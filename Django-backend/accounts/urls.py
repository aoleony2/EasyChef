from django.contrib import admin
from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView

from accounts.views import CreateUserView, UpdateUserView, UserView, AuthUserView

app_name = 'accounts'

urlpatterns = [
    path('user/signup/', CreateUserView.as_view(), name='signup'),
    path('user/login/', TokenObtainPairView.as_view(), name='login'),
    # path('user/logout/', TokenObtainPairView.as_view(), name='logout'),
    path('user/view/<int:id>/', UserView.as_view(), name='users'),
    path('user/edit/', UpdateUserView.as_view(), name='edit'),
    path('user/auth/', AuthUserView.as_view(), name='auth')
]