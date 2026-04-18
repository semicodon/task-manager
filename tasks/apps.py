from django.apps import AppConfig

class TasksConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "tasks"
    verbose_name = "Task Manager"  # Human-readable name shown in admin

