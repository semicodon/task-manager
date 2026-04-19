from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, status, viewsets
from rest_framework.decorators import action
from rest_framework.request import Request
from rest_framework.response import Response

from backend.tasks.models import Category, Task
from backend.tasks.serializers import CategorySerializer, TaskListSerializer, TaskSerializer


class CategoryViewSet(viewsets.ModelViewSet):
    """
    queryset: QuerySet          -> select_related() prefetches objs
    serializer_class: CategorySerializer
    filter_backends: list[filters.x] -> available filter actions
    search_fields: list[str]    ->  ?search=<value> for queries
    ordering_fields: list[str]  ->  ?ordering=<value> for ordering
    ordering: list[str]         ->  default ordering
    """
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'created_at']
    ordering = ['name']


class TaskViewSet(viewsets.ModelViewSet):
    """
    queryset: QuerySet
    filter_backends: list[filters.x]
    filterset_fields: dict[str, list[str]] -> ?=search<value> exact value
    search_fields: list[str] -> ?search=<value> for queries
    ordering_fields: list[str] -> ?ordering=<value> for ordering
    ordering: list[str] -> default ordering

    Key Actions:
    - TaskViewSet has serializers for list vs. detail
    - custom filtering
    - custom methods beyond MVS
    - Queryset optimization

    - Model.objects.select_related('<field>').all() -> optimize foreign key queries
    - DjangoFilterBackend,        # Enables exact-match filtering
    - filters.SearchFilter,       # Enables ?search=keyword
    - filters.OrderingFilter,     # Enables ?ordering=field
    """

    queryset = Task.objects.select_related('category').all()
    filter_backends = [DjangoFilterBackend,
                       filters.SearchFilter,
                       filters.OrderingFilter]
    exact = ['exact']
    filterset_fields = {
        'status': exact,
        'priority': exact,
        'category': exact,
        'due_date': exact + ['gt', 'lt', 'gte', 'lte']
    }
    search_fields= ['title', 'description']
    ordering_fields = ['created_at','updated_at','due_date','priority','status']
    ordering = ['-created_at']


    def get_serializer_class(self):
        """
        - self.action    -> determined by HTTP method and URL pattern by DRF
        - TaskListSerializer
        - TaskSerializer
        :return: TaskListSerializer | TaskSerializer
        """
        if self.action == 'list':
            return TaskListSerializer
        return TaskSerializer

    def get_queryset(self):
        """
        override: allow filter by 'overdue' (no DB column; cannot use DjangoFilterBackend)  eg. GET api/tasks/?overdue=true
        - super().get_queryset()
        - self.request.query_params
        - queryset.filter()
        - queryset.exclude()
        - <field>__<lookup> (e.g., due_date__lt) -> specify how to lookup query
        :return: queryset
        """
        queryset = super().get_queryset()

        overdue_param = self.request.query_params.get('overdue')
        if overdue_param is not None:
            today = timezone.now().date()

            if overdue_param.lower() == 'true':
                queryset = queryset.filter(due_date__lt=today).exclude(status=Task.Status.DONE)

            elif overdue_param.lower() == 'false':
                queryset = queryset.exclude(due_date__lt=today)

        return queryset

    @action(
        detail=True,          # URL includes an ID (/tasks/{id}/)
        methods=['post'],     # restrict method to POST only
        url_path='mark-done', # URL suffix: /api/tasks/{id}/mark-done/
    )
    def mark_done(self, request: Request, pk=None) -> Response:
        """
        Custom action: mark a task as done
        Access: POST api/tasks/<pk>/mark_done/
        :param request: Request
        :param pk: int|None -> fetches task by get_object()
        :return: Response({?}, status)
        - self.get_object()
        - TaskSerializer()
        - Response()
        """

        task = self.get_object()

        if task.status == Task.Status.DONE:
            return Response(
                {'detail': 'Task is already marked as done.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        task.mark_done()

        serializer = TaskSerializer(task, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)


    @action(
        detail=False,
        methods=['get'],
        url_path='summary',
    )
    def summary(self, request: Request) -> Response:
        """
        Custom action: return summary of all tasks
        Access: GET /api/tasks/summary/
        :param request: Request
        :return: Response
        - self.get_queryset()
        - queryset.filter()
        - queryset.count()
        - Response()
        """

        queryset = self.get_queryset()

        stats = {
            'total': queryset.count(),
            'by_status': {
                'todo': queryset        .filter(status=Task.Status.TODO).count(),
                'in_progress': queryset .filter(status=Task.Status.IN_PROGRESS).count(),
                'done': queryset        .filter(status=Task.Status.DONE).count(),
            },
            'by_priority': {
                'low': queryset         .filter(priority=Task.Priority.LOW).count(),
                'medium': queryset      .filter(priority=Task.Priority.MEDIUM).count(),
                'high': queryset        .filter(priority=Task.Priority.HIGH).count(),
            },
            'overdue': queryset         .filter(due_date__lt=timezone.now().date()).exclude(status=Task.Status.DONE).count()
        }

        return Response(stats, status=status.HTTP_200_OK)
