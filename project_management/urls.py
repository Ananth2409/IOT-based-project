from django.conf.urls import url
from . import views
urlpatterns = [
    url(r'^$',views.ProjectList.as_view()),
    url(r'^validate$',views.ProjectValidation.as_view()),
    url(r'^dataprocess',views.DataProcessList.as_view()),
    url(r'^component',views.ProjectComponent.as_view()),
    url(r'^tag_component',views.ComponentTag.as_view()),
    url(r'^library',views.ComponentLibraries.as_view()),
    url(r'^listcomponent',views.ComponentList.as_view()),
    # url(r'^test',views.test,name='test'),

    ]
