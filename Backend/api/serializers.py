# api/serializers.py
from rest_framework import serializers
from .models import User, Question, Interest

# 1. Serializer for Placement Test Questions
class QuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        # Frontend needs these to display the test; 'correct_option' is excluded for security
        fields = ['id', 'text', 'category', 'option_a', 'option_b', 'option_c', 'option_d']

# 2. Serializer for Interest Selection
class InterestSerializer(serializers.ModelSerializer):
    class Meta:
        model = Interest
        fields = ['id', 'name']

# 3. Serializer for Registration (Supports Student, Tutor, and Student-Tutor)
class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        # Added 'target_proficiency' and 'role' to match your latest model
        fields = [
            'full_name', 
            'email', 
            'password', 
            'university', 
            'faculty', 
            'academic_year', 
            'role',
            'target_proficiency'
        ]

    def create(self, validated_data):
        # Using create_user ensures the password is automatically hashed
        user = User.objects.create_user(
            username=validated_data['email'], # Use email as the internal username
            email=validated_data['email'],
            password=validated_data['password'],
            full_name=validated_data.get('full_name'),
            role=validated_data.get('role', 'STUDENT'),
            university=validated_data.get('university', 'SLIIT'),
            faculty=validated_data.get('faculty'),
            academic_year=validated_data.get('academic_year'),
            target_proficiency=validated_data.get('target_proficiency'),
        )
        return user