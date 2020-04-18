from django.db import models
from django.contrib.auth.models import AbstractUser
from django.contrib.auth.models import Group,Permission
from django.conf import settings
from phonenumber_field.modelfields import PhoneNumberField
from safedelete.models import SafeDeleteModel
from safedelete.models import SOFT_DELETE_CASCADE  

class User(AbstractUser):
    class Meta:
        db_table="iot_user"
    mobile_no=models.BigIntegerField(unique=True,blank=False)
    email = models.EmailField(unique=True)
    admin= models.ForeignKey(settings.AUTH_USER_MODEL,related_name="user_admin",on_delete=models.CASCADE,null=True)
    role=models.ForeignKey('djmongo.Roles',related_name="role_id",on_delete=models.CASCADE,null=True)
    # role_id=models.ForeignKey()
# email = models.EmailField(_('email address'), unique=True)
# class Roles(models.Model):
#     roles=models.CharField(max_length=120)

# class User_Roles(models.Model):
#     user=models.ForeignKey(settings.AUTH_USER_MODEL,related_name="iot_user",on_delete=models.CASCADE)
#     role=models.ForeignKey(Roles,related_name="user_roles",on_delete=models.CASCADE)
                            
class PasswordReset(models.Model):
    class Meta:
        db_table="password_reset"
    token=models.CharField(max_length=200)
    expires_at = models.DateTimeField(auto_now=False)
    user=models.ForeignKey(User,related_name='user_pwd_rst',on_delete=models.CASCADE)
    status=models.BigIntegerField(default=1)
    created = models.DateTimeField(auto_now_add=True)
    updated= models.DateTimeField(auto_now=True)


class UserProject(SafeDeleteModel):
    class Meta:
        db_table="iot_user_project"
    _safedelete_policy = SOFT_DELETE_CASCADE
    user=models.ForeignKey(User,related_name="user_projects",on_delete=models.CASCADE)
    project=models.ForeignKey('project_management.ProjectDetails',related_name="user_project_id",on_delete=models.CASCADE)
    analog_tag=models.BigIntegerField(null=True)
    digital_tag=models.BigIntegerField(null=True)
    video_tag=models.BigIntegerField(null=True)
    audio_tag=models.BigIntegerField(null=True)
    is_active=models.IntegerField(default=1)
    created_at= models.DateTimeField(auto_now_add=True)
    updated= models.DateTimeField(auto_now=True)

class Roles(SafeDeleteModel):
    class Meta:
        db_table="roles"
    _safedelete_policy = SOFT_DELETE_CASCADE
    role_name          =models.CharField(max_length=120)
    created_at         = models.DateTimeField(auto_now_add=True)
    updated            = models.DateTimeField(auto_now=True)

    