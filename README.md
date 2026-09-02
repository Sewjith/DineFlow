# DineFlow

A restaurant ordering & reservation platform. Customers browse the menu, build a cart,
place orders, look up order status, and book tables. Staff use an admin portal to manage
the menu, process orders, and handle reservations.

> Replaces paper menus and phone bookings with a clean, modern web stack.

## Architecture

A single React frontend talks to an **API Gateway**, which routes to three focused
Spring Boot services. One PostgreSQL instance backs everything, with each service owning
its own tables (no cross-service database access — `order-service` fetches menu prices
over REST).

```
                         ┌──────────────────┐
  Browser (React/Vite) ─▶│  API Gateway     │  :8080  (routing, CORS, /api/auth/login → JWT)
                         └───────┬──────────┘
             ┌───────────────────┼────────────────────┐
             ▼                   ▼                     ▼
      ┌────────────┐     ┌────────────┐        ┌──────────────────┐
      │menu-service│     │order-service│──REST─▶│  (menu prices)   │
      │   :8081    │     │   :8082     │        └──────────────────┘
      └─────┬──────┘     └─────┬───────┘        ┌──────────────────┐
            │                  │                 │reservation-service│ :8083
            └──────────────────┴─────────────────┴────────┬─────────┘
                                                           ▼
                                                  PostgreSQL :5432  (db: dineflow)
```

Each service validates the shared-secret JWT for admin endpoints (defense in depth);
public customer endpoints are open.

## Tech Stack

| Layer     | Technology                                                        |
|-----------|-------------------------------------------------------------------|
| Frontend  | React 18 + Vite, React Router, Axios, Context API, Tailwind CSS    |
| Backend   | Java 21, Spring Boot 3.3 (Web, Data JPA, Security), Spring Cloud Gateway |
| Auth      | JWT (issued by gateway, validated per service)                    |
| Database  | PostgreSQL 16                                                      |
| Tooling   | Maven, Docker Compose, GitHub Actions                             |

## Services & Ports

| Component            | Port | Responsibility                                   |
|----------------------|------|--------------------------------------------------|
| api-gateway          | 8080 | Single entry point, routing, CORS, login/JWT     |
| menu-service         | 8081 | Categories & menu items                          |
| order-service        | 8082 | Orders, order items, status, dashboard           |
| reservation-service  | 8083 | Tables & reservations (availability check)       |
| postgres             | 5432 | Database `dineflow`                              |
| frontend (dev)       | 5173 | Vite dev server                                  |

## Getting Started

### Option A — Docker (everything with one command)

Requires Docker Desktop. From the repo root:

```bash
docker compose up --build
```

This builds and starts Postgres + the four services + the frontend. Then open:

- **Customer app / Admin portal:** http://localhost:5173  (admin at `/admin`)
- **API gateway:** http://localhost:8080
- **Postgres:** host port **5433** (container-internal 5432)

Stop with `docker compose down` (add `-v` to also drop the database volume).

### Option B — Local dev (hot reload)

Requires **JDK 21**, **Maven** (or the bundled `mvnw` wrapper), and **Node 20**.

```bash
# 1. Start Postgres only
docker compose up -d postgres

# 2. Run each service (separate terminals) — e.g. menu-service
cd backend/menu-service && mvn spring-boot:run     # 8081
cd backend/order-service && mvn spring-boot:run    # 8082
cd backend/reservation-service && mvn spring-boot:run  # 8083
cd backend/api-gateway && mvn spring-boot:run      # 8080

# 3. Frontend dev server (proxies /api -> :8080)
cd frontend && npm install && npm run dev          # 5173
```

### Default admin login

`admin` / `admin123` (override via `ADMIN_USERNAME` / `ADMIN_PASSWORD_HASH`; generate a
new hash with `PasswordHashTool` in api-gateway).

## Testing

```bash
cd backend/order-service && mvn test        # order totals + status transitions
cd backend/reservation-service && mvn test  # table availability / overlap logic
```

CI (`.github/workflows/build.yml`) builds all four services and the frontend on every push.

## How one request flows (React → DB)

Placing an order, end to end:

1. **React** — `CheckoutPage` collects name/phone/type/items and calls
   `orderApi.place()` → `POST /api/orders` via the axios client (`frontend/src/api`).
2. **Vite/nginx** proxies `/api` to the **API Gateway** (`:8080`).
3. **Gateway** matches the `/api/orders/**` route and forwards to **order-service**
   (`:8082`), stripping the `/api` prefix.
4. **order-service** `OrderController.place` → `OrderService.placeOrder`: validates the
   request, then calls **menu-service** via `MenuClient` (Spring `RestClient`) to fetch
   each item's **live price** and availability — the total is computed server-side.
5. JPA saves the `orders` + `order_item` rows to **PostgreSQL**; the generated
   `ORD-XXXXXX` reference comes back up the chain to the browser, which redirects to
   `/track?ref=...`.

Admin writes carry a JWT (`Authorization: Bearer …`) issued by the gateway's
`/api/auth/login`; each service's `JwtAuthFilter` validates it before allowing the call.

## Project Layout

```
DineFlow/
├── backend/
│   ├── api-gateway/          # Spring Cloud Gateway + auth/login (JWT)
│   ├── menu-service/         # categories & menu items
│   ├── order-service/        # orders, status, dashboard
│   └── reservation-service/  # tables & reservations
├── frontend/                 # single Vite React app (customer + admin)
├── docker-compose.yml
└── .github/workflows/        # CI
```
