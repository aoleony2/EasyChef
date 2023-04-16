from django.db import models
from django.contrib.auth.models import UserManager, AbstractUser


# Create your models here.
class UserAccount(AbstractUser):
    phone_num = models.CharField(max_length=20, blank=True)
    profile_pic = models.ImageField(upload_to='profile_pic', blank=True, null=True)
    description = models.CharField(max_length=300, blank=True)

    objects = UserManager()
