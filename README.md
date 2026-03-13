# MicroShop - Microservices Architecture

A microservices architecture demo with **Spring Boot** (Java 21) and **React + Tailwind CSS**: **5 application microservices** plus **API Gateway** and **Service Discovery (Eureka)**.

## Architecture

- **Discovery Server** (8761) - Eureka service registration
- **API Gateway** (8080) - Single entry point, routes `/api/*` to services
- **Auth Service** (8081) - Register, login, JWT
- **Product Service** (8082) - Product CRUD and search
- **Order Service** (8083) - Create and list orders
- **Inventory Service** (8084) - Stock levels
- **Frontend** (3000) - React + Tailwind SPA

## Prerequisites

- Java 21, Maven 3.8+
- Node.js 20+, npm
- Docker and Docker Compose (for containerized run)
- Kubernetes (optional, for K8s deployment)

## Quick Start (Local)

**Docker Compose** (recommended for local):

```bash
mvn clean package -DskipTests
docker compose build
docker compose up -d
```

**Kubernetes (local, e.g. minikube):** build images, then `kubectl apply -f k8s/` in dependency order (see [DEPLOYMENT.md](./DEPLOYMENT.md)). Docker and Kubernetes are fully supported and unchanged by the Render-specific options.

Then run the frontend (for dev with hot reload):

```bash
cd frontend && npm install && npm run dev
```

- Frontend: http://localhost:3000
- API Gateway: http://localhost:8080
- Eureka: http://localhost:8761

## Project Structure

- `discovery-server/` - Eureka
- `api-gateway/` - Spring Cloud Gateway
- `auth-service/` - JWT auth
- `product-service/` - Products
- `order-service/` - Orders
- `inventory-service/` - Inventory
- `frontend/` - React + Vite + Tailwind
- `k8s/` - Kubernetes manifests
- `docker-compose.yml`
- `DEPLOYMENT.md` - Full deployment and hosting guide

## Deployment and Hosting

- **Render only:** Yes. Use the **Blueprint** in `render.yaml` to deploy all 7 services; see **[RENDER.md](./RENDER.md)**.
- **Docker / K8s / other clouds:** See **[DEPLOYMENT.md](./DEPLOYMENT.md)** (Docker Compose, Kubernetes, AWS, GCP, Azure, Railway, Fly.io, VPS).
