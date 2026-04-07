from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from . import views

# Cleaned up and merged all imports into one block
from .views import (
    RegisterView, 
    VerifyOTPView, 
    InterestListView,
    SubmitInterestsView, 
    PlacementTestView, 
    CreateQuestionView,
    IdentityVerificationView,      # New: Step 1 of Tutor Application
    SubmitApplicationView,         # New: Step 2 of Tutor Application
    ReviewApplicationView,         # New: Admin Approval
    TutorDashboardView,             # New: Example Protected Route
    TutorRegisterView,             # New: Final Tutor Registration after OTP
)

urlpatterns = [
    # --- Identity & Auth ---
    path('register/', RegisterView.as_view(), name='register'),
    path('verify-otp/', VerifyOTPView.as_view(), name='verify_otp'),
    path('login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'), 
    
    # --- Onboarding Flow ---
    path('interests/list/', InterestListView.as_view(), name='list_interests'), # To GET interests
    path('interests/', SubmitInterestsView.as_view(), name='submit_interests'), # To POST selected interests
    path('placement-test/', PlacementTestView.as_view(), name='placement_test'),
    path('create-questions/', CreateQuestionView.as_view(), name='create-questions'),
    
    # --- Tutor Application Flow ---
    path('tutor/verify-identity/', IdentityVerificationView.as_view(), name='verify-identity'),
    path('tutor/application/', SubmitApplicationView.as_view(), name='tutor-application'),
    path('tutor/application/review/<int:profile_id>/', ReviewApplicationView.as_view(), name='review-tutor-application'),

    path('tutor/send-otp/', views.send_tutor_otp, name='tutor_send_otp'),
    path('tutor/verify-otp/', views.verify_tutor_otp, name='tutor_verify_otp'),
    path('tutor/register/', TutorRegisterView.as_view(), name='tutor_register'),
    # --- Tutor Protected Endpoint ---
    path('tutor/dashboard/', TutorDashboardView.as_view(), name='tutor-dashboard'),
]