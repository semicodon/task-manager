# Task Manager API

A RESTful API for managing tasks and categories, built with Django REST Framework and PostgreSQL. This project serves as the backend for a full-stack task management application inspired by tools like Trello and Jira.

## Tech Stack

- **Python 3.12** — Language
- **Django 4.2** — Web framework
- **Django REST Framework 3.15** — REST API layer
- **PostgreSQL 16** — Database
- **Docker & Docker Compose** — Containerised development environment

## Features

- Full CRUD for Tasks and Categories
- Filter tasks by status, priority, category, and due date
- Search tasks by title or description
- Custom endpoints: mark a task as done, get a task summary
- Pagination on all list endpoints
- Django Admin panel for data management

## Getting Started

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/)


### Setup

```bash
# 1. Clone the repo
git clone <your-repo-url>
cd episode_1/task_manager_api

# 2. Create your environment file
cp .env.example .env
# Open .env and set a SECRET_KEY (generate one at https://djecrety.ir)

# 3. Build and start all services
docker compose up --build -d

# 4. Run database migrations
docker compose exec web python manage.py migrate

# 5. Create an admin user (optional)
docker compose exec web python manage.py createsuperuser
```

The API is now running at `http://localhost:8000/api/`

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/tasks/` | List all tasks |
| POST | `/api/tasks/` | Create a task |
| GET | `/api/tasks/{id}/` | Retrieve a task |
| PUT | `/api/tasks/{id}/` | Update a task |
| PATCH | `/api/tasks/{id}/` | Partial update |
| DELETE | `/api/tasks/{id}/` | Delete a task |
| POST | `/api/tasks/{id}/mark-done/` | Mark task as done |
| GET | `/api/tasks/summary/` | Task stats by status and priority |
| GET | `/api/categories/` | List all categories |
| POST | `/api/categories/` | Create a category |
| GET | `/api/categories/{id}/` | Retrieve a category |
| PUT | `/api/categories/{id}/` | Update a category |
| DELETE | `/api/categories/{id}/` | Delete a category |

### Filtering & Search

```
GET /api/tasks/?status=todo
GET /api/tasks/?priority=high
GET /api/tasks/?category=1
GET /api/tasks/?search=meeting
GET /api/tasks/?ordering=-created_at
GET /api/tasks/?overdue=true
```

### Example Request

```bash
# Create a category
curl -X POST http://localhost:8000/api/categories/ \
  -H "Content-Type: application/json" \
  -d '{"name": "Work", "color": "#4A90D9"}'

# Create a task
curl -X POST http://localhost:8000/api/tasks/ \
  -H "Content-Type: application/json" \
  -d '{"title": "Review pull request", "priority": "high", "category": 1}'
```

## Project Structure

```
task_manager_api/
├── Dockerfile
├── docker-compose.yml
├── requirements.txt
├── manage.py
├── task_manager/          # Project config
│   ├── settings.py
│   └── urls.py
└── tasks/                 # Main app
    ├── models.py          # Category and Task models
    ├── serializers.py     # JSON serialization
    ├── views.py           # ViewSets and custom actions
    └── urls.py            # URL routing via DRF Router
```

## Useful Commands

```bash
docker compose up -d                          # Start all services
docker compose down                           # Stop all services
docker compose exec web python manage.py shell  # Django shell
docker compose logs web                       # View Django logs
```
