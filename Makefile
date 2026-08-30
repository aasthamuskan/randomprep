# ══════════════════════════════════════════════════════════════════════════════
#  RandomPrep — Makefile
#  Usage: make <command>
# ══════════════════════════════════════════════════════════════════════════════

.PHONY: help dev prod build stop clean logs health install

# Default: show help
help:
	@echo ""
	@echo "  RandomPrep — Available Commands"
	@echo "  ─────────────────────────────────────────────"
	@echo "  make dev        Start local dev servers (no Docker)"
	@echo "  make prod       Start production stack via Docker Compose"
	@echo "  make build      Build Docker images only"
	@echo "  make stop       Stop all Docker containers"
	@echo "  make clean      Stop containers + remove volumes + images"
	@echo "  make logs       Tail logs from all containers"
	@echo "  make health     Hit /api/health endpoint"
	@echo "  make install    Install all npm dependencies"
	@echo ""

# ── Local Development (no Docker) ─────────────────────────────────────────────
dev:
	npm run dev

install:
	npm run install:all

# ── Docker Production ──────────────────────────────────────────────────────────
prod:
	docker-compose up --build -d
	@echo ""
	@echo "  App running at  → http://localhost"
	@echo "  API running at  → http://localhost:5000/api/health"
	@echo ""

build:
	docker-compose build --no-cache

stop:
	docker-compose down

clean:
	docker-compose down -v --rmi local
	@echo "Containers, volumes, and local images removed."

# ── Docker Dev (hot reload) ────────────────────────────────────────────────────
dev-docker:
	docker-compose -f docker-compose.dev.yml up --build

# ── Logs ──────────────────────────────────────────────────────────────────────
logs:
	docker-compose logs -f

logs-backend:
	docker-compose logs -f backend

logs-frontend:
	docker-compose logs -f frontend

# ── Health Check ──────────────────────────────────────────────────────────────
health:
	@curl -s http://localhost:5000/api/health | python3 -m json.tool || echo "Server not running!"

# ── Git Helpers ───────────────────────────────────────────────────────────────
push:
	git add .
	git status
	@read -p "Commit message: " msg; git commit -m "$$msg"
	git push origin main