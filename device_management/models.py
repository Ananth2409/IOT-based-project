from django.db import models

# Create your models here.
class DeviceDetails(models.Model):
    device_type=models.IntegerField()
    device_name=models.CharField(max_length=120)
    device_image=models.CharField(max_length=200)

    def __str__(self):
        return self.name

class Tags(models.Model):
    tag_name=models.CharField(max_length=120)
    ip_address=models.BigIntegerField()
    polling_interval=models.BigIntegerField()
    device=models.ForeignKey(DeviceDetails,related_name="tags",on_delete=models.CASCADE)

    def __str__(self):
        return self.ip_address