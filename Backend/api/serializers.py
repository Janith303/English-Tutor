# api/serializers.py
from rest_framework import serializers
from django.contrib.humanize.templatetags.humanize import naturaltime
from .models import User, Question, Interest, StudentTutorProfile, WallQuestion, WallAnswer
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.db.models import Sum

# --- 1. AUTHENTICATION SERIALIZER ---
# This fixes your navigation issue by adding 'role' to the login response
class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        # Add custom fields to the JWT response
        data['role'] = self.user.role
        data['email'] = self.user.email
        data['full_name'] = self.user.full_name
        data['onboarding_status'] = self.user.onboarding_status
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
        fields = ['full_name', 'email', 'password', 'university', 'faculty', 'academic_year', 'role', 'target_proficiency']

    def create(self, validated_data):
        role = validated_data.get('role', 'STUDENT')
        
        # FIX: Determine verification status based on role
        # If Admin or Tutor, set to VERIFIED immediately
        if role in ['ADMIN', 'TUTOR']:
            onboarding = 'VERIFIED'
            is_verified_bool = True
        else:
            onboarding = 'REGISTERED'
            is_verified_bool = False

        user = User.objects.create_user(
            username=validated_data['email'],
            email=validated_data['email'],
            password=validated_data['password'],
            full_name=validated_data.get('full_name'),
            role=role,
            university=validated_data.get('university', 'SLIIT'),
            faculty=validated_data.get('faculty'),
            academic_year=validated_data.get('academic_year'),
            target_proficiency=validated_data.get('target_proficiency'),
            
            # These apply the fix for your database column issue
            onboarding_status=onboarding,
            is_verified=is_verified_bool,
            
            is_staff=(role == 'ADMIN'), 
            is_superuser=(role == 'ADMIN'),
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
    # 1. Use ReadOnlyField (It won't crash if the value is missing)
    full_name = serializers.ReadOnlyField(source='user.full_name')
    email = serializers.ReadOnlyField(source='user.email')
    
    # 2. Use SerializerMethodField for media to safely catch any missing files
    identity_proof = serializers.SerializerMethodField()
    video = serializers.SerializerMethodField()

    class Meta:
        model = StudentTutorProfile
        fields = [
            'id', 'full_name', 'email', 'identity_proof', 
            'teaching_areas', 'bio', 'availability', 'video', 
            'status', 'applied_at'
        ]
        read_only_fields = ['id', 'status', 'applied_at']

    def get_identity_proof(self, obj):
        try:
            # Safely check if the user and the file exist
            if obj.user and hasattr(obj.user, 'identity_proof') and obj.user.identity_proof:
                request = self.context.get('request')
                if request:
                    return request.build_absolute_uri(obj.user.identity_proof.url)
                return obj.user.identity_proof.url
        except Exception:
            pass # If anything goes wrong, catch the crash silently
        return None

    def get_video(self, obj):
        try:
            # Safely check if the video exists
            if hasattr(obj, 'video') and obj.video:
                request = self.context.get('request')
                if request:
                    return request.build_absolute_uri(obj.video.url)
                return obj.video.url
        except Exception:
            pass
        return None


# --- COURSE SYSTEM SERIALIZERS ---
from decimal import Decimal
from django.utils import timezone
from .models import Course, Chapter, Lesson, Enrollment


class CourseWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = [
            'id',
            'title',
            'summary',
            'category',
            'level',
            'duration_hours',
            'price',
            'thumbnail',
            'status',
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

    def validate_summary(self, value):
        value = value.strip()
        if len(value) < 10:
            raise serializers.ValidationError('Summary must be at least 10 characters')
        if len(value) > 300:
            raise serializers.ValidationError('Summary must be 300 characters or less')
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
    enrolledStudents = serializers.SerializerMethodField()
    focusArea = serializers.CharField(source='category', read_only=True)
    thumbnail = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = [
            'id',
            'title',
            'summary',
            'category',
            'focusArea',
            'level',
            'price',
            'thumbnail',
            'status',
            'instructor',
            'enrolledStudents',
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

    def get_enrolledStudents(self, obj):
        return Enrollment.objects.filter(course=obj).count()

    def get_thumbnail(self, obj):
        if obj.thumbnail:
            return obj.thumbnail.url
        return None


class CourseDetailSerializer(serializers.ModelSerializer):
    instructor = serializers.SerializerMethodField()
    chapters = serializers.SerializerMethodField()
    totalLessons = serializers.SerializerMethodField()
    thumbnail = serializers.SerializerMethodField()
    enrolledStudents = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = [
            'id',
            'title',
            'summary',
            'category',
            'level',
            'duration_hours',
            'price',
            'thumbnail',
            'status',
            'published_at',
            'created_at',
            'updated_at',
            'instructor',
            'enrolledStudents',
            'totalLessons',
            'chapters',
        ]

    def get_instructor(self, obj):
        return obj.tutor.full_name or obj.tutor.email

    def get_totalLessons(self, obj):
        return Lesson.objects.filter(chapter__course=obj).count()

    def get_enrolledStudents(self, obj):
        return Enrollment.objects.filter(course=obj).count()

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


# ============================================
# QUIZ SERIALIZERS
# ============================================
from .models import Quiz, QuizQuestion, QuizOption, QuizAttempt, QuizAnswer


class QuizOptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuizOption
        fields = ['id', 'option_text', 'is_correct']


class QuizOptionCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuizOption
        fields = ['id', 'option_text', 'is_correct']

    def validate(self, attrs):
        question = self.context.get('question')
        if question and not attrs.get('is_correct', False):
            has_correct = QuizOption.objects.filter(
                question=question,
                is_correct=True
            ).exists()
            if not has_correct and not attrs.get('is_correct'):
                raise serializers.ValidationError({
                    'is_correct': 'Each question must have at least one correct answer.'
                })
        return attrs


class QuizQuestionSerializer(serializers.ModelSerializer):
    options = QuizOptionSerializer(many=True, read_only=True)

    class Meta:
        model = QuizQuestion
        fields = ['id', 'question_text', 'marks', 'question_type', 'order', 'options']


class QuizQuestionCreateSerializer(serializers.ModelSerializer):
    options = QuizOptionCreateSerializer(many=True)

    class Meta:
        model = QuizQuestion
        fields = ['id', 'question_text', 'marks', 'question_type', 'order', 'options']
        extra_kwargs = {
            'marks': {'default': 10},
            'question_type': {'default': 'MULTIPLE_CHOICE'},
        }

    def validate(self, attrs):
        options = attrs.get('options', [])
        if len(options) < 2:
            raise serializers.ValidationError({
                'options': 'Each question must have at least 2 options.'
            })

        has_correct = any(opt.get('is_correct', False) for opt in options)
        if not has_correct:
            raise serializers.ValidationError({
                'options': 'Each question must have exactly one correct answer.'
            })

        correct_count = sum(1 for opt in options if opt.get('is_correct', False))
        if correct_count > 1:
            raise serializers.ValidationError({
                'options': 'Each question must have exactly one correct answer.'
            })

        return attrs

    def create(self, validated_data):
        options_data = validated_data.pop('options')
        question = QuizQuestion.objects.create(**validated_data)
        for option_data in options_data:
            QuizOption.objects.create(question=question, **option_data)
        return question


class QuizListSerializer(serializers.ModelSerializer):
    total_questions = serializers.SerializerMethodField()
    total_marks = serializers.SerializerMethodField()
    creator_name = serializers.SerializerMethodField()

    class Meta:
        model = Quiz
        fields = [
            'id',
            'title',
            'description',
            'category',
            'difficulty',
            'time_limit',
            'passing_score',
            'is_daily_quiz',
            'is_active',
            'total_questions',
            'total_marks',
            'creator_name',
            'created_at',
            'updated_at',
        ]

    def get_total_questions(self, obj):
        return obj.questions.count()

    def get_total_marks(self, obj):
        return obj.get_total_marks()

    def get_creator_name(self, obj):
        if obj.created_by:
            return obj.created_by.full_name or obj.created_by.email
        return None


class QuizDetailSerializer(serializers.ModelSerializer):
    questions = QuizQuestionSerializer(many=True, read_only=True)
    creator_name = serializers.SerializerMethodField()
    total_questions = serializers.SerializerMethodField()
    total_marks = serializers.SerializerMethodField()

    class Meta:
        model = Quiz
        fields = [
            'id',
            'title',
            'description',
            'category',
            'difficulty',
            'time_limit',
            'passing_score',
            'randomize_questions',
            'immediate_results',
            'is_daily_quiz',
            'is_active',
            'total_questions',
            'total_marks',
            'creator_name',
            'created_at',
            'updated_at',
            'questions',
        ]

    def get_creator_name(self, obj):
        if obj.created_by:
            return obj.created_by.full_name or obj.created_by.email
        return None

    def get_total_questions(self, obj):
        return obj.questions.count()

    def get_total_marks(self, obj):
        return obj.get_total_marks()


class QuizCreateSerializer(serializers.ModelSerializer):
    questions = QuizQuestionCreateSerializer(many=True)

    class Meta:
        model = Quiz
        fields = [
            'id',
            'title',
            'description',
            'category',
            'difficulty',
            'time_limit',
            'passing_score',
            'randomize_questions',
            'immediate_results',
            'is_daily_quiz',
            'is_active',
            'questions',
        ]
        extra_kwargs = {
            'time_limit': {'default': 5},
            'passing_score': {'default': 70},
            'randomize_questions': {'default': False},
            'immediate_results': {'default': True},
            'is_daily_quiz': {'default': False},
            'is_active': {'default': True},
        }

    def validate_title(self, value):
        value = value.strip()
        if len(value) < 5:
            raise serializers.ValidationError('Quiz title must be at least 5 characters.')
        if len(value) > 100:
            raise serializers.ValidationError('Quiz title must be 100 characters or less.')
        return value

    def validate_description(self, value):
        value = value.strip()
        if len(value) < 10:
            raise serializers.ValidationError('Quiz description must be at least 10 characters.')
        if len(value) > 300:
            raise serializers.ValidationError('Quiz description must be 300 characters or less.')
        return value

    def validate_questions(self, value):
        if not value or len(value) == 0:
            raise serializers.ValidationError('Quiz must have at least one question.')
        return value

    def create(self, validated_data):
        questions_data = validated_data.pop('questions')
        request = self.context.get('request')

        quiz = Quiz.objects.create(
            created_by=request.user if request and hasattr(request, 'user') else None,
            **validated_data
        )

        for i, question_data in enumerate(questions_data):
            question_data['order'] = question_data.get('order', i + 1)
            options_data = question_data.pop('options')
            question = QuizQuestion.objects.create(quiz=quiz, **question_data)
            for option_data in options_data:
                QuizOption.objects.create(question=question, **option_data)

        return quiz

    def update(self, instance, validated_data):
        questions_data = validated_data.pop('questions', None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if questions_data is not None:
            instance.questions.all().delete()
            for i, question_data in enumerate(questions_data):
                question_data['order'] = question_data.get('order', i + 1)
                options_data = question_data.pop('options')
                question = QuizQuestion.objects.create(quiz=instance, **question_data)
                for option_data in options_data:
                    QuizOption.objects.create(question=question, **option_data)

        return instance


class QuizAnswerSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuizAnswer
        fields = ['id', 'question', 'selected_option', 'is_correct']


class QuizAttemptSerializer(serializers.ModelSerializer):
    quiz_title = serializers.CharField(source='quiz.title', read_only=True)
    student_email = serializers.SerializerMethodField()

    class Meta:
        model = QuizAttempt
        fields = [
            'id',
            'quiz',
            'quiz_title',
            'student',
            'student_name',
            'student_email',
            'score',
            'correct_answers',
            'total_questions',
            'time_used',
            'percentage',
            'passed',
            'submitted_at',
        ]

    def get_student_email(self, obj):
        if obj.student:
            return obj.student.email
        return None


class QuizSubmitSerializer(serializers.Serializer):
    student_name = serializers.CharField(max_length=100, required=False, allow_blank=True)
    time_used = serializers.IntegerField(min_value=0, default=0)
    answers = serializers.ListField(
        child=serializers.DictField(),
        required=True,
        allow_empty=True,
    )

    def validate_answers(self, value):
        if not value:
            return value

        for answer in value:
            if 'question_id' not in answer:
                raise serializers.ValidationError('Each answer must have a question_id.')
            if 'selected_option_id' not in answer:
                raise serializers.ValidationError('Each answer must have a selected_option_id.')

            try:
                question_id = int(answer['question_id'])
                selected_option_id = int(answer['selected_option_id'])
            except (ValueError, TypeError):
                raise serializers.ValidationError('question_id and selected_option_id must be integers.')

        return value


class QuizResultSerializer(serializers.ModelSerializer):
    quiz_title = serializers.CharField(source='quiz.title', read_only=True)
    category = serializers.CharField(source='quiz.category', read_only=True)
    difficulty = serializers.CharField(source='quiz.difficulty', read_only=True)
    passing_score = serializers.IntegerField(source='quiz.passing_score', read_only=True)

    class Meta:
        model = QuizAttempt
        fields = [
            'id',
            'quiz_title',
            'category',
            'difficulty',
            'passing_score',
            'score',
            'correct_answers',
            'total_questions',
            'time_used',
            'percentage',
            'passed',
            'submitted_at',
        ]


class QuizAnswerDetailSerializer(serializers.ModelSerializer):
    question_text = serializers.CharField(source='question.question_text', read_only=True)
    correct_option_text = serializers.SerializerMethodField()
    selected_option_text = serializers.CharField(source='selected_option.option_text', read_only=True)

    class Meta:
        model = QuizAnswer
        fields = [
            'id',
            'question',
            'question_text',
            'selected_option',
            'selected_option_text',
            'is_correct',
            'correct_option_text',
        ]

    def get_correct_option_text(self, obj):
        correct_option = obj.question.options.filter(is_correct=True).first()
        if correct_option:
            return correct_option.option_text
        return None
# --- LESSON AUTHORING SERIALIZERS ---
from .models import (
    LessonAuthoringProfile,
    LessonExerciseFile,
    LessonQuiz,
    LessonQuizQuestion,
    LessonQuizAttempt,
)


class LessonExerciseFileSerializer(serializers.ModelSerializer):
    file_url = serializers.SerializerMethodField()

    class Meta:
        model = LessonExerciseFile
        fields = ['id', 'lesson', 'display_name', 'file', 'file_url', 'order', 'uploaded_at']
        read_only_fields = ['id', 'lesson', 'file_url', 'uploaded_at']

    def validate_display_name(self, value):
        return value.strip()

    def get_file_url(self, obj):
        return obj.file.url if obj.file else None


class LessonQuizQuestionWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = LessonQuizQuestion
        fields = [
            'id',
            'question_text',
            'option_a',
            'option_b',
            'option_c',
            'option_d',
            'correct_option',
            'order',
            'explanation',
        ]
        read_only_fields = ['id']

    def validate_question_text(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError('Question text is required')
        return value

    def validate(self, attrs):
        option_fields = ['option_a', 'option_b', 'option_c', 'option_d']
        for field in option_fields:
            value = attrs.get(field)
            if value is None:
                continue
            if not str(value).strip():
                raise serializers.ValidationError({field: 'Option cannot be empty'})
            attrs[field] = str(value).strip()
        return attrs


class LessonQuizSerializer(serializers.ModelSerializer):
    questions = LessonQuizQuestionWriteSerializer(many=True, required=False)

    class Meta:
        model = LessonQuiz
        fields = [
            'id',
            'title',
            'instructions',
            'passing_score',
            'order',
            'status',
            'published_at',
            'questions',
        ]
        read_only_fields = ['id', 'published_at']

    def validate_title(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError('Quiz title is required')
        if len(value) > 140:
            raise serializers.ValidationError('Quiz title must be 140 characters or less')
        return value

    def _upsert_questions(self, quiz, questions_data):
        existing_by_id = {question.id: question for question in quiz.questions.all()}
        kept_ids = set()

        for index, raw_question in enumerate(questions_data, start=1):
            question_data = dict(raw_question)
            question_id = question_data.pop('id', None)
            if not question_data.get('order'):
                question_data['order'] = index

            if question_id:
                question = existing_by_id.get(question_id)
                if question is None:
                    raise serializers.ValidationError({'questions': f'Invalid question id: {question_id}'})
                for key, value in question_data.items():
                    setattr(question, key, value)
                question.save()
                kept_ids.add(question.id)
            else:
                question = LessonQuizQuestion.objects.create(quiz=quiz, **question_data)
                kept_ids.add(question.id)

        quiz.questions.exclude(id__in=kept_ids).delete()

    def create(self, validated_data):
        questions_data = validated_data.pop('questions', [])
        if validated_data.get('status') == 'PUBLISHED':
            validated_data['published_at'] = timezone.now()

        quiz = LessonQuiz.objects.create(**validated_data)
        if questions_data:
            self._upsert_questions(quiz, questions_data)
        return quiz

    def update(self, instance, validated_data):
        questions_data = validated_data.pop('questions', None)

        next_status = validated_data.get('status', instance.status)
        if instance.status != 'PUBLISHED' and next_status == 'PUBLISHED':
            validated_data['published_at'] = timezone.now()
        elif next_status != 'PUBLISHED':
            validated_data['published_at'] = None

        for key, value in validated_data.items():
            setattr(instance, key, value)
        instance.save()

        if questions_data is not None:
            self._upsert_questions(instance, questions_data)

        return instance


class LessonAuthoringProfileSerializer(serializers.ModelSerializer):
    lesson_id = serializers.IntegerField(source='lesson.id', read_only=True)
    title = serializers.CharField(source='lesson.title', required=False)
    content = serializers.CharField(source='lesson.content', required=False, allow_blank=True)
    duration_minutes = serializers.IntegerField(source='lesson.duration_minutes', required=False, min_value=1)
    credits_awarded = serializers.IntegerField(source='lesson.credits_awarded', required=False, min_value=0)
    required_credits_to_unlock = serializers.IntegerField(
        source='lesson.required_credits_to_unlock',
        required=False,
        min_value=0,
    )
    publish_at = serializers.DateTimeField(required=False, allow_null=True)
    drip_delay_days = serializers.IntegerField(required=False, min_value=0)
    require_quiz_pass_for_completion = serializers.BooleanField(required=False)
    lesson_link_url = serializers.URLField(required=False, allow_blank=True)
    lesson_image = serializers.ImageField(required=False, allow_null=True)
    lesson_video_file = serializers.FileField(required=False, allow_null=True)
    lesson_video_embed_url = serializers.URLField(required=False, allow_blank=True)
    lesson_image_url = serializers.SerializerMethodField()
    lesson_video_file_url = serializers.SerializerMethodField()
    exercise_files = LessonExerciseFileSerializer(source='lesson.exercise_files', many=True, read_only=True)
    quizzes = LessonQuizSerializer(source='lesson.quizzes', many=True, read_only=True)

    class Meta:
        model = LessonAuthoringProfile
        fields = [
            'lesson_id',
            'title',
            'description',
            'content',
            'duration_minutes',
            'credits_awarded',
            'required_credits_to_unlock',
            'status',
            'publish_at',
            'drip_delay_days',
            'require_quiz_pass_for_completion',
            'lesson_link_url',
            'lesson_image',
            'lesson_image_url',
            'lesson_video_file',
            'lesson_video_file_url',
            'lesson_video_embed_url',
            'exercise_files',
            'quizzes',
            'updated_at',
        ]
        read_only_fields = ['lesson_id', 'exercise_files', 'quizzes', 'updated_at']

    def validate_description(self, value):
        return value.strip()

    def get_lesson_image_url(self, obj):
        if obj.lesson_image:
            return obj.lesson_image.url
        return None

    def get_lesson_video_file_url(self, obj):
        if obj.lesson_video_file:
            return obj.lesson_video_file.url
        return None

    def update(self, instance, validated_data):
        lesson_data = validated_data.pop('lesson', {})
        if lesson_data:
            lesson = instance.lesson
            for field, value in lesson_data.items():
                setattr(lesson, field, value)
            lesson.save()

        status_in_payload = 'status' in validated_data
        next_status = validated_data.get('status', instance.status)
        publish_at = validated_data.get('publish_at', instance.publish_at)
        if next_status == 'PUBLISHED' and not publish_at:
            validated_data['publish_at'] = timezone.now()
        elif status_in_payload and next_status != 'PUBLISHED':
            validated_data['publish_at'] = None

        return super().update(instance, validated_data)


class LearnerLessonQuizQuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = LessonQuizQuestion
        fields = ['id', 'question_text', 'option_a', 'option_b', 'option_c', 'option_d', 'order']


class LearnerLessonQuizSerializer(serializers.ModelSerializer):
    questions = LearnerLessonQuizQuestionSerializer(many=True, read_only=True)

    class Meta:
        model = LessonQuiz
        fields = ['id', 'title', 'instructions', 'passing_score', 'order', 'questions']


class LessonQuizSubmissionSerializer(serializers.Serializer):
    answers = serializers.ListField(child=serializers.DictField(), allow_empty=False)

    def validate_answers(self, value):
        normalized_answers = []
        option_map = {0: 'A', 1: 'B', 2: 'C', 3: 'D'}

        for item in value:
            question_id = item.get('question_id')
            selected_option = item.get('selected_option')

            if not isinstance(question_id, int):
                raise serializers.ValidationError('Each answer requires an integer question_id')

            if isinstance(selected_option, int):
                selected_option = option_map.get(selected_option)
            elif isinstance(selected_option, str):
                selected_option = selected_option.strip().upper()

            if selected_option not in ['A', 'B', 'C', 'D']:
                raise serializers.ValidationError('selected_option must be A, B, C, D or 0-3')

            normalized_answers.append(
                {
                    'question_id': question_id,
                    'selected_option': selected_option,
                }
            )

        return normalized_answers


class LessonQuizAttemptSerializer(serializers.ModelSerializer):
    class Meta:
        model = LessonQuizAttempt
        fields = ['id', 'quiz', 'score_percent', 'passed', 'answers', 'submitted_at']
        read_only_fields = ['id', 'quiz', 'score_percent', 'passed', 'answers', 'submitted_at']

        # --- NEW: Q&A WALL SERIALIZERS ---
class WallAnswerSerializer(serializers.ModelSerializer):
    author_name = serializers.ReadOnlyField(source='author.full_name')
    author_role = serializers.ReadOnlyField(source='author.role')
    created_at_human = serializers.SerializerMethodField()

    class Meta:
        model = WallAnswer
        fields = ['id', 'question', 'body', 'author_name', 'author_role', 'is_expert_answer', 'created_at', 'created_at_human']

    # This MUST be indented inside the class
    def get_created_at_human(self, obj):
        return naturaltime(obj.created_at)       

class WallQuestionSerializer(serializers.ModelSerializer):
    author_name = serializers.SerializerMethodField()
    tags = serializers.SerializerMethodField()
    created_at_human = serializers.SerializerMethodField()
    answers = WallAnswerSerializer(many=True, read_only=True, source='wall_answers')
    
    # Existing logic for votes
    votes = serializers.SerializerMethodField()
    is_upvoted = serializers.SerializerMethodField()

    # NEW: Tells the frontend if the logged-in user owns this question
    is_owner = serializers.SerializerMethodField()

    class Meta:
        model = WallQuestion
        fields = [
            'id', 'title', 'body', 'author_name', 'is_anonymous', 
            'tags', 'votes', 'is_upvoted', 'is_owner', 'answers', 
            'created_at', 'created_at_human'
        ]

    def get_is_owner(self, obj):
        """Checks if the current logged-in user is the author of the question."""
        user = self.context.get('request').user
        if user and user.is_authenticated:
            return obj.author == user
        return False

    def get_author_name(self, obj):
        if obj.is_anonymous:
            return "Anonymous Student"
        return obj.author.full_name or obj.author.username

    def get_tags(self, obj):
        if not obj.tags:
            return []
        return [tag.strip() for tag in obj.tags.split(',') if tag.strip()]

    def get_created_at_human(self, obj):
        return naturaltime(obj.created_at)

    def get_votes(self, obj):
        """Returns the total count of unique users who upvoted."""
        return obj.upvoted_by.count()

    def get_is_upvoted(self, obj):
        """Tells the frontend if the logged-in user has already voted for this."""
        user = self.context.get('request').user
        if user and user.is_authenticated:
            return obj.upvoted_by.filter(id=user.id).exists()
        return False
