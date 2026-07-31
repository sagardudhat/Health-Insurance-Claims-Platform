# ClaimCare - Backend API

The ClaimCare backend is a robust REST API built with Node.js, Express, and TypeScript. It serves as the central data authority for the ClaimCare platform, handling user authentication, strict role-based access control, complex claim adjudication logic, and document storage.

## 🏗 Architecture

The backend strictly follows a **3-Tier Layered Architecture**:
1. **Controllers (`src/controllers`)**: Handle HTTP requests, parsing parameters, and delegating to services. They handle formatting the standard JSON response using `buildSuccess` and `buildError` utilities.
2. **Services (`src/services`)**: Contain the core business logic, validation, state machine transitions, and orchestrate multiple repositories if necessary.
3. **Repositories (`src/repositories`)**: Encapsulate all database interaction and Mongoose queries, isolating the database layer from the business logic.

## 🛠 Tech Stack
- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose
- **Validation**: Zod
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: bcrypt

## 📂 Directory Structure

```text
src/
├── config/        # Environment variables and constants
├── controllers/   # Express route handlers
├── middleware/    # Auth, Role Guards, Error Handlers, Multer
├── models/        # Mongoose Schemas (User, Claim)
├── repositories/  # Database access layer
├── routes/        # Express router definitions
├── services/      # Core business logic
└── utils/         # Helper functions (API responses, API Error)
```

## 🚀 Setup & Installation

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Variables
Create a `.env` file in the root of the `backend` folder:
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/claimcare
JWT_SECRET=your_jwt_secret
NODE_ENV=development
```

### 3. Start Development Server
```bash
npm run dev
```
The API will be available at `http://localhost:5000/api`.

### 4. Build for Production
```bash
npm run build
npm start
```

## 🛡 Validation & Error Handling
All incoming requests are validated against strict `Zod` schemas before hitting the controllers. 
Any errors thrown (like `AppError`) are caught by the global error handling middleware in `src/middleware/error.ts`, which returns standardized JSON error responses.
