import os
from django.shortcuts import render,redirect,reverse
from rest_framework.views import APIView
from .mongo_models import device
from .models import User,UserProject
from django.contrib.auth.models import Group,Permission
from django.http import JsonResponse,response,HttpResponse,HttpResponseRedirect
from mongoengine import *
from django.views.decorators.csrf import csrf_exempt
from djmongo.JSONEncoder import JSONEncoder
from response import getResponse
from bson import ObjectId
from bson import json_util
from django.contrib.auth.hashers import make_password
from django.contrib.auth import authenticate, login, logout
from rest_framework import permissions
from rest_framework_jwt.settings import api_settings
from rest_framework.permissions import (
AllowAny,IsAuthenticated
)
from rolepermissions.decorators import has_role_decorator,has_permission_decorator
from rest_framework_jwt.authentication import JSONWebTokenAuthentication,BaseJSONWebTokenAuthentication
from django.contrib.auth.decorators import login_required,permission_required
from django.views.decorators.http import require_http_methods
from djmongo.permissions import ToCreateEngineer
from rolepermissions.roles import assign_role
from django.shortcuts import render
from django.contrib.auth.decorators import user_passes_test
from rest_framework_jwt.serializers import VerifyJSONWebTokenSerializer
from rest_framework_jwt.views import verify_jwt_token
import logging
from django.core.exceptions import FieldError,ValidationError
from djmongo.serializers.role_serializers import RoleSerializers
from djmongo.serializers.module_serializers import ModuleSerializers
from django.http import Http404
import json
from rest_framework.parsers import JSONParser
from django.db import connection
import requests
import time
import urllib
import urllib.request
import urllib.parse
from django.conf import settings 
from django.template.loader import render_to_string
from mongonew.utils import send_html_mail
from django.core.mail import EmailMessage
from django.contrib.sites.shortcuts import get_current_site
import random
import string
from .models import PasswordReset
# import dateutil
import datetime
from djmongo.services import createUser,checkCurrentRole
from project_management.models import ProjectDetails


# from json import JSONEncoder
# Create your views here.


def create_view(request):
    print(request.session.session_key)
    return JsonResponse("okay",safe=False)



class create(APIView):
    connect("test")
    authentication_classes = (JSONWebTokenAuthentication,)
    permission_classes=[ToCreateEngineer]
    def post(self,request):
        responseblock={}
        print(request)
        if request.method=="POST":
           
            add=device()
            add.email=request.data["email"]
            add.first_name=request.data["first_name"]
            add.last_name=request.data["last_name"]
            add.field_one=request.data["field_one"]
            add.field_two=request.data["field_two"]
            add.field_three=request.data["field_three"]
            add.field_four=request.data["field_four"]
            add.field_five=request.data["field_five"]
            add.field_six=request.data["field_six"]
            add.field_seven=request.data["field_seven"]
            add.field_eight=request.data["field_eight"]
            add.field_nine=request.data["field_nine"]
            add.field_ten=request.data["field_ten"]
            add.field_eleven=request.data["field_eleven"]
            add.field_twelve=request.data["field_twelve"]
            add.field_thirteen=request.data["field_thirteen"]
            add.field_fourteen=request.data["field_fourteen"]
            add.field_fifteen=request.data["field_fifteen"]
            add.field_sixteen=request.data["field_sixteen"]
            add.field_seventeen=request.data["field_seventeen"]
            add.field_eighteen=request.data["field_eighteen"]
            add.user_id=request.user.id
            # add.field_teen=request.data["teen"]
            # add.field_twenty=request.data["twenty"]
            
            add.save()
            responseblock['status']="success"
            responseblock['message']="successfully created"
        else:
           responseblock['status']="failure"
           responseblock['message']="something went wrong"

        return JsonResponse(responseblock)

    def get(self,request):
        
        responseblock={}
        print(request)
        final_array=[]
        user=device.objects.all().order_by('-id')
        object_id=[]
        if user:
            for obj in user:
                data={}
                data["id"]=str(obj.id)
                data['email']=obj.email
                data['first_name']=obj.first_name
                data['last_name']=obj.last_name
                data["field_one"]=obj.field_one
                data["field_two"]=obj.field_two
                final_array.append(data)
            responseblock['status']="success"
            responseblock['message']="successfully created"
            responseblock['data']=final_array
            
        else:
           responseblock['status']="failure"
           responseblock['message']="something went wrong"
           
        return JsonResponse(responseblock)
class CreateUser(APIView):
    authentication_classes=[JSONWebTokenAuthentication]
    # permission_classes=[ToCreateEngineer]
    def post(self,request):
        responseblock={}
        body_unicode=request.body.decode('utf-8')
        data=json.loads(body_unicode)
        data['admin_id']=request.user.id #need to change later
        if 'id' in request.data:
            response=createUser(data)
        else:
            response=createUser(data)
        
        # if 'id' in request.data:
        #     if request.user.id != int(data['id']):
        #         user_details=User.objects.get(id=data['id'])
        #         if user_details:
        #             responseblock['status']="success"
        #             responseblock['message']="successfully user updated"
        #     else:
        #         responseblock['status']="failure"
        #         responseblock['message']="something went wrong"
        # else:
        #     user_details=User()
        #     responseblock['status']="success"
        #     responseblock['message']="successfully user created"
       
        #     if user_details is not None:
        #         if "first_name" in data:
        #             user_details.first_name=data['first_name']
        #         else:
        #             user_details.first_name=""
        #         if "last_name" in data:
        #             user_details.last_name=data['last_name']
        #         else:
        #             user_details.last_name=""
        #         if "email" in data:
        #             user_details.email=data['email']
        #         else:
        #             user_details.email=""
        #         if "username" in data:
        #             user_details.username=data['username']
        #         else:
        #             user_details.username=""
        #         if "password" in data:
        #             hash_password=make_password(data['password'])
        #             user_details.password=hash_password
        #         else:
        #             user_details.password=""
        #         if "mobile_no" in data:
        #             user_details.mobile_no=data['mobile_no']
        #         else:
        #             user_details.mobile_no=""
        #         user_details.save()
        #         try:
        #             user=User.objects.get(id=user_details.id)
        #             print("create role for the user")
        #             if "role" in data:
        #                 print("assing role",data['role'])
        #                 print("assign role to this user id",user.id)
        #                 assign_role(user,data['role'])
        #         except:
        #             User.DoesNotExist
        #     else:
        #         responseblock['status']="failure"
        #         responseblock['message']="something went wrong"
        return response
    def get(self,request):
        logger=logging.getLogger(__name__)
        # group=User.objects.filter(groups__name='Engineer').order_by('-id')
        user_obj=User.objects.filter(admin_id=request.user.id).order_by('-id')
        final_array=[]
        responseblock={}
        if user_obj:
            logger.debug("something went wrong")
            for obj in user_obj:
                data={}
                data["id"]=obj.id
                data['first_name']=obj.first_name
                data['last_name']=obj.last_name
                data['username']=obj.username
                data["email"]=obj.email
                data["mobile_no"]=obj.mobile_no
                final_array.append(data)
            responseblock['status']="success"
            responseblock['message']="successfully created"
            responseblock['data']=final_array
        else:
            responseblock['status']="failure"
            responseblock['message']="something went wrong"
        return JsonResponse(responseblock)
    def delete(self,request):
        responseblock={}
        delete_user=User.objects.get(id=request.data['id'])
        if delete_user:
            delete_user.delete()
            responseblock['status']='success'
            responseblock['message']="successfully deleted"
        else:
            responseblock['status']="failure"
            responseblock['message']="something went wrong"
        return JsonResponse(responseblock)

class getuserbyid(APIView):
    def post(self,request):
        body_unicode=request.body.decode('utf-8')
        req_data=json.loads(body_unicode)
        responseblock={}
        data={}
        projects_array=[]
        try:
            get_user=User.objects.get(id=req_data["id"])
            data["id"]=get_user.id
            data['first_name']=get_user.first_name
            data['last_name']=get_user.last_name
            data['username']=get_user.username
            data["email"]=get_user.email    
            data["mobile_no"]=get_user.mobile_no  
            user_projects=UserProject.objects.filter(user_id=req_data['id'],deleted__isnull=True)
            for projects in user_projects:
                user_project=ProjectDetails.objects.get(id=projects.project_id)
                data_proj={}
                data_proj['id']=user_project.id
                data_proj['project_name']=user_project.project_name
                data_proj['description']=user_project.description
                data_proj['project_design_json']=user_project.project_design_json
                projects_array.append(data_proj)
                data['analog_tag']=projects.analog_tag
                data['digital_tag']=projects.digital_tag
                data['video_tag']  =projects.video_tag
                data['audio_tag']  =projects.audio_tag
            
            data["projects_id"]= projects_array
           
            responseblock['status']='success'
            responseblock['message']='successfully got user'
            responseblock['data']=data
        except:
            responseblock['status']='failure'
            responseblock['message']='User Does Not Exist'
        # groups=Group.objects.get()
        return JsonResponse(responseblock)
            


class loginnew(APIView):
    permission_classes=[AllowAny]
    
    def post(self,request):
        responseblock={}
        body_unicode = request.body.decode('utf-8')
        data=json.loads(body_unicode)
        # email=request.data['email']
        # password=request.data['password']
        email           =   data['email']
        password        =   data['password']
        user=authenticate(email=email,password=password)
        if user:
            login(request,user)
            if request.user.is_authenticated:
                print (user.id)
                # print(request.session)
                # role=Group.objects.get(id=user.id)
            # print("role is",role)
            jwt_payload_handler=api_settings.JWT_PAYLOAD_HANDLER
            jwt_encode_handler=api_settings.JWT_ENCODE_HANDLER
            payload = jwt_payload_handler(user)
            temp_token = jwt_encode_handler(payload)
            token = "Bearer " + temp_token
            # print(token)
            responseblock['status']="success"
            responseblock['message']="successfully logged in"
            responseblock['token']=token
            response=JsonResponse(responseblock)
            response.set_cookie('cookie',token)
            #let me understand if the cookie disabled in the browser settings, what wil happens? 
        else:
            responseblock['status']="failure"
            responseblock['message']="something went wrong"
            response=JsonResponse(responseblock)
        return response


def weblogin (request):
    if request.method=="GET":
        if 'cookie' in request.COOKIES:
            return HttpResponseRedirect("/welcome")
        else:
            return render(request,"login.html",)


class welcome(APIView):
    permission_classes=[AllowAny]
    def get(self,request):
        if 'cookie' in request.COOKIES:
            cookie_value=request.COOKIES['cookie']
            " ".join(cookie_value.split("%20"))
            token=cookie_value.split(" ")
            # print(token[-1])
            data = {'token': token[-1]}
            headers={'Content-Type':'application/json'}
            r = requests.post("http://"+request.META['HTTP_HOST']+"/api-token-verify/",data=json.dumps(data),headers=headers)
            if r.status_code==200:
                return render(request,"welcome.html")
        else:
        #    return redirect(reverse('login-view'))
            return HttpResponseRedirect('/login') 
            """ if you would like to use redirect(reverse()) you need to specify a namespace or name keyword in the url itself,
            say for eg  url(r'^$', views.weblogin, name='login-view'), login-view is the namespace
             
             """
        

# class webform(APIView):
#     def get(self,request):
#         return render(request,"forms.html")
# class webuser(APIView):
#     permission_classes=(IsAuthenticated,)
#     def get(self,request):
        
#         print("jdklj",request.user)
#         return render(request,"user.html")

class webuserlist(APIView):
    permission_classes=(AllowAny,)
    def get(self,request):
        return render(request,"userlist.html")

class check_user(APIView):
    def checkuser(self,username):
        try:
            user_exists=User.objects.get(username=username)
            response=getResponse("success","successfully got the user")
        except:
            response=getResponse("failure","nith does not exist")
        return response

    def post(self,request):
        responseblock={}
        if 'id' in request.data:
            try:
                user_exists=User.objects.get(id=request.data['id'])
                if user_exists.username ==request.data['username']:
                    response=getResponse("failure","failed to get the user")
                else:
                    response=self.checkuser(request.data["username"])
            except:
                 response=getResponse("failure","user does not exist")
        else:
            response=self.checkuser(request.data["username"])
        return response
@csrf_exempt
def dropdownlist(request):
    try:
        final_array=[]
        userGroup=Group.objects.all()
        for group  in userGroup:
            data={}
            data['id']=group.id
            data['name']=group.name
            final_array.append(data)
        response=getResponse("success","successfully got the user",final_array)
    except Group.DoesNotExist:
        response=getResponse("failure","failed to get the group")
    return response
    
class roleview(APIView):
    permission_classes=[AllowAny]
    def get_or_object(self,id):
        try:
            return Group.objects.get(id=id)
        except Group.DoesNotExist:
            return Http404
    def post(self,request):
        data=request.data
        if 'id' in data:
            group_instance=self.get_or_object(data['id'])
            serializers=RoleSerializers(group_instance,data=data)
        else:
            serializers=RoleSerializers(data=data)
        if serializers.is_valid():
            serializers.save()
            response= getResponse('success','successfully created')
        else:
            response=getResponse('failure','failed to do this operation')
        return response
    def get(self,request):
        data=request.data
        group_instance=Group.objects.all()
        serializers=RoleSerializers(group_instance,many=True)
        if group_instance:
            response=getResponse('success','successfully got it',serializers.data)
        else:
            response=getResponse('failure','failed to do this operation')
        return response
    def delete(self,request):
        print("delete this data")
        body_unicode=request.body.decode('utf-8')
        data=json.loads(body_unicode)
        delete_permission=self.get_or_object(data['id'])
        if delete_permission:
            delete_permission.delete()
            response=getResponse('success','successfully deleted')
        else:
           response=getResponse('failure','failed to do this operation')
        return response

class RoleDetail(APIView):
    permission_classes=[AllowAny]
    def post(self,request):
        try:
            group_value=Group.objects.get(id=request.data['id'])
            serializers=RoleSerializers(group_value)
            response=getResponse('success','successfully got the details',serializers.data)
        except Group.DoesNotExist:
            response=getResponse('failure','failed to get the user')
        return response
class ModuleList(APIView):
    permission_classes=[AllowAny]
    def get_or_object(self,id):
        try:
            return Permission.objects.get(id=id)
        except Permission.DoesNotExist:
            raise Http404
    def post(self,request):
        data=request.data
        if 'id' in request.data:
            permission_instance=Permission.objects.get(id=request.data['id'])
            serializers=ModuleSerializers(permission_instance,data=data)
        else:
            serializers=ModuleSerializers(data=data)
        if serializers.is_valid():
            serializers.save()
            response= getResponse('success','successfully created',serializers.data)
        else:
            response= getResponse('failure','failed to do this operation')
        return response
        
    def get(self,request):
        data=request.data
        permission_instance=Permission.objects.filter(content_type_id=str(7))
        serializers=ModuleSerializers(permission_instance,many=True)
        if serializers:
            response= getResponse('success','successfully got the details',serializers.data)
        else:
            response= getResponse('failure','failed to do this operation')
        return response

    def delete(self,request):
        body_unicode=request.body.decode('utf-8')
        data=json.loads(body_unicode)
        delete_permission=self.get_or_object(data['id'])
        if delete_permission:
            delete_permission.delete()
            response=getResponse('success','successfully deleted')
        else:
           response=getResponse('failure','failed to do this operation')
        return response
    def put(self,request):
        body_unicode=request.body.decode('utf-8')
        data=json.loads(body_unicode)
        get_permission=self.get_or_object(data['id'])
        serializers=ModuleSerializers(get_permission)
        if serializers:
            response=getResponse('success','successfully got the details',serializers.data )
        else:
           response=getResponse('failure','failed to do this operation')
        return response


class AttachModule(APIView):
    def post(self,request):
        body_unicode=request.body.decode('utf-8')
        data=json.loads(body_unicode)
        print(data)
        # cursor = connection.cursor()
        # cursor.execute('''INSERT INTO auth_group_permissions (group_id,permission_id) Values(data["group_id"],data["permission_id"])''')
        # cursor.execute(''' SELECT * FROM auth_group_permissions''')
        group_instance=Group.objects.get(id=data["role_id"])
        print("group ",group_instance)
        try:
           group_instance.permissions.clear()
        except:
            response=None
        if group_instance:
      
            c=[]   
            for i in data["selectedpermission"]:
                data={}
                per=Permission.objects.get(id=i)
                group_instance.permissions.add(per)

            response=getResponse("success","successfully created")
        else:
            response=getResponse("failure","failed to do this operation")

        return response
        # for i in range(0,3):
        #     Group_v=User.objects.raw("INSERT INTO auth_group_permissions (group_id,permission_id) Values( '{0}','{1}')".format(data["group_id"],data["permission_id"]))
        # for i in Group_v:
        #     print(i.permission_id)
        # # serializer=AuthGroupPermissionSerializer(data=data)
        # if serializer.is_valid():
        #     serializer.save()
        # return getResponse("success","successfully created")

        # nothing=Group.objects.raw("INSERT INTO auth_group_permissions (group_id,permission_id) Values(2,10)")
        # print(nothing)
#         > G1=Group.objects.get(id=1)
# >>> p1=Permission.objects.get(id=29)
# >>> G1.group_permissions.add(p1)
# Traceback (most recent call last):
#   File "<console>", line 1, in <module>
# AttributeError: 'Group' object has no attribute 'group_permissions'
# >>> G1.permissions.add(p1)
# >>> G1.group_permissions.add(p1)
       
class RolePermission(APIView):
    def post(self,request):
        body_unicode=request.body.decode('utf-8')
        data=json.loads(body_unicode)
        final_array=[]
        if request.method=="POST":
            per=Permission.objects.filter(group__id=data["id"])
            print(per)
            if per:
                for key in per:
                    data={}
                    data["id"]=key.id
                    # data["code_name"]=key.codename
                    final_array.append(data)
                response=getResponse("success","successfully done",final_array)
            else:
                response=getResponse("failure","failed to do this operation")

        return response 
    def get(self,request):
        group_array=[]
        group_inst=Group.objects.all()
        if group_inst:
            for group_key in group_inst:
                data={}
                data["role_"]=group_key.name
                per_inst=Permission.objects.filter(group__id=group_key.id)
                # print(per)
                per_array=[]
                for per_key in per_inst:
                    per_data={}
                    per_data["permission"]=per_key.codename
                    per_array.append(per_data)
                    # per_array.append(per_key.codename)
                data["permission_are"]=per_array
                group_array.append(data)
            response=getResponse("success","successfully done",group_array)
        else:
            response=getResponse("failure","failed to do this operation") 
        return response

# def get_user(obj):
#     try:
#         return User.objects.get(email=obj)
#     except User.DoesNotExist:
#         raise Http404                                          


@csrf_exempt
def sendResetPwdEmail(request):
    print('reset')
    digits = "".join( [random.choice(string.digits) for i in range(8)] )
    chars = "".join( [random.choice(string.ascii_letters) for i in range(15)])
    token=digits+chars
    if request.method=="POST":
        body_unicode=request.body.decode('utf-8')
        data=json.loads(body_unicode)
        email=data['email']
        print(email)
        
        try:
            user_check=User.objects.get(email=email)
            print(user_check)
            mail_subject='Reset password'        
            current_site = get_current_site(request)  
            pwd_rst=PasswordReset()
            pwd_rst.token=token
            pwd_rst.expires_at=datetime.datetime.now()+datetime.timedelta(hours=1)
            pwd_rst.user_id=user_check.id
            pwd_rst.save()    
            print(token)
            message = render_to_string('password_reset_mail.html',{
                'domain':current_site.domain,
                'token':token
                })

            send_html_mail(mail_subject,message,"ananthpselvam@gmail.com")
            response=getResponse('success','successfully sent email')
        except User.DoesNotExist:
            print('not found')
            response=getResponse('failure','email not found')

        # email_s=EmailMessage(mail_subject, message, to=["ananthpselvam@gmail.com"])
        # email_s.send()  
       
    else:
        response=getResponse('failure','something went wrong')
    
    return response






@csrf_exempt
def password_reset(request):
    
    body_unicode=request.body.decode('utf-8')
    data=json.loads(body_unicode)
    token=data['token']
    password1=data['password1']
    password2=data['password2'] 
    try:
        pwd_rst=PasswordReset.objects.get(token=token,status=1)
        print(pwd_rst)
    except PasswordReset.DoesNotExist:
        raise Http404
    print(pwd_rst.user_id)
    try:
        user_info=User.objects.get(id=pwd_rst.user_id)
    except PasswordReset.DoesNotExist:
        raise Http404
    if password1==password2:
        user_info.password=make_password(password2)
        user_info.save()
        pwd_rst.status=0
        pwd_rst.save()
        response=getResponse('success','successfully resetted password')
    else:
        response=getResponse('failure','password mismatch')
    return response

def reset_page(request,token):
    # print('allow to reset')
    # print(token)
    try:
        pwd_rst=PasswordReset.objects.get(token=token,status=1)
        print(pwd_rst)
    except PasswordReset.DoesNotExist:
        return HttpResponse('link is invalid') 
    if datetime.datetime.now()<pwd_rst.expires_at:
        return render(request,'reset_password.html')       
    return HttpResponse('link is invalid')  

def web_forgot(request):
    return render(request,'forgot_password.html')

def web_email_sent(request):
    return render(request,'email_sent.html')


class UserRole(APIView):
    pass

class CheckCurrentRole(APIView):
    
    permission_classes=[AllowAny]
    authentication_classes=[JSONWebTokenAuthentication]
    def get(self,request):
        print("welcome to role")
        if request.user.id:
            response=checkCurrentRole(request.user.id)
        else:
            response=getResponse('failure','something went wrong')
        return response
    
        


        











































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































        
        
            
            


