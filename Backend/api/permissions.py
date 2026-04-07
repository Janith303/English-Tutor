# api/permissions.py
from rest_framework.permissions import BasePermission

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