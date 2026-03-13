# MicroShop — Deployment and Hosting Guide

This document explains how to **build**, **run**, and **deploy** the MicroShop microservices stack using **Docker**, **Kubernetes**, and **public cloud / hosting** options.

---

## Table of Contents

1. [Docker](#1-docker)
2. [Docker Compose](#2-docker-compose)
3. [Kubernetes](#3-kubernetes)
4. [Public Hosting Options](#4-public-hosting-options)
5. [Environment Variables](#5-environment-variables)
6. [Production Checklist](#6-production-checklist)

---

## Compatibility with Docker and Kubernetes

The project supports **Render** (see [RENDER.md](./RENDER.md)) using optional env vars (`PORT`, `DISCOVERY_HOSTPORT`, `API_GATEWAY_HOSTPORT`). **Docker and Kubernetes are unchanged and fully supported:**

- **Docker Compose** sets `EUREKA_CLIENT_SERVICEURL_DEFAULTZONE` (full URL) for backends, so they ignore the new defaults. The frontend image defaults `API_GATEWAY_HOSTPORT` to `api-gateway:8080`, so it works as before.
- **Kubernetes** manifests set `EUREKA_CLIENT_SERVICEURL_DEFAULTZONE` in each deployment; the frontend pod uses the default gateway address `api-gateway:8080`. You can run everything locally with `minikube`, `kind`, or any K8s cluster.

---

## 1. Docker

### Build images

From the **project root** (`micro two/`), first build the JARs, then build Docker images:

```bash
# Build all Spring Boot JARs
mvn clean package -DskipTests

# Build each image (from project root)
docker build -t discovery-server:latest ./discovery-server
docker build -t api-gateway:latest ./api-gateway
docker build -t auth-service:latest ./auth-service
docker build -t product-service:latest ./product-service
docker build -t order-service:latest ./order-service
docker build -t inventory-service:latest ./inventory-service
docker build -t frontend:latest ./frontend
```

### Run with Docker (manual)

You must start **Discovery** first, then the rest. Eureka URL for other services must point to the discovery container (e.g. by network):

```bash
docker network create microshop

docker run -d --name discovery-server --network microshop -p 8761:8761 discovery-server:latest
# Wait ~30 seconds for Eureka to be ready

docker run -d --name api-gateway --network microshop -p 8080:8080 \
  -e EUREKA_CLIENT_SERVICEURL_DEFAULTZONE=http://discovery-server:8761/eureka/ \
  api-gateway:latest

docker run -d --name auth-service --network microshop \
  -e EUREKA_CLIENT_SERVICEURL_DEFAULTZONE=http://discovery-server:8761/eureka/ \
  auth-service:latest

docker run -d --name product-service --network microshop \
  -e EUREKA_CLIENT_SERVICEURL_DEFAULTZONE=http://discovery-server:8761/eureka/ \
  product-service:latest

docker run -d --name order-service --network microshop \
  -e EUREKA_CLIENT_SERVICEURL_DEFAULTZONE=http://discovery-server:8761/eureka/ \
  order-service:latest

docker run -d --name inventory-service --network microshop \
  -e EUREKA_CLIENT_SERVICEURL_DEFAULTZONE=http://discovery-server:8761/eureka/ \
  inventory-service:latest

docker run -d --name frontend --network microshop -p 3000:80 frontend:latest
```

- **Frontend (web app):** http://localhost:3000  
- **API Gateway:** http://localhost:8080  
- **Eureka:** http://localhost:8761  

---

## 2. Docker Compose

Easiest way to run the full stack locally.

### Steps

```bash
# From project root
mvn clean package -DskipTests
docker compose build
docker compose up -d
```

Wait about 1–2 minutes for Eureka and services to register. Then:

- **Web app:** http://localhost:3000  
- **API (for debugging):** http://localhost:8080  
- **Eureka:** http://localhost:8761  

### Useful commands

```bash
docker compose up -d      # Start in background
docker compose logs -f    # Follow logs
docker compose down       # Stop and remove containers
docker compose ps         # List services
```

---

## 3. Kubernetes

### Prerequisites

- **kubectl** installed and pointed at your cluster (minikube, kind, GKE, EKS, AKS, etc.)
- **Docker images** built and available to the cluster:
  - **Minikube:** build inside minikube: `eval $(minikube docker-env)` then run the same `docker build` commands from the project root (after `mvn package`).
  - **Kind:** push to kind’s registry or load images (e.g. `kind load docker-image api-gateway:latest`).
  - **Cloud (GKE/EKS/AKS):** push images to a container registry (GCR, ECR, ACR) and set `imagePullPolicy` / image names in the manifests.

### Deploy order

Deploy in this order so Discovery is ready before other services:

```bash
# From project root
kubectl apply -f k8s/discovery-server-deployment.yaml
kubectl apply -f k8s/api-gateway-deployment.yaml
kubectl apply -f k8s/auth-service-deployment.yaml
kubectl apply -f k8s/product-service-deployment.yaml
kubectl apply -f k8s/order-service-deployment.yaml
kubectl apply -f k8s/inventory-service-deployment.yaml
kubectl apply -f k8s/frontend-deployment.yaml
```

### Ingress and making the app reachable

- The **frontend** Deployment serves the SPA and proxies `/api` to the **api-gateway** service (see `frontend/nginx.conf`). So you only need to expose the **frontend** to the outside.
- The file `k8s/frontend-deployment.yaml` includes an **Ingress** that sends all traffic to the frontend service. It assumes an **Ingress controller** (e.g. NGINX Ingress) is installed.

**Minikube:**

```bash
minikube addons enable ingress
# Get app URL (after ingress is ready)
minikube service list
# Or use tunnel: minikube tunnel
# Then open http://<minikube-ip> or the host you set in Ingress
```

**Kind / cloud:** Ensure the Ingress controller is installed and that the Ingress host or path matches how you want to access the app (e.g. add a host like `microshop.example.com` and point DNS to the load balancer).

### Check status

```bash
kubectl get pods,svc,ingress
kubectl logs -l app=discovery-server -f
kubectl logs -l app=api-gateway -f
```

---

## 4. Public Hosting Options

To make the web app **publicly available**, you need to:

1. Build and push Docker images to a **container registry**.
2. Run the stack on a **hosting platform** that can pull those images and expose the frontend (and optionally the API) to the internet.

Below are common options; the exact steps depend on the provider’s current UI and CLI.

### A. AWS

- **EKS (Kubernetes):** Push images to **ECR**, update K8s manifests to use ECR image URLs and `imagePullPolicy: Always`. Deploy the same `k8s/` manifests; use an AWS Load Balancer Ingress or ALB Ingress Controller to expose the frontend.
- **ECS (Fargate):** Create a task definition per service (discovery, api-gateway, auth, product, order, inventory, frontend). Use ECS service discovery or an ALB to route traffic. Frontend task gets public exposure; backend tasks are internal.
- **App Runner:** Run the **frontend** (and optionally API Gateway) as separate services; point the frontend’s `/api` proxy to the API Gateway URL. Simpler than EKS/ECS but less control.

### B. Google Cloud (GCP)

- **GKE:** Push images to **Artifact Registry**, update K8s manifests, deploy with `kubectl apply -f k8s/`. Use a GKE Ingress or LoadBalancer Service to expose the frontend.
- **Cloud Run:** Run each service as a Cloud Run service. Frontend can be a static site (e.g. Firebase Hosting or Cloud Storage + Load Balancer) that calls an API Gateway URL; or run the frontend container on Cloud Run and set the API base URL via env.

### C. Azure

- **AKS:** Push images to **ACR**, deploy the same Kubernetes manifests, use AKS Ingress or Application Gateway to expose the frontend.
- **App Service:** Run each backend as a Web App (container); put the frontend on a separate Web App or Static Web Apps, and set the API URL in the frontend (e.g. env variable).

### D. Railway / Render / Fly.io (simpler PaaS)

- **Railway:** Create a project, add each folder (discovery-server, api-gateway, auth-service, product-service, order-service, inventory-service, frontend) as a service. Set env var `EUREKA_CLIENT_SERVICEURL_DEFAULTZONE` to the **public** URL of the discovery service (e.g. `https://discovery-server.railway.app/eureka/`). Expose the **frontend** and **api-gateway** publicly; keep others internal if the platform allows, or expose only what’s needed.
- **Render:** Similar: deploy each service as a Web Service (Docker). Use Render’s internal hostnames for Eureka URL when possible; set `EUREKA_CLIENT_SERVICEURL_DEFAULTZONE` to the discovery service URL. Expose frontend and API gateway.
- **Fly.io:** `fly launch` per service (or use `fly.toml`). Put all apps in the same organization; use Fly’s internal DNS (e.g. `http://discovery-server.internal:8761/eureka/`) for Eureka. Expose frontend and api-gateway with `fly proxy` or public IPs.

### E. Single VPS (e.g. DigitalOcean, Linode)

1. Install Docker and Docker Compose on the VM.
2. Clone the repo and run `mvn package`, then `docker compose build` and `docker compose up -d`.
3. Put a **reverse proxy** (e.g. Nginx or Caddy) on the host in front of port 3000 (frontend) and optionally 8080 (API). Add TLS with Let’s Encrypt.
4. Open firewall for 80/443 and point DNS to the server IP.

---

## 5. Environment Variables

| Service           | Variable                              | Description                          |
|-------------------|----------------------------------------|--------------------------------------|
| All (except Discovery) | `EUREKA_CLIENT_SERVICEURL_DEFAULTZONE` | Eureka URL, e.g. `http://discovery-server:8761/eureka/` |
| Auth              | `JWT_SECRET`                           | Secret for JWT (use a long random string in prod) |
| Auth              | `JWT_EXPIRATION_MS`                     | Token expiry in milliseconds         |
| Any (DB in prod)  | `SPRING_DATASOURCE_URL`                | JDBC URL (e.g. PostgreSQL/RDS)       |
| Frontend (build)  | `VITE_API_URL`                         | Optional; if you build the frontend with a different API base URL |

For **production**, set at least:

- Strong `JWT_SECRET`.
- Persistent databases (e.g. PostgreSQL) for auth, product, order, inventory instead of H2.

---

## 6. Production Checklist

- [ ] Use a **persistent database** (PostgreSQL, MySQL) for each service that has data; set `SPRING_DATASOURCE_*` and remove H2.
- [ ] Set a **strong JWT secret** and secure all secrets (e.g. via Kubernetes Secrets or the cloud provider’s secret manager).
- [ ] Enable **HTTPS** (TLS) on the frontend and API (reverse proxy or cloud load balancer).
- [ ] Configure **CORS** on the API Gateway if the frontend is on a different domain.
- [ ] Use **health checks** (already present in Discovery) and add actuator/health to other services if needed.
- [ ] Consider **rate limiting** and **auth** on the gateway for production.
- [ ] Build frontend with production API URL if it differs from relative `/api` (e.g. `VITE_API_URL=https://api.yourdomain.com` and use it in `AuthContext` for `API_BASE`).

---

## Summary

| Goal              | Approach                                                                 |
|-------------------|--------------------------------------------------------------------------|
| Run locally       | `docker compose up` or run each service with Maven + `npm run dev`      |
| Run in K8s        | Build images, push to registry, `kubectl apply -f k8s/` in order          |
| Public on cloud   | Push images to registry, deploy to EKS/GKE/AKS/ECS/Cloud Run/Railway/Render/Fly, expose frontend (+ API if needed) |
| Public on VPS     | Docker Compose + reverse proxy (Nginx/Caddy) + TLS + DNS                 |

For step-by-step provider-specific instructions, use the official docs for your chosen platform (e.g. “Deploy Docker to ECS”, “Deploy to GKE”, “Deploy to Railway”).
