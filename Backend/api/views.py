import random
import json
from datetime import timedelta
from django.utils import timezone
from django.db.models import Count
from django.db.models.functions import TruncDate
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, viewsets
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework_simplejwt.tokens import RefreshToken
from django.core.mail import send_mail
from django.db import transaction # Added for atomic transactions
from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from .models import Notification, WallQuestion
from .serializers import WallQuestionSerializer

# Make sure to import the new models and serializers
from .models import User, OTP, Interest, Question, TestResult, StudentTutorProfile, TutorOTP, WallQuestion, WallAnswer
from .serializers import (
    RegisterSerializer, 
    QuestionSerializer, 
    InterestSerializer,
    IdentityVerificationSerializer, 
    StudentTutorApplicationSerializer, WallQuestionSerializer, WallAnswerSerializer, NotificationSerializer
)
from .permissions import IsApprovedTutor

# --- ADDED THIS IMPORT TO FIX THE NameError ---
from rest_framework.decorators import api_view, permission_classes
from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from .models import User, StudentTutorProfile
from .serializers import WallQuestionSerializer, StudentTutorApplicationSerializer # Ensure these are imported


# --- 1. REGISTRATION ---
class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            
            # Generate 6-digit OTP
            otp_code = str(random.randint(100000, 999999))
            OTP.objects.update_or_create(user=user, defaults={'code': otp_code})
            
            # Send Email (Console backend for testing)
            send_mail(
                'English Tutor Verification Code',
                f'Hello {user.full_name}, your verification code is: {otp_code}',
                'noreply@english-tutor.edu',
                [user.email],
                fail_silently=False,
            )
            return Response({"message": "OTP sent to your university email."}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# --- 2. VERIFICATION (With Auto-Login) ---
class VerifyOTPView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email')
        code = request.data.get('code')
        
        if not email or not code:
            return Response({"error": "Email and code are required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(email=email)
            otp = OTP.objects.get(user=user, code=code)
            
            if otp.is_valid():
                user.is_verified = True
                user.onboarding_status = 'VERIFIED'
                user.save()
                otp.delete() 

                # GENERATE TOKENS: User doesn't have to login again
                refresh = RefreshToken.for_user(user)
                
                return Response({
                    "message": "Verification successful.",
                    "access": str(refresh.access_token),
                    "refresh": str(refresh),
                    "role": user.role,
                    "onboarding_status": user.onboarding_status
                }, status=status.HTTP_200_OK)
            
            return Response({"error": "OTP has expired."}, status=status.HTTP_400_BAD_REQUEST)
            
        except User.DoesNotExist:
            return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)
        except OTP.DoesNotExist:
            return Response({"error": "Invalid verification code."}, status=status.HTTP_400_BAD_REQUEST)


# --- 3. INTERESTS (GET and POST) ---
class InterestListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        interests = Interest.objects.all()
        serializer = InterestSerializer(interests, many=True)
        return Response(serializer.data)

class SubmitInterestsView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        interest_ids = request.data.get('interests', [])
        target_level = request.data.get('target_level')

        if not interest_ids or not target_level:
            return Response({"error": "Interests and target level are required."}, status=status.HTTP_400_BAD_REQUEST)

        user.target_proficiency = target_level
        user.interests.clear()
        
        for i_id in interest_ids:
            try:
                interest = Interest.objects.get(id=i_id)
                interest.students.add(user)
            except Interest.DoesNotExist:
                continue
        
        user.onboarding_status = 'INTERESTS_SELECTED'
        user.save()
        
        return Response({
            "message": "Goals updated successfully!",
            "onboarding_status": user.onboarding_status
        }, status=status.HTTP_200_OK)


# --- 4. PLACEMENT TEST ---
class PlacementTestView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # 1. Start with all questions
        queryset = Question.objects.all()

        # 2. Check if the frontend sent a category (e.g., ?category=GRAMMAR)
        category_param = request.query_params.get('category', None)
        # 1. PRINT WHAT DJANGO ACTUALLY RECEIVED
        print(f"--- DEBUG: Category Received from React: {category_param} ---")
        # 3. Filter the database if a category exists
        if category_param:
            queryset = queryset.filter(category__iexact=category_param)

        # 4. Now randomize and take 15 questions from that specific category
        questions = queryset.order_by('?')[:15]
        
        serializer = QuestionSerializer(questions, many=True)
        return Response(serializer.data)

    def post(self, request):
        user = request.user
        answers = request.data.get('answers', [])
        
        if not answers:
            return Response({"error": "No answers provided."}, status=status.HTTP_400_BAD_REQUEST)

        score = 0
        for ans in answers:
            try:
                q = Question.objects.get(id=ans.get('id'))
                if str(q.correct_option).strip().upper() == str(ans.get('choice')).strip().upper():
                    score += 1
            except Question.DoesNotExist:
                continue

        total = len(answers)
        percent = (score / total) * 100 if total > 0 else 0
        
        if percent < 40: level = "Beginner"
        elif percent < 75: level = "Intermediate"
        else: level = "Advanced"

        TestResult.objects.create(student=user, score=score, proficiency_level=level)
        
        user.onboarding_status = 'COMPLETED'
        user.save()

        return Response({
            "score": score,
            "level": level,
            "onboarding_status": user.onboarding_status,
            "status": "Onboarding Complete"
        }, status=status.HTTP_200_OK)


class StudentProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        interest_names = list(user.interests.values_list('name', flat=True))

        latest_result = (
            TestResult.objects.filter(student=user)
            .order_by('-completed_at', '-id')
            .first()
        )

        target_level_label = dict(User.TARGET_LEVEL_CHOICES).get(user.target_proficiency)
        placement_level = latest_result.proficiency_level if latest_result else None
        resolved_level = placement_level or target_level_label

        data = {
            'id': user.id,
            'full_name': user.full_name,
            'email': user.email,
            'onboarding_status': user.onboarding_status,
            'selected_area': interest_names[0] if interest_names else None,
            'selected_areas': interest_names,
            'target_level': target_level_label,
            'placement_level': placement_level,
            'placement_score': latest_result.score if latest_result else None,
            'level': resolved_level,
        }
        return Response(data, status=status.HTTP_200_OK)


class CreateQuestionView(APIView):
    permission_classes = [IsAuthenticated] 
    
    def get(self, request):
        """Returns all placement questions for the admin dashboard"""
        questions = Question.objects.all().order_by('-id') # Newest first
        serializer = QuestionSerializer(questions, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        is_many = isinstance(request.data, list)
        serializer = QuestionSerializer(data=request.data, many=is_many)
        
        if serializer.is_valid():
            serializer.save()
            return Response({
                "message": f"Successfully added {len(serializer.data) if is_many else 1} question(s).",
                "data": serializer.data
            }, status=status.HTTP_201_CREATED)
            
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class QuestionDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Handles GET, PUT (Edit), and DELETE for a single placement question.
    """
    queryset = Question.objects.all()
    serializer_class = QuestionSerializer
    permission_classes = [IsAuthenticated]


# --- 5. TUTOR APPLICATION WORKFLOW ---

class IdentityVerificationView(APIView):
    """
    Handles the Identity Verification step of the Tutor Application 
    (Uploading Student ID and agreeing to terms)
    """
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser] # Required for image uploads

    def put(self, request):
        user = request.user
        serializer = IdentityVerificationSerializer(user, data=request.data, partial=True)
        
        if serializer.is_valid():
            serializer.save()
            return Response({
                "message": "Identity verification documents uploaded successfully.",
                "identity_proof_url": user.identity_proof.url if user.identity_proof else None
            }, status=status.HTTP_200_OK)
            
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class SubmitApplicationView(APIView):
    """
    Handles submitting teaching areas, bio, and availability
    """
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def get(self, request):
        """Check application status"""
        try:
            profile = StudentTutorProfile.objects.get(user=request.user)
            serializer = StudentTutorApplicationSerializer(profile)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except StudentTutorProfile.DoesNotExist:
            return Response(
                {"message": "No application submitted yet.", "status": "NOT_APPLIED"}, 
                status=status.HTTP_404_NOT_FOUND
            )

    def post(self, request):
        """Submit a new student tutor application"""
        # Ensure they have completed identity verification first
        if not request.user.identity_proof or not request.user.agreed_to_tutor_terms:
             return Response(
                {"error": "You must complete Identity Verification before submitting this application."}, 
                status=status.HTTP_403_FORBIDDEN
            )

        if StudentTutorProfile.objects.filter(user=request.user).exists():
            return Response(
                {"error": "You have already submitted an application."}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = StudentTutorApplicationSerializer(data=request.data)
        if serializer.is_valid():
            uploaded_video = request.FILES.get('video')
            serializer.save(user=request.user, status='PENDING',video=uploaded_video)
            return Response(
                {"message": "Application submitted successfully. It is currently under review.", "data": serializer.data}, 
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ReviewApplicationView(APIView):
    """Admin-only view to approve or reject student tutor applications"""
    permission_classes = [IsAuthenticated] 

    def patch(self, request, profile_id):
        if request.user.role != 'ADMIN':
            return Response({"error": "Unauthorized. Admins only."}, status=status.HTTP_403_FORBIDDEN)

        try:
            profile = StudentTutorProfile.objects.get(id=profile_id)
        except StudentTutorProfile.DoesNotExist:
            return Response({"error": "Application not found."}, status=status.HTTP_404_NOT_FOUND)

        new_status = request.data.get('status')
        if new_status not in dict(StudentTutorProfile.APPLICATION_STATUS_CHOICES):
            return Response({"error": "Invalid status."}, status=status.HTTP_400_BAD_REQUEST)

        profile.status = new_status
        profile.reviewed_at = timezone.now()
        profile.save()

        # Update the User's role based on Admin approval
        if new_status == 'APPROVED':
            profile.user.role = 'STUDENT_TUTOR'
            profile.user.save()
        elif new_status == 'REJECTED' and profile.user.role == 'STUDENT_TUTOR':
            profile.user.role = 'STUDENT'
            profile.user.save()

        return Response({"message": f"Application marked as {new_status}."}, status=status.HTTP_200_OK)


# --- 6. ISOLATED TUTOR SIGNUP LOGIC (New Additions) ---

@api_view(['POST'])
@permission_classes([AllowAny])
def send_tutor_otp(request):
    email = request.data.get('email')
    if not email:
        return Response({"error": "Email is required"}, status=400)

    otp_code = str(random.randint(100000, 999999))
    
    try:
        # Check if this line is causing the crash
        TutorOTP.objects.update_or_create(
            email=email, 
            defaults={'code': otp_code, 'created_at': timezone.now()}
        )
        
        send_mail(
            'English Tutor Verification',
            f'This is Your English Tutor Verification code: {otp_code}',
            'noreply@english-tutor.edu',
            [email],
            fail_silently=False, 
        )
        return Response({"message": "OTP sent!"}, status=200)

    except Exception as e:
        # THIS LINE IS KEY: It sends the real error message to your browser console
        print(f"DEBUG ERROR: {str(e)}") 
        return Response({"error": str(e)}, status=500)

@api_view(['POST'])
@permission_classes([AllowAny])
def verify_tutor_otp(request):
    email = request.data.get('email'); code = request.data.get('otp')
    try:
        otp_record = TutorOTP.objects.get(email=email, code=code)
        if otp_record.is_valid(): return Response({"message": "Verified"}, status=200)
        return Response({"error": "Expired"}, status=400)
    except TutorOTP.DoesNotExist: return Response({"error": "Invalid Code"}, status=400)

class TutorRegisterView(APIView):
    """
    Handles the Multipart signup: User creation + Profile + Video Upload.
    """
    authentication_classes = [] # Fix for 401
    permission_classes = [AllowAny]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        # 1. Prepare User Data
        user_payload = {
            "full_name": request.data.get("full_name"),
            "email": request.data.get("email"),
            "password": request.data.get("password"),
            "role": "TUTOR",
            "is_verified": True
        }

        try:
            with transaction.atomic():
                # 2. Create the User
                user_serializer = RegisterSerializer(data=user_payload)
                if not user_serializer.is_valid():
                    return Response(user_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
                
                user = user_serializer.save()

                # 3. Handle Hourly Rate (CRITICAL: Fixes DecimalField crashes)
                raw_rate = request.data.get('hourly_rate', '0')
                try:
                    # Convert to float/decimal; if it's empty or invalid, default to 0
                    hourly_rate = float(raw_rate) if raw_rate else 0.0
                except ValueError:
                    hourly_rate = 0.0

                # 4. Handle JSON fields (React sends strings via FormData)
                try:
                    areas = json.loads(request.data.get('teaching_areas', '[]'))
                    avail = json.loads(request.data.get('availability', '{}'))
                except (json.JSONDecodeError, TypeError):
                    areas, avail = [], {}

                # 5. Create the Tutor Profile
                # video is pulled from request.FILES
                StudentTutorProfile.objects.create(
                    user=user,
                    bio=request.data.get('bio', ''),
                    hourly_rate=hourly_rate,
                    teaching_areas=areas,
                    availability=avail,
                    video=request.FILES.get('video'),
                    status='PENDING'
                )
                
                # 6. Generate Tokens
                refresh = RefreshToken.for_user(user)
                return Response({
                    "message": "Registration successful!",
                    "access": str(refresh.access_token),
                    "refresh": str(refresh)
                }, status=status.HTTP_201_CREATED)

        except Exception as e:
            # This prints the REAL error to your Django terminal
            print(f"--- REGISTRATION CRASH ERROR: {str(e)} ---")
            return Response({"error": "An internal error occurred during registration."}, status=500)

class TutorDashboardView(APIView):
    """Protected endpoint for approved tutors only"""
    permission_classes = [IsApprovedTutor]

    def get(self, request):
        courses_qs = Course.objects.filter(tutor=request.user)
        enrollments_qs = Enrollment.objects.filter(course__tutor=request.user)

        today = timezone.localdate()
        start_date = today - timedelta(days=29)

        enrollment_rows = (
            enrollments_qs
            .filter(enrolled_at__date__gte=start_date)
            .annotate(day=TruncDate('enrolled_at'))
            .values('day')
            .annotate(enrollments=Count('id'))
            .order_by('day')
        )

        enrollments_by_day = {
            row['day']: row['enrollments']
            for row in enrollment_rows
            if row.get('day')
        }

        enrollment_trend = []
        for index in range(30):
            current_day = start_date + timedelta(days=index)
            enrollment_trend.append(
                {
                    "day": index + 1,
                    "date": current_day.isoformat(),
                    "enrollments": enrollments_by_day.get(current_day, 0),
                }
            )

        stats = {
            "total_signups": enrollments_qs.count(),
            "total_learners": enrollments_qs.values("student_id").distinct().count(),
            "total_courses": courses_qs.count(),
            "total_lessons": Lesson.objects.filter(chapter__course__tutor=request.user).count(),
        }

        return Response(
            {
                "message": "Welcome to the Tutor Dashboard!",
                "stats": stats,
                "enrollment_trend": enrollment_trend,
            },
            status=status.HTTP_200_OK,
        )


# --- 6. COURSE CRUD WORKFLOW ---
from django.db import transaction
from django.shortcuts import get_object_or_404

from .models import Course, Chapter, Lesson, Enrollment, LessonCompletion
from .serializers import (
    CourseWriteSerializer,
    CoursePublicSerializer,
    CourseDetailSerializer,
    ChapterWriteSerializer,
    ChapterReadSerializer,
    LessonWriteSerializer,
    LessonReadSerializer,
    EnrollmentCreateSerializer,
    EnrollmentSerializer,
    ReorderSerializer,
)
from .permissions import IsTutorAuthor


def _normalize_chapter_orders(course):
    chapters = course.chapters.order_by('order', 'id')
    for index, chapter in enumerate(chapters, start=1):
        if chapter.order != index:
            Chapter.objects.filter(id=chapter.id).update(order=index)


def _normalize_lesson_orders(chapter):
    lessons = chapter.lessons.order_by('order', 'id')
    for index, lesson in enumerate(lessons, start=1):
        if lesson.order != index:
            Lesson.objects.filter(id=lesson.id).update(order=index)


def _build_course_context(user, course):
    enrollment = Enrollment.objects.filter(student=user, course=course).first()
    if not enrollment:
        return {
            'completed_lesson_ids': set(),
            'earned_credits': 0,
        }

    completed_ids = set(
        enrollment.completions.values_list('lesson_id', flat=True)
    )
    return {
        'completed_lesson_ids': completed_ids,
        'earned_credits': enrollment.earned_credits,
    }


class TutorCourseListCreateView(APIView):
    permission_classes = [IsTutorAuthor]

    def get(self, request):
        courses = Course.objects.filter(tutor=request.user).select_related('tutor')
        serializer = CoursePublicSerializer(courses, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = CourseWriteSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            course = serializer.save()
            response_serializer = CourseDetailSerializer(course, context={'request': request})
            return Response(response_serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class TutorCourseDetailView(APIView):
    permission_classes = [IsTutorAuthor]

    def get_object(self, request, course_id):
        return get_object_or_404(
            Course.objects.select_related('tutor').prefetch_related('chapters__lessons'),
            id=course_id,
            tutor=request.user,
        )

    def get(self, request, course_id):
        course = self.get_object(request, course_id)
        serializer = CourseDetailSerializer(course, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request, course_id):
        course = self.get_object(request, course_id)
        serializer = CourseWriteSerializer(course, data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(CourseDetailSerializer(course, context={'request': request}).data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request, course_id):
        course = self.get_object(request, course_id)
        serializer = CourseWriteSerializer(course, data=request.data, partial=True, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(CourseDetailSerializer(course, context={'request': request}).data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, course_id):
        course = self.get_object(request, course_id)
        course.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class TutorCoursePublishView(APIView):
    permission_classes = [IsTutorAuthor]

    def patch(self, request, course_id):
        course = get_object_or_404(Course, id=course_id, tutor=request.user)

        next_status = request.data.get('status')
        if next_status and next_status not in dict(Course.STATUS_CHOICES):
            return Response({'error': 'Invalid status value.'}, status=status.HTTP_400_BAD_REQUEST)

        if next_status:
            course.status = next_status
            if next_status == 'PUBLISHED':
                course.published_at = timezone.now()
            else:
                course.published_at = None

        course.save()
        return Response(
            {
                'message': 'Publishing status updated successfully.',
                'status': course.status,
                'published_at': course.published_at,
            },
            status=status.HTTP_200_OK,
        )


class TutorChapterListCreateView(APIView):
    permission_classes = [IsTutorAuthor]

    def get(self, request, course_id):
        course = get_object_or_404(Course, id=course_id, tutor=request.user)
        chapters = course.chapters.prefetch_related('lessons').all()
        serializer = ChapterReadSerializer(chapters, many=True, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request, course_id):
        course = get_object_or_404(Course, id=course_id, tutor=request.user)

        payload = request.data.copy()
        if not payload.get('order'):
            payload['order'] = course.chapters.count() + 1

        serializer = ChapterWriteSerializer(data=payload)
        if serializer.is_valid():
            chapter = serializer.save(course=course)
            return Response(ChapterReadSerializer(chapter).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class TutorChapterDetailView(APIView):
    permission_classes = [IsTutorAuthor]

    def patch(self, request, course_id, chapter_id):
        course = get_object_or_404(Course, id=course_id, tutor=request.user)
        chapter = get_object_or_404(Chapter, id=chapter_id, course=course)

        serializer = ChapterWriteSerializer(chapter, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(ChapterReadSerializer(chapter).data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, course_id, chapter_id):
        course = get_object_or_404(Course, id=course_id, tutor=request.user)
        chapter = get_object_or_404(Chapter, id=chapter_id, course=course)
        chapter.delete()
        _normalize_chapter_orders(course)
        return Response(status=status.HTTP_204_NO_CONTENT)


class TutorChapterReorderView(APIView):
    permission_classes = [IsTutorAuthor]

    def patch(self, request, course_id):
        course = get_object_or_404(Course, id=course_id, tutor=request.user)
        serializer = ReorderSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        ordered_ids = serializer.validated_data['ordered_ids']
        existing_ids = list(course.chapters.values_list('id', flat=True))

        if len(ordered_ids) != len(existing_ids) or set(ordered_ids) != set(existing_ids):
            return Response(
                {'error': 'ordered_ids must include each chapter in this course exactly once.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        with transaction.atomic():
            for index, chapter_id in enumerate(ordered_ids, start=1):
                Chapter.objects.filter(id=chapter_id, course=course).update(order=index)

        return Response({'message': 'Chapters reordered successfully.'}, status=status.HTTP_200_OK)


class TutorLessonListCreateView(APIView):
    permission_classes = [IsTutorAuthor]

    def get_chapter(self, request, chapter_id):
        chapter = get_object_or_404(
            Chapter.objects.select_related('course__tutor').prefetch_related('lessons'),
            id=chapter_id,
        )
        if chapter.course.tutor_id != request.user.id:
            return None
        return chapter

    def get(self, request, chapter_id):
        chapter = self.get_chapter(request, chapter_id)
        if chapter is None:
            return Response({'error': 'Unauthorized to access this chapter.'}, status=status.HTTP_403_FORBIDDEN)

        lessons = chapter.lessons.all()
        serializer = LessonWriteSerializer(lessons, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request, chapter_id):
        chapter = self.get_chapter(request, chapter_id)
        if chapter is None:
            return Response({'error': 'Unauthorized to modify this chapter.'}, status=status.HTTP_403_FORBIDDEN)

        payload = request.data.copy()
        if not payload.get('order'):
            payload['order'] = chapter.lessons.count() + 1

        serializer = LessonWriteSerializer(data=payload)
        if serializer.is_valid():
            lesson = serializer.save(chapter=chapter)
            return Response(LessonWriteSerializer(lesson).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class TutorLessonDetailView(APIView):
    permission_classes = [IsTutorAuthor]

    def get_lesson(self, request, chapter_id, lesson_id):
        lesson = get_object_or_404(
            Lesson.objects.select_related('chapter__course__tutor'),
            id=lesson_id,
            chapter_id=chapter_id,
        )
        if lesson.chapter.course.tutor_id != request.user.id:
            return None
        return lesson

    def patch(self, request, chapter_id, lesson_id):
        lesson = self.get_lesson(request, chapter_id, lesson_id)
        if lesson is None:
            return Response({'error': 'Unauthorized to modify this lesson.'}, status=status.HTTP_403_FORBIDDEN)

        serializer = LessonWriteSerializer(lesson, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(LessonWriteSerializer(lesson).data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, chapter_id, lesson_id):
        lesson = self.get_lesson(request, chapter_id, lesson_id)
        if lesson is None:
            return Response({'error': 'Unauthorized to delete this lesson.'}, status=status.HTTP_403_FORBIDDEN)

        chapter = lesson.chapter
        lesson.delete()
        _normalize_lesson_orders(chapter)
        return Response(status=status.HTTP_204_NO_CONTENT)


class TutorLessonReorderView(APIView):
    permission_classes = [IsTutorAuthor]

    def patch(self, request, chapter_id):
        chapter = get_object_or_404(Chapter.objects.select_related('course__tutor'), id=chapter_id)
        if chapter.course.tutor_id != request.user.id:
            return Response({'error': 'Unauthorized to reorder this chapter.'}, status=status.HTTP_403_FORBIDDEN)

        serializer = ReorderSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        ordered_ids = serializer.validated_data['ordered_ids']
        existing_ids = list(chapter.lessons.values_list('id', flat=True))

        if len(ordered_ids) != len(existing_ids) or set(ordered_ids) != set(existing_ids):
            return Response(
                {'error': 'ordered_ids must include each lesson in this chapter exactly once.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        with transaction.atomic():
            for index, lesson_id in enumerate(ordered_ids, start=1):
                Lesson.objects.filter(id=lesson_id, chapter=chapter).update(order=index)

        return Response({'message': 'Lessons reordered successfully.'}, status=status.HTTP_200_OK)


class PublishedCourseListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        courses = Course.objects.filter(
            status='PUBLISHED',
        ).select_related('tutor')
        serializer = CoursePublicSerializer(courses, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class CourseDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, course_id):
        course = get_object_or_404(
            Course.objects.select_related('tutor').prefetch_related('chapters__lessons'),
            id=course_id,
            status='PUBLISHED',
        )

        enrollment = Enrollment.objects.filter(student=request.user, course=course).first()
        context = {'request': request}
        context.update(_build_course_context(request.user, course))
        serializer = CourseDetailSerializer(course, context=context)

        data = serializer.data
        data['isEnrolled'] = bool(enrollment)
        data['earnedCredits'] = context['earned_credits']
        return Response(data, status=status.HTTP_200_OK)


class StudentEnrollmentListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        enrollments = Enrollment.objects.filter(student=request.user).select_related('course__tutor')
        serializer = EnrollmentSerializer(enrollments, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = EnrollmentCreateSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            enrollment = serializer.save()
            return Response(EnrollmentSerializer(enrollment).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class StudentLessonCompleteView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, course_id, lesson_id):
        enrollment = get_object_or_404(
            Enrollment.objects.select_related('course'),
            student=request.user,
            course_id=course_id,
        )
        lesson = get_object_or_404(
            Lesson.objects.select_related('chapter__course'),
            id=lesson_id,
            chapter__course_id=course_id,
        )

        already_done = LessonCompletion.objects.filter(enrollment=enrollment, lesson=lesson).exists()
        if already_done:
            return Response({'message': 'Lesson already completed.'}, status=status.HTTP_200_OK)

        if enrollment.earned_credits < lesson.required_credits_to_unlock:
            return Response(
                {
                    'error': 'Lesson is still locked for this student.',
                    'required_credits_to_unlock': lesson.required_credits_to_unlock,
                    'earned_credits': enrollment.earned_credits,
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        with transaction.atomic():
            LessonCompletion.objects.create(
                enrollment=enrollment,
                lesson=lesson,
                credits_awarded=lesson.credits_awarded,
            )

            enrollment.earned_credits += lesson.credits_awarded
            total_lessons = Lesson.objects.filter(chapter__course=enrollment.course).count()
            completed_count = LessonCompletion.objects.filter(enrollment=enrollment).count()
            enrollment.progress_percent = round((completed_count / total_lessons) * 100) if total_lessons else 0

            if enrollment.progress_percent >= 100:
                enrollment.status = 'completed'
                enrollment.completed_at = timezone.now()

            enrollment.save()

        return Response(
            {
                'message': 'Lesson marked as completed.',
                'earned_credits': enrollment.earned_credits,
                'progress': enrollment.progress_percent,
                'status': enrollment.status,
            },
            status=status.HTTP_200_OK,
        )


class StudentCourseProgressView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, course_id):
        enrollment = get_object_or_404(
            Enrollment.objects.select_related('course__tutor'),
            student=request.user,
            course_id=course_id,
        )

        total_lessons = Lesson.objects.filter(chapter__course_id=course_id).count()
        completed_qs = LessonCompletion.objects.filter(enrollment=enrollment)
        completed_lessons = completed_qs.count()
        progress = round((completed_lessons / total_lessons) * 100) if total_lessons else 0

        if progress >= 100 and enrollment.status != 'completed':
            enrollment.status = 'completed'
            enrollment.completed_at = timezone.now()
            enrollment.progress_percent = progress
            enrollment.save(update_fields=['status', 'completed_at', 'progress_percent'])
        elif enrollment.progress_percent != progress:
            enrollment.progress_percent = progress
            enrollment.save(update_fields=['progress_percent'])

        return Response(
            {
                'course': CoursePublicSerializer(enrollment.course).data,
                'status': enrollment.status,
                'progress': progress,
                'earned_credits': enrollment.earned_credits,
                'completed_lessons': completed_lessons,
                'total_lessons': total_lessons,
                'completed_lesson_ids': list(completed_qs.values_list('lesson_id', flat=True)),
            },
            status=status.HTTP_200_OK,
        )


# ============================================
# QUIZ VIEWS
# ============================================
from .models import Quiz, QuizQuestion, QuizOption, QuizAttempt, QuizAnswer
from .serializers import (
    QuizListSerializer,
    QuizDetailSerializer,
    QuizCreateSerializer,
    QuizSubmitSerializer,
    QuizResultSerializer,
    QuizAttemptSerializer,
    QuizAnswerDetailSerializer,
    QuizOptionSerializer,
    QuizQuestionAdminSerializer,
)


class QuizListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        quizzes = Quiz.objects.filter(is_active=True).select_related('created_by').distinct()
        serializer = QuizListSerializer(quizzes, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class QuizDetailView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, quiz_id):
        try:
            quiz = Quiz.objects.select_related('created_by').prefetch_related('questions__options').get(id=quiz_id, is_active=True)
        except Quiz.DoesNotExist:
            return Response({'error': 'Quiz not found.'}, status=status.HTTP_404_NOT_FOUND)

        serializer = QuizDetailSerializer(quiz)
        return Response(serializer.data, status=status.HTTP_200_OK)


class QuizCategoryListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, category):
        quizzes = Quiz.objects.filter(category=category.upper(), is_active=True).select_related('created_by').distinct()
        serializer = QuizListSerializer(quizzes, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class QuizDailyView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        from random import sample
        
        bank_questions = QuizQuestion.objects.filter(is_in_bank=True, is_approved=True).select_related('quiz')
        
        if bank_questions.count() < 10:
            return Response({'error': 'Not enough questions in the bank. Need at least 10.'}, status=status.HTTP_404_NOT_FOUND)
        
        selected_questions = sample(list(bank_questions), 10)
        
        quiz_data = {
            'id': 0,
            'title': 'Daily Quiz',
            'description': 'Test your knowledge with 10 random questions from the question bank!',
            'category': 'DAILY',
            'difficulty': 'MEDIUM',
            'time_limit': 10,
            'passing_score': 70,
            'randomize_questions': True,
            'immediate_results': True,
            'is_daily_quiz': True,
            'is_active': True,
            'questions': [
                {
                    'id': q.id,
                    'question_text': q.question_text,
                    'marks': q.marks,
                    'question_type': q.question_type,
                    'order': idx + 1,
                    'options': [
                        {'id': opt.id, 'option_text': opt.option_text, 'is_correct': opt.is_correct}
                        for opt in q.options.all()
                    ]
                }
                for idx, q in enumerate(selected_questions)
            ]
        }
        
        return Response(quiz_data, status=status.HTTP_200_OK)


class AdminPendingQuestionsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not request.user.role == 'ADMIN':
            return Response({'error': 'Admin access required.'}, status=status.HTTP_403_FORBIDDEN)
        
        pending_questions = QuizQuestion.objects.filter(
            is_in_bank=True, 
            is_approved=False
        ).select_related('quiz')
        
        serializer = QuizQuestionAdminSerializer(pending_questions, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class AdminQuestionApproveView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, question_id):
        if not request.user.role == 'ADMIN':
            return Response({'error': 'Admin access required.'}, status=status.HTTP_403_FORBIDDEN)
        
        try:
            question = QuizQuestion.objects.get(id=question_id)
        except QuizQuestion.DoesNotExist:
            return Response({'error': 'Question not found.'}, status=status.HTTP_404_NOT_FOUND)
        
        question.is_approved = True
        question.save()
        
        serializer = QuizQuestionAdminSerializer(question)
        return Response(serializer.data, status=status.HTTP_200_OK)


class AdminQuestionRejectView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, question_id):
        if not request.user.role == 'ADMIN':
            return Response({'error': 'Admin access required.'}, status=status.HTTP_403_FORBIDDEN)
        
        try:
            question = QuizQuestion.objects.get(id=question_id)
        except QuizQuestion.DoesNotExist:
            return Response({'error': 'Question not found.'}, status=status.HTTP_404_NOT_FOUND)
        
        question.is_in_bank = False
        question.is_approved = False
        question.save()
        
        return Response({'message': 'Question rejected and removed from bank.'}, status=status.HTTP_200_OK)


# --- ADMIN COURSE CONTENT APPROVAL VIEWS ---
class AdminCourseApprovalListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not request.user.role == 'ADMIN':
            return Response({'error': 'Admin access required.'}, status=status.HTTP_403_FORBIDDEN)

        courses = Course.objects.filter(
            approval_status='PENDING',
            status='DRAFT',
            created_by_role='STUDENT_TUTOR'
        ).select_related('tutor')

        from .serializers import CourseDetailSerializer
        serializer = CourseDetailSerializer(courses, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class AdminCourseApproveView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, course_id):
        if not request.user.role == 'ADMIN':
            return Response({'error': 'Admin access required.'}, status=status.HTTP_403_FORBIDDEN)

        try:
            course = Course.objects.get(id=course_id)
        except Course.DoesNotExist:
            return Response({'error': 'Course not found.'}, status=status.HTTP_404_NOT_FOUND)

        if course.created_by_role != 'STUDENT_TUTOR':
            return Response({'error': 'This course does not need approval.'}, status=status.HTTP_400_BAD_REQUEST)

        course.status = 'PUBLISHED'
        course.published_at = timezone.now()
        course.approval_status = 'APPROVED'
        course.approved_at = timezone.now()
        course.save()

        return Response({'message': 'Course approved and published.', 'status': course.status}, status=status.HTTP_200_OK)


class AdminCourseRejectView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, course_id):
        if not request.user.role == 'ADMIN':
            return Response({'error': 'Admin access required.'}, status=status.HTTP_403_FORBIDDEN)

        try:
            course = Course.objects.get(id=course_id)
        except Course.DoesNotExist:
            return Response({'error': 'Course not found.'}, status=status.HTTP_404_NOT_FOUND)

        if course.created_by_role != 'STUDENT_TUTOR':
            return Response({'error': 'This course does not need approval.'}, status=status.HTTP_400_BAD_REQUEST)

        rejection_reason = request.data.get('reason', '')
        course.rejection_reason = rejection_reason
        course.approval_status = 'REJECTED'
        course.save()

        return Response({'message': 'Course rejected.', 'rejection_reason': course.rejection_reason}, status=status.HTTP_200_OK)


class QuizCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = QuizCreateSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            quiz = serializer.save()
            return Response(
                QuizDetailSerializer(quiz).data,
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class QuizUpdateDeleteView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, quiz_id, user):
        try:
            return Quiz.objects.get(id=quiz_id, created_by=user)
        except Quiz.DoesNotExist:
            return None

    def get(self, request, quiz_id):
        quiz = self.get_object(quiz_id, request.user)
        if quiz is None:
            return Response({'error': 'Quiz not found or unauthorized.'}, status=status.HTTP_404_NOT_FOUND)
        serializer = QuizDetailSerializer(quiz)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request, quiz_id):
        quiz = self.get_object(quiz_id, request.user)
        if quiz is None:
            return Response({'error': 'Quiz not found or unauthorized.'}, status=status.HTTP_404_NOT_FOUND)
        serializer = QuizCreateSerializer(quiz, data=request.data, context={'request': request})
        if serializer.is_valid():
            quiz = serializer.save()
            return Response(QuizDetailSerializer(quiz).data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request, quiz_id):
        quiz = self.get_object(quiz_id, request.user)
        if quiz is None:
            return Response({'error': 'Quiz not found or unauthorized.'}, status=status.HTTP_404_NOT_FOUND)
        serializer = QuizCreateSerializer(quiz, data=request.data, partial=True, context={'request': request})
        if serializer.is_valid():
            quiz = serializer.save()
            return Response(QuizDetailSerializer(quiz).data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, quiz_id):
        quiz = self.get_object(quiz_id, request.user)
        if quiz is None:
            return Response({'error': 'Quiz not found or unauthorized.'}, status=status.HTTP_404_NOT_FOUND)
        quiz.is_active = False
        quiz.save()
        return Response(status=status.HTTP_204_NO_CONTENT)


class QuizSubmitView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, quiz_id):
        try:
            quiz = Quiz.objects.prefetch_related('questions__options').get(id=quiz_id, is_active=True)
        except Quiz.DoesNotExist:
            return Response({'error': 'Quiz not found.'}, status=status.HTTP_404_NOT_FOUND)

        serializer = QuizSubmitSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        validated_data = serializer.validated_data
        student_name = validated_data.get('student_name', '')
        time_used = validated_data.get('time_used', 0)
        answers_data = validated_data.get('answers', [])

        answers_dict = {}
        for ans in answers_data:
            answers_dict[ans['question_id']] = ans['selected_option_id']

        correct_answers = 0
        total_questions = quiz.questions.count()
        score = 0

        attempt = QuizAttempt.objects.create(
            quiz=quiz,
            student=request.user if request.user.is_authenticated else None,
            student_name=student_name or (request.user.full_name if request.user.is_authenticated else ''),
            total_questions=total_questions,
            time_used=time_used,
        )

        with transaction.atomic():
            for question in quiz.questions.all():
                selected_option_id = answers_dict.get(question.id)

                if selected_option_id is not None:
                    try:
                        selected_option = QuizOption.objects.get(id=selected_option_id, question=question)
                        is_correct = selected_option.is_correct

                        if is_correct:
                            correct_answers += 1
                            score += question.marks

                        QuizAnswer.objects.create(
                            attempt=attempt,
                            question=question,
                            selected_option=selected_option,
                            is_correct=is_correct,
                        )
                    except QuizOption.DoesNotExist:
                        pass

            percentage = (correct_answers / total_questions * 100) if total_questions > 0 else 0
            passed = percentage >= quiz.passing_score

            attempt.correct_answers = correct_answers
            attempt.score = score
            attempt.percentage = round(percentage, 2)
            attempt.passed = passed
            attempt.save()

        result_data = {
            'quiz_id': quiz.id,
            'quiz_title': quiz.title,
            'correct_answers': correct_answers,
            'total_questions': total_questions,
            'score': score,
            'total_marks': quiz.get_total_marks(),
            'percentage': float(attempt.percentage),
            'passing_score': quiz.passing_score,
            'passed': passed,
            'time_used': time_used,
        }

        if quiz.immediate_results:
            result_data['answers'] = QuizAnswerDetailSerializer(attempt.answers.all(), many=True).data

        return Response(result_data, status=status.HTTP_200_OK)


class QuizAttemptListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        attempts = QuizAttempt.objects.filter(student=request.user).select_related('quiz').order_by('-submitted_at')
        serializer = QuizAttemptSerializer(attempts, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class QuizAttemptDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, attempt_id):
        try:
            attempt = QuizAttempt.objects.select_related('quiz').prefetch_related('answers__question', 'answers__selected_option').get(
                id=attempt_id,
                student=request.user
            )
        except QuizAttempt.DoesNotExist:
            return Response({'error': 'Attempt not found.'}, status=status.HTTP_404_NOT_FOUND)

        result_serializer = QuizResultSerializer(attempt)
        answers_serializer = QuizAnswerDetailSerializer(attempt.answers.all(), many=True)

        return Response({
            'result': result_serializer.data,
            'answers': answers_serializer.data,
        }, status=status.HTTP_200_OK)


class TutorQuizListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        quizzes = Quiz.objects.filter(created_by=request.user).select_related('created_by')
        serializer = QuizListSerializer(quizzes, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class QuizForPlayView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, quiz_id):
        try:
            quiz = Quiz.objects.select_related('created_by').prefetch_related('questions__options').get(id=quiz_id, is_active=True)
        except Quiz.DoesNotExist:
            return Response({'error': 'Quiz not found.'}, status=status.HTTP_404_NOT_FOUND)

        questions_data = []
        for question in quiz.questions.all():
            questions_data.append({
                'id': question.id,
                'question_text': question.question_text,
                'marks': question.marks,
                'question_type': question.question_type,
                'order': question.order,
                'options': [
                    {
                        'id': option.id,
                        'option_text': option.option_text,
                    }
                    for option in question.options.all()
                ]
            })

        if quiz.randomize_questions:
            import random
            random.shuffle(questions_data)

        return Response({
            'id': quiz.id,
            'title': quiz.title,
            'description': quiz.description,
            'category': quiz.category,
            'difficulty': quiz.difficulty,
            'time_limit': quiz.time_limit,
            'passing_score': quiz.passing_score,
            'immediate_results': quiz.immediate_results,
            'questions': questions_data,
        }, status=status.HTTP_200_OK)
        return Response({"message": "Welcome to the Tutor Dashboard!"})


# --- 7. LESSON AUTHORING + LESSON READER WORKFLOW ---
from datetime import timedelta
from rest_framework.parsers import JSONParser

from .models import (
    LessonAuthoringProfile,
    LessonExerciseFile,
    LessonQuiz,
    LessonQuizAttempt,
)
from .serializers import (
    LessonAuthoringProfileSerializer,
    LessonExerciseFileSerializer,
    LessonQuizSerializer,
    LearnerLessonQuizSerializer,
    LessonQuizSubmissionSerializer,
    LessonQuizAttemptSerializer,
)


def _normalize_exercise_file_orders(lesson):
    files = lesson.exercise_files.order_by('order', 'id')
    for index, file_obj in enumerate(files, start=1):
        if file_obj.order != index:
            LessonExerciseFile.objects.filter(id=file_obj.id).update(order=index)


def _normalize_quiz_orders(lesson):
    quizzes = lesson.quizzes.order_by('order', 'id')
    for index, quiz in enumerate(quizzes, start=1):
        if quiz.order != index:
            LessonQuiz.objects.filter(id=quiz.id).update(order=index)


def _get_ordered_course_lesson_ids(course_id):
    return list(
        Lesson.objects.filter(chapter__course_id=course_id)
        .order_by('chapter__order', 'order', 'id')
        .values_list('id', flat=True)
    )


def _is_sequentially_unlocked(enrollment, lesson):
    ordered_ids = _get_ordered_course_lesson_ids(enrollment.course_id)
    if lesson.id not in ordered_ids:
        return False, []

    lesson_index = ordered_ids.index(lesson.id)
    if lesson_index == 0:
        return True, []

    required_previous_ids = ordered_ids[:lesson_index]
    completed_previous_ids = set(
        LessonCompletion.objects.filter(
            enrollment=enrollment,
            lesson_id__in=required_previous_ids,
        ).values_list('lesson_id', flat=True)
    )
    missing_ids = [lesson_id for lesson_id in required_previous_ids if lesson_id not in completed_previous_ids]
    return len(missing_ids) == 0, missing_ids


def _is_drip_unlocked(enrollment, profile):
    if not profile or profile.drip_delay_days <= 0:
        return True, None

    unlock_at = enrollment.enrolled_at + timedelta(days=profile.drip_delay_days)
    return timezone.now() >= unlock_at, unlock_at


def _can_student_view_lesson(profile):
    if not profile:
        return True
    if profile.status != 'PUBLISHED':
        return False
    if profile.publish_at and timezone.now() < profile.publish_at:
        return False
    return True


def _quiz_completion_requirement(enrollment, lesson, profile):
    published_quizzes = list(lesson.quizzes.filter(status='PUBLISHED').order_by('order', 'id'))
    require_quiz_pass = bool(published_quizzes) and (profile.require_quiz_pass_for_completion if profile else True)

    if not require_quiz_pass:
        return {
            'require_quiz_pass': False,
            'all_passed': True,
            'missing_quiz_ids': [],
            'published_quizzes': published_quizzes,
        }

    passed_quiz_ids = set(
        LessonQuizAttempt.objects.filter(
            enrollment=enrollment,
            quiz__in=published_quizzes,
            passed=True,
        ).values_list('quiz_id', flat=True)
    )
    missing_quiz_ids = [quiz.id for quiz in published_quizzes if quiz.id not in passed_quiz_ids]
    return {
        'require_quiz_pass': require_quiz_pass,
        'all_passed': len(missing_quiz_ids) == 0,
        'missing_quiz_ids': missing_quiz_ids,
        'published_quizzes': published_quizzes,
    }


class TutorLessonAuthoringDetailView(APIView):
    permission_classes = [IsTutorAuthor]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_lesson(self, request, chapter_id, lesson_id):
        lesson = get_object_or_404(
            Lesson.objects.select_related('chapter__course__tutor'),
            id=lesson_id,
            chapter_id=chapter_id,
        )
        if lesson.chapter.course.tutor_id != request.user.id:
            return None
        return lesson

    def get(self, request, chapter_id, lesson_id):
        lesson = self.get_lesson(request, chapter_id, lesson_id)
        if lesson is None:
            return Response({'error': 'Unauthorized to access this lesson.'}, status=status.HTTP_403_FORBIDDEN)

        profile, _ = LessonAuthoringProfile.objects.get_or_create(lesson=lesson)
        serializer = LessonAuthoringProfileSerializer(profile, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)

    def patch(self, request, chapter_id, lesson_id):
        lesson = self.get_lesson(request, chapter_id, lesson_id)
        if lesson is None:
            return Response({'error': 'Unauthorized to modify this lesson.'}, status=status.HTTP_403_FORBIDDEN)

        profile, _ = LessonAuthoringProfile.objects.get_or_create(lesson=lesson)
        serializer = LessonAuthoringProfileSerializer(
            profile,
            data=request.data,
            partial=True,
            context={'request': request},
        )
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class TutorLessonExerciseFileListCreateView(APIView):
    permission_classes = [IsTutorAuthor]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_lesson(self, request, lesson_id):
        lesson = get_object_or_404(
            Lesson.objects.select_related('chapter__course__tutor'),
            id=lesson_id,
        )
        if lesson.chapter.course.tutor_id != request.user.id:
            return None
        return lesson

    def get(self, request, lesson_id):
        lesson = self.get_lesson(request, lesson_id)
        if lesson is None:
            return Response({'error': 'Unauthorized to access this lesson.'}, status=status.HTTP_403_FORBIDDEN)

        files = lesson.exercise_files.all()
        serializer = LessonExerciseFileSerializer(files, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request, lesson_id):
        lesson = self.get_lesson(request, lesson_id)
        if lesson is None:
            return Response({'error': 'Unauthorized to modify this lesson.'}, status=status.HTTP_403_FORBIDDEN)

        uploaded_file = request.FILES.get('file')
        if not uploaded_file:
            return Response({'error': 'file is required.'}, status=status.HTTP_400_BAD_REQUEST)

        display_name = (request.data.get('display_name') or uploaded_file.name).strip()
        next_order = lesson.exercise_files.count() + 1

        exercise_file = LessonExerciseFile.objects.create(
            lesson=lesson,
            file=uploaded_file,
            display_name=display_name,
            order=next_order,
        )
        return Response(LessonExerciseFileSerializer(exercise_file).data, status=status.HTTP_201_CREATED)


class TutorLessonExerciseFileDetailView(APIView):
    permission_classes = [IsTutorAuthor]
    parser_classes = [JSONParser]

    def get_file(self, request, lesson_id, file_id):
        file_obj = get_object_or_404(
            LessonExerciseFile.objects.select_related('lesson__chapter__course__tutor'),
            id=file_id,
            lesson_id=lesson_id,
        )
        if file_obj.lesson.chapter.course.tutor_id != request.user.id:
            return None
        return file_obj

    def patch(self, request, lesson_id, file_id):
        file_obj = self.get_file(request, lesson_id, file_id)
        if file_obj is None:
            return Response({'error': 'Unauthorized to modify this file.'}, status=status.HTTP_403_FORBIDDEN)

        if 'display_name' in request.data:
            file_obj.display_name = str(request.data.get('display_name') or '').strip()

        if 'order' in request.data:
            try:
                order = int(request.data.get('order'))
                if order < 1:
                    raise ValueError
                file_obj.order = order
            except (TypeError, ValueError):
                return Response({'error': 'order must be an integer >= 1.'}, status=status.HTTP_400_BAD_REQUEST)

        file_obj.save()
        _normalize_exercise_file_orders(file_obj.lesson)
        refreshed_file = LessonExerciseFile.objects.get(id=file_obj.id)
        return Response(LessonExerciseFileSerializer(refreshed_file).data, status=status.HTTP_200_OK)

    def delete(self, request, lesson_id, file_id):
        file_obj = self.get_file(request, lesson_id, file_id)
        if file_obj is None:
            return Response({'error': 'Unauthorized to delete this file.'}, status=status.HTTP_403_FORBIDDEN)

        lesson = file_obj.lesson
        file_obj.delete()
        _normalize_exercise_file_orders(lesson)
        return Response(status=status.HTTP_204_NO_CONTENT)


class TutorLessonQuizListCreateView(APIView):
    permission_classes = [IsTutorAuthor]
    parser_classes = [JSONParser]

    def get_lesson(self, request, lesson_id):
        lesson = get_object_or_404(
            Lesson.objects.select_related('chapter__course__tutor').prefetch_related('quizzes__questions'),
            id=lesson_id,
        )
        if lesson.chapter.course.tutor_id != request.user.id:
            return None
        return lesson

    def get(self, request, lesson_id):
        lesson = self.get_lesson(request, lesson_id)
        if lesson is None:
            return Response({'error': 'Unauthorized to access quizzes for this lesson.'}, status=status.HTTP_403_FORBIDDEN)

        quizzes = lesson.quizzes.prefetch_related('questions').all()
        serializer = LessonQuizSerializer(quizzes, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request, lesson_id):
        lesson = self.get_lesson(request, lesson_id)
        if lesson is None:
            return Response({'error': 'Unauthorized to modify quizzes for this lesson.'}, status=status.HTTP_403_FORBIDDEN)

        payload = request.data.copy()
        if not payload.get('order'):
            payload['order'] = lesson.quizzes.count() + 1

        serializer = LessonQuizSerializer(data=payload)
        if serializer.is_valid():
            quiz = serializer.save(lesson=lesson)
            _normalize_quiz_orders(lesson)
            return Response(LessonQuizSerializer(quiz).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class TutorLessonQuizDetailView(APIView):
    permission_classes = [IsTutorAuthor]
    parser_classes = [JSONParser]

    def get_quiz(self, request, lesson_id, quiz_id):
        quiz = get_object_or_404(
            LessonQuiz.objects.select_related('lesson__chapter__course__tutor').prefetch_related('questions'),
            id=quiz_id,
            lesson_id=lesson_id,
        )
        if quiz.lesson.chapter.course.tutor_id != request.user.id:
            return None
        return quiz

    def patch(self, request, lesson_id, quiz_id):
        quiz = self.get_quiz(request, lesson_id, quiz_id)
        if quiz is None:
            return Response({'error': 'Unauthorized to modify this quiz.'}, status=status.HTTP_403_FORBIDDEN)

        serializer = LessonQuizSerializer(quiz, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            _normalize_quiz_orders(quiz.lesson)
            refreshed_quiz = LessonQuiz.objects.prefetch_related('questions').get(id=quiz.id)
            return Response(LessonQuizSerializer(refreshed_quiz).data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, lesson_id, quiz_id):
        quiz = self.get_quiz(request, lesson_id, quiz_id)
        if quiz is None:
            return Response({'error': 'Unauthorized to delete this quiz.'}, status=status.HTTP_403_FORBIDDEN)

        lesson = quiz.lesson
        quiz.delete()
        _normalize_quiz_orders(lesson)
        return Response(status=status.HTTP_204_NO_CONTENT)


class StudentLessonDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, course_id, lesson_id):
        enrollment = get_object_or_404(
            Enrollment.objects.select_related('course'),
            student=request.user,
            course_id=course_id,
        )
        lesson = get_object_or_404(
            Lesson.objects.select_related('chapter__course').prefetch_related('exercise_files', 'quizzes__questions'),
            id=lesson_id,
            chapter__course_id=course_id,
        )

        profile = LessonAuthoringProfile.objects.filter(lesson=lesson).first()
        if not _can_student_view_lesson(profile):
            return Response({'error': 'This lesson is not published yet.'}, status=status.HTTP_403_FORBIDDEN)

        sequential_unlocked, missing_previous_lesson_ids = _is_sequentially_unlocked(enrollment, lesson)
        credits_unlocked = enrollment.earned_credits >= lesson.required_credits_to_unlock
        drip_unlocked, drip_unlock_at = _is_drip_unlocked(enrollment, profile)
        is_unlocked = sequential_unlocked and credits_unlocked and drip_unlocked

        completion_exists = LessonCompletion.objects.filter(enrollment=enrollment, lesson=lesson).exists()

        quiz_status = _quiz_completion_requirement(enrollment, lesson, profile)
        quizzes_data = LearnerLessonQuizSerializer(quiz_status['published_quizzes'], many=True).data

        attempt_by_quiz = {
            attempt.quiz_id: attempt
            for attempt in LessonQuizAttempt.objects.filter(
                enrollment=enrollment,
                quiz__in=quiz_status['published_quizzes'],
            )
        }
        for quiz_data in quizzes_data:
            attempt = attempt_by_quiz.get(quiz_data['id'])
            quiz_data['attempt'] = LessonQuizAttemptSerializer(attempt).data if attempt else None

        requires_quiz_pass = quiz_status['require_quiz_pass']
        can_complete = is_unlocked and (quiz_status['all_passed'] or not requires_quiz_pass)

        data = {
            'id': lesson.id,
            'title': lesson.title,
            'description': profile.description if profile else '',
            'content': lesson.content,
            'duration_minutes': lesson.duration_minutes,
            'credits_awarded': lesson.credits_awarded,
            'required_credits_to_unlock': lesson.required_credits_to_unlock,
            'status': profile.status if profile else 'PUBLISHED',
            'publish_at': profile.publish_at if profile else None,
            'drip_delay_days': profile.drip_delay_days if profile else 0,
            'require_quiz_pass_for_completion': requires_quiz_pass,
            'lesson_link_url': profile.lesson_link_url if profile else '',
            'lesson_image_url': profile.lesson_image.url if profile and profile.lesson_image else None,
            'lesson_video_file_url': profile.lesson_video_file.url if profile and profile.lesson_video_file else None,
            'lesson_video_embed_url': profile.lesson_video_embed_url if profile else '',
            'exercise_files': LessonExerciseFileSerializer(lesson.exercise_files.all(), many=True).data,
            'quizzes': quizzes_data,
            'is_completed': completion_exists,
            'is_unlocked': is_unlocked,
            'sequential_unlocked': sequential_unlocked,
            'missing_previous_lesson_ids': missing_previous_lesson_ids,
            'credits_unlocked': credits_unlocked,
            'earned_credits': enrollment.earned_credits,
            'drip_unlocked': drip_unlocked,
            'drip_unlock_at': drip_unlock_at,
            'all_quizzes_passed': quiz_status['all_passed'],
            'missing_quiz_ids': quiz_status['missing_quiz_ids'],
            'can_complete': can_complete,
        }
        return Response(data, status=status.HTTP_200_OK)


class StudentLessonQuizSubmitView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, course_id, lesson_id, quiz_id):
        enrollment = get_object_or_404(
            Enrollment.objects.select_related('course'),
            student=request.user,
            course_id=course_id,
        )
        lesson = get_object_or_404(
            Lesson.objects.select_related('chapter__course'),
            id=lesson_id,
            chapter__course_id=course_id,
        )
        profile = LessonAuthoringProfile.objects.filter(lesson=lesson).first()

        if not _can_student_view_lesson(profile):
            return Response({'error': 'This lesson is not published yet.'}, status=status.HTTP_403_FORBIDDEN)

        sequential_unlocked, _ = _is_sequentially_unlocked(enrollment, lesson)
        credits_unlocked = enrollment.earned_credits >= lesson.required_credits_to_unlock
        drip_unlocked, _ = _is_drip_unlocked(enrollment, profile)

        if not (sequential_unlocked and credits_unlocked and drip_unlocked):
            return Response({'error': 'This lesson is still locked.'}, status=status.HTTP_403_FORBIDDEN)

        quiz = get_object_or_404(
            LessonQuiz.objects.prefetch_related('questions'),
            id=quiz_id,
            lesson=lesson,
            status='PUBLISHED',
        )

        submission_serializer = LessonQuizSubmissionSerializer(data=request.data)
        if not submission_serializer.is_valid():
            return Response(submission_serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        answers = submission_serializer.validated_data['answers']
        submitted_by_question = {item['question_id']: item['selected_option'] for item in answers}

        questions = list(quiz.questions.order_by('order', 'id'))
        if not questions:
            return Response({'error': 'Quiz has no questions yet.'}, status=status.HTTP_400_BAD_REQUEST)

        evaluated_answers = []
        correct_count = 0
        for question in questions:
            selected_option = submitted_by_question.get(question.id)
            is_correct = selected_option == question.correct_option
            if is_correct:
                correct_count += 1

            evaluated_answers.append(
                {
                    'question_id': question.id,
                    'selected_option': selected_option,
                    'correct_option': question.correct_option,
                    'is_correct': is_correct,
                }
            )

        score_percent = round((correct_count / len(questions)) * 100)
        passed = score_percent >= quiz.passing_score

        attempt, _ = LessonQuizAttempt.objects.update_or_create(
            enrollment=enrollment,
            quiz=quiz,
            defaults={
                'score_percent': score_percent,
                'passed': passed,
                'answers': evaluated_answers,
            },
        )

        return Response(
            {
                'message': 'Quiz submitted successfully.',
                'quiz_id': quiz.id,
                'score_percent': score_percent,
                'passing_score': quiz.passing_score,
                'passed': passed,
                'correct_answers': correct_count,
                'total_questions': len(questions),
                'attempt': LessonQuizAttemptSerializer(attempt).data,
            },
            status=status.HTTP_200_OK,
        )


class StudentLessonCompleteWithRulesView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, course_id, lesson_id):
        enrollment = get_object_or_404(
            Enrollment.objects.select_related('course'),
            student=request.user,
            course_id=course_id,
        )
        lesson = get_object_or_404(
            Lesson.objects.select_related('chapter__course'),
            id=lesson_id,
            chapter__course_id=course_id,
        )
        profile = LessonAuthoringProfile.objects.filter(lesson=lesson).first()

        if LessonCompletion.objects.filter(enrollment=enrollment, lesson=lesson).exists():
            return Response({'message': 'Lesson already completed.'}, status=status.HTTP_200_OK)

        if not _can_student_view_lesson(profile):
            return Response({'error': 'This lesson is not published yet.'}, status=status.HTTP_403_FORBIDDEN)

        sequential_unlocked, missing_previous_lesson_ids = _is_sequentially_unlocked(enrollment, lesson)
        if not sequential_unlocked:
            return Response(
                {
                    'error': 'Previous lessons must be completed first.',
                    'missing_previous_lesson_ids': missing_previous_lesson_ids,
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        if enrollment.earned_credits < lesson.required_credits_to_unlock:
            return Response(
                {
                    'error': 'Lesson is still locked by credit requirement.',
                    'required_credits_to_unlock': lesson.required_credits_to_unlock,
                    'earned_credits': enrollment.earned_credits,
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        drip_unlocked, drip_unlock_at = _is_drip_unlocked(enrollment, profile)
        if not drip_unlocked:
            return Response(
                {
                    'error': 'Lesson is locked by drip schedule.',
                    'drip_unlock_at': drip_unlock_at,
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        quiz_status = _quiz_completion_requirement(enrollment, lesson, profile)
        if quiz_status['require_quiz_pass'] and not quiz_status['all_passed']:
            return Response(
                {
                    'error': 'Quiz pass is required before completing this lesson.',
                    'missing_quiz_ids': quiz_status['missing_quiz_ids'],
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        with transaction.atomic():
            LessonCompletion.objects.create(
                enrollment=enrollment,
                lesson=lesson,
                credits_awarded=lesson.credits_awarded,
            )

            enrollment.earned_credits += lesson.credits_awarded
            total_lessons = Lesson.objects.filter(chapter__course=enrollment.course).count()
            completed_count = LessonCompletion.objects.filter(enrollment=enrollment).count()
            enrollment.progress_percent = round((completed_count / total_lessons) * 100) if total_lessons else 0

            if enrollment.progress_percent >= 100:
                enrollment.status = 'completed'
                enrollment.completed_at = timezone.now()

            enrollment.save()

        return Response(
            {
                'message': 'Lesson marked as completed.',
                'earned_credits': enrollment.earned_credits,
                'progress': enrollment.progress_percent,
                'status': enrollment.status,
            },
            status=status.HTTP_200_OK,
        )
# --- 7. Q&A WALL LOGIC ---

class WallQuestionViewSet(viewsets.ModelViewSet):
    """
    Handles the community Q&A wall. 
    Students can ask, and everyone can view.
    """
    queryset = WallQuestion.objects.all().order_by('-created_at')
    serializer_class = WallQuestionSerializer
    permission_classes = [permissions.IsAuthenticated] 

    def perform_create(self, serializer):
        # Automatically sets the author to the student currently logged in
        serializer.save(author=self.request.user)

    def destroy(self, request, *args, **kwargs):
        """
        Ensures only the person who asked the question OR an Admin can delete it.
        """
        question = self.get_object()
        
        # Security check: Allow if user is the author OR if user is staff (Admin)
        if question.author != request.user and not request.user.is_staff:
            return Response(
                {"detail": "You do not have permission to delete this question."}, 
                status=status.HTTP_403_FORBIDDEN
            )
            
        return super().destroy(request, *args, **kwargs)

    @action(detail=True, methods=['post'])
    def upvote(self, request, pk=None):
        """
        Toggles the upvote for the current user.
        URL: /api/wall-questions/{id}/upvote/
        """
        question = self.get_object()
        user = request.user

        # Toggle Logic
        if question.upvoted_by.filter(id=user.id).exists():
            question.upvoted_by.remove(user)
            is_upvoted = False
        else:
            question.upvoted_by.add(user)
            is_upvoted = True
        
        return Response({
            'current_votes': question.upvoted_by.count(),
            'is_upvoted': is_upvoted
        })

class WallAnswerViewSet(viewsets.ModelViewSet):
    """
    Handles responses to questions. 
    Checks user role to flag 'Expert' answers.
    """
    queryset = WallAnswer.objects.all()
    serializer_class = WallAnswerSerializer
    
    # Change: Require the user to be logged in to post an answer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        user = self.request.user
        
        # Logic: If user is a TUTOR, ADMIN, or STUDENT_TUTOR, mark as expert
        # This handles the "Expert Badge" logic for the frontend
        is_expert = user.role in ['TUTOR', 'ADMIN', 'STUDENT_TUTOR']
        
        serializer.save(author=user, is_expert_answer=is_expert)


from .permissions import IsAdminUser
from .models import Course
class AdminDashboardStatsView(APIView):
    permission_classes = [IsAdminUser] # Only Admins can see this

    def get(self, request):
        stats = {
            "totalUsers": User.objects.count(),
            "pendingRequests": StudentTutorProfile.objects.filter(status='PENDING').count(),
            "approvedTutors": User.objects.filter(role__in=['TUTOR', 'STUDENT_TUTOR'], is_verified=True).count(),
            "activeStudents": User.objects.filter(role='STUDENT').count(),
            "pendingCourseApprovals": Course.objects.filter(approval_status='PENDING').count(),
        }
        return Response(stats)
  
  
  
    # 1. GET ALL USERS
class AdminUserListView(generics.ListAPIView):
    queryset = User.objects.all().order_by('-date_joined')
    serializer_class = RegisterSerializer # Use your existing reg serializer
    permission_classes = [IsAdminUser]

# 2. GET PENDING TUTOR REQUESTS
class AdminTutorRequestListView(generics.ListAPIView):
    queryset = StudentTutorProfile.objects.filter(status='PENDING')
    serializer_class = StudentTutorApplicationSerializer
    permission_classes = [IsAdminUser]

# 3. APPROVE/REJECT TUTOR ACTION
@api_view(['POST'])
@permission_classes([IsAdminUser])
def approve_tutor(request, profile_id):
    profile = get_object_or_404(StudentTutorProfile, id=profile_id)
    action = request.data.get('action') # 'APPROVE' or 'REJECT'
    
    if action == 'APPROVE':
        profile.status = 'APPROVED'
        profile.user.role = 'TUTOR' # Ensure role is updated
        profile.user.is_verified = True
        profile.user.onboarding_status = 'REGISTERED'
        profile.user.save()
    else:
        profile.status = 'REJECTED'
        
    profile.save()
    return Response({"message": f"Tutor {action}ed successfully"})

# --- PROFILE VIEW FOR QA WALL ---
class UserProfileView(APIView):
    """
    This view takes the user's token and returns their actual name.
    This is what replaces 'Loading...' with your real name in the navbar.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # We send back the full_name, or the username if full_name is empty
        return Response({
            "full_name": request.user.full_name or request.user.username,
            "username": request.user.username,
        })

class NotificationViewSet(viewsets.ModelViewSet):
    """
    Allows Tutors to see and manage their expertise-based alerts.
    """
    serializer_class = NotificationSerializer # We will create this next
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Only show notifications belonging to the logged-in user
        return Notification.objects.filter(recipient=self.request.user).order_by('-created_at')

    @action(detail=True, methods=['post'])
    def mark_as_read(self, request, pk=None):
        notification = self.get_object()
        notification.is_read = True
        notification.save()
        return Response({'status': 'notification marked as read'})