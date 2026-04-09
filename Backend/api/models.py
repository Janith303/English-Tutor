from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator
from decimal import Decimal
import datetime

class User(AbstractUser):
    # --- ROLE CHOICES ---
    ROLE_CHOICES = [
        ('STUDENT', 'Student'),
        ('TUTOR', 'Tutor'),
        ('STUDENT_TUTOR', 'Student Tutor'), 
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
    
    # --- IDENTITY VERIFICATION FIELDS (For Tutor Application) ---
    identity_proof = models.ImageField(upload_to='verification/student_ids/', null=True, blank=True)
    agreed_to_tutor_terms = models.BooleanField(default=False)

    # --- FIX: ADDED MISSING FIELD HERE ---
    email_pre_verified = models.BooleanField(default=False, null=True, blank=True)

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


# --- NEW: STUDENT TUTOR APPLICATION PROFILE ---
class StudentTutorProfile(models.Model):
    APPLICATION_STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('APPROVED', 'Approved'),
        ('REJECTED', 'Rejected'),
    ]

    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='tutor_profile')
    teaching_areas = models.JSONField(default=list) 
    bio = models.TextField(help_text="Short teaching bio or motivation")
    
    # --- ADD THIS LINE HERE ---
    hourly_rate = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    
    availability = models.JSONField(default=dict) 
    status = models.CharField(max_length=20, choices=APPLICATION_STATUS_CHOICES, default='PENDING')
    applied_at = models.DateTimeField(auto_now_add=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)
    video = models.FileField(upload_to='verification/tutor_videos/', null=True, blank=True)

    def __str__(self):
        return f"Tutor Profile: {self.user.email} - {self.status}"


class Course(models.Model):
    STATUS_CHOICES = [
        ('DRAFT', 'Draft'),
        ('PUBLISHED', 'Published'),
        ('ARCHIVED', 'Archived'),
    ]

    LEVEL_CHOICES = [
        ('beginner', 'Beginner'),
        ('intermediate', 'Intermediate'),
        ('advanced', 'Advanced'),
    ]

    tutor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='courses')
    title = models.CharField(max_length=120)
    slug = models.SlugField(max_length=150, unique=True)
    summary = models.CharField(max_length=300)
    description = models.TextField()
    category = models.CharField(max_length=80)
    level = models.CharField(max_length=20, choices=LEVEL_CHOICES)
    duration_hours = models.DecimalField(
        max_digits=5,
        decimal_places=1,
        validators=[MinValueValidator(Decimal('0.5')), MaxValueValidator(Decimal('500'))],
    )
    price = models.DecimalField(
        max_digits=8,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0')), MaxValueValidator(Decimal('9999'))],
    )
    thumbnail = models.ImageField(upload_to='courses/thumbnails/', null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='DRAFT')
    public_marketplace = models.BooleanField(default=True)
    search_indexing = models.BooleanField(default=False)
    auto_enroll_existing_students = models.BooleanField(default=False)
    published_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} ({self.status})"


class Chapter(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='chapters')
    title = models.CharField(max_length=120)
    order = models.PositiveIntegerField(default=1, validators=[MinValueValidator(1)])
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['order', 'id']
        unique_together = ('course', 'order')

    def __str__(self):
        return f"{self.course.title} - {self.title}"


class Lesson(models.Model):
    chapter = models.ForeignKey(Chapter, on_delete=models.CASCADE, related_name='lessons')
    title = models.CharField(max_length=120)
    order = models.PositiveIntegerField(default=1, validators=[MinValueValidator(1)])
    duration_minutes = models.PositiveIntegerField(default=10, validators=[MinValueValidator(1), MaxValueValidator(1000)])
    credits_awarded = models.PositiveIntegerField(default=0, validators=[MinValueValidator(0), MaxValueValidator(1000)])
    required_credits_to_unlock = models.PositiveIntegerField(default=0, validators=[MinValueValidator(0), MaxValueValidator(10000)])
    content = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['order', 'id']
        unique_together = ('chapter', 'order')

    def __str__(self):
        return f"{self.chapter.title} - {self.title}"


class Enrollment(models.Model):
    STATUS_CHOICES = [
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
    ]

    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='course_enrollments')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='enrollments')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='in_progress')
    progress_percent = models.PositiveSmallIntegerField(default=0, validators=[MinValueValidator(0), MaxValueValidator(100)])
    earned_credits = models.PositiveIntegerField(default=0)
    enrolled_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-enrolled_at']
        unique_together = ('student', 'course')
        indexes = [
            models.Index(fields=['student', 'status']),
            models.Index(fields=['course', 'status']),
        ]

    def __str__(self):
        return f"{self.student.email} -> {self.course.title}"


class LessonCompletion(models.Model):
    enrollment = models.ForeignKey(Enrollment, on_delete=models.CASCADE, related_name='completions')
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE, related_name='completions')
    credits_awarded = models.PositiveIntegerField(default=0)
    completed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-completed_at']
        unique_together = ('enrollment', 'lesson')

    def __str__(self):
        return f"{self.enrollment.student.email} completed {self.lesson.title}"
# --- NEW MODEL: ADDED FOR TUTOR OTP VERIFICATION ---
class TutorOTP(models.Model):
    email = models.EmailField(unique=True)
    code = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)

    def is_valid(self):
        # Valid for 10 minutes
        return timezone.now() < self.created_at + datetime.timedelta(minutes=10)

    def __str__(self):
        return f"Tutor OTP for {self.email}"
