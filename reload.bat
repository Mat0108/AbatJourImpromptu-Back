@echo off
docker compose down
docker compose -f docker-compose.dev.yml build
docker compose -f docker-compose.dev.yml up -d
docker compose logs -f serverabatjour