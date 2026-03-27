// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/home/Home';
import Login from './components/home/login';
import SignUp from './components/home/singup';
import BecomeTutor from './components/home/becometutor';
import LearnerDashboard from "./components/pages/LearnerDashboard";
import QuizHome from "./components/quiz/QuizHome";
import StudentDashboard from "./components/student/StudentDashboard";
import StudentSignUp from "./components/studentsignup/mailverify";
import StudentSignUpStep2 from "./components/studentsignup/interest";
import PlacementTest from "./components/studentsignup/placementtest";
<<<<<<< HEAD
import Studenttutor from "./components/stutorsignup/verify";
import Stexperiance from "./components/stutorsignup/experiance";
import Stmailverify from "./components/stutorsignup/stmailverify";
=======
import QandAPage from './components/qa/QandAPage';
>>>>>>> 8c5e5b9 (Completed the q&a main page)

function App() {
  return (
    <Router>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/dashboard" element={<LearnerDashboard />} />
            <Route path="/quiz" element={<QuizHome />} />
            <Route path="/student-dashboard" element={<StudentDashboard />} />
            <Route path="/signup/sverify" element={<StudentSignUp />} />
            <Route path="/signup/interests" element={<StudentSignUpStep2 />} />
            <Route path="/signup/test" element={<PlacementTest />} />
<<<<<<< HEAD
            <Route path="/stsignup/stverify" element={<Studenttutor />} />
            <Route path="/stsignup/stexperiance" element={<Stexperiance />} />
            <Route path="/stsignup/mailverify" element={<Stmailverify />} />
            <Route path="/becometutor" element={<BecomeTutor />} />
=======
            <Route path="/qa" element={<QandAPage />} />
>>>>>>> 8c5e5b9 (Completed the q&a main page)
          </Routes>
    </Router>
  );
}

export default App;