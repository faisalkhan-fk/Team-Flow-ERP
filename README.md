# 🚀 TeamFlow ERP – Employee, Project & Task Management System

### Full-Stack MERN Application | Academic Syllabus Project (Units 1–5)

## 📌 Project Overview

TeamFlow ERP is a web-based Employee, Project & Task Management System designed to simplify employee management, task assignment, and project tracking. It also demonstrates concepts covered in the React, Node.js, Express.js, and MongoDB syllabus.

## ✨ Features

- **Employee Management:** Add, view, update, and delete employee records.
- **Project Management:** View projects and track project progress.
- **Task Management:** Create tasks and manage task status through a Kanban workflow.
- **Dashboard & Analytics:** Display employee statistics and department analytics.
- **REST API Integration:** Perform CRUD operations using Axios.
- **React Routing:** Navigation using React Router and lazy loading.
- **State Management:** Manage application state using React Hooks, Context API, and useReducer.
- **Node.js File System:** Demonstrate file writing, reading, appending, and deletion.
- **Error Handling:** Express middleware, request logging, and centralized error handling.
- **Reporting & Export Center:** Generate and download official PDF, Excel, and CSV corporate telemetry reports.

## 🛠️ Technology Stack

- **Frontend:** React.js 19, Vite, HTML, CSS, JavaScript
- **Backend:** Node.js, Express.js
- **Database:** MongoDB, Mongoose
- **API Communication:** Axios, REST APIs
- **Tools:** VS Code, Git, GitHub

## 📚 Syllabus Coverage

| Unit | Topics Covered |
|---|---|
| Unit 1 | React Fundamentals, JSX, Components, Props, Conditional Rendering, Forms |
| Unit 2 | React Router, Lazy Loading, React Hooks, Context API, useReducer |
| Unit 3 | REST API Integration, Axios, CRUD Operations |
| Unit 4 | Node.js, Async Programming, File System, Sync vs Async |
| Unit 5 | Express.js, Middleware, REST APIs, MongoDB, Mongoose, Aggregation |

## 📂 Project Structure

```text
Team-Flow-ERP/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   └── pages/
│   ├── package.json
│   └── vercel.json
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── package.json
│   └── server.js
├── vercel.json
└── README.md
```

## ⚙️ Local Installation & Setup

### Prerequisites

- Node.js (v18+) and npm
- Git
- MongoDB (Local or MongoDB Atlas)

### 1. Clone the Repository

```bash
git clone https://github.com/faisalkhan-fk/Team-Flow-ERP.git
cd Team-Flow-ERP
```

### 2. Start the Backend

```bash
cd backend
npm install
node server.js
```

Backend URL: `http://localhost:5000`

### 3. Start the Frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend URL: `http://localhost:5173`

---

## 🌐 Cloud Deployment Guide (100% Free Setup)

### 1. Database: MongoDB Atlas
- Create a free **M0 Sandbox** cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
- Whitelist all IPs (`0.0.0.0/0`) in Network Access.
- Copy your Connection String (`mongodb+srv://<user>:<password>@cluster0.mongodb.net/teamflow`).

### 2. Backend API: Render.com (Web Service)
- Create a new **Web Service** on [Render](https://render.com) connected to this repository.
- Root Directory: `backend`
- Build Command: `npm install`
- Start Command: `node server.js`
- Environment Variables:
  - `PORT`: `5000`
  - `NODE_ENV`: `production`
  - `MONGO_URI`: `your-atlas-connection-string`
  - `EMAIL_USER`: `your-gmail@gmail.com`
  - `EMAIL_PASS`: `your-16-char-app-password`

### 3. Frontend App: Vercel (Vite)
- Import this repository on [Vercel](https://vercel.com).
- Framework Preset: `Vite`
- Root Directory: `frontend`
- Build Command: `npm run build`
- Output Directory: `dist`
- Environment Variables:
  - `VITE_API_URL`: `https://your-backend-app.onrender.com`

---

## 📡 API Overview

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | System Health check |
| GET | `/api/employees` | Fetch all employees |
| POST | `/api/employees` | Create employee record |
| PUT | `/api/employees/:id` | Update employee record |
| DELETE | `/api/employees/:id` | Delete employee record |
| GET | `/api/projects` | Fetch all projects |
| PATCH | `/api/projects/:id/progress` | Update project progress |
| GET | `/api/tasks` | Fetch Kanban tasks |
| POST | `/api/tasks` | Create task |
| PATCH | `/api/tasks/:id` | Update task status |
| GET | `/api/attendance` | Attendance telemetry |
| GET | `/api/leaves` | Leave management |
| GET | `/api/node-fs/benchmark`| Node.js sync vs async file system benchmark |

## 🎯 Project Objective

The objective of TeamFlow ERP is to improve employee management, simplify task allocation, monitor project progress, and demonstrate practical implementation of full-stack web development concepts.

## 👨‍💻 Author

**Faisal Khan**

GitHub: [faisalkhan-fk](https://github.com/faisalkhan-fk)

## 📄 License

MIT License
