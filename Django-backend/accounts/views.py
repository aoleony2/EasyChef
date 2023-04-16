from django.shortcuts import render
from rest_framework.response import Response
from rest_framework import generics, status
from accounts.serializers import RegisterSerializer, UserViewSerializer, UserUpdateSerializer
from rest_framework.permissions import AllowAny, IsAdminUser, IsAuthenticated
from rest_framework.generics import CreateAPIView, ListAPIView, RetrieveAPIView, UpdateAPIView, get_object_or_404
from accounts.models import UserAccount
from django.http import HttpResponse

# Create your views here.

# signup profile
class CreateUserView(CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]    

# view profile
class UserView(RetrieveAPIView):
    serializer_class = UserViewSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return get_object_or_404(UserAccount, id=self.kwargs['id'])

# edit profile
class UpdateUserView(RetrieveAPIView, UpdateAPIView):
    serializer_class = UserUpdateSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user

    def put(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', True)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
# auth profile
class AuthUserView(RetrieveAPIView):
    serializer_class = UserViewSerializer
    permission_classes = [IsAuthenticated]
    def get_object(self):
        return self.request.user

def relate(request):
    users = UserAccount.objects.all()
    return HttpResponse('done')