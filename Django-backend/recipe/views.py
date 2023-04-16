from django.shortcuts import render
from rest_framework import status
from django.http import HttpResponse, JsonResponse
from django.views.generic import FormView
from rest_framework.permissions import AllowAny, IsAdminUser, IsAuthenticated
from rest_framework.generics import RetrieveAPIView, ListAPIView, CreateAPIView, UpdateAPIView, get_object_or_404
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from rest_framework import filters, viewsets
from django.db.models import Subquery, OuterRef

from recipe.models import Comment, Recipe, Cuisine, Ingredient, Diet
from accounts.models import UserAccount
from recipe.serializers import CommentSerializer, RecipeSerializer, CuisineSerializer, IngredientSerializer, DietSerializer, IngredientListSerializer
from recipe.filters import RecipeFilter, IngredientFilterBackend, IngredientFilter

def index(request):
    return HttpResponse("Hello, world. You're at the polls index.")


# Create new recipe
class CreateRecipeView(CreateAPIView):
    serializer_class = RecipeSerializer
    permission_classes = [AllowAny]

class CuisineListView(ListAPIView):
    serializer_class = CuisineSerializer
    permission_classes = [AllowAny]
    filter_backends = [SearchFilter]
    search_fields = ['name']

    def get_queryset(self):
        queryset = Cuisine.objects.all()
        return queryset
    
class IngredientListView(ListAPIView):
    serializer_class = IngredientSerializer
    permission_classes = [AllowAny]  

    def get_queryset(self):
        queryset = Ingredient.objects.all()

        search_query = self.request.query_params.get('search', None)
        if search_query:
            queryset = queryset.filter(name__icontains=search_query)

        subquery = queryset.filter(name=OuterRef('name')).order_by('id').values('id')[:1]
        queryset = queryset.filter(id__in=Subquery(subquery)).order_by('name')

        return queryset

class DietListView(ListAPIView):
    serializer_class = DietSerializer
    permission_classes = [AllowAny]  
    filter_backends = [SearchFilter]
    search_fields = ['name']

    def get_queryset(self):
        queryset = Diet.objects.all()
        return queryset

# List all recipes
class RecipeListView(ListAPIView):
    serializer_class = RecipeSerializer
    permission_classes = [AllowAny]  
    filter_backends = [DjangoFilterBackend, IngredientFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = RecipeFilter
    search_fields = ['name']
    # ordering parameters (default ascneding order, use '-' to change to descending)
    ordering_fields = ['name', 'cook_time', 'prep_time', 'serving', 'overall_rating', 'like_num']
    default_ordering = ['-like_num']

    def get_queryset(self):
        filterset = RecipeFilter(self.request.query_params, queryset=Recipe.objects.all())
        queryset = filterset.qs.distinct()
        return queryset

# List User Created Recipes
class UserRecipeView(ListAPIView):
    serializer_class = RecipeSerializer
    permission_classes = [IsAuthenticated]    
    filter_backends = [DjangoFilterBackend, IngredientFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = RecipeFilter
    search_fields = ['name']
    # ordering parameters (default ascneding order, use '-' to change to descending)
    ordering_fields = ['name', 'cook_time', 'prep_time', 'serving', 'overall_rating', 'like_num']
    default_ordering = ['-like_num']

    def get_queryset(self):
        filterset = RecipeFilter(self.request.query_params, queryset=Recipe.objects.filter(user=self.request.user))
        queryset = filterset.qs.distinct()
        return queryset

# List User liked recipes
class LikedRecipeView(ListAPIView):
    serializer_class = RecipeSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, IngredientFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = RecipeFilter
    search_fields = ['name']
    # ordering parameters (default ascneding order, use '-' to change to descending)
    ordering_fields = ['name', 'cook_time', 'prep_time', 'serving', 'overall_rating', 'like_num']
    default_ordering = ['-like_num']

    def get_queryset(self):
        filterset = RecipeFilter(self.request.query_params, queryset=self.request.user.likes.all())
        queryset = filterset.qs.distinct()
        return queryset
    
# User likes recipe
class LikeRecipeView(UpdateAPIView):
    serializer_class = RecipeSerializer
    permission_classes = [IsAuthenticated]
    
    def update(self, request, *args, **kwargs):
        recipe_id = kwargs["recipe_id"]
        instance = Recipe.objects.filter(id=recipe_id)
        if not instance.exists():
            raise ValidationError("recipe not found")
        instance = instance.first()
        if self.request.user in instance.likes.all():
            instance.likes.remove(self.request.user)
            instance.like_num -= 1
            instance.save()
            return Response({"message": f"You have successfully unliked this recipe {recipe_id}"})
        else:
            instance.likes.add(self.request.user)
            instance.like_num += 1
            instance.save()
            return Response({"message": f"You have successfully liked this recipe {recipe_id}"})

# Popular Recipes
class PopularRecipeView(ListAPIView):
    serializer_class = RecipeSerializer
    permission_classes = [AllowAny]
    
    def get_object(self):
        return Recipe.objects.all().order_by('-likes', '-rating')

# view recipe
class RecipeView(RetrieveAPIView):
    serializer_class = RecipeSerializer
    permission_classes = [AllowAny]
    
    def get_object(self):
        return get_object_or_404(Recipe, id=self.kwargs['recipe_id'])

class EditRecipeView(RetrieveAPIView, UpdateAPIView):
    serializer_class = RecipeSerializer
    permission_classes = [IsAuthenticated]
    
    def get_object(self):
        return get_object_or_404(Recipe, id=self.kwargs['recipe_id'])
    
    def put(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', True)
        instance = self.get_object()
        if instance.user != request.user:
            raise ValidationError("You can't edit other user's recipe")
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, recipe_id):
        try:
            instance = self.get_object()
            if instance.user != request.user:
                raise ValidationError("You can't edit other user's recipe")
            recipe = Recipe.objects.get(id=recipe_id)
            recipe.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Recipe.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)
    
class AddCommentView(CreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = CommentSerializer
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['recipe_id'] = self.kwargs.get('recipe_id')
        return context
    def get_object(self):
        return get_object_or_404(Recipe, id=self.kwargs['recipe_id'])
    def post(self, request, recipe_id):
        self.get_object()
        return super().post(request, recipe_id)

class EditCommentView(RetrieveAPIView, UpdateAPIView):
    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticated]
    
    def get_object(self):
        return get_object_or_404(Comment, id=self.kwargs['comment_id'])
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['comment_id'] = self.kwargs.get('comment_id')
        return context
    def put (self, request, comment_id):
        comment =self.get_object()
        print("asdf")
        # Only the author of the comment can delete the comment
        if comment.user != request.user:
            return Response({'message': 'You are not authorized to edit this comment.'}, 
                            status=status.HTTP_403_FORBIDDEN)
        return super().put(request, comment_id)  
    def delete(self, request, comment_id):
        comment = self.get_object()

        # Only the author of the comment can delete the comment
        if comment.user != request.user:
            return Response({'message': 'You are not authorized to delete this comment.'}, 
                            status=status.HTTP_403_FORBIDDEN)

        comment.delete()
        return Response({"message": f"comment {comment_id}"}, 
                        status=status.HTTP_200_OK)

        
# List User ShoppingList Recipes
class UserShoppingListView(ListAPIView, UpdateAPIView):
    serializer_class = IngredientListSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, IngredientFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = IngredientFilter
    filterset_fields = ['name']
    search_fields = ['name']

    # ordering parameters (default ascending order, use '-' to change to descending)
    ordering_fields = ['name', 'cook_time', 'prep_time', 'serving']
    default_ordering = ['name']

    def get_queryset(self):
        recipe_name = self.request.query_params.get('recipe_name')
        if recipe_name:
            recipes = self.request.user.added.filter(name__icontains=recipe_name)
        else:
            recipes = self.request.user.added.all()

        ingredients = []
        for recipe in recipes:
            ingredients.extend(recipe.ingredients.all())

        return Ingredient.objects.filter(pk__in=[ingredient.pk for ingredient in ingredients]).distinct()

    def get_object(self):
        return get_object_or_404(Recipe, id=self.kwargs['recipe_id'])
    
    
    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        
        if self.request.user in instance.added.all():
            raise ValidationError("You have already added this recipe")
        else:
            instance.added.add(self.request.user)
            instance.save()
            return Response({"message": f"You have successfully added recipe {self.kwargs['recipe_id']}"})

    
class ShoppingListDeleteView(UserShoppingListView):
    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        
        if self.request.user not in instance.added.all():
            raise ValidationError("This recipe is not the shopping list.")
        else:
            instance.added.remove(self.request.user)
            instance.save()
            return Response({"message": f"You have successfully delete recipe {self.kwargs['recipe_id']}"})