from django.utils import timezone
from rest_framework import serializers

from .models import Category, Task


class CategorySerializer(serializers.ModelSerializer):
    """
    task_count: serializers.SerializerMethodField
    """
    task_count = serializers.SerializerMethodField(
        source='get_task_count'
    )

    class Meta:
        """
        model: Type
        fields: list[str]
        read_only_fields: list[str]
        """
        model = Category
        fields = ['id', 'name', 'description', 'color', 'task_count', 'created_at']
        read_only_fields = ['id','task_count','created_at']

    def get_task_count(self, obj: Category) -> int:
        """
        :param obj: the Category instance
        :return: count of tasks in this category
        """
        return obj.tasks.count()


class TaskSerializer(serializers.ModelSerializer):
    """
    category_detail: CategorySerializer
    status_display: serializers.CharField
    priority_display: serializers.CharField
    is_overdue: serializers.SerializerMethodField
    built-ins:
        - get_<field>_display: serializers.CharField
    methods:
        - func(): serializers.SerializerMethodField
    """
    category_detail = CategorySerializer(source="category", read_only=True)
    status_display = serializers.CharField(
        source='get_status_display', read_only=True
    )
    priority_display = serializers.CharField(
        source='get_priority_display', read_only=True
    )
    is_overdue = serializers.SerializerMethodField()

    class Meta:
        """
        model: Type
        fields: list[str]
        read_only_fields: list[str]
        """
        model = Task
        fields = [
            "id",
            "title",
            "description",
            "status",
            "status_display",    # Human-readable status
            "priority",
            "priority_display",  # Human-readable priority
            "due_date",
            "is_overdue",        # Computed: is the deadline past?
            "category",          # Write field: accepts category ID
            "category_detail",   # Read field: returns full category object
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "status_display",
            "priority_display",
            "is_overdue",
            "category_detail",
            "created_at",
            "updated_at",
        ]

    def get_is_overdue(self, obj: Task) -> bool:
        """
        :param obj: object of Task in context
        :return: if the task is overdue
        """
        return obj.is_overdue()

    def validate_title(self, value: str) -> str:
        """
        :param value: the title of the task
        :return: the validated title | ValidationError
        validation:
            - length
        - auto called on title field
        """
        if len(value.strip()) < 3:
            raise serializers.ValidationError("Title must be at least 3 characters long")
        return value.strip()

    def validate(self, data: dict) -> dict:
        """
        :param data: all data in context.
        :return: all data | ValidationError
        checks:
            - due_date
            - instance (only on C, not U)
        - auto called on post-validation of all fields
        """
        if 'due_date' in data and data['due_date']:
            if data['due_date'] < timezone.now():
                if not self.instance:
                    raise serializers.ValidationError(
                        {"due_date": "Due date cannot be in the past for a new task."}
                    )
        return data


class TaskListSerializer(serializers.ModelSerializer):
    """
    category_name: serializers.CharField
    category_color: serializers.CharField

    - lightweight serializer for list views
    - reduce DB queries
    """

    category_name = serializers.CharField(
        source='category.name', read_only=True, default=None
    )
    category_color = serializers.CharField(
        source='category.color', read_only=True, default=None
    )

    class Meta:
        """
        model: Type
        fields: list[str]
        """
        model = Task
        fields = [
            "id",
            "title",
            "status",
            "priority",
            "due_date",
            "category",
            "category_name",
            "category_color",
            "created_at",
        ]