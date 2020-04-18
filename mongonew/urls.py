"""mongonew URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/2.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.conf.urls import url
from djmongo import views

from django.conf.urls import include
from rest_framework_jwt.views import refresh_jwt_token,verify_jwt_token,obtain_jwt_token

app_name='djmongo'
urlpatterns = [
    url(r'^admin/', admin.site.urls),
    # url(r'^create$', views.create,name="akljfkj"),
    url(r'^create$',views.create.as_view()),
    url(r'^createuser',views.CreateUser.as_view()),
    url(r'^getuserbyid',views.getuserbyid.as_view()),
    url(r'^loginuser$',views.loginnew.as_view()),
    url(r'^test',views.create_view,name="create-view"),
    
    #weburl
    url(r'^login$', views.weblogin, name='login-view'),
    # url(r'^logout$',views.logout,name='login-view'),
    
    # url(r'^asset/create$', views.assetCreate, name='create'),
    #weblogin
    url(r'welcome$',views.welcome.as_view()),
    # url(r'^adddata$',views.webform.as_view()),
    # url(r'^adduser$',views.webuser.as_view())
    url(r'^userlist',views.webuserlist.as_view()),
    url(r'^checkusername',views.check_user.as_view()),
    url(r'^getgroupdropdown',views.dropdownlist,name="group-dropdown"),
    url(r'^role$',views.roleview.as_view()),
    url(r'^role/detail$',views.RoleDetail.as_view()),
    url(r'^permission/create',views.ModuleList.as_view()),
    url(r'^attachmodule',views.AttachModule.as_view()),
    url(r'^role/permissionvalue',views.RolePermission.as_view()),
    url(r'^tag/',include("tag_management.urls")),
    url(r'^project/',include("project_management.urls")),
    url(r'^api-token-refresh/', refresh_jwt_token),
    url(r'^api-token-auth/',obtain_jwt_token),
    url(r'^api-token-verify/', verify_jwt_token),
    url(r'^resetpwd/email/send$',views.sendResetPwdEmail,name='reset-pwd'),
    # url(r'^password/(?P<uidb64>[0-9A-Za-z_\-]+)/(?P<token>[0-9A-Za-z]{1,13}-[0-9A-Za-z]{1,20})/$',
    #     views.open_reset, name='password'),
    url(r'^password/(?P<token>[0-9A-Za-z]{1,23})$',
        views.reset_page, name='reset_page'),
    url(r'^new',views.password_reset, name="test-new"),
    url(r'^forgot/password',views.web_forgot,name="forgot"),
    url(r'^email/sent$',views.web_email_sent ,name='email-sent'),
    url(r'^check/role$',views.CheckCurrentRole.as_view()),
]   

