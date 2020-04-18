from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework_jwt.authentication import JSONWebTokenAuthentication,BaseJSONWebTokenAuthentication
from rest_framework.permissions import IsAuthenticated
from django.views.decorators.csrf import csrf_exempt
from project_management.serializers.project_serializers import ProjectSerializers,ProjectComponentsSerializers,ComponentsTagSerializers,ComponentsLibrarySerializers
from project_management.serializers.data_process_serializers import DataProcessSerializers
from project_management.models import ProjectDetails,DataProcess,ProjectComponents,ProjectComponentsTags,ComponentsLibrary,CompLibDigitalNotify
from tag_management.models import TagDetails
from response import getResponse
import json
from django.http.response import Http404,HttpResponse,JsonResponse
from rest_framework import serializers
import pdb
import redis
from djmongo.models import User
from django.conf import settings 
from django.core.files.storage import FileSystemStorage
from rest_framework.permissions import AllowAny
from rest_framework.pagination import PageNumberPagination
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from django.core.mail import EmailMessage
from mongonew.utils import send_html_mail
import requests
# from djsms import send_text


# Create your views here.
def sendsms(message,frm,to):
    # url="https://api.textlocal.in/send/?"
    data={'apikey': "rAgShhbkEHk-6R0j9h28B1fqSMQAj25gxpbrmICwbr", 'numbers': to,
        'message' :  message, 'sender': frm}
    request = "https://api.textlocal.in/send/?"
    fr=requests.post(request, data)
    print(fr)
    return fr 
   

class ProjectList(APIView):

    # permission_classes=[IsAuthenticated]
    permission_classes=[AllowAny]
    authentication_classes=[JSONWebTokenAuthentication]
    def get_or_object(self,id):
        try:
            return ProjectDetails.objects.get(id=id)
        except ProjectDetails.DoesNotExist:
            raise Http404

    def post(self,request):
        body_unicode=request.body.decode('utf-8')
        data=json.loads(body_unicode)
        if 'id' in data:
            Comp_tag_instance=self.get_or_object(data['id'])
            serializers=ProjectSerializers(Comp_tag_instance,data=data)
        else:
            serializers=ProjectSerializers(data=data)
        if serializers.is_valid(raise_exception=True):
            serializers.save(user_id=request.user.id)     
            if 'id' not in data:
                response=getResponse('success','successfully updated',serializers.data)
            else:
                response=getResponse('success','successfully created',serializers.data)           
        else:
            response=getResponse('failure','failed to do this operation')
        return response
    
    def get(self,request):
        Project_list=ProjectDetails.objects.all().order_by('-id')
        serializers=ProjectSerializers(Project_list,many=True)
        if serializers:
            response=getResponse('success','successfully got the Project details',serializers.data)
        else:
            response=getResponse('failure','failed to do this operation')
        return response
    
    def delete(self,request):
        body_unicode=request.body.decode('utf-8')        
        data=json.loads(body_unicode)
        delete_Project=self.get_or_object(data['id'])
        if delete_Project:
            delete_Project.delete()
            response=getResponse('success','successfully deleted')
        else:
           response=getResponse('failure','failed to do this operation')
        return response
    
    def put(self,request):
        body_unicode=request.body.decode('utf-8')
        data=json.loads(body_unicode)
        get_Project=self.get_or_object(data['id'])
        serializers=ProjectSerializers(get_Project)
        if serializers:
            response=getResponse('success','successfully got the Project',serializers.data)
        else:
            response=getResponse('failure','failed to do this operation')
        return response

class ProjectValidation(APIView):
    def post(self,request):
        body_unicode=request.body.decode('utf-8')
        data=json.loads(body_unicode)
        try:
            proj_instance=ProjectDetails.objects.get(project_name=data["project_name"])
            response=getResponse("success","successfully got the project_name")
        except ProjectDetails.DoesNotExist:
            response=getResponse("failure","failed to get the project_name")
        return response


class DataProcessList(APIView):
    permission_classes=[IsAuthenticated]
    authentication_classes=[JSONWebTokenAuthentication]
    
    def get_or_object(self,id):
        try:
            return DataProcess.objects.get(id=id)
        except DataProcess.DoesNotExist:
            raise Http404

    def post(self,request):
        body_unicode=request.body.decode('utf-8')
        data=json.loads(body_unicode)
        data["user_id"]=request.user.id
        print("crossed")
        if 'id' in data:
            dp_instance=self.get_or_object(data['id'])
            serializers=DataProcessSerializers(dp_instance,data=data)
        else:
            serializers=DataProcessSerializers(data=data)
        if serializers.is_valid():
            serializers.save()
            r = redis.StrictRedis(host=settings.REDIS_HOST, port=6379, db=0)
            output={}
            output["channel_name"]="project-"+data["project_id"]
            output["data"]=json.dumps(serializers.data)
            r.publish('iot', json.dumps(output))
            wrapper=serializers.data
            print("wrapper",wrapper['tag_id'])
            notify_email=ProjectComponentsTags.objects.filter(tag_id=wrapper['tag_id']).filter(is_active=1)
            print("notify",notify_email)
            for x in notify_email:
                print("x",x.component_id)
                comp_lib=ProjectComponents.objects.filter(id=x.component_id) 
                for y in comp_lib:
                    print("y",y.component_library_id)
                    digi_notify=CompLibDigitalNotify.objects.filter(Component_library_id=y.component_library_id)
                    print("digi_notify",digi_notify)
                    for z in digi_notify:
                        print("status_on_email is",z.status_on_email)
                        print("status_on_sms is",z.status_on_sms)
                        print("status_off_email is",z.status_off_email)
                        print("status_off_sms is",z.status_off_sms)
                        frm = 'GOARIN'
                        to = '9524829751'
                        if wrapper['output']=="0":
                            if z.status_off_email =="true": 
                                # print("email = ",wrapper['output'])
                                email=send_html_mail('DEVICEOFF','device is off','elakkiyamrg6@gmail.com')
                            if z.status_off_sms =="true": 
                                # print("sms = ",wrapper['output'])
                                sendsms('Welcome to GO-AR, An Augmented Reality dining experience!! Your OTP is 696800',frm,to)

                        else:
                            if z.status_on_email =="true":
                                # print("email = ",wrapper['output'])
                                email=send_html_mail('DEVICEON','device is on','elakkiyamrg6@gmail.com')
                            if z.status_on_sms =="true":
                                # print("sms = ",wrapper['output'])
                                sendsms('Welcome to GO-AR, An Augmented Reality dining experience!! Your OTP is 696801',frm,to)                               

                        # if z.status_off_email=="true" or z.status_on_email=="true":
                        #     print("wrap",wrapper['output'])
                        #     # if wrapper['output']=="0":
                        #     #     email = EmailMessage('Subject', 'Device is off', to=['elakkiyamrg6@gmail.com'])
                        #     #     email.send()
                        #     # else:
                        #     #     email = EmailMessage('Subject', 'Device is on', to=['elakkiyamrg6@gmail.com'])
                        #     #     email.send()
                        #     if wrapper['output']=="0":
                        #         print("send mail 0")
                        #         email=send_html_mail('Subject','device is off','ananthpselvam@gmail.com')
                        #     else:
                        #         email=send_html_mail('Subject','device is on','ananthpselvam@gmail.com')
                        # if z.status_on_sms=="true" or z.status_off_sms=="true":
                        #     frm = 'GOARIN'
                        #     to = '9791070329'
                        #     if wrapper['output']=="0":
                        #         print("sms 0")
                        #         message = 'Welcome to GO-AR, An Augmented Reality dining experience!! Your OTP is 696893'
                        #         sendsms(message,frm,to)
                        #     else:
                        #         print("sms 1")
                        #         message = 'Welcome to GO-AR, An Augmented Reality dining experience!! Your OTP is 696893'
                        #         sendsms(message, frm, to)
            
            response=getResponse('success','successfully created')
        else:
            response=getResponse('failure','failed to do this operation')
        return response

    def delete(self,request):
        body_unicode=request.body.decode('utf-8')
        data=json.loads(body_unicode)
        delete_dp=self.get_or_object(data['id'])
        if delete_dp:
            delete_dp.delete()
            response=getResponse('success','successfully deleted')
        else:
            response=getResponse('failure','failed to do this operation')
        return response

    def put(self,request):
        body_unicode=request.body.decode('utf-8')
        data=json.loads(body_unicode)
        get_dp=self.get_or_object(data['id'])
        serializers=DataProcessSerializers(get_dp)
        if serializers:
            response=getResponse('success','successfully got the data',serializers.data)
        else:
            response=getResponse('failure','failed to do this operation')
        return response


class ProjectComponent(APIView):
    # permission_classes=[AllowAny]
    permission_classes=[IsAuthenticated]
    authentication_classes=[JSONWebTokenAuthentication]
    def get_or_object(self,id):
        try:
            return ProjectComponents.objects.get(id=id)
        except ProjectComponents.DoesNotExist:
            raise Http404

    def post(self,request):
        body_unicode=request.body.decode('utf-8')
        data=json.loads(body_unicode)
        data["user_id"]=request.user.id
        if 'id' in data:
            Proj_comp_instance=self.get_or_object(data['id'])
            serializers=ProjectComponentsSerializers(Proj_comp_instance,data=data)
            response=getResponse('success','successfully updated')
        else:
            serializers=ProjectComponentsSerializers(data=data)
           
        if serializers.is_valid(raise_exception=True):
            serializers.save(user_id=request.user.id)
            response=getResponse('success','successfully created',serializers.data)
        else:
            response=getResponse('failure','failed to do this operation')
        return response
    
    def get(self,request):
        Proj_comp_list=ProjectComponents.objects.all().order_by('-id')
        serializers=ProjectComponentsSerializers(Proj_comp_list,many=True)
        if serializers:
            response=getResponse('success','successfully got the Project Component',serializers.data)
        else:
            response=getResponse('failure','failed to do this operation')
        return response
    
    def delete(self,request):
        body_unicode=request.body.decode('utf-8')        
        data=json.loads(body_unicode)
        Delete_proj_comp=self.get_or_object(data['id'])
        if Delete_proj_comp:
            Delete_proj_comp.delete()
            response=getResponse('success','successfully deleted')
        else:
           response=getResponse('failure','failed to do this operation')
        return response
    
    def put(self,request):
        body_unicode=request.body.decode('utf-8')
        data=json.loads(body_unicode)
        Get_proj_comp=self.get_or_object(data['id'])
        serializers=ProjectComponentsSerializers(Get_proj_comp)
        if serializers:
            response=getResponse('success','successfully got the Project Component',serializers.data)
        else:
            response=getResponse('failure','failed to do this operation')
        return response

class ComponentTag(APIView):
    permission_classes=[IsAuthenticated]
    authentication_classes=[JSONWebTokenAuthentication]
    def get_or_object(self,id):
        try:
            return ProjectComponentsTags.objects.get(id=id)
        except ProjectComponentsTags.DoesNotExist:
            raise Http404

    def post(self,request):
        body_unicode=request.body.decode('utf-8')
        data=json.loads(body_unicode)
        if 'id' in data:
            Comp_tag_instance=self.get_or_object(data['id'])
            serializers=ComponentsTagSerializers(Comp_tag_instance,data=data)
            response=getResponse('success','successfully updated')
        
        else:
            serializers=ComponentsTagSerializers(data=data)
            response=getResponse('success','successfully created')
        if serializers.is_valid(raise_exception=True):
            serializers.save(user_id=request.user.id)
            response=getResponse('success','successfully created',serializers.data) 
            if('id' in data):
                response=getResponse('success','successfully updated',serializers.data)
        else:
            response=getResponse('failure','failed to do this operation')
        return response
    
    def get(self,request):
        Comp_tag_list=ProjectComponentsTags.objects.all().order_by('-id')
        serializers=ComponentsTagSerializers(Comp_tag_list,many=True)
        if serializers:
            response=getResponse('success','successfully got the Project Component',serializers.data)
        else:
            response=getResponse('failure','failed to do this operation')
        return response
    
    def delete(self,request):
        body_unicode=request.body.decode('utf-8')        
        data=json.loads(body_unicode)
        Delete_comp_tag=self.get_or_object(data['id'])
        if Delete_comp_tag:
            Delete_comp_tag.delete()
            response=getResponse('success','successfully deleted')
        else:
           response=getResponse('failure','failed to do this operation')
        return response
    
    def put(self,request):
        body_unicode=request.body.decode('utf-8')
        data=json.loads(body_unicode)
        Get_comp_tag=self.get_or_object(data['id'])
        serializers=ComponentsTagSerializers(Get_comp_tag)
        if serializers:
            response=getResponse('success','successfully got the Project Component',serializers.data)
        else:
            response=getResponse('failure','failed to do this operation')
        return response


class ComponentLibraries(APIView):
    permission_classes=[AllowAny]
    authentication_classes=[JSONWebTokenAuthentication]
    def get_or_object(self,id):
        try:
            return ComponentsLibrary.objects.get(id=id)
        except ComponentLibraries.DoesNotExist:
            raise Http404

    def post(self,request):
        if 'id' in request.data:
            library_inst                  =self.get_or_object(request.data['id'])
            try:
                notify_inst               =CompLibDigitalNotify.objects.get(Component_library=request.data['id'])
            except CompLibDigitalNotify.DoesNotExist:
                return None
            # serializers=ComponentsLibrarySerializers(Comp_tag_instance,data=data)
            response=getResponse('success','successfully updated')
        else:
            library_inst                  = ComponentsLibrary()
            notify_inst                   = CompLibDigitalNotify()
            response=getResponse('success','successfully created')
            # serializers=ComponentsLibrarySerializers(data=data)
        # try:
        #     component_inst            = TagType.objects.get(id=request["component_type_id"])
        # except TagType.DoesNotExist:
        #     raise Http404
        if library_inst:
            library_inst.name               = request.data["name"]
            library_inst.user_id            = request.user.id
            library_inst.component_type_id  = request.data["component_type_id"]
            library_inst.save()
            
            file1                           = request.FILES["default_image"]
            file2                           = request.FILES["status_on"]
            file3                           = request.FILES["status_off"]

            if file1:

                path                              = 'static/media/'+str(library_inst.id)
                fs                                = FileSystemStorage(path)
                filename                          = fs.save(file1.name,file1)
                library_inst.default_image        = path+'/'+filename

            if file2:
                path                              = 'static/media/'+str(library_inst.id)
                fs                                = FileSystemStorage(path)
                filename                          = fs.save(file2.name,file2)
                library_inst.status_on            = path+'/'+filename
            
            if file3:
                path                              = 'static/media/'+str(library_inst.id)
                fs                                = FileSystemStorage(path)
                filename                          = fs.save(file3.name,file3)
                library_inst.status_off           = path+'/'+filename
            
            library_inst.save()  
            if notify_inst:
                notify_inst.status_on_email           =request.data["status_on_email"]
                notify_inst.status_off_email          =request.data["status_off_email"]   
                notify_inst.status_on_sms             =request.data["status_on_sms"]
                notify_inst.status_off_sms            =request.data["status_off_sms"]  
                notify_inst.Component_library_id      =library_inst.id
                notify_inst.save()
            
        else:
            
            response=getResponse('failure','failed to do this operation')
        return response
    
    def get(self,request):
        final=[]
        Library_list=ComponentsLibrary.objects.all().order_by('-id')
        # for i in Library_list:
        #     k=CompLibDigitalNotify.objects.get(Component_library=i.id)
            
        serializers=ComponentsLibrarySerializers(Library_list,many=True)
        if serializers:
            response=getResponse('success','successfully got the Project Component',serializers.data)
        else:
            response=getResponse('failure','failed to do this operation')
        return response
    
    def delete(self,request):
        body_unicode=request.body.decode('utf-8')        
        data=json.loads(body_unicode)
        Delete_lib=self.get_or_object(data['id'])
        if Delete_lib:
            Delete_lib.delete()
            response=getResponse('success','successfully deleted')
        else:
           response=getResponse('failure','failed to do this operation')
        return response
    
    def put(self,request):
        body_unicode=request.body.decode('utf-8')
        data=json.loads(body_unicode)
        Get_lib=self.get_or_object(data['id'])
        serializers=ComponentsLibrarySerializers(Get_lib)
        if serializers:
            response=getResponse('success','successfully got the Project Component',serializers.data)
        else:
            response=getResponse('failure','failed to do this operation')
        return response

class ComponentList(APIView):
    permission_classes=[IsAuthenticated]
    authentication_classes=[JSONWebTokenAuthentication]
    

    def get(self,request):
        page=request.GET.get('page')
        count=request.GET.get('count')
        data={}
        final_array=[]
        try:
            # comp_tg_inst=ProjectComponentsTags.objects.raw("select a.id,a.project_id,a.component_id,d.name, a.tag_id,b.component_name,c.tag_type_id,e.project_name,b.created_at,b.updated_at from project_components_tags as a INNER JOIN project_component as b on a.component_id && a.is_active=1 = b.id && b.user_id="+str(request.user.id) +" INNER JOIN tags as c on a.tag_id=c.id INNER JOIN tagtype as d on c.tag_type_id=d.id INNER JOIN project as e on e.id=a.project_id")
            comp_tg_inst= ProjectComponentsTags.objects.raw("select a.id,a.tag_name,e.name,b.component_id,c.component_name,d.project_name from tags as a left join project_components_tags as b on a.id = b.tag_id && is_active=1 left join  project_component as c on  b.component_id  = c.id  left join project as d on d.id=b.project_id left join tagtype as e on e.id=a.tag_type_id")
        except ProjectComponentsTags.DoesNotExist:
            response=getResponse('failure','failed to do this operation',"data not found")
        # comp_tg_inst.columns //['id','component_name','tag_id' etc.,]
        paginator=Paginator(comp_tg_inst,count)
        use=paginator.page(page)

        for obj in use:
        # for obj in comp_tg_inst:
            data={}
            data['id']=obj.id
            if obj.component_name:
                data["component_name"]=obj.component_name
            else:
                data["component_name"]="-"
            
            data['tag_id']            =obj.id
            data['tag_name']          =obj.tag_name
            data['tag_type']          =obj.name
            if obj.project_name:
                 data["project_name"] =obj.project_name
            else:
                data["project_name"]  ="-"
           
            data["component_id"]      =obj.component_id
           
            # data["created_at"]=obj.created_at
            # data["updated_at"]=obj.updated_at
            final_array.append(data)
        if use.has_previous():
            previous_page             =use.previous_page_number() 
        else:
            previous_page             =""
        if use.has_next():
            next_page                 =use.next_page_number()
        else:
            next_page                 =""
        num_of_pages                  =paginator.num_pages
        if final_array:
            
            response=getResponse('success','successfully got component list',final_array,previous_page,next_page,num_of_pages)
        else:
            response=getResponse('failure','failed to do this operation')
        return response

    def post(self,request):
        body_unicode=request.body.decode('utf-8')
        data=json.loads(body_unicode)
        print(data)
        final_array=[]
        try:
            comp_tg_inst=ProjectComponentsTags.objects.raw("select a.id,d.name, a.tag_id,b.component_name,c.tag_type_id,e.project_name,b.created_at,b.updated_at from project_components_tags as a INNER JOIN project_component as b on a.project_id =" +str(data["project_id"])+"&& a.is_active=1 = b.id && b.user_id="+str(request.user.id) +" INNER JOIN tags as c on a.tag_id=c.id INNER JOIN tagtype as d on c.tag_type_id=d.id INNER JOIN project as e on e.id=a.project_id")
        except ProjectComponentsTags.DoesNotExist:
            return getResponse('failure','failed to do this operation',"data not found")
        # comp_tg_inst.columns //['id','component_name','tag_id' etc.,]
        # paginator=Paginator(comp_tg_inst,count)
        # use=paginator.page(page)

        # for obj in use:
        for obj in comp_tg_inst:
            data={}
            data['id']=obj.id 
            data['component_name']=obj.component_name
            data['tag_id']=obj.tag_id
            data['tag_type']=obj.name
            data["project_name"]=obj.project_name
            
            # data["created_at"]=obj.created_at
            # data["updated_at"]=obj.updated_at
            final_array.append(data)
        
        if final_array:
            
            response=getResponse('success','successfully got component list',final_array)
        else:
            response=getResponse('failure',"data not found")
        return response

   
    