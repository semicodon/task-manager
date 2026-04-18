from django.contrib import admin

from .models import Category, Task


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    """
    list_display: list[str]
    search_fields: list[str]
    ordering: list[str]

    def task_count_display(self, obj)
    task_count_display.short_description: str
    """

    list_display = ['name','color','task_count_display','created_at']   # column list view
    search_fields = ['name','description']  # search box
    ordering = ['name']

    def task_count_display(self, obj: Category):
        return obj.tasks.count()

    task_count_display.short_description = 'Tasks'  # Column header label


@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    """
    list_display: list[str]
    search_fields: list[str]
    list_filter: list[str]
    ordering: list[str]
    list_editable: list[str]
    date_hierarchy: str
    """

    list_display = ['title','status','priority','category','due_date','created_at']
    list_filter =  ['status','priority','category']
    search_fields = ['title','description']
    ordering = ['-created_at']
    list_editable = ['status','priority']   # directly editable in the list view
    date_hierarchy = 'created_at'           # date drill-down bar
