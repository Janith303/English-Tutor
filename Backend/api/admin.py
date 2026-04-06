from django.contrib import admin
from .models import User, Question, OTP, Interest, TestResult

admin.site.register(User)
admin.site.register(Question)
admin.site.register(OTP)
admin.site.register(Interest)
admin.site.register(TestResult)