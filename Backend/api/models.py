from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone
import datetime

class User(AbstractUser):
    STATUS_CHOICES = [
        ('REGISTERED', 'Registered'),
        ('VERIFIED', 'Verified'),
        ('INTERESTS_SELECTED', 'Interests Selected'),
        ('COMPLETED', 'Test Completed'),
    ]
    email = models.EmailField(unique=True)
    university = models.CharField(max_length=255, null=True, blank=True)
    academic_year = models.IntegerField(null=True, blank=True)
    is_verified = models.BooleanField(default=False)
    onboarding_status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='REGISTERED')

    # Fix for the "Reverse accessor clash"
    groups = models.ManyToManyField(
        'auth.Group',
        related_name='api_user_groups',
        blank=True,
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        related_name='api_user_permissions',
        blank=True,
    )

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'first_name', 'last_name']

    def __str__(self):
        return self.email

class OTP(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    code = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def is_valid(self):
        return timezone.now() < self.created_at + datetime.timedelta(minutes=10)

class Interest(models.Model):
    name = models.CharField(max_length=100)
    students = models.ManyToManyField(User, related_name='interests')

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
    correct_option = models.CharField(max_length=1) # A, B, C, or D

    def __str__(self):
        return f"{self.category}: {self.text[:30]}..."

class TestResult(models.Model):
    student = models.ForeignKey(User, on_delete=models.CASCADE)
    score = models.IntegerField()
    proficiency_level = models.CharField(max_length=50)
    completed_at = models.DateTimeField(auto_now_add=True)