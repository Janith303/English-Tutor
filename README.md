# 🎓 English Learning Platform

An intelligent university-based English learning platform designed to improve students' academic communication skills, including grammar, writing, and speaking.

---

## 🚀 Features

* Student Registration with OTP Email Verification
* Personalized Learning Dashboard
* Adevance Tutor Recommended 
* Placement Test for Skill Detection
* Student Tutor & Tutor System
* Admin Dashboard for User & Tutor Management
* Q&A Academic Community
* Interligent Daily quize
* Interligent Quection routing
* Anonymous quection posting in QA wall
* 

---

## 🛠️ Technologies Used

### Frontend

* React.js
* Tailwind CSS

### Backend

* Django
* Django REST Framework

### Database

* SQLite (Development)
* PostgreSQL (Production - optional)

### DevOps / Deployment

* GitHub (Version Control)
* Vercel (Frontend Deployment)
* Render (Backend Deployment)

---

## 📁 Folder Structure

```
ENGLISH-TUTOR/
│
├── Backend/
│   ├── api/                      # Django Apps / API logic
│   ├── backend_config/           # Project settings and WSGI/ASGI
│   ├── media/                    # User uploaded files
│   ├── venv/                     # Python Virtual Environment
│   ├── verification\student_ids/ # Verification document storage
│   ├── .env                      # Environment variables
│   ├── db.sqlite3                # SQLite Database
│   ├── manage.py                 # Django management script
│   └── package-lock.json         # Backend dependency lock
│
├── frontend/                     # React.js application
│   ├── src/
│   ├── public/
│   └── package.json
│
├── .gitattributes
└── .gitignore
```

---

## ⚙️ Setup Instructions

### 🔹 1. Clone Repository

```
git clone https://github.com/your-username/your-repo-name.git
cd your-repo-name
```

---

## 🖥️ Backend Setup (Django)

### Navigate to backend

```
cd backend
```

### Create Virtual Environment

```
python -m venv venv
```

### Activate Virtual Environment

```
venv\Scripts\activate   (Windows)
source venv/bin/activate (Mac/Linux)
```

### Install Dependencies

```
pip install -r requirements.txt
```

### Apply Migrations

```
python manage.py makemigrations
python manage.py migrate
```

### Run Server

```
python manage.py runserver
```

Backend runs on:
http://127.0.0.1:8000/

---

## 🌐 Frontend Setup (React)

### Navigate to frontend

```
cd frontend
```

### Install Dependencies

```
npm install
```

### Run React App

```
npm run dev
```

Frontend runs on:
http://localhost:3000/

---

## 🔗 API Integration

Update API URL in frontend:

```
http://127.0.0.1:8000/api/
```

---

## 🔐 Environment Variables (Optional)

Create a `.env` file in backend:

```
SECRET_KEY=your_secret_key
DEBUG=True
```

---

## 📦 Deployment

* Frontend → Vercel
* Backend → Render

---

## 👨‍💻 Contributors

* Student 1 – Frontend / Signup
* Student 2 – Backend / API
* Student 3 – Dashboard
* Student 4 – Admin Panel

---

## 📌 Notes

* Ensure backend is running before starting frontend
* Check CORS settings if API errors occur
* Use virtual environment for backend

---

## ⭐ Future Improvements

* AI-based recommendation system
* Advanced analytics dashboard
* Real-time chat system

---

## 📄 License

This project is for educational purposes.
