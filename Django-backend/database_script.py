from recipe.views import CreateRecipeView
from recipe.models import Recipe
from accounts.models import UserAccount

Recipe.objects.create(name='TEST1',
                      prep_time=20,
                      description='TEST',
                      likes=1,
                      base_recipe=None,
                      user=UserAccount.objects.get(id=1))

Recipe.objects.create(name='TEST2',
                      prep_time=20,
                      description='TEST',
                      likes=1,
                      base_recipe=None,
                      user=UserAccount.objects.get(id=2))
