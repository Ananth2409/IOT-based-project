from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework_jwt.authentication import JSONWebTokenAuthentication,BaseJSONWebTokenAuthentication
from rest_framework.permissions import IsAuthenticated
from django.views.decorators.csrf import csrf_exempt
from project_management.models import ProjectDetails,DataProcess,ProjectComponents,ProjectComponentsTags
from tag_management.serializers.tag_serializers import TagSerializers
from tag_management.serializers.tag_type_serializers import TagTypeSerializers
from tag_management.models import TagDetails,TagType
from response import getResponse
import json
from django.http.response import Http404
from rest_framework.permissions import AllowAny
from django.core.paginator import Paginator

# Create your views here.
class TagList(APIView):


    permission_classes = [AllowAny]
    authentication_classes=[JSONWebTokenAuthentication]
    def get_or_object(self,id):
        try:
            return TagDetails.objects.get(id=id)
        except TagDetails.DoesNotExist:
            raise Http404

    def post(self,request):
        body_unicode=request.body.decode('utf-8')
        data=json.loads(body_unicode)
        data["user_id"]=request.user.id
        if 'id' in data:
            tag_instance=self.get_or_object(data['id'])
            serializers=TagSerializers(tag_instance,data=data)
        else:
            serializers=TagSerializers(data=data)
        if serializers.is_valid(raise_exception=True):
            serializers.save()
            if 'id' not in data:
                response=getResponse('success','successfully created',serializers.data)
            else:
                response=getResponse('success','successfully updated',serializers.data)
        else:
            response=getResponse('failure','failed to do this operation',serializers.data)
        return response

    def get(self,request):
        tag_list=TagDetails.objects.all().order_by('-id')
        # if 'page' in request.GET and 'count' in request.GET:
        if set(('page','count')) <= request.GET.keys(): 
            page=request.GET.get("page")
            count=request.GET.get("count")
            paginator=Paginator(tag_list,count)
            tags=paginator.page(page)
            previous_page=""
            next_page=""
            if tags.has_previous():
                previous_page = str(tags.previous_page_number())
            if tags.has_next():
                next_page     = str(tags.next_page_number())
            num_pages         = paginator.num_pages
            serializers=TagSerializers(tags,many=True)
            if serializers:
                response=getResponse('success','successfully got the tag details',serializers.data,previous_page,next_page,num_pages)
            else:
                response=getResponse('failure','failed to do this operation')
        else:
            serializers=TagSerializers(tag_list,many=True)
            if serializers:
                response=getResponse('success','successfully got the tag details',serializers.data)
            else:
                response=getResponse('failure','failed to do this operation')
        
       
        return response

    def delete(self,request):
        body_unicode=request.body.decode('utf-8')
        
        data=json.loads(body_unicode)
        delete_tag=self.get_or_object(data['id'])
        if delete_tag:
            delete_tag.delete()
            response=getResponse('success','successfully deleted')
        else:
            response=getResponse('failure','failed to do this operation')
        return response

    def put(self,request):
        body_unicode=request.body.decode('utf-8')
        data=json.loads(body_unicode)
        get_tag=self.get_or_object(data['id'])
        serializers=TagSerializers(get_tag)       
        if serializers:
            response=getResponse('success','successfully got the tag',serializers.data)
        else:
            response=getResponse('failure','failed to do this operation')
        return response

class TagTypeList(APIView):


    permission_classes = [AllowAny]
    authentication_classes=[JSONWebTokenAuthentication]
    def get_or_object(self,id):
        try:
            return TagType.objects.get(id=id)
        except TagType.DoesNotExist:
            raise Http404

    def post(self,request):
        body_unicode=request.body.decode('utf-8')
        data=json.loads(body_unicode)
        if 'id' in data:
            tag_instance=self.get_or_object(data['id'])
            serializers=TagTypeSerializers(tag_instance,data=data)
        else:
            serializers=TagTypeSerializers(data=data)
        if serializers.is_valid():
            serializers.save()
            response=getResponse('success','successfully created',serializers.data)
        else:
            response=getResponse('failure','failed to do this operation',serializers.data)
        return response

    def get(self,request):
        tag_list=TagType.objects.all().order_by('-id')
        serializers=TagTypeSerializers(tag_list,many=True)
        if serializers:
            response=getResponse('success','successfully got the tag details',serializers.data)
        else:
            response=getResponse('failure','failed to do this operation')
        return response

    def delete(self,request):
        body_unicode=request.body.decode('utf-8')
        
        data=json.loads(body_unicode)
        delete_tag=self.get_or_object(data['id'])
        if delete_tag:
            delete_tag.delete()
            response=getResponse('success','successfully deleted')
        else:
            response=getResponse('failure','failed to do this operation')
        return response

    def put(self,request):
        body_unicode=request.body.decode('utf-8')
        data=json.loads(body_unicode)
        get_tag=self.get_or_object(data['id'])
        serializers=TagTypeSerializers(get_tag)
        if serializers:
            response=getResponse('success','successfully got the tag',serializers.data)
        else:
            response=getResponse('failure','failed to do this operation')
        return response


class TagUnAssign(APIView):
    permission_classes=[IsAuthenticated]
    authentication_classes=[JSONWebTokenAuthentication]

    def post(self,request):
        body_unicode=request.body.decode('utf-8')
        data=json.loads(body_unicode)
        arr=[]
        final_array=[]
        try:
            unassign_tag=TagDetails.objects.exclude(pk__in=[i.tag_id for i in ProjectComponentsTags.objects.filter(is_active=1)])
            for i in unassign_tag:
                arr.append(i.id)
            try:
                    v=TagDetails.objects.get(pk__in=[i.tag_id for i in ProjectComponentsTags.objects.filter(component_id=data["component_id"],is_active=1)])
                    arr.append(v.id)
            except TagDetails.DoesNotExist:
                arr=arr
        except TagDetails.DoesNotExist:
            raise Http404
        for i in arr:
            data={}
            data['tag_id']=i
            final_array.append(data)
        if final_array:
            response=getResponse('success','successfully got the unassigned tag',final_array)
        else:
            response=getResponse('failure','failed to do this operation')
        return response
    
    def get(self,request):
        final_array=[]
        
        page=request.GET.get("page")
        count=request.GET.get("count")
        try:
            
            unassign_tag=unassign_tag=TagDetails.objects.exclude(pk__in=[i.tag_id for i in ProjectComponentsTags.objects.filter(is_active=1)])
            paginator=Paginator(unassign_tag,count)
            try:
                page_obj=paginator.page(page)
                for obj in page_obj:
                    data={}
                    try:
                        tag_type_inst=TagType.objects.get(id=obj.tag_type_id)
                    except TagType.DoesNotExist:
                        raise Http404
                    data["tag_id"]              =obj.id 
                    data["tag_name"]            =obj.tag_name
                    data["tag_type"]            =tag_type_inst.name
                    data["component_name"]      ="-"
                    data["project_name"]        ="-"
                    final_array.append(data)
                previous_page  = ""
                next_page      = ""
                if page_obj.has_previous():
                    previous_page  =str(page_obj.previous_page_number())  
                if page_obj.has_next():
                    next_page      =str(page_obj.next_page_number())
                num_of_pages       =paginator.num_pages
                    
                    # final_array.append(data)
                
                response=getResponse('success','successfully got the unassigned tag',final_array,previous_page,next_page,num_of_pages)
            except Exception as e:
                response=getResponse('failure','this page does not have results',e)
            
        except TagDetails.DoesNotExist:
            response=getResponse('failure','failed to do this operation')   
        return response