from rest_framework import serializers
import random
from django.contrib.auth.models import Group,Permission,ContentType

class ModuleSerializers(serializers.Serializer):
    # content_type=serializers.IntegerField(default=12)
    id=serializers.IntegerField(required=False)
    name=serializers.CharField()
    codename=serializers.CharField()

    def create(self,validated_data):
        
        p=Permission()
        c=ContentType.objects.get(id=7)
        p.name=validated_data["name"]
        p.content_type_id=c.id
        p.codename=validated_data["codename"]
        p.save()
        
        return validated_data

    def update(self,instance,validated_data):
        instance.name=validated_data.get('name',instance.name)
        # instance.content_type=validated_data.get('name',instance.name)
        instance.codename=validated_data.get('codename',instance.codename)
        instance.save()
        return instance
        
