from rest_framework import serializers
from accounts.models import UserAccount
from django.contrib.auth.hashers import make_password
import re

class RegisterSerializer(serializers.ModelSerializer):

    id = serializers.ReadOnlyField()
    username = serializers.CharField(required=True)
    first_name = serializers.CharField(required=False)
    last_name = serializers.CharField(required=False)
    email = serializers.EmailField(required=False)
    password1 = serializers.CharField(write_only=True, required=True)
    password2 = serializers.CharField(write_only=True, required=True)
    phone_num = serializers.CharField(required=False)
    

    class Meta:
        model = UserAccount
        fields = ['id', 'username', 'first_name', 'last_name', 'email',
                  'password1', 'password2', 'phone_num']

    def validate(self, attrs):
        
        # check password length
        if len(attrs['password1']) < 8:
            raise serializers.ValidationError({"password1": "This password is too short. It must contain at least 8 characters"})

        # passwords need to match
        if attrs['password1'] != attrs['password2']:
            raise serializers.ValidationError({"password2": "passwords don't match"})

        # username needs to be unique
        if UserAccount.objects.filter(username=attrs['username']).exists():
            raise serializers.ValidationError({"username": "this user already has an account"})

        # # email checking
        # email = attrs['email']
        # if email is not None and len(email) > 0:
        #     email_form = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
        #     if not re.fullmatch(email_form, email):
        #         self.add_error("email", "Enter a valid email address")

        return attrs

    def create(self, validated_data):
        user = UserAccount.objects.create_user(username=validated_data['username'],
                                               first_name=validated_data['first_name'],
                                               last_name=validated_data['last_name'],
                                               email=validated_data['email'],
                                               phone_num=validated_data['phone_num'])
        user.set_password(validated_data['password1'])
        user.save()
        return user

class UserViewSerializer(serializers.ModelSerializer):
    id = serializers.ReadOnlyField()

    class Meta():
        model = UserAccount
        fields = ['id', 'username', 'first_name', 'last_name', 'email',
                  'profile_pic', 'phone_num', 'description']

class UserUpdateSerializer(serializers.ModelSerializer):
    id = serializers.ReadOnlyField()
    new_password1 = serializers.CharField(write_only=True)
    new_password2 = serializers.CharField(write_only=True)

    class Meta():
        model = UserAccount
        fields = ['id','username', 'first_name', 'last_name', 'email', 'profile_pic', 'phone_num', 'description','new_password1', 'new_password2']
    
    def update(self, instance, validated_data):
        validated_data.pop('id', None)
        new_password1 = validated_data.pop('new_password1', None)
        new_password2 = validated_data.pop('new_password2', None)
        if new_password1 and new_password2:
            if new_password1 != new_password2:
                raise serializers.ValidationError({"new_password2": "passwords don't match"})
            instance.password = make_password(new_password1)

        return super().update(instance, validated_data)

    def validate(self, attrs):
        # check passwords existence
        password1 = attrs.get('new_password1', '')
        password2 = attrs.get('new_password2', '')
        if password1 == None and password2 == None:
            pass
        elif len(password1) == 0 and len(password2) == 0:
            pass
        else:
            if len(password1) < 8:
                raise serializers.ValidationError({"password1": "This password is too short. It must contain at least 8 characters"})
            if password1 != password2:
                raise serializers.ValidationError({"password2": "passwords don't match"})

        # # email checking
        # email = attrs.get('email', '')
        # if email is not None and len(email) > 0:
        #     email_form = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
        #     if not re.fullmatch(email_form, email):
        #         self.add_error("email", "Enter a valid email address")

        return attrs
