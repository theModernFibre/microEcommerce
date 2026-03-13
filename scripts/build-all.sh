#!/usr/bin/env bash
# Build all JARs and Docker images from project root.

set -e
cd "$(dirname "$0")/.."

echo "Building JARs..."
mvn clean package -DskipTests

echo "Building Docker images..."
docker build -t discovery-server:latest ./discovery-server
docker build -t api-gateway:latest ./api-gateway
docker build -t auth-service:latest ./auth-service
docker build -t product-service:latest ./product-service
docker build -t order-service:latest ./order-service
docker build -t inventory-service:latest ./inventory-service
docker build -t frontend:latest ./frontend

echo "Done. Run: docker compose up -d"
