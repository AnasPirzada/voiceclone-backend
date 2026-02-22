.PHONY: dev dev-infra dev-backend dev-frontend dev-worker build up down logs migrate seed clean

dev-infra:
	docker compose -f docker-compose.dev.yml up -d

dev-backend:
	cd backend && uvicorn backend.api.main:app --reload --host 0.0.0.0 --port 8000

dev-frontend:
	cd frontend && npm run dev

dev-worker:
	cd backend && celery -A backend.workers.celery_app:celery_app worker --loglevel=info -Q training,generation,conversion,cleanup,default

dev: dev-infra
	@echo "Infrastructure started. Run backend, frontend, and worker separately."

build:
	docker compose build

up:
	docker compose up -d

down:
	docker compose down

logs:
	docker compose logs -f

migrate:
	cd backend && alembic upgrade head

seed:
	cd backend && python -m backend.scripts.seed_data

clean:
	docker compose down -v
	find . -type d -name __pycache__ -exec rm -rf {} +
	find . -type d -name .pytest_cache -exec rm -rf {} +
	rm -rf frontend/.next frontend/node_modules
