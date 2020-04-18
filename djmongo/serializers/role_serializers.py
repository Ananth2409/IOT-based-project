from rest_framework import serializers
import random
from django.contrib.auth.models import Group

class RoleSerializers(serializers.ModelSerializer):
    class Meta:
        model=Group
        fields= ('id',"name")

    
