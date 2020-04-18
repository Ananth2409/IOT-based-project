from django.db import models
from djmongo.models import User
from safedelete.models import SafeDeleteModel
from safedelete.models import SOFT_DELETE_CASCADE

# from tag_management.models import TagDetails
# Create your models here.

class ProjectDetails(SafeDeleteModel):
    class Meta:
        db_table="project"
    _safedelete_policy = SOFT_DELETE_CASCADE
    project_name=models.CharField(max_length=200,unique=True,null=True)
    description=models.TextField(null=True)
    project_design_json=models.TextField(null=True)
    user=models.ForeignKey(User,related_name='project_creator',on_delete=models.CASCADE)
    updated = models.DateTimeField(auto_now=True)
    timestamp = models.DateTimeField( auto_now_add=True)
    



class ProjectComponents(SafeDeleteModel):
    class Meta:
        db_table="project_component"
    _safedelete_policy = SOFT_DELETE_CASCADE
    component_name=models.CharField(max_length=120)
    reference_id=models.IntegerField()
    project=models.ForeignKey(ProjectDetails,related_name='components',on_delete=models.CASCADE)
    component_library=models.ForeignKey("ComponentsLibrary",null=True,related_name='library',on_delete=models.CASCADE)
    user=models.ForeignKey(User,related_name='components_user',on_delete=models.CASCADE)
    created_at = models.DateTimeField( auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)



class ProjectComponentsTags(SafeDeleteModel):
    class Meta:
        db_table="project_components_tags"
    _safedelete_policy = SOFT_DELETE_CASCADE
    component=models.ForeignKey(ProjectComponents,related_name="components_tags_compt",on_delete=models.CASCADE)
    tag=models.ForeignKey("tag_management.TagDetails",related_name="components_tags_tg",on_delete=models.CASCADE)
    project=models.ForeignKey(ProjectDetails,related_name='components_tags_proj',on_delete=models.CASCADE)
    is_active=models.IntegerField()
    created_at = models.DateTimeField( auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)



class DataProcess(SafeDeleteModel):
    class Meta:
        db_table="dataprocess"
    _safedelete_policy = SOFT_DELETE_CASCADE
    output=models.TextField()
    project=models.ForeignKey(ProjectDetails,related_name='project_data',on_delete=models.CASCADE)
    tag=models.ForeignKey("tag_management.TagDetails",related_name="tag_data",on_delete=models.CASCADE)
    user=models.ForeignKey(User,related_name='user_data',on_delete=models.CASCADE)
    created_at = models.DateTimeField( auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)



class ComponentsLibrary(models.Model):
    class Meta:
        db_table="project_component_libraries"
    name            = models.CharField(max_length=120,unique=True)
    component_type  = models.ForeignKey("tag_management.TagType",related_name="libraries",on_delete=models.CASCADE)
    default_image   = models.CharField(max_length=120)
    status_on       = models.CharField(max_length=120)
    status_off      = models.CharField(max_length=120)
    user            = models.ForeignKey(User,related_name="lib_creator",on_delete=models.CASCADE)
    created_at      = models.DateTimeField( auto_now_add=True)
    updated_at      = models.DateTimeField(auto_now=True)


class CompLibDigitalNotify(models.Model):
    status_on_email       = models.CharField(max_length=120)
    status_on_sms         = models.CharField(max_length=120)
    status_off_email      = models.CharField(max_length=120)
    status_off_sms        = models.CharField(max_length=120)
    Component_library     = models.ForeignKey("ComponentsLibrary",related_name="comp_lib_digi_notify",on_delete=models.CASCADE)
    created_at            = models.DateTimeField( auto_now_add=True)
    updated_at            = models.DateTimeField(auto_now=True)

    class Meta:
        db_table="component_library_digital_notifications"
