
from rest_framework import serializers
import random
from project_management.models import DataProcess,ProjectDetails
from tag_management.models import TagDetails
from rest_framework_jwt.authentication import JSONWebTokenAuthentication
from rest_framework.fields import CurrentUserDefault
import redis
class DataProcessSerializers(serializers.Serializer):
    output=serializers.CharField()
    project_id=serializers.CharField()
    tag_id=serializers.CharField()
    user_id=serializers.CharField()
    
    def create(self,validated_data):
        # request = self.context.get("request")
        print("serializers",validated_data) 
        dp_inst=DataProcess()
        pr_inst=ProjectDetails.objects.get(id=validated_data["project_id"])
        print(pr_inst)
        tg_inst=TagDetails.objects.get(id=validated_data["tag_id"])
        
        dp_inst.output=validated_data["output"]
        dp_inst.project_id=pr_inst.id
        dp_inst.tag_id=tg_inst.id
        dp_inst.user_id=validated_data["user_id"]
        dp_inst.save()        
        return dp_inst

    def update(self, instance, validated_data):
       pr_inst=ProjectDetails.objects.get(id=validated_data["project_id"]) 
       tg_inst=TagDetails.objects.get(id=validated_data["tag_id"])
       instance.output = validated_data.get('output', instance.output)
       instance.project_id = validated_data.get('project_id', instance.project.id)
       instance.tag_id = validated_data.get('tag_id', instance.tag_id)
       instance.save()
       return instance

