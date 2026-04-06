import random
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.core.mail import send_mail
from .models import User, OTP, Interest, Question, TestResult
from .serializers import RegisterSerializer, QuestionSerializer

class RegisterView(APIView):
    permission_classes = [AllowAny] # Anyone can register

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            # Generate OTP
            otp_code = str(random.randint(100000, 999999))
            OTP.objects.update_or_create(user=user, defaults={'code': otp_code})
            
            # Send Email (In settings.py, use console backend for testing)
            send_mail(
                'Your Verification Code',
                f'Your OTP is {otp_code}',
                'noreply@university.edu',
                [user.email],
                fail_silently=False,
            )
            return Response({"message": "User registered. OTP sent to email."}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

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
                otp.delete() # Clean up OTP after use
                return Response({"message": "Account verified successfully."}, status=status.HTTP_200_OK)
            
            return Response({"error": "OTP has expired."}, status=status.HTTP_400_BAD_REQUEST)
            
        except User.DoesNotExist:
            return Response({"error": "User with this email does not exist."}, status=status.HTTP_404_NOT_FOUND)
        except OTP.DoesNotExist:
            return Response({"error": "Invalid verification code."}, status=status.HTTP_400_BAD_REQUEST)

class SubmitInterestsView(APIView):
    permission_classes = [IsAuthenticated] # Ensures request.user is valid

    def post(self, request):
        user = request.user
        
        # Check if verified
        if not user.is_verified:
            return Response({"error": "Please verify your email first."}, status=status.HTTP_403_FORBIDDEN)
        
        interest_names = request.data.get('interests', [])
        if not interest_names:
            return Response({"error": "Please select at least one interest."}, status=status.HTTP_400_BAD_REQUEST)

        # Clear old interests if they are re-submitting
        user.interests.clear()
        
        for name in interest_names:
            interest, _ = Interest.objects.get_or_create(name=name)
            interest.students.add(user)
        
        user.onboarding_status = 'INTERESTS_SELECTED'
        user.save()
        return Response({"message": "Interests updated successfully."}, status=status.HTTP_200_OK)

class PlacementTestView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        # Strict flow control
        if user.onboarding_status not in ['INTERESTS_SELECTED', 'COMPLETED']:
            return Response(
                {"error": "Finish selecting interests before taking the test."}, 
                status=status.HTTP_403_FORBIDDEN
            )

        # Get 15 random questions
        questions = Question.objects.all().order_by('?')[:15]
        serializer = QuestionSerializer(questions, many=True)
        return Response(serializer.data)

    def post(self, request):
        user = request.user
        
        if user.onboarding_status == 'REGISTERED':
             return Response({"error": "Verify email and select interests first."}, status=status.HTTP_403_FORBIDDEN)

        answers = request.data.get('answers', [])
        if not answers:
            return Response({"error": "No answers provided."}, status=status.HTTP_400_BAD_REQUEST)

        score = 0
        for ans in answers:
            try:
                question = Question.objects.get(id=ans.get('id'))
                if str(question.correct_option).upper() == str(ans.get('choice')).upper():
                    score += 1
            except (Question.DoesNotExist, ValueError):
                continue

        # Proficiency Level Logic
        total = len(answers)
        percentage = (score / total) * 100 if total > 0 else 0
        
        if percentage < 35:
            level = "Beginner"
        elif percentage < 75:
            level = "Intermediate"
        else:
            level = "Advanced"

        TestResult.objects.create(student=user, score=score, proficiency_level=level)
        
        user.onboarding_status = 'COMPLETED'
        user.save()

        return Response({
            "score": score,
            "proficiency_level": level,
            "status": "Onboarding Complete"
        }, status=status.HTTP_200_OK)