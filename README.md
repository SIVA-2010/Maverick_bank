# 🏛️ Maverick Bank — Full Stack Banking System

A complete Banking & Financial System built with **Java Spring Boot**, **React**, **MySQL**, and **AWS**.

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      AWS Cloud                          │
│  ┌────────────┐    ┌──────────────┐    ┌─────────────┐  │
│  │   React    │───▶│ Spring Boot  │───▶│  AWS RDS    │  │
│  │  Frontend  │    │   Backend    │    │  (MySQL)    │  │
│  │  (Nginx)   │    │  Port 8080   │    │             │  │
│  │  Port 80   │    │  JWT + REST  │    │             │  │
│  └────────────┘    └──────────────┘    └─────────────┘  │
│       EC2 Instance                                       │
└─────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start — Local Development

### Prerequisites
- Java 17+
- Node.js 18+
- MySQL 8.0+ (or Docker)
- Maven 3.9+

### Option A — Docker Compose (Recommended)
```bash
# Clone and start all services
git clone <repo-url>
cd maverick-bank
docker-compose up --build -d

# App URLs:
#   Frontend: http://localhost:3000
#   Backend:  http://localhost:8080/api
#   Swagger:  http://localhost:8080/api/swagger-ui.html
```

### Option B — Manual Setup

**1. Database**
```sql
CREATE DATABASE maverick_bank;
-- Run: infrastructure/mysql/init.sql
```

**2. Backend**
```bash
cd backend
cp src/main/resources/application.properties src/main/resources/application-local.properties
# Edit DB credentials in application-local.properties
mvn spring-boot:run -Dspring-boot.run.profiles=local
```

**3. Frontend**
```bash
cd frontend
npm install
REACT_APP_API_URL=http://localhost:8080/api/v1 npm start
```

---

## 🔐 Default Login Credentials

| Role          | Email                          | Password        |
|---------------|--------------------------------|-----------------|
| Admin         | admin@maverickbank.com         | Admin@1234      |
| Bank Employee | employee@maverickbank.com      | Employee@1234   |
| Customer      | Register via /register page    | Your choice     |

---

## 📋 API Endpoints Summary

### Authentication (`/api/v1/auth`)
| Method | Endpoint    | Description        |
|--------|-------------|-------------------|
| POST   | /register   | Customer registration |
| POST   | /login      | Login (all roles) |

### Customer Accounts (`/api/v1/customer/accounts`)
| Method | Endpoint                          | Description         |
|--------|-----------------------------------|---------------------|
| POST   | /open                             | Open new account    |
| GET    | /                                 | My accounts         |
| GET    | /{accountNumber}                  | Account details     |
| POST   | /{accountNumber}/close-request    | Request closure     |

### Customer Transactions (`/api/v1/customer/transactions`)
| Method | Endpoint                          | Description              |
|--------|-----------------------------------|--------------------------|
| POST   | /                                 | Deposit/Withdraw/Transfer|
| GET    | /{accountNumber}/last10           | Last 10 transactions     |
| GET    | /{accountNumber}/last-month       | Last month transactions  |
| GET    | /{accountNumber}/by-date          | Transactions by date     |
| GET    | /{accountNumber}/summary          | Account summary          |

### Customer Loans (`/api/v1/customer/loans`)
| Method | Endpoint    | Description          |
|--------|-------------|---------------------|
| GET    | /products   | Available loan types |
| POST   | /apply      | Apply for loan       |
| GET    | /my-loans   | My loan applications |

### Employee (`/api/v1/employee`)
| Method | Endpoint                          | Description             |
|--------|-----------------------------------|-------------------------|
| GET    | /accounts/pending                 | Pending approvals       |
| PUT    | /accounts/{id}/approve            | Approve account         |
| PUT    | /accounts/{id}/close              | Close account           |
| GET    | /loans/pending                    | Pending loan apps       |
| POST   | /loans/decision                   | Approve/Reject loan     |
| POST   | /loans/{id}/disburse              | Disburse loan           |

### Admin (`/api/v1/admin`)
| Method | Endpoint               | Description           |
|--------|------------------------|-----------------------|
| POST   | /employees             | Create employee       |
| GET    | /employees             | All employees         |
| PUT    | /users/{id}/status     | Update user status    |
| DELETE | /users/{id}            | Deactivate user       |

---

## 🏗️ Project Structure

```
maverick-bank/
├── backend/
│   └── src/main/java/com/maverickbank/
│       ├── config/          # Security, Swagger, CORS
│       ├── controller/      # REST Controllers
│       ├── dto/             # Request/Response DTOs
│       │   ├── request/
│       │   └── response/
│       ├── entity/          # JPA Entities
│       ├── enums/           # Java Enums
│       ├── exception/       # Custom exceptions + global handler
│       ├── repository/      # Spring Data JPA repositories
│       ├── security/        # JWT provider + filter
│       ├── service/impl/    # Business logic services
│       └── util/            # Utilities, Swagger config
├── frontend/
│   └── src/
│       ├── assets/styles/   # Global CSS
│       ├── components/
│       │   └── layout/      # Sidebar, PageLayout, Topbar
│       ├── context/         # AuthContext (global state)
│       ├── pages/
│       │   ├── customer/    # Dashboard, Accounts, Transactions, Loans, Beneficiaries
│       │   ├── employee/    # Dashboard, Approvals, Loan Review, Reports
│       │   └── admin/       # Dashboard, Manage Users
│       └── services/        # Axios API service layer
└── infrastructure/
    ├── mysql/               # DB init + seed SQL
    ├── aws/                 # buildspec.yml for CodeBuild
    └── AWS_DEPLOYMENT.sh    # Step-by-step AWS guide
```

---

## ☁️ AWS Deployment

### Services Used
| AWS Service     | Purpose                          |
|-----------------|----------------------------------|
| EC2 (t3.small)  | Docker host for frontend+backend |
| RDS MySQL       | Managed database                 |
| ECR             | Private Docker image registry    |
| CodePipeline    | CI/CD pipeline                   |
| CodeBuild       | Build, test, and push images     |
| SSM             | Remote command execution         |
| Parameter Store | Secrets management               |

### Deploy Steps
```bash
# See infrastructure/AWS_DEPLOYMENT.sh for full instructions
# See infrastructure/aws/buildspec.yml for CI/CD pipeline config
```

---

## 🧪 Running Tests

```bash
cd backend
mvn test                           # Run all unit tests
mvn test -pl . -Dtest=AuthServiceTest  # Specific test
```

---

## 🛡️ Security Features

- **JWT Authentication** — HS512-signed tokens, configurable expiry
- **Role-Based Access Control** — CUSTOMER / BANK_EMPLOYEE / ADMIN
- **BCrypt Password Hashing** — Strength factor 10
- **CORS Protection** — Configurable allowed origins
- **Input Validation** — Bean Validation on all request DTOs
- **Global Exception Handler** — User-readable error messages
- **Security Headers** — X-Frame-Options, X-Content-Type-Options via Nginx

---

## 📦 Tech Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Frontend   | React 18, TypeScript, React Router  |
| Styling    | Custom CSS with CSS Variables       |
| HTTP       | Axios with JWT interceptors         |
| Backend    | Java 17, Spring Boot 3.2            |
| Security   | Spring Security + JWT (jjwt 0.11)  |
| ORM        | Spring Data JPA + Hibernate         |
| Database   | MySQL 8.0 (AWS RDS)                 |
| Docs       | SpringDoc OpenAPI 2 (Swagger UI)    |
| Tests      | JUnit 5 + Mockito                   |
| Docker     | Multi-stage builds (Alpine)         |
| CI/CD      | AWS CodePipeline + CodeBuild        |
| Registry   | AWS ECR                             |
