.PHONY: setup dev build test lint clean docker-up docker-down

setup:
	@echo "Installing dependencies..."
	pnpm install
	@echo "Copying environment file if not exists..."
	@if not exist .env copy .env.example .env

dev:
	@echo "Starting development environment..."
	pnpm run dev:api

docker-up:
	@echo "Starting local infrastructure (PostgreSQL, Redis, LiveKit)..."
	docker-compose up -d

docker-down:
	@echo "Stopping local infrastructure..."
	docker-compose down

build:
	pnpm run build

test:
	pnpm run test

lint:
	pnpm run lint

clean:
	pnpm run clean
