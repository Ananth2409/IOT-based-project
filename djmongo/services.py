from djmongo.models import User,UserProject
from response import getResponse
from project_management.models import ProjectDetails
from djmongo.models import Roles
from django.contrib.auth.hashers import make_password


def get_modal_object(modalname,key,value):
    try:
        return modalname.objects.get(key=value)
    except modalname.DoesNotExist:
        return None

# def assignProject(data):
    
    
    
    
#     return assign_project

        
    

def createUser(data):
    print(data)
    if 'id' not in data:
        user_details=User()
    else:
        try:
            user_details= User.objects.get(id=data['id'])
            assign_project=UserProject.objects.filter(user_id=user_details.id).delete()
        except User.DoesNotExist:
            response=getResponse('failure','detail not found')

    
    if user_details:
        if "first_name" in data:
            user_details.first_name=data['first_name']
        else:
            user_details.first_name=""
        if "last_name" in data:
            user_details.last_name=data['last_name']
        if "email" in data:
            user_details.email=data['email']
        else:
            user_details.email=""
        if "username" in data:
            user_details.username=data['username']
        else:
            user_details.username=""
        if "password" in data:
            hash_password=make_password(data['password'])
            user_details.password=hash_password
        else:
            user_details.password=""
        if "mobile_no" in data:
            user_details.mobile_no=data['mobile_no']
        else:
            user_details.mobile_no=""
        
        user_details.admin_id=data['admin_id']
        user_details.save()
        
        for i in data['project_id']:
            assign_project=UserProject()
            assign_project.user_id      = user_details.id
            assign_project.project_id   = i
            assign_project.analog_tag   = data['analog_tag']
            assign_project.digital_tag  = data['digital_tag']
            assign_project.video_tag    = data['video_tag']
            assign_project.audio_tag    = data['audio_tag']
            assign_project.save()
        response=getResponse('success','successfully created')
        return response
                
 
def checkCurrentRole(obj):
    data={}
    if obj:
        try:
            user_details=User.objects.get(id=obj)
            try:
                role=Roles.objects.get(id=user_details.role_id)
                data["role_id"]=role.id
                data['role_name']=role.role_name
                response=getResponse('success','successfully done',data)
            except Roles.DoesNotExist:
                response=getResponse('failure','something went wrong')
        except User.DoesNotExist:
            response=getResponse('failure','something went wrong')
    else:
       response=getResponse('failure','something went wrong')
    return response
        