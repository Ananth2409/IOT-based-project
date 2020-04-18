from rest_framework import serializers
from tag_management.models import TagType

class TagTypeSerializers(serializers.ModelSerializer):
    class Meta:
        model=TagType
        fields=("__all__")


