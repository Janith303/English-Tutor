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
	LessonAuthoringProfile,
	LessonExerciseFile,
	LessonQuiz,
	LessonQuizQuestion,
	LessonQuizAttempt,
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
admin.site.register(LessonAuthoringProfile)
admin.site.register(LessonExerciseFile)
admin.site.register(LessonQuiz)
admin.site.register(LessonQuizQuestion)
admin.site.register(LessonQuizAttempt)