.PHONY: up down logs test test-clean dev clean-all

up:
	docker compose -p sql-arena-dev up -d --build

down:
	docker compose -p sql-arena-dev down

logs:
	docker compose logs -f

test:
	docker compose -f docker-compose.test.yml -p sql-arena-test up --build --abort-on-container-exit --remove-orphans

test-clean:
	docker compose -f docker-compose.test.yml -p sql-arena-test down -v --remove-orphans

dev:
	docker compose -p sql-arena-dev up --build

clean-all:
	docker container prune -f
	docker volume prune -f
	docker network prune -f
	docker compose -p sql-arena-dev down -v --remove-orphans 2>/dev/null || true
	docker compose -p sql-arena-test down -v --remove-orphans 2>/dev/null || true