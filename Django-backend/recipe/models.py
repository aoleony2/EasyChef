import os
from django.db import models
from django.db.models import SET_NULL, CASCADE, PROTECT
from django.forms import ValidationError
from django.core.validators import FileExtensionValidator
from accounts.models import UserAccount
from django.template.defaultfilters import slugify

class Diet(models.Model):
    name = models.CharField(max_length=50)
    
    def __str__(self):
        return self.name

class Cuisine(models.Model):
    name = models.CharField(max_length=50)
    
    def __str__(self):
        return self.name

class Ingredient(models.Model):
    name = models.CharField(max_length=50)
    amount = models.IntegerField()
    
    def __str__(self):
        return self.name
    
class Media(models.Model):
    media_file = models.FileField(upload_to='media/', 
                                  validators=[FileExtensionValidator(allowed_extensions=['mp4', 'avi', 'wmv', 'jpg', 'jpeg', 'png', 'gif'])],
                                  verbose_name='media files')
class Step(models.Model):
    description = models.TextField(null=True, blank=True)
    prep_time = models.IntegerField(default=0)
    cook_time = models.IntegerField(default=0)
    media_list = models.ManyToManyField(to=Media, related_name='step_media_list', blank=True)
    
    def __str__(self):
        return self.description

class Comment(models.Model):
    user = models.ForeignKey(to=UserAccount, on_delete=CASCADE, related_name='comment_user')
    rating = models.IntegerField() # an integer from 1 to 5
    text = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

# Create your models here.
class Recipe(models.Model):
    name = models.CharField(max_length=100, unique=True)
    prep_time = models.IntegerField(default=0, null=True, blank=True)
    cook_time = models.IntegerField(default=0, null=True, blank=True)
    serving = models.PositiveIntegerField(default=1)
    description = models.TextField()
    # contains a list of steps
    step_list = models.ManyToManyField(to=Step, through="RecipeStep", blank=True)
    ingredients = models.ManyToManyField(to=Ingredient, blank=True)
    cuisine = models.ForeignKey(to=Cuisine, on_delete=PROTECT, null=True, blank=True)
    likes = models.ManyToManyField(to=UserAccount, related_name="likes", blank=True)
    like_num = models.IntegerField(default=0, null=True, blank=True)
    overall_rating = models.FloatField(default=0, null=True, blank=True)
    rating_num = models.IntegerField(default=0, null=True, blank=True)
    base_recipe = models.ForeignKey('self', on_delete=SET_NULL, null=True, blank=True)
    user = models.ForeignKey(UserAccount, on_delete=CASCADE, related_name='user')
    added = models.ManyToManyField(to=UserAccount, related_name="added", blank=True)
    diets = models.ManyToManyField(to=Diet, blank=True)
    media_list = models.ManyToManyField(to=Media, related_name='recipe_media_list', blank=True)
    comment_list = models.ManyToManyField(to=Comment, related_name='recipe_set', blank=True)
    
    def __str__(self):
        return self.name

    def get_step_list(self):
        # return list of steps of self instance of Recipe
        return [recipe.step for recipe in RecipeStep.objects.filter(recipe=self).order_by('order')]
    
    def update_total_time(self):
        total_prep_time = 0
        total_cook_time = 0
        for step in self.get_step_list():
            total_prep_time += step.prep_time
            total_cook_time += step.cook_time
        self.prep_time = total_prep_time
        self.cook_time = total_cook_time
        self.save()
    def update_overall_rating(self):
        total = 0
        count = 0
        for comment in self.comment_list.all():
            total += comment.rating
            count += 1
        self.overall_rating = total / count
        self.rating_num = count
        

        
class RecipeStep(models.Model):
    step = models.ForeignKey(Step, on_delete=models.CASCADE)
    recipe = models.ForeignKey(Recipe, on_delete=models.CASCADE)
    order = models.PositiveIntegerField()
    
    class Meta:
        ordering = ['order',]
        unique_together = ('recipe', 'order')
        
    def __str__(self):
        return self.recipe.__str__() + ": " + self.step.__str__() 

