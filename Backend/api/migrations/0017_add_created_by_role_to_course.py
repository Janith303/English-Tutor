from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0016_add_is_approved'),
    ]

    operations = [
        migrations.AddField(
            model_name='course',
            name='created_by_role',
            field=models.CharField(
                choices=[('TUTOR', 'Tutor'), ('STUDENT_TUTOR', 'Student Tutor')],
                default='TUTOR',
                max_length=20
            ),
        ),
        migrations.AddField(
            model_name='course',
            name='rejection_reason',
            field=models.TextField(blank=True, default=''),
        ),
    ]