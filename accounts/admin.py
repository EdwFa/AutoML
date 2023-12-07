from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth.forms import UserChangeForm
from .models import *
from django.contrib.auth import get_user_model
User = get_user_model()

class MyUserChangeForm(UserChangeForm):
    class Meta(UserChangeForm.Meta):
        model = User

class MyUserAdmin(UserAdmin):
    form = MyUserChangeForm

    fieldsets = UserAdmin.fieldsets + (
            (None, {'fields': ('city', 'employment', 'info', 'count', 'allow_date')}),
    )

# общая информация
admin.site.register(User, MyUserAdmin)
