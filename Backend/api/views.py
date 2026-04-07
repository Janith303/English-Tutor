import random
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from django.core.mail import send_mail
from .models import User, OTP, Interest, Question, TestResult
from .serializers import RegisterSerializer, QuestionSerializer, InterestSerializer

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
    """
    Used by the frontend to fetch the list of interests to display
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        interests = Interest.objects.all()
        serializer = InterestSerializer(interests, many=True)
        return Response(serializer.data)

class SubmitInterestsView(APIView):
    """
    Used to save selected interests and the target goal level
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        interest_ids = request.data.get('interests', [])
        target_level = request.data.get('target_level')

        if not interest_ids or not target_level:
            return Response({"error": "Interests and target level are required."}, status=status.HTTP_400_BAD_REQUEST)

        # 1. Update Target Proficiency
        user.target_proficiency = target_level
        
        # 2. Update Interests
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
        # Fetch 15 random questions across all categories
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
                # Handle case-insensitive comparison
                if str(q.correct_option).strip().upper() == str(ans.get('choice')).strip().upper():
                    score += 1
            except Question.DoesNotExist:
                continue

        # Logic for Level Calculation
        total = len(answers)
        percent = (score / total) * 100 if total > 0 else 0
        
        if percent < 40: level = "Beginner"
        elif percent < 75: level = "Intermediate"
        else: level = "Advanced"

        # Save result for history
        TestResult.objects.create(student=user, score=score, proficiency_level=level)
        
        user.onboarding_status = 'COMPLETED'
        user.save()

        return Response({
            "score": score,
            "level": level,
            "onboarding_status": user.onboarding_status,
            "status": "Onboarding Complete"
        }, status=status.HTTP_200_OK)
        
# Add this to api/views.py
class CreateQuestionView(APIView):
    # Usually, only Admins should be allowed to add questions
    permission_classes = [IsAuthenticated] 

    def post(self, request):
        # We check if the input is a list (for bulk upload) or a single object
        is_many = isinstance(request.data, list)
        
        # Use your existing QuestionSerializer
        serializer = QuestionSerializer(data=request.data, many=is_many)
        
        if serializer.is_valid():
            serializer.save()
            return Response({
                "message": f"Successfully added {len(serializer.data) if is_many else 1} question(s).",
                "data": serializer.data
            }, status=status.HTTP_201_CREATED)
            
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)