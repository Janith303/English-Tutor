from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone
import datetime

class User(AbstractUser):
    # --- CHOICES ---
    ROLE_CHOICES = [
        ('STUDENT', 'Student'),
        ('TUTOR', 'Tutor'),
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

    # --- CUSTOM FIELDS ---
    email = models.EmailField(unique=True)
    full_name = models.CharField(max_length=255, null=True, blank=True)
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='STUDENT')
    
    university = models.CharField(max_length=255, default="SLIIT")
    faculty = models.CharField(max_length=100, choices=FACULTY_CHOICES, null=True, blank=True)
    academic_year = models.IntegerField(null=True, blank=True)
    
    is_verified = models.BooleanField(default=False)
    onboarding_status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='REGISTERED')
    
    # --- AUTHENTICATION SETTINGS ---
    # We use email as the unique identifier for login
    USERNAME_FIELD = 'email'
    # These fields are required when creating a user via 'createsuperuser'
    REQUIRED_FIELDS = ['username', 'full_name']

    # --- FIX FOR ACCESSOR CLASH ---
    # This prevents conflicts with Django's built-in User model
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

    def __str__(self):
        return f"{self.email} ({self.role})"


class OTP(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    code = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def is_valid(self):
        # Code remains valid for 10 minutes
        return timezone.now() < self.created_at + datetime.timedelta(minutes=10)


class Interest(models.Model):
    name = models.CharField(max_length=100)
    # Allows tracking which students are interested in which topics
    students = models.ManyToManyField(User, related_name='interests')

    def __str__(self):
        return self.name


class Question(models.Model):
    CATEGORY_CHOICES = [
        ('GRAMMAR', 'Grammar'), 
        ('VOCABULARY', 'Vocabulary'), 
        ('WRITING', 'Writing')
    ]
    
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
    proficiency_level = models.CharField(max_length=50) # e.g., Beginner, Intermediate
    completed_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.student.email} - {self.proficiency_level}"