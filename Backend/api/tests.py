from decimal import Decimal

from django.urls import reverse
from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

from .models import (
	User,
	Course,
	Chapter,
	Lesson,
	Enrollment,
	Interest,
	TestResult,
	LessonAuthoringProfile,
	LessonQuiz,
	LessonQuizQuestion,
)


def auth_headers_for(user):
	token = RefreshToken.for_user(user).access_token
	return {'HTTP_AUTHORIZATION': f'Bearer {token}'}


class CourseCrudApiTests(TestCase):
	def setUp(self):
		self.client = APIClient()
		self.tutor = User.objects.create_user(
			username='tutor@example.com',
			email='tutor@example.com',
			password='Test@1234',
			role='STUDENT_TUTOR',
		)
		self.other_tutor = User.objects.create_user(
			username='other@example.com',
			email='other@example.com',
			password='Test@1234',
			role='STUDENT_TUTOR',
		)
		self.student = User.objects.create_user(
			username='student@example.com',
			email='student@example.com',
			password='Test@1234',
			role='STUDENT',
		)

	def _create_published_course(self, tutor=None):
		tutor = tutor or self.tutor
		course = Course.objects.create(
			tutor=tutor,
			title='Academic Writing Bootcamp',
			summary='A practical writing course for university students.',
			category='academic-writing',
			level='beginner',
			duration_hours=Decimal('20.0'),
			price=Decimal('0.00'),
			status='PUBLISHED',
		)
		return course

	def test_tutor_can_create_course(self):
		payload = {
			'title': 'Presentation Mastery',
			'summary': 'Learn how to present clearly and confidently.',
			'category': 'presentation-skills',
			'level': 'intermediate',
			'duration_hours': '24.0',
			'price': '1000.00',
			'status': 'DRAFT',
		}
		response = self.client.post(
			reverse('tutor-courses'),
			payload,
			format='json',
			**auth_headers_for(self.tutor),
		)

		self.assertEqual(response.status_code, status.HTTP_201_CREATED)
		self.assertEqual(Course.objects.count(), 1)
		self.assertEqual(Course.objects.first().tutor, self.tutor)

	def test_student_cannot_create_course(self):
		payload = {
			'title': 'Not allowed course',
			'summary': 'Summary with valid length.',
			'category': 'grammar',
			'level': 'beginner',
			'duration_hours': '10.0',
			'price': '0.00',
			'status': 'DRAFT',
		}
		response = self.client.post(
			reverse('tutor-courses'),
			payload,
			format='json',
			**auth_headers_for(self.student),
		)
		self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

	def test_non_owner_tutor_cannot_update_course(self):
		course = self._create_published_course(tutor=self.tutor)

		response = self.client.patch(
			reverse('tutor-course-detail', kwargs={'course_id': course.id}),
			{'title': 'Changed Title'},
			format='json',
			**auth_headers_for(self.other_tutor),
		)

		self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

	def test_student_can_enroll_once_only(self):
		course = self._create_published_course()

		first = self.client.post(
			reverse('student-enrollments'),
			{'course_id': course.id},
			format='json',
			**auth_headers_for(self.student),
		)
		second = self.client.post(
			reverse('student-enrollments'),
			{'course_id': course.id},
			format='json',
			**auth_headers_for(self.student),
		)

		self.assertEqual(first.status_code, status.HTTP_201_CREATED)
		self.assertEqual(second.status_code, status.HTTP_400_BAD_REQUEST)
		self.assertEqual(Enrollment.objects.filter(student=self.student, course=course).count(), 1)

	def test_locked_lesson_completion_is_blocked(self):
		course = self._create_published_course()
		chapter = Chapter.objects.create(course=course, title='Chapter 1', order=1)
		lesson = Lesson.objects.create(
			chapter=chapter,
			title='Locked Lesson',
			order=1,
			duration_minutes=20,
			credits_awarded=10,
			required_credits_to_unlock=50,
		)
		Enrollment.objects.create(student=self.student, course=course)

		response = self.client.post(
			reverse('student-lesson-complete', kwargs={'course_id': course.id, 'lesson_id': lesson.id}),
			{},
			format='json',
			**auth_headers_for(self.student),
		)

		self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

	def test_completing_unlocked_lesson_updates_progress(self):
		course = self._create_published_course()
		chapter = Chapter.objects.create(course=course, title='Chapter 1', order=1)
		lesson = Lesson.objects.create(
			chapter=chapter,
			title='Unlocked Lesson',
			order=1,
			duration_minutes=15,
			credits_awarded=20,
			required_credits_to_unlock=0,
		)
		Enrollment.objects.create(student=self.student, course=course)

		complete = self.client.post(
			reverse('student-lesson-complete', kwargs={'course_id': course.id, 'lesson_id': lesson.id}),
			{},
			format='json',
			**auth_headers_for(self.student),
		)
		progress = self.client.get(
			reverse('student-course-progress', kwargs={'course_id': course.id}),
			**auth_headers_for(self.student),
		)

		self.assertEqual(complete.status_code, status.HTTP_200_OK)
		self.assertEqual(progress.status_code, status.HTTP_200_OK)
		self.assertEqual(progress.data['progress'], 100)
		self.assertEqual(progress.data['status'], 'completed')

	def test_student_profile_returns_selected_area_and_latest_level(self):
		self.student.target_proficiency = 'INTERMEDIATE'
		self.student.save(update_fields=['target_proficiency'])

		interest = Interest.objects.create(name='Academic Writing')
		interest.students.add(self.student)

		TestResult.objects.create(student=self.student, score=4, proficiency_level='Beginner')
		TestResult.objects.create(student=self.student, score=12, proficiency_level='Advanced')

		response = self.client.get(
			reverse('student-profile'),
			**auth_headers_for(self.student),
		)

		self.assertEqual(response.status_code, status.HTTP_200_OK)
		self.assertEqual(response.data['selected_area'], 'Academic Writing')
		self.assertEqual(response.data['level'], 'Advanced')
		self.assertEqual(response.data['target_level'], 'Intermediate')


class LessonAuthoringWorkflowApiTests(TestCase):
	def setUp(self):
		self.client = APIClient()
		self.tutor = User.objects.create_user(
			username='author-tutor@example.com',
			email='author-tutor@example.com',
			password='Test@1234',
			role='STUDENT_TUTOR',
		)
		self.student = User.objects.create_user(
			username='author-student@example.com',
			email='author-student@example.com',
			password='Test@1234',
			role='STUDENT',
		)

		self.course = Course.objects.create(
			tutor=self.tutor,
			title='Fluency Ladder',
			summary='Course for testing lesson authoring flow.',
			category='conversation',
			level='beginner',
			duration_hours=Decimal('12.0'),
			price=Decimal('0.00'),
			status='PUBLISHED',
		)
		self.chapter = Chapter.objects.create(course=self.course, title='Week 1', order=1)
		self.lesson_one = Lesson.objects.create(
			chapter=self.chapter,
			title='Lesson One',
			order=1,
			duration_minutes=20,
			credits_awarded=15,
			required_credits_to_unlock=0,
		)
		self.lesson_two = Lesson.objects.create(
			chapter=self.chapter,
			title='Lesson Two',
			order=2,
			duration_minutes=20,
			credits_awarded=15,
			required_credits_to_unlock=0,
		)
		self.enrollment = Enrollment.objects.create(student=self.student, course=self.course, earned_credits=0)

		self.lesson_one_profile = LessonAuthoringProfile.objects.create(
			lesson=self.lesson_one,
			status='PUBLISHED',
			require_quiz_pass_for_completion=True,
		)
		self.lesson_two_profile = LessonAuthoringProfile.objects.create(
			lesson=self.lesson_two,
			status='PUBLISHED',
			require_quiz_pass_for_completion=False,
		)

		self.quiz = LessonQuiz.objects.create(
			lesson=self.lesson_one,
			title='Quiz 1',
			instructions='Choose the best answer.',
			passing_score=60,
			order=1,
			status='PUBLISHED',
		)
		self.question = LessonQuizQuestion.objects.create(
			quiz=self.quiz,
			question_text='Select A to pass.',
			option_a='A',
			option_b='B',
			option_c='C',
			option_d='D',
			correct_option='A',
			order=1,
		)

	def test_tutor_can_get_and_patch_lesson_authoring(self):
		get_response = self.client.get(
			reverse(
				'tutor-lesson-authoring-detail',
				kwargs={'chapter_id': self.chapter.id, 'lesson_id': self.lesson_one.id},
			),
			**auth_headers_for(self.tutor),
		)
		self.assertEqual(get_response.status_code, status.HTTP_200_OK)

		patch_response = self.client.patch(
			reverse(
				'tutor-lesson-authoring-detail',
				kwargs={'chapter_id': self.chapter.id, 'lesson_id': self.lesson_one.id},
			),
			{
				'title': 'Updated Lesson One',
				'description': 'Updated description',
				'content': 'Updated rich content',
				'drip_delay_days': 2,
			},
			format='json',
			**auth_headers_for(self.tutor),
		)
		self.assertEqual(patch_response.status_code, status.HTTP_200_OK)
		self.lesson_one.refresh_from_db()
		self.lesson_one_profile.refresh_from_db()
		self.assertEqual(self.lesson_one.title, 'Updated Lesson One')
		self.assertEqual(self.lesson_one_profile.description, 'Updated description')
		self.assertEqual(self.lesson_one_profile.drip_delay_days, 2)

	def test_student_must_pass_quiz_before_lesson_completion(self):
		blocked = self.client.post(
			reverse(
				'student-lesson-complete-checked',
				kwargs={'course_id': self.course.id, 'lesson_id': self.lesson_one.id},
			),
			{},
			format='json',
			**auth_headers_for(self.student),
		)
		self.assertEqual(blocked.status_code, status.HTTP_403_FORBIDDEN)

		wrong_submit = self.client.post(
			reverse(
				'student-lesson-quiz-submit',
				kwargs={
					'course_id': self.course.id,
					'lesson_id': self.lesson_one.id,
					'quiz_id': self.quiz.id,
				},
			),
			{
				'answers': [
					{'question_id': self.question.id, 'selected_option': 'B'},
				],
			},
			format='json',
			**auth_headers_for(self.student),
		)
		self.assertEqual(wrong_submit.status_code, status.HTTP_200_OK)
		self.assertFalse(wrong_submit.data['passed'])

		still_blocked = self.client.post(
			reverse(
				'student-lesson-complete-checked',
				kwargs={'course_id': self.course.id, 'lesson_id': self.lesson_one.id},
			),
			{},
			format='json',
			**auth_headers_for(self.student),
		)
		self.assertEqual(still_blocked.status_code, status.HTTP_403_FORBIDDEN)

		correct_submit = self.client.post(
			reverse(
				'student-lesson-quiz-submit',
				kwargs={
					'course_id': self.course.id,
					'lesson_id': self.lesson_one.id,
					'quiz_id': self.quiz.id,
				},
			),
			{
				'answers': [
					{'question_id': self.question.id, 'selected_option': 'A'},
				],
			},
			format='json',
			**auth_headers_for(self.student),
		)
		self.assertEqual(correct_submit.status_code, status.HTTP_200_OK)
		self.assertTrue(correct_submit.data['passed'])

		completed = self.client.post(
			reverse(
				'student-lesson-complete-checked',
				kwargs={'course_id': self.course.id, 'lesson_id': self.lesson_one.id},
			),
			{},
			format='json',
			**auth_headers_for(self.student),
		)
		self.assertEqual(completed.status_code, status.HTTP_200_OK)

	def test_student_must_complete_previous_lessons_first(self):
		response = self.client.post(
			reverse(
				'student-lesson-complete-checked',
				kwargs={'course_id': self.course.id, 'lesson_id': self.lesson_two.id},
			),
			{},
			format='json',
			**auth_headers_for(self.student),
		)

		self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
		self.assertIn('missing_previous_lesson_ids', response.data)
