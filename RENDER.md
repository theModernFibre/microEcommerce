# Deploy MicroShop on Render (Only)

**Yes — Render alone can host this entire web app.** All 7 components (discovery, API gateway, 4 microservices, and the frontend) run as Render Web Services and talk over Render’s **private network**. You only expose the **frontend** to the internet; the browser calls that URL and the frontend proxies `/api` to the API Gateway internally.

## What Runs on Render

| Service           | Type   | Public URL? | Role                          |
|-------------------|--------|-------------|--------------------------------|
| discovery-server  | Web    | Optional    | Eureka (other services use private hostport) |
| api-gateway       | Web    | No*         | Entry for backend; frontend proxies to it   |
| auth-service      | Web    | No          | Auth                           |
| product-service   | Web    | No          | Products                       |
| order-service     | Web    | No          | Orders                         |
| inventory-service | Web    | No          | Inventory                      |
| frontend          | Web (Docker) | **Yes** | SPA + `/api` → api-gateway     |

\*You can expose the API Gateway as well if you want a separate API URL (e.g. for mobile apps).

## Requirements

- **Render account** (free tier works for trying it out).
- **Git repo** with this project (e.g. push to GitHub/GitLab and connect it to Render).
- All services in the **same Render region and workspace** so private networking works.

## Option A: One-click Blueprint (recommended)

1. Push this repo to GitHub (or GitLab).
2. In [Render Dashboard](https://dashboard.render.com), click **New** → **Blueprint**.
3. Connect the repo and confirm the blueprint file path (e.g. `render.yaml` at repo root).
4. Render will create all 7 services. **Deploy order:** discovery-server first, then the rest (Render handles dependencies via `fromService`).
5. Open the **frontend** service URL (e.g. `https://frontend-xxxx.onrender.com`). That is your public web app; it proxies `/api` to the API Gateway over the private network.

No need to set the API URL in the frontend: the frontend runs as a Docker web service and proxies `/api` to the API Gateway using `API_GATEWAY_HOSTPORT` from the Blueprint.

## Option B: Manual setup (per service)

If you prefer not to use the Blueprint:

1. **New → Web Service** for each of the 7. Use the **same region** for all.
2. **Discovery server**
   - Connect repo, **Root Directory**: leave empty (repo root).
   - **Runtime**: Java.
   - **Build**: `mvn clean package -DskipTests -pl discovery-server -am`
   - **Start**: `java -jar discovery-server/target/discovery-server-1.0.0-SNAPSHOT.jar`
   - **Env**: `PORT` = `8761` (optional; Render sets PORT automatically).
   - Deploy and note its **internal hostname** (e.g. from Connect → Internal in the dashboard).
3. **Other backend services** (api-gateway, auth-service, product-service, order-service, inventory-service)
   - Same idea: Root = repo root, Runtime = Java.
   - **Build**: `mvn clean package -DskipTests -pl <module> -am`
   - **Start**: `java -jar <module>/target/<module>-1.0.0-SNAPSHOT.jar`
   - **Env**: `DISCOVERY_HOSTPORT` = internal hostport of discovery-server (e.g. `discovery-server:10000` from Connect → Internal).
4. **Frontend**
   - **New → Web Service**, **Root Directory**: `frontend`, **Runtime**: Docker.
   - **Env**: `API_GATEWAY_HOSTPORT` = internal hostport of api-gateway (e.g. `api-gateway:10001`).
   - Deploy; the frontend’s public URL is your app.

## Free tier notes

- Services **spin down** after ~15 minutes of no traffic; the first request after that can take **30–60 seconds** (cold start).
- For a smoother demo, use a **paid** plan so instances stay up, or accept the cold start on the first hit.
- Keep **discovery-server** and **api-gateway** on a plan that avoids spin-down if you want the app to wake up reliably.

## Summary

- **Can Render alone deploy this web app?** **Yes.** Use the provided `render.yaml` Blueprint (Option A) or create the 7 Web Services manually (Option B). Only the **frontend** needs to be public; the rest can stay on Render’s private network.
