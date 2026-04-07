from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import (
    RegisterView, 
    VerifyOTPView, 
    SubmitInterestsView, 
    PlacementTestView
)
from .views import RegisterView, VerifyOTPView, InterestListView, SubmitInterestsView, PlacementTestView, CreateQuestionView

urlpatterns = [
    # Identity & Auth
    path('register/', RegisterView.as_view(), name='register'),
    path('verify-otp/', VerifyOTPView.as_view(), name='verify_otp'),
    path('login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'), 
    
    # Onboarding Flow
    path('interests/', SubmitInterestsView.as_view(), name='submit_interests'),
    path('placement-test/', PlacementTestView.as_view(), name='placement_test'),
    path('create-questions/', CreateQuestionView.as_view(), name='create-questions'),
]