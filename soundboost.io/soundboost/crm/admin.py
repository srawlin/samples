from django.contrib import admin

from .models import (
    Contact
)


class ContactAdmin(admin.ModelAdmin):
    list_display = ('organization_name', 'first_name', 'email', 'alexa_rank',
                    'status')
    list_filter = ('status', 'kind', 'blog_software')

admin.site.register(Contact, ContactAdmin)
