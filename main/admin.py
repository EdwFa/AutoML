from django.contrib import admin
from .models import Dataset, DefaultNetwork, Networks, ModelParam, ModelDefaultParam

admin.site.register(Dataset)
admin.site.register(DefaultNetwork)
admin.site.register(Networks)
admin.site.register(ModelParam)
admin.site.register(ModelDefaultParam)