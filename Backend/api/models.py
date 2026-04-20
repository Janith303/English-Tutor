from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator
from decimal import Decimal
import datetime
from django.db.models import Sum

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
    CATEGORY_CHOICES = [('GRAMMAR', 'Grammar'), ('VOCABULARY', 'Vocabulary'), ('WRITING', 'Writing'), ('IELTS', 'IELTS')]
    text = models.TextField()
    category = models.CharField(max_length=30, choices=CATEGORY_CHOICES)
    option_a = models.CharField(max_length=255)
    option_b = models.CharField(max_length=255)
    option_c = models.CharField(max_length=255)
    option_d = models.CharField(max_length=255)
    correct_option = models.CharField(max_length=1)

    def __str__(self):
       return f"[{self.category}] {self.text}"


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
    summary = models.CharField(max_length=300)
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


# ============================================
# QUIZ MODELS
# ============================================

class Quiz(models.Model):
    CATEGORY_CHOICES = [
        ('VOCABULARY', 'Vocabulary'),
        ('GRAMMAR', 'Grammar'),
        ('READING', 'Reading'),
        ('IDIOMS', 'English Idioms'),
        ('WRITING', 'Writing Skills'),
        ('SENTENCE', 'Sentence Structure'),
        ('DAILY', 'Daily Quiz'),
        ('CUSTOM', 'Custom Quiz'),
    ]

    DIFFICULTY_CHOICES = [
        ('EASY', 'Easy'),
        ('MEDIUM', 'Medium'),
        ('HARD', 'Hard'),
    ]

    title = models.CharField(max_length=100)
    description = models.TextField(max_length=300)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default='CUSTOM')
    difficulty = models.CharField(max_length=20, choices=DIFFICULTY_CHOICES, default='MEDIUM')
    time_limit = models.IntegerField(default=5, help_text="Time limit in minutes")
    passing_score = models.IntegerField(default=70)
    randomize_questions = models.BooleanField(default=False)
    immediate_results = models.BooleanField(default=True)
    is_daily_quiz = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='created_quizzes'
    )
    created_at = models.DateTimeField(auto_now_add=True, null=True)
    updated_at = models.DateTimeField(auto_now=True, null=True)
    
    def get_total_marks(self):
        # This looks at all related QuizQuestions and adds up their 'marks' field
        # 'questions' should match the related_name on your QuizQuestion model
        total = self.questions.aggregate(Sum('marks'))['marks__sum']
        return total if total else 0

    def __str__(self):
        return self.title
    
class LessonAuthoringProfile(models.Model):
    STATUS_CHOICES = [
        ('DRAFT', 'Draft'),
        ('PUBLISHED', 'Published'),
    ]

    lesson = models.OneToOneField(
        Lesson,
        on_delete=models.CASCADE,
        related_name='authoring_profile',
    )
    description = models.TextField(blank=True, default='')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='DRAFT')
    publish_at = models.DateTimeField(null=True, blank=True)
    drip_delay_days = models.PositiveIntegerField(
        default=0,
        validators=[MinValueValidator(0), MaxValueValidator(365)],
    )
    require_quiz_pass_for_completion = models.BooleanField(default=True)
    lesson_link_url = models.URLField(blank=True, default='')
    lesson_image = models.ImageField(upload_to='lessons/images/', null=True, blank=True)
    lesson_video_file = models.FileField(upload_to='lessons/videos/', null=True, blank=True)
    lesson_video_embed_url = models.URLField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} ({self.category})"

    def get_total_marks(self):
        return sum(q.marks for q in self.questions.all())


class QuizQuestion(models.Model):
    QUESTION_TYPE_CHOICES = [
        ('MULTIPLE_CHOICE', 'Multiple Choice'),
        ('TRUE_FALSE', 'True/False'),
    ]

    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name='questions')
    question_text = models.TextField()
    marks = models.IntegerField(default=10)
    question_type = models.CharField(max_length=50, choices=QUESTION_TYPE_CHOICES, default='MULTIPLE_CHOICE')
    order = models.IntegerField(default=1)
    learning_link = models.URLField(blank=True, null=True, help_text="Learning resource URL for incorrect answers")
    is_in_bank = models.BooleanField(default=False, help_text="Whether this question is added to the shared question bank")
    is_approved = models.BooleanField(default=False, help_text="Whether this question is approved by admin for use in daily quiz")

    class Meta:
        ordering = ['order', 'id']

    def __str__(self):
        return f"Q{self.order}: {self.question_text[:50]}..."

    def get_correct_option(self):
        correct_option = self.options.filter(is_correct=True).first()
        return correct_option


class QuizOption(models.Model):
    question = models.ForeignKey(QuizQuestion, on_delete=models.CASCADE, related_name='options')
    option_text = models.CharField(max_length=255)
    is_correct = models.BooleanField(default=False)

    class Meta:
        ordering = ['id']

    def __str__(self):
        return f"{self.option_text} ({'Correct' if self.is_correct else 'Wrong'})"


class QuizAttempt(models.Model):
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name='attempts')
    student = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='quiz_attempts'
    )
    student_name = models.CharField(max_length=100, blank=True, null=True)
    score = models.IntegerField(default=0)
    correct_answers = models.IntegerField(default=0)
    total_questions = models.IntegerField(default=0)
    time_used = models.IntegerField(default=0, help_text="Time used in seconds")
    percentage = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    passed = models.BooleanField(default=False)
    submitted_at = models.DateTimeField(auto_now_add=True, null=True)

    # 1. FIXED: Meta must be indented once, and ordering inside it indented twice
    class Meta:
        ordering = ['-pk'] # Or ['quiz_id'] if you want to group by quiz

    # 2. FIXED: Changed self.lesson.title to self.quiz.title
    def __str__(self):
        return f"Attempt by {self.student_name or 'Unknown'}: {self.quiz.title} ({self.score})"


class LessonExerciseFile(models.Model):
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE, related_name='exercise_files')
    display_name = models.CharField(max_length=150, blank=True, default='')
    file = models.FileField(upload_to='lessons/exercises/')
    order = models.PositiveIntegerField(
        default=1,
        validators=[MinValueValidator(1), MaxValueValidator(1000)],
    )
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['order', 'id']
        unique_together = ('lesson', 'order')

    def __str__(self):
        label = self.display_name or self.file.name
        return f"{self.lesson.title} - {label}"


class LessonQuiz(models.Model):
    STATUS_CHOICES = [
        ('DRAFT', 'Draft'),
        ('PUBLISHED', 'Published'),
    ]

    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE, related_name='quizzes')
    title = models.CharField(max_length=140)
    instructions = models.TextField(blank=True, default='')
    passing_score = models.PositiveSmallIntegerField(
        default=70,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
    )
    order = models.PositiveIntegerField(
        default=1,
        validators=[MinValueValidator(1), MaxValueValidator(1000)],
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='DRAFT')
    published_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['order', 'id']
        unique_together = ('lesson', 'order')

    def __str__(self):
        return f"{self.lesson.title} - Quiz {self.order}: {self.title}"


class LessonQuizQuestion(models.Model):
    CORRECT_OPTION_CHOICES = [
        ('A', 'Option A'),
        ('B', 'Option B'),
        ('C', 'Option C'),
        ('D', 'Option D'),
    ]

    quiz = models.ForeignKey(LessonQuiz, on_delete=models.CASCADE, related_name='questions')
    question_text = models.TextField()
    option_a = models.CharField(max_length=255)
    option_b = models.CharField(max_length=255)
    option_c = models.CharField(max_length=255)
    option_d = models.CharField(max_length=255)
    correct_option = models.CharField(max_length=1, choices=CORRECT_OPTION_CHOICES)
    order = models.PositiveIntegerField(
        default=1,
        validators=[MinValueValidator(1), MaxValueValidator(1000)],
    )
    explanation = models.TextField(blank=True, default='')

    class Meta:
        ordering = ['order', 'id']
        unique_together = ('quiz', 'order')

    def __str__(self):
        return f"Quiz {self.quiz_id} Q{self.order}"


class LessonQuizAttempt(models.Model):
    enrollment = models.ForeignKey(Enrollment, on_delete=models.CASCADE, related_name='quiz_attempts')
    quiz = models.ForeignKey(LessonQuiz, on_delete=models.CASCADE, related_name='attempts')
    score_percent = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(0), MaxValueValidator(100)],
    )
    passed = models.BooleanField(default=False)
    answers = models.JSONField(default=list, blank=True)
    submitted_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-submitted_at']

    def __str__(self):
        return f"{self.student_name or 'Anonymous'} - {self.quiz.title} ({self.percentage}%)"

    def calculate_percentage(self):
        if self.total_questions > 0:
            return (self.correct_answers / self.total_questions) * 100
        return 0


class QuizAnswer(models.Model):
    attempt = models.ForeignKey(QuizAttempt, on_delete=models.CASCADE, related_name='answers')
    question = models.ForeignKey(QuizQuestion, on_delete=models.CASCADE)
    selected_option = models.ForeignKey(QuizOption, on_delete=models.CASCADE)
    is_correct = models.BooleanField(default=False)

    class Meta:
        unique_together = ('attempt', 'question')

    def __str__(self):
        return f"Answer for Q{self.question.order} in Attempt #{self.attempt.id}"
        unique_together = ('enrollment', 'quiz')
        indexes = [
            models.Index(fields=['enrollment', 'quiz']),
            models.Index(fields=['quiz', 'submitted_at']),
        ]

    def __str__(self):
        return f"Attempt {self.enrollment_id}-{self.quiz_id}: {self.score_percent}%"
    
# --- Q&A WALL MODELS ---
class WallQuestion(models.Model):
    title = models.CharField(max_length=255)
    body = models.TextField()
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='forum_questions')
    is_anonymous = models.BooleanField(default=False) 
    tags = models.CharField(max_length=200, blank=True, help_text="Comma-separated tags")
    
    # REPLACED: votes = models.IntegerField(default=0)
    # This tracks exactly WHICH users have upvoted this question
    upvoted_by = models.ManyToManyField(
        settings.AUTH_USER_MODEL, 
        related_name='upvoted_questions', 
        blank=True
    )
    
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} {'(Anonymous)' if self.is_anonymous else ''}"

    @property
    def vote_count(self):
        """Helper property to return the total number of upvotes"""
        return self.upvoted_by.count()

class WallAnswer(models.Model):
    question = models.ForeignKey(WallQuestion, on_delete=models.CASCADE, related_name='wall_answers')
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='given_answers')
    body = models.TextField()
    
    # This stays, but you'll set it in the View based on author.is_tutor
    is_expert_answer = models.BooleanField(default=False) 
    
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        status = "Expert" if self.is_expert_answer else "Student"
        return f"{status} Answer to {self.question.title} by {self.author.email}"
