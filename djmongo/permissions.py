from rest_framework.permissions import BasePermission
from django.contrib.auth.models import User,Group

class ToCreateEngineer(BasePermission):

    def has_permission(self,request,view):
        try:
            user_group=Group.objects.get(id=request.user.id)
            return user_group.name=="admin"
        except Group.DoesNotExist:
            return False
