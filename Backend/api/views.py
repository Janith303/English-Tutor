import random
import json
from django.utils import timezone
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework_simplejwt.tokens import RefreshToken
from django.core.mail import send_mail
from django.db import transaction # Added for atomic transactions

# Make sure to import the new models and serializers
from .models import User, OTP, Interest, Question, TestResult, StudentTutorProfile, TutorOTP
from .serializers import (
    RegisterSerializer, 
    QuestionSerializer, 
    InterestSerializer,
    IdentityVerificationSerializer, 
    StudentTutorApplicationSerializer
)
from .permissions import IsApprovedTutor

# --- ADDED THIS IMPORT TO FIX THE NameError ---
from rest_framework.decorators import api_view, permission_classes


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
                'SpeakUni Verification Code',
                f'Hello {user.full_name}, your verification code is: {otp_code}',
                'noreply@speakuni.edu',
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
        questions = Question.objects.all().order_by('?')[:15]
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


class CreateQuestionView(APIView):
    permission_classes = [IsAuthenticated] 

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
            serializer.save(user=request.user, status='PENDING')
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
            'SpeakUni Tutor Verification',
            f'Your code: {otp_code}',
            'noreply@speakuni.edu',
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
        return Response({"message": "Welcome to the Tutor Dashboard! You have access to this because your application was approved."})


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


def _parse_optional_bool(raw_value):
    if isinstance(raw_value, bool):
        return raw_value

    if isinstance(raw_value, str):
        normalized = raw_value.strip().lower()
        if normalized in ['true', '1', 'yes', 'on']:
            return True
        if normalized in ['false', '0', 'no', 'off']:
            return False
        return None

    if isinstance(raw_value, (int, float)):
        return bool(raw_value)

    return None


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

        if 'public_marketplace' in request.data:
            parsed = _parse_optional_bool(request.data.get('public_marketplace'))
            if parsed is None:
                return Response({'error': 'public_marketplace must be a boolean value.'}, status=status.HTTP_400_BAD_REQUEST)
            course.public_marketplace = parsed
        if 'search_indexing' in request.data:
            parsed = _parse_optional_bool(request.data.get('search_indexing'))
            if parsed is None:
                return Response({'error': 'search_indexing must be a boolean value.'}, status=status.HTTP_400_BAD_REQUEST)
            course.search_indexing = parsed
        if 'auto_enroll_existing_students' in request.data:
            parsed = _parse_optional_bool(request.data.get('auto_enroll_existing_students'))
            if parsed is None:
                return Response({'error': 'auto_enroll_existing_students must be a boolean value.'}, status=status.HTTP_400_BAD_REQUEST)
            course.auto_enroll_existing_students = parsed

        course.save()
        return Response(
            {
                'message': 'Publishing settings updated successfully.',
                'status': course.status,
                'public_marketplace': course.public_marketplace,
                'search_indexing': course.search_indexing,
                'auto_enroll_existing_students': course.auto_enroll_existing_students,
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
            public_marketplace=True,
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
)


class QuizListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        quizzes = Quiz.objects.filter(is_active=True).select_related('created_by')
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
        quizzes = Quiz.objects.filter(category=category.upper(), is_active=True).select_related('created_by')
        serializer = QuizListSerializer(quizzes, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class QuizDailyView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        try:
            daily_quiz = Quiz.objects.filter(is_daily_quiz=True, is_active=True).latest('created_at')
        except Quiz.DoesNotExist:
            return Response({'error': 'Daily quiz not found.'}, status=status.HTTP_404_NOT_FOUND)

        serializer = QuizDetailSerializer(daily_quiz)
        return Response(serializer.data, status=status.HTTP_200_OK)


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
        quiz.delete()
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
