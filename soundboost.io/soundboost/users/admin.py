from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.utils.translation import ugettext_lazy as _

from .models import User


class EmailUserAdmin(UserAdmin):

    """EmailUser Admin model."""

    fieldsets = (
        (None, {'fields': ('email', 'password', 'first_name', 'last_name')}),
        (_('Permissions'), {'fields': ('is_staff', 'is_superuser',
                                       'groups', 'user_permissions')}),
        (_('Important dates'), {'fields': ('last_login', 'date_joined')}),
    )
    add_fieldsets = ((
        None, {
            'classes': ('wide',),
            'fields': ('email', 'password1', 'password2', 'first_name',
                       'last_name', 'is_staff',)
        }
    ),)

    list_display = ('email', 'is_staff', 'is_superuser',)
    list_filter = ('is_staff', 'is_superuser', 'groups')
    search_fields = ('email', 'first_name', 'last_name',)
    ordering = ('email',)
    filter_horizontal = ('groups', 'user_permissions',)

admin.site.register(User, EmailUserAdmin)
