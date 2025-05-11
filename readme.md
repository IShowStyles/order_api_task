# Order Management API


## Project Overview  
**Order Management API** is a learning-grade yet production-ready pet project that demonstrates the **full order-processing pipeline**—from the incoming HTTP request on the front-end, through an **atomic database transaction**, to a clean JSON response back to the client.  
The back end is built with **Node.js 20.18.2** and **Express**. Two database engines are supported out of the box—**PostgreSQL 15** and **MongoDB 6**—chosen at runtime via environment variables. Monetary values are handled with `Decimal.js` for deterministic arithmetic, and every critical operation is wrapped in a transaction so that network hiccups, insufficient balance, or out-of-stock items can never leave partial data behind. A built-in rate-limiter caps each user to **10 requests per minute**.  
The front end is written in **React 18**, uses **Zustand** for state, is built with **Vite**, and styled with **Tailwind CSS**.  

## Technology Stack  
| Layer            | Tech / Libraries                                                          | Purpose                                                            |
|------------------|---------------------------------------------------------------------------|--------------------------------------------------------------------|
| **Back-end**     | Node.js, Express, Prisma ORM, Winston, Jest, Supertest                     | REST API, business logic, transactions, logging, unit + integration tests |
| **Rate-limiting**| `express-rate-limit`                                                       | Per-user throttling                                                |
| **Front-end**    | React 18, React-Hook-Form, Vite, Tailwind CSS, Vitest                      | UI, API calls, form validation, component tests                    |
| **Dev Ops**      | Docker, Docker Compose,                                                    | Containerisation, CI/CD, coverage reports                          |
| **Database**     | PostgreSQL 15                 | Persisting users, products, orders                                 |

## Quick Start

### Prerequisites
* **Node.js ≥ 20.18.2**  
* **Docker & Docker Compose** (tested with Docker 24)  
* Free ports **4000**, **5173**, **5432** (when PostgreSQL is used)  

### Clone the repository
```bash
git clone https://github.com/your-org/order-management-api.git
cd order-management-api
```
### Envarioment variables 
  **Already pre-setuped in docker-compose.yml**


### Run Application
  ```bash
  docker-compose up --build 
  ```

### Test
  ```bash
    cd api && npm run test --clearCache
  ```