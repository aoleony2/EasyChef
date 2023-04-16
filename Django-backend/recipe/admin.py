from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

# Register your models here.
from recipe.models import *

admin.site.register(Recipe)
admin.site.register(Step)
admin.site.register(Ingredient)
admin.site.register(Cuisine)