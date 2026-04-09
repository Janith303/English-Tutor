# api/serializers.py
from rest_framework import serializers
from django.contrib.humanize.templatetags.humanize import naturaltime
from .models import User, Question, Interest, StudentTutorProfile, WallQuestion, WallAnswer
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

# --- 1. AUTHENTICATION SERIALIZER ---
# This fixes your navigation issue by adding 'role' to the login response
class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        # Add custom fields to the JWT response
        data['role'] = self.user.role
        data['email'] = self.user.email
        data['full_name'] = self.user.full_name
        return data

# 1. Serializer for Placement Test Questions
class QuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        # Frontend needs these to display the test; 'correct_option' is excluded for security
        fields = ['id', 'text', 'category', 'option_a', 'option_b', 'option_c', 'option_d']

# 2. Serializer for Interest Selection
class InterestSerializer(serializers.ModelSerializer):
    class Meta:
        model = Interest
        fields = ['id', 'name']

# 3. Serializer for Registration (Supports Student, Tutor, and Student-Tutor)
class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = [
            'full_name', 
            'email', 
            'password', 
            'university', 
            'faculty', 
            'academic_year', 
            'role',
            'target_proficiency'
        ]

    def create(self, validated_data):
        # Using create_user ensures the password is automatically hashed
        user = User.objects.create_user(
            username=validated_data['email'], # Use email as the internal username
            email=validated_data['email'],
            password=validated_data['password'],
            full_name=validated_data.get('full_name'),
            role=validated_data.get('role', 'STUDENT'),
            university=validated_data.get('university', 'SLIIT'),
            faculty=validated_data.get('faculty'),
            academic_year=validated_data.get('academic_year'),
            target_proficiency=validated_data.get('target_proficiency'),
        )
        return user

# --- NEW: TUTOR APPLICATION SERIALIZERS ---

# 4. Serializer for Identity Verification (Step 1 of Application)
class IdentityVerificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['identity_proof', 'agreed_to_tutor_terms']

    def validate_agreed_to_tutor_terms(self, value):
        if not value:
            raise serializers.ValidationError("You must agree to the Tutor Agreement to proceed.")
        return value
        
    def validate_identity_proof(self, value):
        if not value:
            raise serializers.ValidationError("Please upload your Student ID.")
        return value

# 5. Serializer for Student Tutor Application (Step 2 of Application)
class StudentTutorApplicationSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudentTutorProfile
        fields = ['id', 'teaching_areas', 'bio', 'availability', 'status', 'applied_at']
        # Prevent users from directly changing their approval status or application date
        read_only_fields = ['id', 'status', 'applied_at']
        
def create(self, validated_data):
        # Using create_user ensures the password is automatically hashed
        user = User.objects.create_user(
            username=validated_data['email'], 
            email=validated_data['email'],
            password=validated_data['password'],
            full_name=validated_data.get('full_name'),
            role=validated_data.get('role', 'STUDENT'),
            university=validated_data.get('university', 'SLIIT'),
            faculty=validated_data.get('faculty'),
            academic_year=validated_data.get('academic_year'),
            target_proficiency=validated_data.get('target_proficiency'),
            
            # --- ADD THIS LINE TO FIX THE ERROR ---
            email_pre_verified=False 
        )
        return user
    
# In api/serializers.py
class StudentTutorApplicationSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudentTutorProfile
        # Add 'video' to the fields list
        fields = ['id', 'teaching_areas', 'bio', 'availability', 'video', 'status', 'applied_at']
        read_only_fields = ['id', 'status', 'applied_at']


# --- COURSE SYSTEM SERIALIZERS ---
import re
from decimal import Decimal
from django.utils import timezone
from .models import Course, Chapter, Lesson, Enrollment


class CourseWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = [
            'id',
            'title',
            'slug',
            'summary',
            'description',
            'category',
            'level',
            'duration_hours',
            'price',
            'thumbnail',
            'status',
            'public_marketplace',
            'search_indexing',
            'auto_enroll_existing_students',
            'published_at',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'published_at', 'created_at', 'updated_at']

    def validate_title(self, value):
        value = value.strip()
        if len(value) < 5:
            raise serializers.ValidationError('Course Title must be at least 5 characters')
        if len(value) > 120:
            raise serializers.ValidationError('Course Title must be 120 characters or less')
        return value

    def validate_slug(self, value):
        value = value.strip().lower()
        pattern = r'^[a-z0-9]+(?:-[a-z0-9]+)*$'
        if not re.fullmatch(pattern, value):
            raise serializers.ValidationError('Only lowercase letters, numbers, and hyphens are allowed')
        return value

    def validate_summary(self, value):
        value = value.strip()
        if len(value) < 10:
            raise serializers.ValidationError('Summary must be at least 10 characters')
        if len(value) > 300:
            raise serializers.ValidationError('Summary must be 300 characters or less')
        return value

    def validate_description(self, value):
        value = value.strip()
        if len(value) < 10:
            raise serializers.ValidationError('Full Description must be at least 10 characters')
        return value

    def validate_duration_hours(self, value):
        if value < Decimal('0.5') or value > Decimal('500'):
            raise serializers.ValidationError('Duration must be between 0.5 and 500 hours')
        return value

    def validate_price(self, value):
        if value < Decimal('0') or value > Decimal('9999'):
            raise serializers.ValidationError('Price must be between 0 and 9999')
        return value

    def create(self, validated_data):
        request = self.context.get('request')
        validated_data['tutor'] = request.user
        if validated_data.get('status') == 'PUBLISHED':
            validated_data['published_at'] = timezone.now()
        return super().create(validated_data)

    def update(self, instance, validated_data):
        new_status = validated_data.get('status', instance.status)
        if instance.status != 'PUBLISHED' and new_status == 'PUBLISHED':
            validated_data['published_at'] = timezone.now()
        elif new_status != 'PUBLISHED':
            validated_data['published_at'] = None
        return super().update(instance, validated_data)


class ChapterWriteSerializer(serializers.ModelSerializer):
    lessons_count = serializers.IntegerField(source='lessons.count', read_only=True)

    class Meta:
        model = Chapter
        fields = ['id', 'course', 'title', 'order', 'lessons_count']
        read_only_fields = ['id', 'course', 'lessons_count']

    def validate_title(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError('Chapter title is required')
        if len(value) > 120:
            raise serializers.ValidationError('Chapter title must be 120 characters or less')
        return value


class LessonWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lesson
        fields = [
            'id',
            'chapter',
            'title',
            'order',
            'duration_minutes',
            'credits_awarded',
            'required_credits_to_unlock',
            'content',
        ]
        read_only_fields = ['id', 'chapter']

    def validate_title(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError('Lesson title is required')
        if len(value) > 120:
            raise serializers.ValidationError('Lesson title must be 120 characters or less')
        return value


class ReorderSerializer(serializers.Serializer):
    ordered_ids = serializers.ListField(
        child=serializers.IntegerField(min_value=1),
        allow_empty=False,
    )

    def validate_ordered_ids(self, value):
        if len(value) != len(set(value)):
            raise serializers.ValidationError('ordered_ids must contain unique IDs')
        return value


class LessonReadSerializer(serializers.ModelSerializer):
    is_completed = serializers.SerializerMethodField()
    is_unlocked = serializers.SerializerMethodField()
    duration = serializers.SerializerMethodField()

    class Meta:
        model = Lesson
        fields = [
            'id',
            'title',
            'order',
            'duration_minutes',
            'duration',
            'credits_awarded',
            'required_credits_to_unlock',
            'is_completed',
            'is_unlocked',
        ]

    def get_duration(self, obj):
        return f"{obj.duration_minutes} min"

    def get_is_completed(self, obj):
        completed_ids = self.context.get('completed_lesson_ids', set())
        return obj.id in completed_ids

    def get_is_unlocked(self, obj):
        completed_ids = self.context.get('completed_lesson_ids', set())
        if obj.id in completed_ids:
            return True
        earned_credits = self.context.get('earned_credits', 0)
        return earned_credits >= obj.required_credits_to_unlock


class ChapterReadSerializer(serializers.ModelSerializer):
    lessons = LessonReadSerializer(many=True, read_only=True)

    class Meta:
        model = Chapter
        fields = ['id', 'title', 'order', 'lessons']


class CoursePublicSerializer(serializers.ModelSerializer):
    instructor = serializers.SerializerMethodField()
    totalLessons = serializers.SerializerMethodField()
    durationWeeks = serializers.SerializerMethodField()
    focusArea = serializers.CharField(source='category', read_only=True)
    thumbnail = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = [
            'id',
            'title',
            'slug',
            'summary',
            'description',
            'category',
            'focusArea',
            'level',
            'price',
            'thumbnail',
            'status',
            'instructor',
            'totalLessons',
            'durationWeeks',
        ]

    def get_instructor(self, obj):
        return obj.tutor.full_name or obj.tutor.email

    def get_totalLessons(self, obj):
        return Lesson.objects.filter(chapter__course=obj).count()

    def get_durationWeeks(self, obj):
        hours = float(obj.duration_hours)
        return max(1, round(hours / 4))

    def get_thumbnail(self, obj):
        if obj.thumbnail:
            return obj.thumbnail.url
        return None


class CourseDetailSerializer(serializers.ModelSerializer):
    instructor = serializers.SerializerMethodField()
    chapters = serializers.SerializerMethodField()
    totalLessons = serializers.SerializerMethodField()
    thumbnail = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = [
            'id',
            'title',
            'slug',
            'summary',
            'description',
            'category',
            'level',
            'duration_hours',
            'price',
            'thumbnail',
            'status',
            'public_marketplace',
            'search_indexing',
            'auto_enroll_existing_students',
            'published_at',
            'created_at',
            'updated_at',
            'instructor',
            'totalLessons',
            'chapters',
        ]

    def get_instructor(self, obj):
        return obj.tutor.full_name or obj.tutor.email

    def get_totalLessons(self, obj):
        return Lesson.objects.filter(chapter__course=obj).count()

    def get_thumbnail(self, obj):
        if obj.thumbnail:
            return obj.thumbnail.url
        return None

    def get_chapters(self, obj):
        chapters = obj.chapters.prefetch_related('lessons').all()
        return ChapterReadSerializer(chapters, many=True, context=self.context).data


class EnrollmentCreateSerializer(serializers.Serializer):
    course_id = serializers.IntegerField(min_value=1)

    def validate(self, attrs):
        request = self.context.get('request')
        user = request.user

        try:
            course = Course.objects.get(id=attrs['course_id'], status='PUBLISHED')
        except Course.DoesNotExist:
            raise serializers.ValidationError({'course_id': 'Course is not available for enrollment'})

        if Enrollment.objects.filter(student=user, course=course).exists():
            raise serializers.ValidationError({'course_id': 'You are already enrolled in this course'})

        if course.tutor_id == user.id:
            raise serializers.ValidationError({'course_id': 'You cannot enroll in your own course'})

        attrs['course'] = course
        return attrs

    def create(self, validated_data):
        request = self.context.get('request')
        return Enrollment.objects.create(
            student=request.user,
            course=validated_data['course'],
        )


class EnrollmentSerializer(serializers.ModelSerializer):
    course = CoursePublicSerializer(read_only=True)
    progress = serializers.IntegerField(source='progress_percent', read_only=True)

    class Meta:
        model = Enrollment
        fields = [
            'id',
            'course',
            'status',
            'progress',
            'earned_credits',
            'enrolled_at',
            'completed_at',
        ]

        # --- NEW: Q&A WALL SERIALIZERS ---
class WallAnswerSerializer(serializers.ModelSerializer):
    author_name = serializers.ReadOnlyField(source='author.full_name')
    author_role = serializers.ReadOnlyField(source='author.role')
    created_at_human = serializers.SerializerMethodField()

    class Meta:
        model = WallAnswer
        fields = ['id', 'body', 'author_name', 'author_role', 'is_expert_answer', 'created_at', 'created_at_human']

    # This MUST be indented inside the class
    def get_created_at_human(self, obj):
        return naturaltime(obj.created_at)       

class WallQuestionSerializer(serializers.ModelSerializer):
    author_name = serializers.SerializerMethodField()
    tags = serializers.SerializerMethodField()
    created_at_human = serializers.SerializerMethodField()
    answers = WallAnswerSerializer(many=True, read_only=True, source='wall_answers')

    class Meta:
        model = WallQuestion
        fields = ['id', 'title', 'body', 'author_name', 'is_anonymous', 'tags', 'votes', 'answers', 'created_at', 'created_at_human']

    def get_author_name(self, obj):
        if obj.is_anonymous:
            return "Anonymous Student"
        return obj.author.full_name or obj.author.username
    
    # Ensure the code below is indented correctly
    def get_tags(self, obj):
        if not obj.tags:
            return []
        return [tag.strip() for tag in obj.tags.split(',') if tag.strip()]

    def get_created_at_human(self, obj):
        return naturaltime(obj.created_at)