from django.conf.urls import patterns, include, url
from django.contrib.auth.views import login, logout
from django.contrib import admin

from django.contrib.staticfiles.urls import staticfiles_urlpatterns


urlpatterns = patterns('',
    # Examples:
    url(r'^$', login),
    # url(r'^blog/', include('blog.urls')),

    url(r'^portfolio/', include('portfolio.urls')),
    url(r'^admin/', include(admin.site.urls)),
    url(r'^accounts/login/$',  login),
    url(
        r'^accounts/logout/$','django.contrib.auth.views.logout',
        dict(
            template_name = 'registration/logout.html',
        ),
        name='logout',
    ),

)

urlpatterns += staticfiles_urlpatterns()