from decimal import Decimal

from django.urls import reverse
from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

from .models import User, Course, Chapter, Lesson, Enrollment


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
			slug=f'academic-writing-{tutor.id}',
			summary='A practical writing course for university students.',
			description='Full course description for writing mastery.',
			category='academic-writing',
			level='beginner',
			duration_hours=Decimal('20.0'),
			price=Decimal('0.00'),
			status='PUBLISHED',
			public_marketplace=True,
		)
		return course

	def test_tutor_can_create_course(self):
		payload = {
			'title': 'Presentation Mastery',
			'slug': 'presentation-mastery',
			'summary': 'Learn how to present clearly and confidently.',
			'description': 'Detailed syllabus and outcomes.',
			'category': 'presentation-skills',
			'level': 'intermediate',
			'duration_hours': '24.0',
			'price': '1000.00',
			'status': 'DRAFT',
			'public_marketplace': True,
			'search_indexing': False,
			'auto_enroll_existing_students': False,
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
			'slug': 'not-allowed-course',
			'summary': 'Summary with valid length.',
			'description': 'Description with valid length.',
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
