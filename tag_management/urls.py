from django.test import TestCase
from django.conf.urls  import url
# Create your tests here.
from . import views

urlpatterns = [
                url(r'^$',views.TagList.as_view()),
                url(r'^type',views.TagTypeList.as_view()),
                url(r'^unassign',views.TagUnAssign.as_view())
              ]