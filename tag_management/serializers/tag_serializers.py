from rest_framework import serializers
from tag_management.models import TagDetails,TagType,TagParameter,TagAlarm,TagScanType,TagConversionCode

class TagSerializers(serializers.Serializer):
    id=serializers.IntegerField(required=False)
    tag_name=serializers.CharField()
    description=serializers.CharField()
    user_id=serializers.CharField()
    tag_type_id=serializers.IntegerField(required=False)
    number_of_pages=serializers.IntegerField(required=False)
    address               = serializers.CharField(required=False)
    start_bit             = serializers.IntegerField(required=False)
    length                = serializers.IntegerField(required=False)
    signal_reverse        = serializers.CharField(required=False)
    log_data              = serializers.CharField(required=False)
    data_log_dead_band    = serializers.IntegerField(required=False)
    write_action_log      = serializers.CharField(required=False)
    read_only             = serializers.CharField(required=False)
    keep_previous_value   = serializers.CharField(required=False)
    initial_value         = serializers.IntegerField(required=False)
    security_area         = serializers.IntegerField(required=False)
    security_level        = serializers.IntegerField(required=False)
    status_zero           = serializers.CharField(required=False)
    status_one            = serializers.CharField(required=False)
    tag_type_id           = serializers.CharField(required=False)
    parameter_id          = serializers.CharField(required=False)
    alarm_id              = serializers.CharField(required=False)
    scan_type_id          = serializers.CharField(required=False)
    conversion_code_id    = serializers.CharField(required=False)
    # def get__tag_type_id(self,obj):
    #     tagva   = TagType.objects.get(id=obj)
    #     return tagva.name


    def create(self,validated_data):
        tag_inst=TagDetails()
        tag_inst.tag_name   =validated_data['tag_name']
        tag_inst.description=validated_data['description']
        if 'address' in validated_data:
            tag_inst.address=validated_data['address']
        if 'start_bit' in validated_data:
            tag_inst.start_bit=validated_data['start_bit']
        if 'length' in validated_data:
            tag_inst.length=validated_data['length']
        if 'signal_reverse' in validated_data:
            tag_inst.signal_reverse=validated_data['signal_reverse']
        if 'log_data' in validated_data:
            tag_inst.log_data=validated_data['log_data']
        if 'data_log_dead_band' in validated_data:
            tag_inst.data_log_dead_band=validated_data['data_log_dead_band']
        if 'write_action_log' in validated_data:
            tag_inst.write_action_log =validated_data['write_action_log']
        if 'read_only' in validated_data:
            tag_inst.read_only      =validated_data['read_only']
        if 'keep_previous_value' in validated_data:
            tag_inst.keep_previous_value   = validated_data['keep_previous_value']
        if 'initial_value' in validated_data:
            tag_inst.initial_value        =validated_data['initial_value']
        if 'security_area' in validated_data:
            tag_inst.security_area        =validated_data['security_area']
        if 'security_level' in validated_data:
            tag_inst.security_level   =validated_data['security_level']
        if 'status_zero' in validated_data:
            tag_inst.status_zero      =validated_data['status_zero']
        if 'status_one' in validated_data:
            tag_inst.status_one       =validated_data['status_one']
        if 'parameter_id' in validated_data:
            try:
                parameter_inst                =TagParameter.objects.get(id=validated_data["parameter_id"])
            except TagParameter.DoesNotExist:
                return None
            tag_inst.parameter_id     =parameter_inst.id
        if 'alarm_id' in validated_data:
            try:
                alarm_inst                    =TagAlarm.objects.get(id=validated_data["alarm_id"])
            except TagAlarm.DoesNotExist:
                return None
            tag_inst.alarm_id       =alarm_inst.id
        if 'scan_type_id' in validated_data:
            try:
                scan_type_inst                =TagScanType.objects.get(id=validated_data["scan_type_id"])
            except TagScanType.DoesNotExist:
                return None
            tag_inst.scan_type_id  =scan_type_inst.id
        if 'conversion_code_id' in validated_data:
            try:
                conversion_code_inst          =TagConversionCode.objects.get(id=validated_data["conversion_code_id"])
            except TagConversionCode.DoesNotExist:
                return None
            tag_inst.conversion_code_id=conversion_code_inst.id  
        if 'tag_type_id' in validated_data:
            try:
                tag_type_inst                 =TagType.objects.get(id=validated_data["tag_type_id"])
            except TagType.DoesNotExist:
                return None           
            tag_inst.tag_type_id      =tag_type_inst.id
        tag_inst.user_id          =validated_data['user_id'] 
        tag_inst.save()

        return tag_inst

    def update(self,instance,validated_data):
        try:
            tag_type_inst                 =TagType.objects.get(id=validated_data["tag_type_id"])
        except TagType.DoesNotExist:
            return None
        try:
            parameter_inst                =TagParameter.objects.get(id=validated_data["parameter_id"])
        except TagParameter.DoesNotExist:
            return None
        try:
            alarm_inst                    =TagAlarm.objects.get(id=validated_data["alarm_id"])
        except TagAlarm.DoesNotExist:
            return None
        try:
            scan_type_inst                =TagScanType.objects.get(id=validated_data["scan_type_id"])
        except TagScanType.DoesNotExist:
            return None
        try:
            conversion_code_inst          =TagConversionCode.objects.get(id=validated_data["conversion_code_id"])
        except TagConversionCode.DoesNotExist:
            return None
        instance.tag_name             =validated_data.get('tag_name',instance.tag_name)
        instance.description          =validated_data.get('description',instance.description)
        instance.address              =validated_data.get('address',instance.address)
        instance.start_bit            =validated_data.get('start_bitstart_bit',instance.start_bit)
        instance.length               =validated_data.get('length',instance.length)
        instance.signal_reverse       =validated_data.get('signal_reverse',instance.signal_reverse)
        instance.log_data             =validated_data.get('log_data',instance.log_data)
        instance.data_log_dead_band   =validated_data.get('data_log_dead_band',instance.data_log_dead_band)
        instance.write_action_log     =validated_data.get('write_action_log',instance.write_action_log)
        instance.read_only            =validated_data.get('user_id',instance.user_id)
        instance.keep_previous_value  =validated_data.get('keep_previous_value',instance.keep_previous_value)
        instance.initial_value        =validated_data.get('initial_value',instance.initial_value)
        instance.security_area        =validated_data.get('security_area',instance.security_area)
        instance.security_level       =validated_data.get('security_level',instance.security_level)
        instance.status_zero          =validated_data.get('status_zero',instance.status_zero)
        instance.status_one           =validated_data.get('status_one',instance.status_one)
        instance.parameter_id         =validated_data.get('parameter_id',parameter_inst.id)
        instance.alarm_id             =validated_data.get('alarm_id',alarm_inst.id)
        instance.scan_type_id         =validated_data.get('scan_type_id',scan_type_inst.id)
        instance.conversion_code_id   =validated_data.get('conversion_code_id',conversion_code_inst.id)
        instance.user_id              =validated_data.get('user_id',instance.user_id)
        instance.tag_type_id          =validated_data.get('tag_type_id',tag_type_inst.id)
        instance.save()
        return instance

