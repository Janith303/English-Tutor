import random
from django.utils import timezone
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework_simplejwt.tokens import RefreshToken
from django.core.mail import send_mail

# Make sure to import the new models and serializers
from .models import User, OTP, Interest, Question, TestResult, StudentTutorProfile
from .serializers import (
    RegisterSerializer, 
    QuestionSerializer, 
    InterestSerializer,
    IdentityVerificationSerializer, 
    StudentTutorApplicationSerializer
)
from .permissions import IsApprovedTutor


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


class TutorDashboardView(APIView):
    """Protected endpoint for approved tutors only"""
    permission_classes = [IsApprovedTutor]

    def get(self, request):
        return Response({"message": "Welcome to the Tutor Dashboard! You have access to this because your application was approved."})