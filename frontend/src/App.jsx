// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./components/home/Home";
import Login from "./components/home/login";
import SignUp from "./components/home/singup"; 
import BecomeTutor from "./components/home/becometutor";
import PersonalizedLearningHub from "./components/learner/PersonalizedLearningHub";
import QuizHome from "./components/quiz/QuizHome";
import LearnerDashboard from "./components/learner/LearnerDashboard";
import StudentDashboard from "./components/student/StudentDashboard";
import StudentSignUp from "./components/studentsignup/mailverify";
import StudentSignUpStep2 from "./components/studentsignup/interest";
import PlacementTest from "./components/studentsignup/placementtest";
import QandAPage from "./components/qa/QandAPage";
import Studenttutor from "./components/stutorsignup/verify";
import Stexperiance from "./components/stutorsignup/experiance"; // Check if 'experience'
import Stmailverify from "./components/stutorsignup/stmailverify";
import TutorSignup from "./components/tutorsignup/tsignup";
import MyLearningPage from "./components/mylearning/MyLearningPage";
import TutorDetailsPage from "./components/learner/TutorDetailsPage";

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/becometutor" element={<BecomeTutor />} />

        {/* Dashboard & Learning */}
        <Route path="/dashboard" element={<LearnerDashboard />} />
        <Route path="/student-dashboard" element={<StudentDashboard />} />
        <Route path="/my-learning" element={<MyLearningPage />} />
        <Route path="/learning/:courseId" element={<PersonalizedLearningHub />} />
        <Route path="/course/:courseId" element={<TutorDetailsPage />} />
        
        {/* Features */}
        <Route path="/quiz" element={<QuizHome />} />
        <Route path="/qa" element={<QandAPage />} />

        {/* Student Signup Flow */}
        <Route path="/signup/sverify" element={<StudentSignUp />} />
        <Route path="/signup/interests" element={<StudentSignUpStep2 />} />
        <Route path="/signup/test" element={<PlacementTest />} />

        {/* Tutor/Combined Signup Flow */}
        <Route path="/stsignup/stverify" element={<Studenttutor />} />
        <Route path="/stsignup/stexperiance" element={<Stexperiance />} />
        <Route path="/stsignup/mailverify" element={<Stmailverify />} />
        <Route path="/tutor/stverify" element={<TutorSignup />} />
      </Routes>
    </Router>
  );
}

export default App;