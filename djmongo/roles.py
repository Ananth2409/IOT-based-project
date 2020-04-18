from rolepermissions.roles import AbstractUserRole

class Admin(AbstractUserRole):
    available_permissions = {
        'create_engineer': True,
    }

class Engineer(AbstractUserRole):
    available_permissions = {
        'edit_patient_file': True,
        'edit_data':True,
    }

