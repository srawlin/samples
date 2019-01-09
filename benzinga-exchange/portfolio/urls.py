from django.conf.urls import patterns, url

from portfolio import views

urlpatterns = patterns('',
    url(r'^$', views.index, name='index'),
    url(r'^(?P<symbol>[\w-]+)/$', views.exchange, name='exchange'),
    url(r'^register', views.register, name='register'),
)
