from rest_framework import serializers
import random
from project_management.models import ProjectDetails,ProjectComponents,ProjectComponentsTags,ComponentsLibrary,CompLibDigitalNotify
from tag_management.models import TagDetails,TagType
from django.http.response import Http404
from django.core.files.storage import FileSystemStorage
class ProjectSerializers(serializers.ModelSerializer):
    class Meta:
        model=ProjectDetails
        fields= ("id","project_name","description","project_design_json","user_id")



class ProjectComponentsSerializers(serializers.Serializer):
    id=serializers.IntegerField(required=False)
    project_id=serializers.CharField()
    component_name=serializers.CharField()
    reference_id=serializers.IntegerField()
    user_id=serializers.IntegerField()
    component_library_id=serializers.IntegerField(required=False)
    created_at = serializers.DateTimeField(required=False)
    updated_at = serializers.DateTimeField(required=False)
    def create(self,validated_data):
        
        proj_comp_inst                  =ProjectComponents()
        try:
            pr_inst                     =ProjectDetails.objects.get(id=validated_data["project_id"])
        except ProjectDetails.DoesNotExist:
            raise Http404
        if "component_library_id" in validated_data:
            try:
                library_inst                 =ComponentsLibrary.objects.get(id=validated_data["component_library_id"])
                proj_comp_inst.component_library_id=library_inst.id
            except ComponentsLibrary.DoesNotExist:
                raise Http404
        
        proj_comp_inst.component_name   =validated_data["component_name"]
        proj_comp_inst.reference_id     =validated_data['reference_id']
        proj_comp_inst.project_id       =pr_inst.id
        
        proj_comp_inst.user_id          =validated_data["user_id"]
        proj_comp_inst.save()
    
        return proj_comp_inst
    
    def update(self,instance,validated_data):
        pr_inst                     =ProjectDetails.objects.get(id=validated_data["project_id"])
        library_inst                 =ComponentsLibrary.objects.get(id=validated_data["component_library_id"])
        instance.component_name     =validated_data.get("component_name",instance.component_name)
        instance.reference_id       =validated_data.get("reference_id",instance.component_name)
        instance.project_id         =validated_data.get("project_id",instance.component_name)
        instance.component_library_id=validated_data.get("component_library_id",instance.component_library_id)
        instance.user_id            =validated_data.get("user_id",instance.user_id)
        instance.save()
        return instance



class ComponentsTagSerializers(serializers.Serializer):
    id=serializers.IntegerField(required=False)
    project_id=serializers.IntegerField(required=False)
    component_id=serializers.IntegerField()
    tag_id=serializers.IntegerField()
    created_at = serializers.DateTimeField(required=False)
    updated_at = serializers.DateTimeField(required=False)
    def create(self,validated_data):
        print("entering")
        try:
            component_exist            =ProjectComponentsTags.objects.get(component_id=validated_data['component_id'],is_active=1)
            component_exist.is_active=0
            component_exist.save()
        except ProjectComponentsTags.DoesNotExist:
            None
        
        comp_tag_inst                  =ProjectComponentsTags()
        pr_inst                        =ProjectDetails.objects.get(id=validated_data["project_id"])
        tag_inst                       =TagDetails.objects.get(id=validated_data["tag_id"])
        comp_inst                      =ProjectComponents.objects.get(id=validated_data['component_id'])
        comp_tag_inst.component_id     =comp_inst.id
        comp_tag_inst.tag_id           =tag_inst.id
        comp_tag_inst.project_id       =pr_inst.id
        comp_tag_inst.is_active=1
        comp_tag_inst.save()

        return comp_tag_inst
    def update(self,instance,validated_data):
        pr_inst                        =ProjectDetails.objects.get(id=validated_data["project_id"])
        tag_inst                       =TagDetails.objects.get(id=validated_data["tag_id"])
        comp_inst                      =ProjectComponents.objects.get(id=validated_data['component_id'])
        instance.component_id          =comp_inst.id
        instance.tag_id                =tag_inst.id
        instance.project_id            =pr_inst.id
        instance.save()
    
        return instance

class CompLibDigitalNotifySerializers(serializers.ModelSerializer):
    class Meta:
        model=CompLibDigitalNotify
        

class ComponentsLibrarySerializers(serializers.ModelSerializer):
    digi_noti_attrib=CompLibDigitalNotifySerializers(read_only=True)
    class Meta:
        model=ComponentsLibrary
        fields=("id","name","component_type_id","default_image","status_on","status_off","user_id","created_at","updated_at","digi_noti_attrib")
#     name                = serializers.CharField()
#     component_type_id   = serializers.IntegerField()
#     default_image       = serializers.FileField() and CharField()
#     status_on           = serializers.FileField() 
#     status_off          = serializers.FileField()
#     user_id             = serializers.IntegerField()
    
    


#     def create(self,request):
#         print("hi")
            
        # try:
        #     component_inst            = TagType.objects.get(id=request["component_type_id"])
        # except TagType.DoesNotExist:
        #     raise Http404
        # library_inst                  = ComponentsLibrary()
        # library_inst.name             = request["name"]
        # validated_data['owner'] = self.context['request'].user
        # library_inst.user_id       = request["user_id"]
        # library_inst.component_type_id   = component_inst.id
        # print("hi")
        # library_inst.save()
        # print("hi")
        # file1                         = request["default_image"]
        # file2                         = request["status_on"]
        # file3                         = request["status_off"]

        # if file1:

        #     path                              = 'static/media/'+str(library_inst.id)
        #     fs                                = FileSystemStorage(path)
        #     print("stop1")
        #     filename                          = fs.save(file1.name,file1)
        #     print("stop2")
        #     library_inst.default_image        = path+'/'+filename

        # if file2:
        #     path                              = 'static/media/'+str(library_inst.id)
        #     fs                                = FileSystemStorage(path)
        #     filename                          = fs.save(file2.name,file2)
        #     library_inst.status_on            = path+'/'+filename
        
        # if file3:
        #     path                              = 'static/media/'+str(library_inst.id)
        #     fs                                = FileSystemStorage(path)
        #     filename                          = fs.save(file3.name,file3)
        #     library_inst.status_off           = path+'/'+filename
        
        # library_inst.save()
        # return library_inst

    

    

    

