from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from . import views

# Cleaned up and merged all imports into one block
from .views import (
    RegisterView, 
    VerifyOTPView, 
    InterestListView,
    SubmitInterestsView, 
    StudentProfileView, 
    PlacementTestView, 
    CreateQuestionView,
    IdentityVerificationView,      # New: Step 1 of Tutor Application
    SubmitApplicationView,         # New: Step 2 of Tutor Application
    ReviewApplicationView,         # New: Admin Approval
    TutorDashboardView,             # New: Example Protected Route
    TutorRegisterView,             # New: Final Tutor Registration after OTP
    WallQuestionViewSet,
    WallAnswerViewSet,
    QuestionDetailView,
    UserProfileView,               # ADDED: For dynamic profile name
    NotificationViewSet,           # ADDED: Step 5 for Intelligent Routing
)

from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register(r'wall-questions', WallQuestionViewSet)
router.register(r'wall-answers', WallAnswerViewSet)
router.register(r'notifications', NotificationViewSet, basename='notifications') # ADDED: Step 5

urlpatterns = [
    # --- Router URLs (The missing piece of Step 4) ---
    path('', include(router.urls)),
    
    # --- Identity & Auth ---
    path('register/', RegisterView.as_view(), name='register'),
    path('verify-otp/', VerifyOTPView.as_view(), name='verify_otp'),
    path('login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'), 
    path('user/profile/', UserProfileView.as_view(), name='user-profile'), # ADDED: This fixes the 404
    
    # --- Onboarding Flow ---
    path('interests/list/', InterestListView.as_view(), name='list_interests'), # To GET interests
    path('interests/', SubmitInterestsView.as_view(), name='submit_interests'), # To POST selected interests
    path('students/profile/', StudentProfileView.as_view(), name='student-profile'),
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
    
    path('admin/stats/', views.AdminDashboardStatsView.as_view(), name='admin-stats'),
    # List of all users (Students, Tutors, etc.)
    path('admin/users/', views.AdminUserListView.as_view(), name='admin-user-list'),
    
    # List of pending tutor applications
    path('admin/requests/', views.AdminTutorRequestListView.as_view(), name='admin-tutor-requests'),
    
    # Action endpoint to Approve or Reject a Tutor
    path('admin/approve-tutor/<int:profile_id>/', views.approve_tutor, name='admin-approve-tutor'),
    
    path('placement-test/', PlacementTestView.as_view(), name='placement_test'),
    
    # Endpoint for GET (list all) and POST (create new)
    path('create-questions/', CreateQuestionView.as_view(), name='create-questions'),
    
    # NEW: Endpoint for PUT (edit) and DELETE specific questions by ID
    path('create-questions/<int:pk>/', views.QuestionDetailView.as_view(), name='question-detail'),
]


from . import views as course_views

urlpatterns += [
    # --- Tutor Course Authoring ---
    path('tutor/courses/', course_views.TutorCourseListCreateView.as_view(), name='tutor-courses'),
    path('tutor/courses/<int:course_id>/', course_views.TutorCourseDetailView.as_view(), name='tutor-course-detail'),
    path('tutor/courses/<int:course_id>/publish/', course_views.TutorCoursePublishView.as_view(), name='tutor-course-publish'),
    path('tutor/courses/<int:course_id>/chapters/', course_views.TutorChapterListCreateView.as_view(), name='tutor-course-chapters'),
    path('tutor/courses/<int:course_id>/chapters/reorder/', course_views.TutorChapterReorderView.as_view(), name='tutor-course-chapters-reorder'),
    path('tutor/courses/<int:course_id>/chapters/<int:chapter_id>/', course_views.TutorChapterDetailView.as_view(), name='tutor-course-chapter-detail'),
    path('tutor/chapters/<int:chapter_id>/lessons/', course_views.TutorLessonListCreateView.as_view(), name='tutor-chapter-lessons'),
    path('tutor/chapters/<int:chapter_id>/lessons/reorder/', course_views.TutorLessonReorderView.as_view(), name='tutor-chapter-lessons-reorder'),
    path('tutor/chapters/<int:chapter_id>/lessons/<int:lesson_id>/', course_views.TutorLessonDetailView.as_view(), name='tutor-chapter-lesson-detail'),

    # --- Learner Course Access ---
    path('courses/', course_views.PublishedCourseListView.as_view(), name='published-courses'),
    path('courses/<int:course_id>/', course_views.CourseDetailView.as_view(), name='course-detail'),
    path('students/enrollments/', course_views.StudentEnrollmentListCreateView.as_view(), name='student-enrollments'),
    path('students/courses/<int:course_id>/lessons/<int:lesson_id>/complete/', course_views.StudentLessonCompleteView.as_view(), name='student-lesson-complete'),
    path('students/courses/<int:course_id>/progress/', course_views.StudentCourseProgressView.as_view(), name='student-course-progress'),

    # --- Quiz Endpoints ---
    path('quizzes/', course_views.QuizListView.as_view(), name='quiz-list'),
    path('quizzes/category/<str:category>/', course_views.QuizCategoryListView.as_view(), name='quiz-category-list'),
    path('quizzes/daily/', course_views.QuizDailyView.as_view(), name='quiz-daily'),
    path('quizzes/create/', course_views.QuizCreateView.as_view(), name='quiz-create'),
    path('quizzes/<int:quiz_id>/', course_views.QuizDetailView.as_view(), name='quiz-detail'),
    path('quizzes/<int:quiz_id>/play/', course_views.QuizForPlayView.as_view(), name='quiz-play'),
    path('quizzes/<int:quiz_id>/submit/', course_views.QuizSubmitView.as_view(), name='quiz-submit'),
    path('quizzes/<int:quiz_id>/edit/', course_views.QuizUpdateDeleteView.as_view(), name='quiz-update'),
    path('attempts/', course_views.QuizAttemptListView.as_view(), name='quiz-attempts'),
    path('attempts/<int:attempt_id>/', course_views.QuizAttemptDetailView.as_view(), name='quiz-attempt-detail'),
    path('tutor/quizzes/', course_views.TutorQuizListView.as_view(), name='tutor-quiz-list'),
    # --- Tutor Lesson Authoring ---
    path('tutor/chapters/<int:chapter_id>/lessons/<int:lesson_id>/authoring/', course_views.TutorLessonAuthoringDetailView.as_view(), name='tutor-lesson-authoring-detail'),
    path('tutor/lessons/<int:lesson_id>/files/', course_views.TutorLessonExerciseFileListCreateView.as_view(), name='tutor-lesson-files'),
    path('tutor/lessons/<int:lesson_id>/files/<int:file_id>/', course_views.TutorLessonExerciseFileDetailView.as_view(), name='tutor-lesson-file-detail'),
    path('tutor/lessons/<int:lesson_id>/quizzes/', course_views.TutorLessonQuizListCreateView.as_view(), name='tutor-lesson-quizzes'),
    path('tutor/lessons/<int:lesson_id>/quizzes/<int:quiz_id>/', course_views.TutorLessonQuizDetailView.as_view(), name='tutor-lesson-quiz-detail'),

    # --- Admin Question Bank Approval ---
    path('admin/questions/pending/', course_views.AdminPendingQuestionsView.as_view(), name='admin-pending-questions'),
    path('admin/questions/<int:question_id>/approve/', course_views.AdminQuestionApproveView.as_view(), name='admin-approve-question'),
    path('admin/questions/<int:question_id>/reject/', course_views.AdminQuestionRejectView.as_view(), name='admin-reject-question'),

    # --- Admin Course Content Approval ---
    path('admin/courses/pending/', course_views.AdminCourseApprovalListView.as_view(), name='admin-pending-courses'),
    path('admin/courses/<int:course_id>/approve/', course_views.AdminCourseApproveView.as_view(), name='admin-approve-course'),
    path('admin/courses/<int:course_id>/reject/', course_views.AdminCourseRejectView.as_view(), name='admin-reject-course'),

    # --- Learner Lesson Reader + Quiz ---
    path('students/courses/<int:course_id>/lessons/<int:lesson_id>/', course_views.StudentLessonDetailView.as_view(), name='student-lesson-detail'),
    path('students/courses/<int:course_id>/lessons/<int:lesson_id>/quizzes/<int:quiz_id>/submit/', course_views.StudentLessonQuizSubmitView.as_view(), name='student-lesson-quiz-submit'),
    path('students/courses/<int:course_id>/lessons/<int:lesson_id>/complete-checked/', course_views.StudentLessonCompleteWithRulesView.as_view(), name='student-lesson-complete-checked'),
    
    path('password-reset/request/', views.RequestPasswordResetView.as_view(), name='password-reset-request'),
    path('password-reset/confirm/', views.ResetPasswordConfirmView.as_view(), name='password-reset-confirm'),
]