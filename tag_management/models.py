from django.db import models
# from project_management.models import ProjectDetails
from djmongo.models import User
from safedelete.models import SafeDeleteModel
from safedelete.models import SOFT_DELETE_CASCADE


class TagType(SafeDeleteModel):
    class Meta:
        db_table="tagtype"
    _safedelete_policy = SOFT_DELETE_CASCADE
    name=models.CharField(max_length=120)
    updated = models.DateTimeField(auto_now=True)
    timestamp = models.DateTimeField( auto_now_add=True)

class  TagParameter(models.Model):
    class Meta:
        db_table        = "tag_parameter"
    parameter           = models.CharField(max_length=120)
    updated         = models.DateTimeField(auto_now=True)
    timestamp           = models.DateTimeField( auto_now_add=True)

class TagAlarm(models.Model):
    class Meta:
        db_table        ="tag_alarm"
    alarm               = models.CharField(max_length=120)
    updated         = models.DateTimeField(auto_now=True)
    timestamp           = models.DateTimeField( auto_now_add=True)

class TagScanType(models.Model):
    class Meta:
        db_table        = "tag_scan_type"
    scan_type           = models.CharField(max_length=120)
    updated         = models.DateTimeField(auto_now=True)
    timestamp           = models.DateTimeField( auto_now_add=True)

class TagConversionCode(models.Model):
    class Meta:
        db_table        = "tag_conversion_code"
    conversion_code     = models.CharField(max_length=120)
    updated         = models.DateTimeField(auto_now=True)
    timestamp           = models.DateTimeField( auto_now_add=True)

class TagDetails(SafeDeleteModel):
    class Meta:
        db_table="tags"
    _safedelete_policy = SOFT_DELETE_CASCADE
    tag_name=models.CharField(max_length=120)
    description=models.CharField(max_length=500)
    tag_type=models.ForeignKey(TagType,related_name="tag_type",on_delete=models.CASCADE)
    user=models.ForeignKey(User,related_name='tags_user',on_delete=models.CASCADE)
    updated = models.DateTimeField(auto_now=True)
    timestamp = models.DateTimeField( auto_now_add=True)
    



    tag_name            = models.CharField(max_length=120)
    description         = models.CharField(max_length=500)
    address             = models.CharField(max_length=120,null=True)
    start_bit           = models.IntegerField(null=True)
    length              = models.IntegerField(null=True)
    signal_reverse      = models.CharField(max_length=120, null=True)
    log_data            = models.CharField(max_length=120,null=True)
    data_log_dead_band  = models.IntegerField(null=True)
    write_action_log    = models.CharField(max_length=120,null=True)
    read_only           = models.CharField(max_length=120,null=True)
    keep_previous_value = models.CharField(max_length=120,null=True)
    initial_value       = models.IntegerField(null=True)
    security_area       = models.IntegerField(null=True)
    security_level      = models.IntegerField(null=True)
    status_zero         = models.CharField(max_length=120,null=True)
    status_one          = models.CharField(max_length=120,null=True)
    tag_type            = models.ForeignKey(TagType,related_name="tag_type",on_delete=models.CASCADE,null=True)
    parameter           = models.ForeignKey(TagParameter,related_name="tag_parameter",on_delete=models.CASCADE,null=True)
    alarm               = models.ForeignKey(TagAlarm,related_name="tag_alarm",on_delete=models.CASCADE,null=True)
    scan_type           = models.ForeignKey(TagScanType,related_name="tag_scan_type",on_delete=models.CASCADE,null=True)
    conversion_code     = models.ForeignKey(TagConversionCode,related_name="tag_conversion_code",on_delete=models.CASCADE,null=True)
    user                = models.ForeignKey(User,related_name='tags_user',on_delete=models.CASCADE)
    updated             = models.DateTimeField(auto_now=True)
    timestamp           = models.DateTimeField( auto_now_add=True)

    


        

    