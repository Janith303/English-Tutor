from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone
from django.conf import settings
import datetime

class User(AbstractUser):
    # --- ROLE CHOICES ---
    ROLE_CHOICES = [
        ('STUDENT', 'Student'),
        ('TUTOR', 'Tutor'),
        ('STUDENT_TUTOR', 'Student Tutor'), # New Role added
        ('ADMIN', 'Admin'),
    ]

    STATUS_CHOICES = [
        ('REGISTERED', 'Registered'),
        ('VERIFIED', 'Verified'),
        ('INTERESTS_SELECTED', 'Interests Selected'),
        ('COMPLETED', 'Test Completed'),
    ]
    
    FACULTY_CHOICES = [
        ('Computing', 'Computing'),
        ('Business', 'Business'),
        ('Engineering', 'Engineering'),
        ('Humanities', 'Humanities & Sciences'),
    ]

    TARGET_LEVEL_CHOICES = [
        ('BEGINNER', 'Beginner'),
        ('INTERMEDIATE', 'Intermediate'),
        ('ADVANCED', 'Advanced'),
        ('NATIVE', 'Native/Fluent'),
    ]

    # --- CUSTOM FIELDS ---
    email = models.EmailField(unique=True)
    full_name = models.CharField(max_length=255, null=True, blank=True)
    role = models.CharField(max_length=15, choices=ROLE_CHOICES, default='STUDENT')
    
    university = models.CharField(max_length=255, default="SLIIT")
    faculty = models.CharField(max_length=100, choices=FACULTY_CHOICES, null=True, blank=True)
    academic_year = models.IntegerField(null=True, blank=True)
    target_proficiency = models.CharField(max_length=20, choices=TARGET_LEVEL_CHOICES, null=True, blank=True)
    
    is_verified = models.BooleanField(default=False)
    onboarding_status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='REGISTERED')
    
    # --- AUTHENTICATION SETTINGS ---
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'full_name']

    # --- ACCESSOR CLASH FIX ---
    groups = models.ManyToManyField('auth.Group', related_name='api_user_groups', blank=True)
    user_permissions = models.ManyToManyField('auth.Permission', related_name='api_user_permissions', blank=True)

    def __str__(self):
        return f"{self.email} ({self.role})"


class OTP(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    code = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def is_valid(self):
        return timezone.now() < self.created_at + datetime.timedelta(minutes=10)


class Interest(models.Model):
    name = models.CharField(max_length=100)
    students = models.ManyToManyField(settings.AUTH_USER_MODEL, related_name='interests')

    def __str__(self):
        return self.name


class Question(models.Model):
    CATEGORY_CHOICES = [('GRAMMAR', 'Grammar'), ('VOCABULARY', 'Vocabulary'), ('WRITING', 'Writing')]
    text = models.TextField()
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    option_a = models.CharField(max_length=255)
    option_b = models.CharField(max_length=255)
    option_c = models.CharField(max_length=255)
    option_d = models.CharField(max_length=255)
    correct_option = models.CharField(max_length=1)

    def __str__(self):
        return f"{self.category}: {self.text[:30]}..."


class TestResult(models.Model):
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    score = models.IntegerField()
    proficiency_level = models.CharField(max_length=50)
    completed_at = models.DateTimeField(auto_now_add=True)