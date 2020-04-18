

# Create your models here.
from mongoengine import *
class device(Document):
    email = StringField(required=True)
    first_name = StringField(max_length=50)
    last_name = StringField(max_length=50)
    field_one= StringField(max_length=50)
    field_two= StringField(max_length=50)
    field_three=StringField(max_length=50)
    field_four=StringField(max_length=1000)
    field_five=StringField(max_length=1000)
    field_six=StringField(max_length=1000)
    field_seven=StringField(max_length=50)
    field_eight=StringField(max_length=50)
    field_nine=StringField(max_length=50)
    field_ten=StringField(max_length=50)
    field_eleven=StringField(max_length=50)
    field_twelve=StringField(max_length=50)
    field_thirteen=StringField(max_length=50)
    field_fourteen=StringField(max_length=50)
    field_fifteen=StringField(max_length=50)
    field_sixteen=StringField(max_length=50)
    field_seventeen=StringField(max_length=50)
    field_eighteen=StringField(max_length=50)
    user_id=IntField()
    # field_teen=StringField(max_length=50)
    # field_twenty=StringField(max_length=50)
    

