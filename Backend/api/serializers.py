from rest_framework import serializers
from .models import User, Question

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'email', 'password', 'university', 'academic_year']

    def create(self, validated_data):
        # This handles password hashing automatically
        user = User.objects.create_user(**validated_data)
        return user

class QuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        fields = ['id', 'text', 'category', 'option_a', 'option_b', 'option_c', 'option_d']