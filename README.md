# EcoDelivery S.A.S. — Backend & Data Pipeline

Backend REST API + Airflow ETL pipeline for the EcoDelivery assessment.
The Flutter app is a separate repo (`EcoDelivery-App`) and consumes this API.

```
src/                 NestJS backend (DDD by feature: orders, auth)
prisma/              Schema, migrations, seed script
airflow/              Airflow ETL pipeline (Docker Compose)
  dags/               DAG + dashboard generator
  output/             Generated CSVs + HTML dashboard
```

## 1. Backend API

**Requirements**: Node 20+, pnpm, a reachable PostgreSQL instance.

```bash
pnpm install
cp .env.example .env      # fill in real values, see table below
npx prisma migrate deploy # or `migrate dev` in local dev
pnpm db:seed               # optional: sample orders + 2 test users
pnpm start:dev
```

API listens on `0.0.0.0:$PORT` (reachable from LAN / emulator / Docker via
`host.docker.internal`). CORS is enabled for all origins, so any web or
mobile client can call it directly. Swagger docs: **`/api/docs`**.

| Variable | Description |
|---|---|
| `DATABASE_URL` | Postgres connection string. If going through PgBouncer, don't append `?schema=public` — it breaks the connection. |
| `PORT` | Default `3000` |
| `NODE_ENV` | `development` \| `production` \| `test` |
| `JWT_SECRET` | ≥16 chars |
| `JWT_EXPIRES_IN` | e.g. `1d` |

### Auth & roles

- `POST /auth/register` `{ email, password, role: "cliente"|"repartidor" }`
- `POST /auth/login` `{ email, password }` → `{ accessToken }`
- Everything else needs `Authorization: Bearer <token>`.
- `POST /pedidos` needs role `cliente`; `PATCH /pedidos/:id/estado` needs
  role `repartidor`; both roles can read.

### Orders endpoints

`POST /pedidos` · `GET /pedidos` (`?estado=&zona=`) · `GET /pedidos/:id` ·
`PATCH /pedidos/:id/estado`. State machine: `pendiente → en_camino →
entregado`, `cancelado` reachable from `pendiente`/`en_camino`; `entregado`
and `cancelado` are terminal. `fecha_entrega` is set automatically on
delivery.

JSON uses snake_case fields (`id_pedido`, `fecha_creacion`, `metodo_pago`, …)
and lowercase enum values, matching the Flutter app's contract.

Seed users: `cliente@ecodelivery.com` / `repartidor@ecodelivery.com`,
password `password123`.

## 2. Airflow pipeline

**Requirements**: Docker, backend already running.

```bash
cd airflow
cp .env.example .env   # set ECODELIVERY_API_EMAIL/PASSWORD
docker compose build
docker compose up -d
```

UI at **`http://localhost:8081`** (mapped off the default `8080`, which was
taken by another local Airflow instance — change it back in
`docker-compose.yaml` if `8080` is free for you).

Trigger the DAG (`etl_pedidos_diario`) from the UI, or run it once without
waiting for the scheduler:

```bash
docker compose exec airflow-scheduler airflow dags test etl_pedidos_diario "$(date +%F)"
```

It logs into the API, pulls `GET /pedidos`, computes delivery-time/status/
revenue metrics with pandas, writes 3 CSVs and regenerates
`dashboard_ecodelivery.html` — a self-contained dashboard (KPIs, charts,
status filter) — all in `airflow/output/`, refreshed on every run.

## Power BI

No Linux build for Desktop and the web version is too limited without a
tenant, so `dashboard_ecodelivery.html` (built from the same CSVs) is the
substitute deliverable for that module.

## Assumptions & known gaps

- Roles (`cliente` creates orders, `repartidor` updates status) aren't in
  the brief — added because the Flutter app models both user types.
- No `dataset_pedidos_semilla.csv` was provided; `prisma/seed.ts` generates
  equivalent sample data instead.
- Airflow doesn't write back to Postgres (dropped — unreliable with this
  provider version, CSVs/dashboard already cover the requirement).
- The dashboard doesn't live-refresh an open browser tab; reload it after a
  new DAG run.
- No automated tests for `orders`/`auth` beyond manual end-to-end checks.
