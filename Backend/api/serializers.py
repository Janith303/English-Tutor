# api/serializers.py
from rest_framework import serializers
from .models import User, Question, Interest, StudentTutorProfile

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

# --- NEW: TUTOR APPLICATION SERIALIZERS ---

# 4. Serializer for Identity Verification (Step 1 of Application)
class IdentityVerificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['identity_proof', 'agreed_to_tutor_terms']

    def validate_agreed_to_tutor_terms(self, value):
        if not value:
            raise serializers.ValidationError("You must agree to the Tutor Agreement to proceed.")
        return value
        
    def validate_identity_proof(self, value):
        if not value:
            raise serializers.ValidationError("Please upload your Student ID.")
        return value

# 5. Serializer for Student Tutor Application (Step 2 of Application)
class StudentTutorApplicationSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudentTutorProfile
        fields = ['id', 'teaching_areas', 'bio', 'availability', 'status', 'applied_at']
        # Prevent users from directly changing their approval status or application date
        read_only_fields = ['id', 'status', 'applied_at']
        
def create(self, validated_data):
        # Using create_user ensures the password is automatically hashed
        user = User.objects.create_user(
            username=validated_data['email'], 
            email=validated_data['email'],
            password=validated_data['password'],
            full_name=validated_data.get('full_name'),
            role=validated_data.get('role', 'STUDENT'),
            university=validated_data.get('university', 'SLIIT'),
            faculty=validated_data.get('faculty'),
            academic_year=validated_data.get('academic_year'),
            target_proficiency=validated_data.get('target_proficiency'),
            
            # --- ADD THIS LINE TO FIX THE ERROR ---
            email_pre_verified=False 
        )
        return user
    
# In api/serializers.py
class StudentTutorApplicationSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudentTutorProfile
        # Add 'video' to the fields list
        fields = ['id', 'teaching_areas', 'bio', 'availability', 'video', 'status', 'applied_at']
        read_only_fields = ['id', 'status', 'applied_at']