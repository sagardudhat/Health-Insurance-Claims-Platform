# Health Insurance Claims Platform

A comprehensive, production-grade monorepo containing a decoupled frontend and backend for managing the complete lifecycle of medical claims, built for Providers, Reviewers, and System Administrators.

## 🏗 Architecture Overview

This project is structured as a **Decoupled Monorepo**. This means the frontend and backend live in the same Git repository for ease of development, but they are completely independent projects.

- They do **not** share a root `package.json`.
- They have completely isolated dependencies, linting rules, and formatting configurations.
- They are deployed as separate microservices.

## 📂 Project Navigation

The repository is split into two primary workspaces. Please refer to their individual READMEs for detailed setup instructions, environment variables, and architecture diagrams:

### 1. [Backend Service](./backend/README.md)
The RESTful API handling business logic, the claim state machine, MongoDB database operations, file uploads, and fraud detection algorithms.
- **Tech**: Node.js, Express, MongoDB, TypeScript
- **Path**: `/backend`

### 2. [Frontend Web App](./frontend/README.md)
The highly-interactive client portal containing the Provider Dashboard, Reviewer Queue, and Admin Control Panel.
- **Tech**: Next.js 14, Tailwind CSS, React Query
- **Path**: `/frontend`

## 🚀 DevOps & Deployment

If you are a DevOps engineer looking to build, test, and deploy this application in a production environment, please refer to the dedicated handoff guide:

👉 **[Read the DevOps Handoff Guide](./DEVOPS_HANDOFF.md)**

## 👨‍💻 Quick Start (Local Development)

Because the projects are completely decoupled, you must start them in separate terminal windows.

**Terminal 1 (Backend):**
```bash
cd backend
npm install
npm run dev
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm install
npm run dev
```
