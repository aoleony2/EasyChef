from django_filters import rest_framework as filters
from recipe.models import Recipe, Ingredient

# custom filtering backend for ingredients and diet
class IngredientFilterBackend:
    def filter_queryset(self, request, queryset, view):
        ingredients = request.query_params.get('ingredients')
        if ingredients:
            ingredients = ingredients.split(',')
            for ingredient in ingredients:
                queryset = queryset.filter(ingredients__name__icontains=ingredient)
            queryset = queryset.distinct()
        return queryset
    
class UsernameFilterBackend:
    def filter_queryset(self, request, queryset, view):
        usernames = request.query_params.get('username')
        if usernames:
            usernames = usernames.split(',')
            for username in usernames:
                queryset = queryset.filter(user__username__icontains=username)
            queryset = queryset.distinct()
        return queryset

class RecipeFilter(filters.FilterSet):
    cuisine = filters.CharFilter(field_name='cuisine__name', lookup_expr='icontains')
    base_recipe = filters.CharFilter(field_name='base_recipe__name', lookup_expr='icontains')
    ingredient = filters.CharFilter(method='filter_ingredients', lookup_expr='icontains')
    diets = filters.CharFilter(method='filter_diets', lookup_expr='icontains')
    username = filters.CharFilter(field_name='user__username', lookup_expr='icontains')

    class Meta:
        model = Recipe
        fields = ['cuisine', 'base_recipe', 'ingredient', 'diets', 'username']


    def filter_diets(self, queryset, name, value):
        diets = value
        if diets:
            diets = diets.split(',')
            for diet in diets:
                queryset = queryset.filter(diets__name__icontains=diet)
            queryset = queryset.distinct()
        return queryset

class IngredientFilter(filters.FilterSet):
    class Meta:
        model = Ingredient
        fields = ['name']


