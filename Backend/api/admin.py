from django.contrib import admin
from .models import (
	User,
	Question,
	OTP,
	Interest,
	TestResult,
	StudentTutorProfile,
	Course,
	Chapter,
	Lesson,
	Enrollment,
	LessonCompletion,
	TutorOTP,
	Quiz,
	QuizQuestion,
	QuizOption,
	QuizAttempt,
	QuizAnswer,
)

admin.site.register(User)
admin.site.register(Question)
admin.site.register(OTP)
admin.site.register(Interest)
admin.site.register(TestResult)
admin.site.register(StudentTutorProfile)
admin.site.register(Course)
admin.site.register(Chapter)
admin.site.register(Lesson)
admin.site.register(Enrollment)
admin.site.register(LessonCompletion)
admin.site.register(TutorOTP)


class QuizOptionInline(admin.TabularInline):
    model = QuizOption
    extra = 1
    max_num = 6


class QuizQuestionInline(admin.TabularInline):
    model = QuizQuestion
    extra = 1
    inlines = [QuizOptionInline]


@admin.register(Quiz)
class QuizAdmin(admin.ModelAdmin):
    list_display = ['title', 'category', 'difficulty', 'time_limit', 'passing_score', 'is_daily_quiz', 'is_active', 'created_at']
    list_filter = ['category', 'difficulty', 'is_daily_quiz', 'is_active']
    search_fields = ['title', 'description']
    inlines = [QuizQuestionInline]
    readonly_fields = ['created_at', 'updated_at']


@admin.register(QuizQuestion)
class QuizQuestionAdmin(admin.ModelAdmin):
    list_display = ['id', 'quiz', 'question_text', 'marks', 'order']
    list_filter = ['quiz', 'question_type']
    search_fields = ['question_text']
    inlines = [QuizOptionInline]


@admin.register(QuizOption)
class QuizOptionAdmin(admin.ModelAdmin):
    list_display = ['id', 'question', 'option_text', 'is_correct']
    list_filter = ['is_correct']


@admin.register(QuizAttempt)
class QuizAttemptAdmin(admin.ModelAdmin):
    list_display = ['id', 'quiz', 'student', 'student_name', 'correct_answers', 'total_questions', 'percentage', 'passed', 'submitted_at']
    list_filter = ['quiz', 'passed', 'submitted_at']
    search_fields = ['student_name', 'student__email']
    readonly_fields = ['submitted_at']


@admin.register(QuizAnswer)
class QuizAnswerAdmin(admin.ModelAdmin):
    list_display = ['id', 'attempt', 'question', 'selected_option', 'is_correct']
    list_filter = ['is_correct']