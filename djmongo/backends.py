from django.contrib.auth import get_user_model
from django.contrib.auth.backends import ModelBackend
from django.conf import settings
from djmongo.models import User
from django.http.response import Http404

class EmailAsUsername(object):
    def authenticate(self,request,email=None,password=None ):
        UserModel=get_user_model()     
        try:
            user=User.objects.get(email=email)
        except UserModel.DoesNotExist:
            return None
        else:
            if user.check_password(password):
                return user
        return None

    def get_user(self, user_id):
        try:
            return User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return None