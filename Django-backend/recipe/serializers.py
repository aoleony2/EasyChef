from django.shortcuts import get_object_or_404
from rest_framework import serializers
from accounts.serializers import UserViewSerializer
from recipe.models import Comment, Recipe, Step, RecipeStep, Ingredient, Cuisine, Diet, Media
from accounts.models import UserAccount

class DietSerializer(serializers.ModelSerializer):
    name = serializers.CharField()
    
    class Meta:
        model = Diet
        fields = ['id', 'name']

class MediaSerializer(serializers.ModelSerializer):
    media_file = serializers.FileField(use_url=True, required=False)
    class Meta:
        model = Media
        fields = ('id', 'media_file')
    # def validate(self, attrs):
    #     file = attrs.get('media_file', None)
    #     print(file, type(file))
    #     files = Media.objects.filter(media_file=file)
    #     if files.count() != 0:
    #         media = files.first()
    #         if not media.is_video() and not media.is_image():
    #             raise serializers.ValidationError({"media_file": "is not image or videos"})
    #         return attrs
    #     else:  
    #         raise serializers.ValidationError({"files": "no file is found"})
class StepSerializer(serializers.ModelSerializer):
    description = serializers.CharField()
    prep_time = serializers.IntegerField()
    cook_time = serializers.IntegerField()
    media_list = MediaSerializer(many=True, required=False)
    class Meta:
        model = Step
        fields = ['id', 'description', 'prep_time', 'cook_time', 'media_list']

# intermediate serializer
class RecipeStepSerializer(serializers.HyperlinkedModelSerializer):
    id = serializers.ReadOnlyField(source='step.id')
    description = serializers.CharField(source='step.description')
    prep_time = serializers.IntegerField(source='step.prep_time')
    cook_time = serializers.IntegerField(source='step.cook_time')
    media_list = MediaSerializer(source='step.media_list', many=True, required=False)
    order = serializers.IntegerField()
    
    class Meta:
        model = RecipeStep
        fields = ['id', 'description', 'prep_time', 'cook_time', 'media_list', 'order']
        # read_only_fields = ['id']


         
class IngredientSerializer(serializers.ModelSerializer):
    name = serializers.CharField(required=True)
    amount = serializers.IntegerField(required=True)

    class Meta:
        model = Ingredient
        fields = ['name', 'amount']

class CuisineSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cuisine
        fields = ['id', 'name']

class CommentSerializer(serializers.ModelSerializer):
    user = UserViewSerializer(default=serializers.CurrentUserDefault())
    class Meta:
        model = Comment
        fields = ['id', 'user', 'text', 'rating', 'created_at']
    def validate(self, attrs):
        rating: int = attrs.get('rating')
        if not (isinstance(rating, int) and 0 <= rating <= 5):
            raise serializers.ValidationError({"rating": "invalid rating"})
        return attrs
    def create(self, validated_data):
        text_data = validated_data.get('text', None)
        rating_data: int = validated_data.get('rating', None)
        recipe_id = self.context.get('recipe_id')
        recipe = Recipe.objects.filter(id=recipe_id).first()
        if not recipe:
            raise serializers.ValidationError("404 NOT found")
        comment = Comment.objects.create(text=text_data, 
                                                    user=self.context.get('request').user,
                                                    rating=rating_data)
        comment.save()
        recipe.comment_list.add(comment)
        recipe.update_overall_rating()
        recipe.save()
        print("updated overall rating")
        return comment
    def update(self, instance, validated_data):
        text_data = validated_data.pop('text', None)
        rating_data: int = validated_data.pop('rating', None)
        
        instance.text = text_data
        instance.rating = rating_data
        instance.save()
        recipe: Recipe = instance.recipe_set.first()
        recipe.update_overall_rating()
        return instance
        
    def delete(self):
        comment_id = self.context.get('comment_id')
        recipe_id = self.context.get('recipe_id')
        try:
            recipe = get_object_or_404(Recipe, id=recipe_id)
            comment = get_object_or_404(recipe.comment_list.all(), id=comment_id)
            recipe.comment_list.remove(comment)
            comment.delete()
            recipe.update_overall_rating()
            
        except Comment.DoesNotExist:
            raise serializers.ValidationError("Comment not found")

class RecipeSerializer(serializers.ModelSerializer):
    # form fields
    id = serializers.ReadOnlyField()
    name = serializers.CharField(required=True)
    prep_time = serializers.IntegerField(read_only=True, required=False)
    cook_time = serializers.IntegerField(read_only=True, required=False)
    serving = serializers.IntegerField(required=True)
    description = serializers.CharField(required=True)
    cuisine = serializers.CharField(required=True)
    base_recipe = serializers.SlugRelatedField(queryset=Recipe.objects.all(), slug_field='name', required=False)
    user = UserViewSerializer(default=serializers.CurrentUserDefault())
    diets = DietSerializer(many=True)
    step_list = RecipeStepSerializer(source='recipestep_set', many=True)
    ingredients = IngredientSerializer(many=True)
    media_list = MediaSerializer(many=True, required=False)
    comment_list = CommentSerializer(many=True, read_only=True, required=False)
    overall_rating = serializers.FloatField(read_only=True, required=False)
    like_num = serializers.IntegerField(default=0, read_only=True, required=False)
    
    class Meta:
        model = Recipe
        fields = ['id', 'name', 'prep_time', 'cook_time', 'serving', 'description', \
                'ingredients', 'step_list', 'media_list', 'comment_list', 'cuisine', \
                'likes', 'like_num', 'base_recipe', 'diets', 'user', 'overall_rating']
    def validate(self, attrs):
        name = attrs.get('name', None)
        recipe = Recipe.objects.filter(name=name)
        if self.context.get('request').method == 'PUT' and recipe.exists():
            pass
        elif recipe.exists():
            raise serializers.ValidationError({"name": f"{self.context.get('request').user.username}, recipes with the same name already exists."})
        
        if not attrs.get('recipestep_set'): return attrs
        validation_set = set()
        orders = set(range(1, len(attrs['recipestep_set'])+1))
        for item in attrs['recipestep_set']:
            order = item.get("order")
            if not (type(order) is int and order > 0):
                raise serializers.ValidationError({"step_list":f"invalid order: {order}"})
            if order in validation_set:
                raise serializers.ValidationError({"step_list":f"error: same order {order}"})
            else:
                validation_set.add(item["order"])
        if orders != validation_set:
            raise serializers.ValidationError({"step_list": f"invalid order: {validation_set}"})
        
        return attrs
    
    def get_or_create_diets(self, diets):
        diet_ids = []
        for diet in diets:
            diet_instance, _ = Diet.objects.get_or_create(name=diet.get('name'), defaults=diet)
            diet_ids.append(diet_instance.pk)
        return diet_ids
    
    def create_or_update_diets(self, diets):
        diet_ids = []
        for diet in diets:
            diet_instance, _ = Diet.objects.update_or_create(name=diet.get('name'), defaults=diet)
            diet_ids.append(diet_instance.pk)
        return diet_ids
    
    def create(self, validated_data):
        ingredients_data = validated_data.pop('ingredients', [])
        step_list_data = validated_data.pop('recipestep_set', [])
        media_list_data = validated_data.pop('media_list', [])
        diets_data = validated_data.pop('diets', [])
        cuisine = validated_data.pop('cuisine')
        base_recipe = validated_data.pop('base_recipe', None)
        cuisine, _ = Cuisine.objects.get_or_create(name=cuisine)
        recipe = Recipe.objects.create(name=validated_data.get('name', None),
                                       prep_time=validated_data.get('prep_time', None),
                                       cook_time=validated_data.get('cook_time', None),
                                       serving=validated_data.get('serving', None),
                                       description=validated_data.get('description', None),
                                       cuisine=cuisine,
                                       base_recipe=base_recipe,
                                       user=self.context.get('request').user)
        
        try:
            recipe.diets.set(self.get_or_create_diets(diets_data))
            # loop through ingredients_data list, ingredients_data is a list of dictionaries
            for ingredient_data in ingredients_data:
                ingredient = Ingredient.objects.create(
                    name=ingredient_data.get('name', None), 
                    amount=ingredient_data.get('amount'))
                recipe.ingredients.add(ingredient)

            for step_data in step_list_data:
                step = step_data['step']
                media_list = step.get('media_list', [])
                #step_data is list of dictionaries 
                step = Step.objects.create(description=step.get('description', None),
                                        prep_time=step.get('prep_time', None),
                                        cook_time=step.get('cook_time', None))
                recipe.step_list.add(step, through_defaults={'order': step_data.get('order', None)})
                for media in media_list:
                    media = Media.objects.create(media_file=media.get('media_file'))
                    step.media_list.add(media)
                step.save()
            recipe.update_total_time()
            for media_data in media_list_data:
                print("asdfasdf", media_data)
                media = Media.objects.create(media_file=media_data.get('media_file'))
                recipe.media_list.add(media)
        except serializers.ValidationError:
            recipe.clear()
            recipe.delete() 
        return recipe

    def update(self, instance: Recipe, validated_data):
        ingredients_data = validated_data.pop('ingredients', None)
        diets_data = validated_data.pop('diets', None)
        media_list_data = validated_data.pop('media_list', None)
        step_list_data: list = validated_data.pop('recipestep_set', None)
        cuisine = validated_data.pop('cuisine', None)        
        
        if cuisine:
            instance.cuisine, _ = Cuisine.objects.update_or_create(name=cuisine)
            instance.save()
        if media_list_data: 
            media_list = instance.media_list.all()
            instance.media_list.clear()
            for media in media_list:
                media.delete()
            for media_data in media_list_data:
                media = Media.objects.create(media_file=media_data.get('media_file'))
                instance.media_list.add(media)
            instance.save()
        if ingredients_data:
            instance.ingredients.clear()
            # loop through ingredients_data list, ingredients_data is a list of dictionaries
            for ingredient_data in ingredients_data:
                ingredient = Ingredient.objects.create(
                    name=ingredient_data.get('name', None), 
                    amount=ingredient_data.get('amount', None))
                instance.ingredients.add(ingredient)
            instance.save()
        if diets_data:
            # clear all the diets
            instance.diets.set(self.create_or_update_diets(diets_data))
            instance.save()
        if step_list_data:
            step_list_data.sort(key=lambda x: x.get('order'))
            for step in instance.get_step_list():
                step_media_list = step.media_list.all()
                step.media_list.clear()
                for step_media in step_media_list:
                    step_media.delete()
                step.delete()
            instance.step_list.clear()
            for step_data in step_list_data:
                step = step_data['step']
                media_list = step.get('media_list', [])
                #step_data is list of dictionaries 
                step = Step.objects.create(description=step.get('description', None),
                                        prep_time=step.get('prep_time', None),
                                        cook_time=step.get('cook_time', None))
                instance.step_list.add(step, through_defaults={'order': step_data.get('order', None)})
                for media in media_list:
                    media = Media.objects.create(media_file=media.get('media_file'))
                    step.media_list.add(media)
                step.save()
            instance.update_total_time()
            instance.save()

        return super().update(instance, validated_data)
        

'''
class MyRecipeSerializer:
    class Meta:
        model = Recipe
        fields = ['id', 'name', 'prep_time', 'cook_time', 'serving', 'description', \
            'ingredients', 'step_list', 'cuisine', 'likes', 'base_recipe', 'user']
'''

class ShoppingListItemSerializer(serializers.ModelSerializer):
    recipe = RecipeSerializer(many=True)
    serving = serializers.IntegerField()

class IngredientListSerializer(serializers.ModelSerializer):
    serving = serializers.SerializerMethodField()
    recipe_name = serializers.SerializerMethodField()
    recipe_id = serializers.SerializerMethodField()

    class Meta:
        model = Ingredient
        fields = ['name', 'amount', 'serving', 'recipe_name', 'recipe_id']

    def get_serving(self, obj):
        recipe = Recipe.objects.filter(ingredients=obj).first()
        return recipe.serving if recipe else None
    
    def get_recipe_name(self, obj):
        recipe = Recipe.objects.filter(ingredients=obj).first()
        return recipe.name if recipe else None

    def get_recipe_id(self, obj):
        recipe = Recipe.objects.filter(ingredients=obj).first()
        return recipe.id if recipe else None

