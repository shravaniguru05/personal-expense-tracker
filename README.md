# 💰 Personal Expense Tracker — Full-Stack Web Application

A modern, responsive, beginner-friendly **Personal Expense Tracker** built with **FastAPI (Python)**, **React.js (Vite)**, **Tailwind CSS**, and **SQLite**. Designed for desktop, tablet, and mobile devices with production-ready Docker containerization and GitHub Actions CI/CD workflows.

---

## 📋 Table of Contents
- [Project Overview](#project-overview)
- [Key Features](#key-features)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Quick Start: Local Development](#quick-start-local-development)
  - [1. Backend Setup (FastAPI)](#1-backend-setup-fastapi)
  - [2. Frontend Setup (React + Vite)](#2-frontend-setup-react--vite)
- [Running Automated Tests](#running-automated-tests)
- [Running with Docker & Docker Compose](#running-with-docker--docker-compose)
- [API Endpoints Reference](#api-endpoints-reference)
- [Step-by-Step GitHub Setup & Push](#step-by-step-github-setup--push)
- [Verification Checklist](#verification-checklist)
- [Deployment Next Steps](#deployment-next-steps)

---

## 🌟 Project Overview

The **Personal Expense Tracker** enables users to record, organize, analyze, and monitor their daily financial transactions. All monetary computations use exact decimal precision (preventing floating-point rounding errors) and are displayed in **INR (₹)** using Indian numbering standards (Lakhs & Crores).

### Highlight Features:
- 📊 **Dynamic Dashboard**: Real-time KPI cards for Total Income, Total Expenses, Current Balance ($Income - Expense$), and Monthly Savings.
- 📉 **Interactive Visualizations (Recharts)**:
  - Donut Chart: Categorical expenditure distribution.
  - Bar Chart: Monthly Income vs Expenses comparison.
  - Area/Line Chart: Daily spending trends and volatility.
- 💳 **Transaction Management**: Record income and expense entries with amount, category, payment method (UPI, Cash, Cards, Net Banking), and notes. Real-time search, sorting, and pagination.
- 🎯 **Budget Management**: Set overall monthly spending limits and category-specific budgets. Visual progress bars feature an **80% threshold warning** and a **100%+ exceeded limit alert**.
- 📈 **Reports & CSV Export**: Periodic financial statements, category breakdowns, and 1-click transaction export to CSV.
- 🛠️ **Demo Data Generator & Reset**: 1-click button to populate realistic sample data for instant demonstrations, and a 1-click reset button.

---

## 🛠️ Technology Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | React 18 + Vite | Fast, responsive single-page application |
| **Styling** | Tailwind CSS | Modern, clean UI styling |
| **Charts** | Recharts | Interactive SVG charts |
| **Icons** | Lucide React | Lightweight, clean iconography |
| **Backend** | Python FastAPI | High-performance asynchronous REST API |
| **ORM** | SQLAlchemy 2.0 | Type-safe database operations |
| **Data Validation**| Pydantic v2 | Strict schema validation |
| **Database** | SQLite | Lightweight, zero-config relational database |
| **Backend Tests**| Pytest + TestClient | Automated API and business logic tests |
| **Frontend Tests**| Vitest | Client-side unit and formatter tests |
| **Containers** | Docker & Docker Compose | Multi-container reproducible deployment |
| **CI/CD** | GitHub Actions | Automated build and test pipeline |

---

## 📂 Project Structure

```text
personal-expense-tracker/
├── .github/
│   └── workflows/
│       └── ci.yml               # Automated CI pipeline for tests & build
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI app instance, CORS & lifespan
│   │   ├── database.py          # SQLAlchemy engine, session & declarative base
│   │   ├── models/              # Database models (Category, Transaction, Budget)
│   │   ├── schemas/             # Pydantic schemas for validation & responses
│   │   ├── routes/              # Modular API endpoints
│   │   └── services/            # Analytics calculations, seeding, CSV export
│   ├── tests/                   # Pytest test suite (14 passing tests)
│   ├── requirements.txt         # Backend Python dependencies
│   └── Dockerfile               # Production multi-stage Docker build
├── frontend/
│   ├── src/
│   │   ├── api/                 # Axios API service clients
│   │   ├── components/          # Reusable UI & modal components
│   │   ├── pages/               # Dashboard, Transactions, Budgets, Reports, Settings
│   │   ├── utils/               # Indian Currency (₹) and date formatters
│   │   ├── App.jsx              # React router configuration
│   │   └── main.jsx             # React entry point
│   ├── package.json             # Frontend NPM scripts & dependencies
│   ├── vite.config.js           # Vite dev proxy & Vitest config
│   ├── tailwind.config.js       # Tailwind CSS design system
│   ├── nginx.conf               # Production Nginx reverse-proxy config
│   ├── Dockerfile               # Production multi-stage Node + Nginx build
│   └── .env.example             # Frontend environment variables template
├── docker-compose.yml           # Multi-container orchestration & volumes
├── .gitignore                   # Git exclusions (venv, node_modules, .db, secrets)
├── .env.example                 # Root environment variables template
└── README.md                    # Project documentation
```

---

## ⚙️ Prerequisites

Before running the application locally, ensure you have:
1. **Python 3.10+** installed
2. **Node.js 18+** and **npm** installed
3. **Git** installed
4. *(Optional for containers)* **Docker & Docker Compose**

---

## 🚀 Quick Start: Local Development

Open your terminal in **VS Code** inside the project root: `personal expense tracker`.

### 1. Backend Setup (FastAPI)

1. Navigate to the backend folder:
   ```bash
   cd backend
   ```

2. Create and activate a Python virtual environment:
   - **Windows (PowerShell)**:
     ```powershell
     python -m venv venv
     .\venv\Scripts\Activate.ps1
     ```
   - **macOS / Linux**:
     ```bash
     python3 -m venv venv
     source venv/bin/activate
     ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Start the FastAPI development server:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```
   - API is running at: `http://localhost:8000`
   - Interactive Swagger API docs: `http://localhost:8000/docs`

---

### 2. Frontend Setup (React + Vite)

Open a **new** terminal tab in VS Code:

1. Navigate to the frontend folder:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   - Frontend application is running at: `http://localhost:5173`

---

## 🧪 Running Automated Tests

### Run Backend Tests (Pytest)
In your backend terminal:
```bash
# Windows
$env:PYTHONPATH = "backend"
.\backend\venv\Scripts\pytest backend/tests -v

# macOS / Linux
PYTHONPATH=backend pytest backend/tests -v
```

### Run Frontend Tests (Vitest)
In your frontend terminal:
```bash
cd frontend
npm test
```

### Run Frontend Production Build Check
```bash
cd frontend
npm run build
```

---

## 🐳 Running with Docker & Docker Compose

Docker Compose builds both the backend and frontend into isolated production containers with persistent SQLite storage.

1. Ensure Docker Desktop is running on your machine.
2. From the project root, run:
   ```bash
   docker-compose up --build
   ```
3. Open your browser:
   - **Web Application**: `http://localhost` (Port 80)
   - **Backend API**: `http://localhost:8000/api/health`
4. Stop the containers:
   ```bash
   docker-compose down
   ```

---

## 📡 API Endpoints Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Healthcheck status indicator |
| `GET` | `/api/dashboard/summary` | Dashboard KPIs, charts, and budget summary |
| `POST` | `/api/dashboard/seed-demo` | Populates realistic sample demo transactions |
| `POST` | `/api/dashboard/reset-data` | Resets all transaction records |
| `GET` | `/api/transactions` | Paginated, filtered, and sorted transactions |
| `POST` | `/api/transactions` | Record new income or expense transaction |
| `GET` | `/api/transactions/{id}` | Get transaction details by ID |
| `PUT` | `/api/transactions/{id}` | Update existing transaction |
| `DELETE` | `/api/transactions/{id}` | Delete transaction record |
| `GET` | `/api/transactions/export/csv` | Download transactions as CSV file |
| `GET` | `/api/budgets` | Get overall and category budget statuses |
| `POST` | `/api/budgets` | Set or update monthly budget |
| `DELETE` | `/api/budgets/{id}` | Delete budget rule |
| `GET` | `/api/categories` | List expense and income categories |
| `POST` | `/api/categories` | Create custom category |
| `PUT` | `/api/categories/{id}` | Update category |
| `DELETE` | `/api/categories/{id}` | Delete category |
| `GET` | `/api/reports/analytics` | Periodic summary reports & analytics |

---

## 🐙 Step-by-Step GitHub Setup & Push

Follow these steps to create a GitHub repository and push your project:

1. **Check Git Status**:
   ```bash
   git status
   ```

2. **Stage all files and make your initial commit**:
   ```bash
   git add .
   git commit -m "feat: complete personal expense tracker full-stack app with DevOps CI"
   ```

3. **Create a new repository on GitHub**:
   - Go to [GitHub.com](https://github.com) and click **New Repository**.
   - Name it `personal-expense-tracker`.
   - Choose **Public** or **Private**.
   - **Do NOT** initialize with a README, .gitignore, or license (these already exist in the project).
   - Click **Create repository**.

4. **Link and Push your code**:
   *(Replace `<YOUR_GITHUB_USERNAME>` with your GitHub username)*:
   ```bash
   git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/personal-expense-tracker.git
   git branch -M main
   git push -u origin main
   ```

5. **Verify GitHub Actions**:
   - Navigate to the **Actions** tab in your repository.
   - The CI pipeline will automatically trigger, install dependencies, run tests, and verify the production build.

---

## ✅ Verification Checklist

- [x] Backend FastAPI server runs without errors
- [x] Frontend React (Vite) compiles and renders cleanly
- [x] Database tables initialize automatically on startup
- [x] All 14 backend Pytest tests pass cleanly
- [x] Frontend Vitest tests pass cleanly
- [x] Frontend production build (`npm run build`) completes with 0 errors
- [x] Currency is formatted in Indian Rupee format: `₹1,00,000.00`
- [x] 80% and 100% budget threshold warning banners function correctly
- [x] CSV export downloads a formatted file
- [x] 1-Click demo data seeding and database reset work smoothly
- [x] Dockerfile and docker-compose.yml are configured for persistent SQLite storage
- [x] GitHub Actions CI workflow is configured under `.github/workflows/ci.yml`

---

## 🚀 Suggested Next Steps for Online Deployment

1. **Backend Hosting**:
   - Deploy the backend on **Render.com**, **Railway.app**, or **Fly.io** using the provided `Dockerfile`.
   - Set environment variable `FRONTEND_ORIGINS` to your production frontend URL.
2. **Frontend Hosting**:
   - Deploy the frontend on **Vercel** or **Netlify**.
   - Set environment variable `VITE_API_URL` to your live backend URL.
3. **Database Migration to PostgreSQL (Optional)**:
   - When deploying at scale, simply change the `DATABASE_URL` environment variable from `sqlite:///...` to your managed PostgreSQL connection string (`postgresql://user:pass@host:5432/dbname`). SQLAlchemy will handle the rest!
