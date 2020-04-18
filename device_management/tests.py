# class ComponentsLibrarySerializers(serializers.HyperlinkedModelSerializer):
    
#     name                = serializers.CharField()
#     component_type_id   = serializers.IntegerField()
#     default_image       = serializers.FileField(path="static/media/")
#     status_on           = serializers.FileField()
#     status_off          = serializers.FileField()
#     user_id_id          = serializers.IntegerField()
#     class Meta:
#         model = ComponentsLibrary
#         fields = ('name', 'component_type_id', 'default_image', 'status_on','status_off','user_id_id')
    


#     def create(self,request):
#         print("hi")
            
#         try:
#             component_inst            = TagType.objects.get(id=request["component_type_id"])
#         except TagType.DoesNotExist:
#             raise Http404
#         library_inst                  = ComponentsLibrary()
#         library_inst.name             = request["name"]
#         # validated_data['owner'] = self.context['request'].user
#         library_inst.user_id_id       = request["user_id"]
#         library_inst.component_type_id   = component_inst.id
#         print("hi")
#         library_inst.save()
#         print("hi")
#         file1                         = request["default_image"]
#         file2                         = request["status_on"]
#         file3                         = request["status_off"]

#         if file1:

#             path                              = 'static/media/'+str(library_inst.id)
#             fs                                = FileSystemStorage(path)
#             filename                          = fs.save(file1.name,file1)
#             library_inst.default_image        = path+'/'+filename

#         if file2:
#             path                              = 'static/media/'+str(library_inst.id)
#             fs                                = FileSystemStorage(path)
#             filename                          = fs.save(file2.name,file2)
#             library_inst.status_on            = path+'/'+filename
        
#         if file3:
#             path                              = 'static/media/'+str(library_inst.id)
#             fs                                = FileSystemStorage(path)
#             filename                          = fs.save(file3.name,file3)
#             library_inst.status_off           = path+'/'+filename
        
#         library_inst.save()
#         return library_inst