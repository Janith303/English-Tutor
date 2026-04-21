# api/permissions.py
from rest_framework.permissions import BasePermission

class IsAdminUser(BasePermission):
    """
    Allows access only to admin users.
    """
    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            request.user.role == 'ADMIN'
        )

class IsApprovedTutor(BasePermission):
    """
    Allows access only to users who have the 'TUTOR' or 'STUDENT_TUTOR' role.
    """
    def has_permission(self, request, view):
        return bool(
            request.user and 
            request.user.is_authenticated and 
            request.user.role in ['STUDENT_TUTOR', 'TUTOR']
        )


class IsTutorAuthor(BasePermission):
    """Allows only tutor role users to create and manage their own course content."""

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.role in ['STUDENT_TUTOR', 'TUTOR']
        )


class IsCourseOwner(BasePermission):
    """Allows object-level access only to the course owner."""

    def has_object_permission(self, request, view, obj):
        course = getattr(obj, 'course', obj)
        tutor = getattr(course, 'tutor', None)
        return bool(
            request.user
            and request.user.is_authenticated
            and tutor
            and tutor.id == request.user.id
        )