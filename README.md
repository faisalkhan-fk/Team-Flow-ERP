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
│   └── React Application
├── backend/
│   ├── server.js
│   ├── controllers/
│   └── middleware/
└── README.md
```

## ⚙️ Installation & Setup

### Prerequisites

- Node.js and npm
- Git
- MongoDB (as configured for the application)

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

## 📡 API Overview

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | Health check |
| GET | `/api/employees` | Fetch employees |
| POST | `/api/employees` | Create employee |
| PUT | `/api/employees/:id` | Update employee |
| DELETE | `/api/employees/:id` | Delete employee |
| GET | `/api/projects` | Fetch projects |
| GET | `/api/tasks` | Fetch tasks |
| POST | `/api/tasks` | Create task |
| PATCH | `/api/tasks/:id` | Update task status |

## 🎯 Project Objective

The objective of TeamFlow ERP is to improve employee management, simplify task allocation, monitor project progress, and demonstrate practical implementation of full-stack web development concepts.

## 🔮 Future Enhancements

- Enhanced authentication and authorization
- Automated notifications
- Advanced reporting and analytics
- AI-based task recommendations

## 👨‍💻 Author

**Faisal Khan**

GitHub: [faisalkhan-fk](https://github.com/faisalkhan-fk)

## 📄 License

Add a suitable open-source license if you intend to distribute this project under one.
