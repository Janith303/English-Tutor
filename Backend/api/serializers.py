# api/serializers.py
from rest_framework import serializers
from .models import User, Question, Interest

# 1. Serializer for Placement Test Questions
class QuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        # Including all fields needed for the frontend to display the quiz
        fields = ['id', 'text', 'category', 'option_a', 'option_b', 'option_c', 'option_d']

# 2. Serializer for Interest Selection
class InterestSerializer(serializers.ModelSerializer):
    class Meta:
        model = Interest
        fields = ['id', 'name']

# 3. Serializer for Registration (Handles 'full_name' and 'role')
class RegisterSerializer(serializers.ModelSerializer):
    # We set password to write_only so it's never sent back in the response
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        # These fields match your new Model and React frontend keys
        fields = [
            'full_name', 
            'email', 
            'password', 
            'university', 
            'faculty', 
            'academic_year', 
            'role'
        ]

    def create(self, validated_data):
        # We use the email as the 'username' for Django's internal system
        user = User.objects.create_user(
            username=validated_data['email'],
            email=validated_data['email'],
            password=validated_data['password'],
            full_name=validated_data.get('full_name'),
            role=validated_data.get('role', 'STUDENT'), # Defaults to Student if not provided
            university=validated_data.get('university', 'SLIIT'),
            faculty=validated_data.get('faculty'),
            academic_year=validated_data.get('academic_year'),
        )
        return user