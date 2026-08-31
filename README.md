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

_Full run instructions (local dev + `docker-compose up`) are added as the services come
online. See `CLAUDE.md` for the current build status and conventions._

## Project Layout

```
DineFlow/
├── backend/
│   ├── api-gateway/          # Spring Cloud Gateway + auth/login
│   ├── menu-service/         # categories & menu items
│   ├── order-service/        # orders & status
│   └── reservation-service/  # tables & reservations
├── frontend/                 # single Vite React app (customer + admin)
├── docker-compose.yml
└── .github/workflows/        # CI
```
