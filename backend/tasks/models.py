from django.db import models
from django.utils import timezone


class Category(models.Model):
    """
    name: models.CharField
    description: models.TextField
    color: models.CharField
    created_at: models.DateTimeField

    Label for tasks. One to many.
    """
    tasks = None

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="categories",
        help_text="The user who owns this category",
    )

    name = models.CharField(
        max_length=100,
        unique=True,
        help_text='The category name (e.g. "Work", "Personal")'
    )

    description = models.TextField(
        blank=True,
        null=True,
        help_text='Optional description of the category'
    )

    color = models.CharField(
        max_length=7,
        default="#6366f1",
        help_text='Hex color code for the category (e.g. #6366f1)'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        """
        verbose_name: str
        verbose_name_plural: str
        ordering: list[str]
        """
        verbose_name = "Category"
        verbose_name_plural = "Categories"
        ordering = ["name"]
        constraints = [     # per-user uniqueness
            models.UniqueConstraint(
                fields=["user", "name"],
                name="unique_category_name_per_user",
            ),
        ]

    def __str__(self) -> str:
        return self.name

class Task(models.Model):

    # --- Choices: Allow builtins like get_<field>_display()
    class Status(models.TextChoices):
        """
        TO-DO: tuple(str, display_name)
        IN_PROGRESS: tuple(str, display_name)
        DONE: tuple(str, display_name)
        """
        TODO = "todo", "To Do"
        IN_PROGRESS = "in_progress", "In Progress"
        DONE = "done", "Done"

    class Priority(models.TextChoices):
        """
        LOW: tuple(str, display_name)
        MEDIUM: tuple(str, display_name)
        HIGH: tuple(str, display_name)
        """
        LOW = "low", "Low"
        MEDIUM = "medium", "Medium"
        HIGH = "high", "High"

    """
    title: models.CharField
    description: models.TextField
    status: models.CharField
    priority: models.CharField
    due_date: models.DateField
    category: models.ForeignKey
    created_at: models.DateTimeField
    updated_at: models.DateTimeField
    """
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="tasks",
        help_text="The user who owns this task",
    )
    title = models.CharField(
        max_length=200,
        help_text='Task title'
    )
    description = models.TextField(
        blank=True,
        default="",
        help_text='Optional task description'
    )
    status = models.CharField(
        choices=Status.choices,
        max_length=20,
        default=Status.TODO,
        help_text='Current status of the task'
    )
    priority = models.CharField(
        choices=Priority.choices,
        max_length=10,
        default=Priority.MEDIUM,
        help_text='Priority level of the task'
    )
    due_date = models.DateField(
        blank=True,
        null=True,
        help_text="Optional deadline (YYYY-MM-DD)",
    )
    category = models.ForeignKey(
        Category,
        on_delete=models.SET_NULL,
        null=True,blank=True,
        related_name='tasks',   # instance can reference all tasks in this category via task.category.tasks.all()
        help_text="Which category this task belongs to",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        """
        verbose_name: str
        verbose_name_plural: str
        ordering: list[str]
        """
        verbose_name = 'Task'
        verbose_name_plural = 'Tasks'
        ordering = ['-created_at', 'priority']

    def __str__(self) -> str:
        return f"{self.title} - [{self.get_status_display()}]"

    def mark_done(self) -> None:
        """
        - status
        - save
        if status is DONE -> save to DB
        """
        self.status = self.Status.DONE
        self.save()

    def is_overdue(self) -> bool:
        """
        - due_date
        - status
        If status is DONE -> False
        If due_date is less than timezone -> True
        """
        if not self.due_date:
            return False
        if self.status == self.Status.DONE:
            return False
        return self.due_date < timezone.now().date()
