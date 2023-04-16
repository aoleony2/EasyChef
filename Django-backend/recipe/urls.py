from django.urls import path

from . import views

urlpatterns = [
    path('<int:recipe_id>/details/', views.RecipeView.as_view()),
    path('<int:recipe_id>/edit/', views.EditRecipeView.as_view()),
    path('<int:recipe_id>/', views.EditRecipeView.as_view()),
    path('create/', views.CreateRecipeView.as_view()),
    path('<int:recipe_id>/add_comment/', views.AddCommentView.as_view()),
    path('comment/<int:comment_id>', views.EditCommentView.as_view()),
    path('created/', views.UserRecipeView.as_view()),
    path('shopping_list/', views.UserShoppingListView.as_view()),
    path('shopping_list/add/<int:recipe_id>/', views.UserShoppingListView.as_view()),
    path('shopping_list/delete/<int:recipe_id>/', views.ShoppingListDeleteView.as_view()),
    path('liked/', views.LikedRecipeView.as_view()),
    path('<int:recipe_id>/like/', views.LikeRecipeView.as_view()),
    #path('<int:recipe_id>/<int:base_recipe_id>/add/', views.AddBaseRecipeView.as_view()),
    #path('myrecipes/', views.MyRecipeView.as_view()),
    path('list/', views.RecipeListView.as_view()),
    path('cuisine/', views.CuisineListView.as_view()),
    path('ingredient/', views.IngredientListView.as_view()),
    path('diet/', views.DietListView.as_view()),
]