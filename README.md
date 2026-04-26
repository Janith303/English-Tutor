# 🎓 English Learning Platform

An intelligent, university-based English learning platform designed to elevate students' academic communication skills, focusing on grammar, writing, and speaking through data-driven insights.

---

## 👥 Contributors

| Name | Role | GitHub |
| :--- | :--- | :--- |
| **Ruwanthi Thennakoon** | [@ruwanthi-t](https://github.com/ruwanthiThe) |
| **Janith Dissanayaka**  | [@janith-d](https://github.com/Janith303) |
| **Thilina Gunasekara**  | [@thilina-g](https://github.com/thilina250981) |
| **Sanooda Abeysinghe**  | [@sanooda-a](https://github.com/sanuwa13) |

> *Note: Please replace the placeholder links above with the actual GitHub profile URLs.*

---

## 🚀 Key Features

* **Secure Authentication:** Student registration with OTP email verification.
* **Personalized Experience:** Custom learning dashboards based on user progress.
* **Skill Detection:** Initial placement tests to determine proficiency levels.
* **Intelligent Logic:** * Smart daily quizzes and question routing.
    * Advanced tutor recommendation system.
* **Academic Community:** * Q&A wall for collaborative learning.
    * Support for anonymous question posting.
* **Management Suite:** Comprehensive Admin and Tutor dashboards for user oversight.

---

## 🛠️ Technologies Used

### **Frontend**
* **React.js** (UI Library)
* **Tailwind CSS** (Styling)

### **Backend**
* **Django** & **Django REST Framework** (API & Logic)
* **SQLite** (Development Database)
* **PostgreSQL** (Production Ready)

### **DevOps & Deployment**
* **GitHub** (Version Control)
* **Vercel** (Frontend Hosting)
* **Render** (Backend Hosting)

---

## 📁 Folder Structure

```text
ENGLISH-TUTOR/
├── Backend/
│   ├── api/                  # Django Apps / API logic
│   ├── backend_config/       # Project settings and WSGI/ASGI
│   ├── media/                # User uploaded files
│   ├── venv/                 # Python Virtual Environment
│   ├── verification/         # Student ID & document storage
│   ├── .env                  # Environment variables
│   ├── db.sqlite3            # SQLite Database
│   └── manage.py             # Django management script
│
├── frontend/                 # React.js application
│   ├── src/                  # Components and logic
│   ├── public/               # Static assets
│   └── package.json          # Node dependencies
│
└── .gitignore                # Git ignore rules
