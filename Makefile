.PHONY: up down logs test test-clean dev

up:
	docker compose up -d --build

down:
	docker compose down

logs:
	docker compose logs -f

test:
	docker compose -f docker-compose.test.yml up --build --abort-on-container-exit

test-clean:
	docker compose -f docker-compose.test.yml down -v

dev:
	docker compose up --build