// src/App.jsx
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  Navigate
} from "react-router-dom";
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
import DailyQuizStart from "./components/quiz/DailyQuizStart";
import DailyQuizGame from "./components/quiz/DailyQuizGame";
import DailyQuizResult from "./components/quiz/DailyQuizResult";
import VocabularyQuizStart from "./components/quiz/VocabularyQuizStart";
import VocabularyQuizGame from "./components/quiz/VocabularyQuizGame";
import VocabularyQuizResult from "./components/quiz/VocabularyQuizResult";
import GrammarQuizStart from "./components/quiz/GrammarQuizStart";
import GrammarQuizGame from "./components/quiz/GrammarQuizGame";
import GrammarQuizResult from "./components/quiz/GrammarQuizResult";
import ReadingQuizStart from "./components/quiz/ReadingQuizStart";
import ReadingQuizGame from "./components/quiz/ReadingQuizGame";
import ReadingQuizResult from "./components/quiz/ReadingQuizResult";
import IdiomsQuizStart from "./components/quiz/IdiomsQuizStart";
import IdiomsQuizGame from "./components/quiz/IdiomsQuizGame";
import IdiomsQuizResult from "./components/quiz/IdiomsQuizResult";
import WritingQuizStart from "./components/quiz/WritingQuizStart";
import WritingQuizGame from "./components/quiz/WritingQuizGame";
import WritingQuizResult from "./components/quiz/WritingQuizResult";
import SentenceQuizStart from "./components/quiz/SentenceQuizStart";
import SentenceQuizGame from "./components/quiz/SentenceQuizGame";
import SentenceQuizResult from "./components/quiz/SentenceQuizResult";
import QuizPlay from "./components/quiz/QuizPlay";
import QuizResult from "./components/quiz/QuizResult";
import TutorQandA from "./components/qa/TutorQandA";
import TutorDashboardPage from "./components/tutor/TutorDashboardPage";
import EditCoursePage from "./components/course/EditCoursePage";
import TutorCreateQuizPage from "./components/tutor/TutorCreateQuizPage";
import TutorLessonEditorPage from "./components/lesson/TutorLessonEditorPage";
import TutorLessonPreviewPage from "./components/lesson/TutorLessonPreviewPage";
import LessonReaderPage from "./components/lesson/LessonReaderPage";
import VibrantMeshBackground from "./components/ui/VibrantMeshBackground";
import Waitingapproval from "./components/home/waitingtoverify";
import Admin from "./components/admin/admindash";
import ForgotPassword from "./components/home/forgotpassword";

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("access_token");
  
  if (!token) {
    // If no token is found, kick them to the login page immediately
    return <Navigate to="/login" replace />;
  }
  
  // If they have a token, let them see the page
  return children;
};

function AppRoutes() {
  const location = useLocation();
  const hasGlobalMesh = location.pathname !== "/signup";

  return (
    <div
      className={`relative min-h-screen overflow-x-hidden ${hasGlobalMesh ? "app-mesh-scope app-mesh-active" : ""}`}
    >
      {hasGlobalMesh && <VibrantMeshBackground />}
      <div className={hasGlobalMesh ? "relative z-10" : ""}>
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
          <Route
            path="/learning/:courseId/lesson/:lessonId"
            element={<LessonReaderPage />}
          />
          <Route
            path="/learning/:courseId"
            element={<PersonalizedLearningHub />}
          />
          <Route path="/course/:courseId" element={<TutorDetailsPage />} />

          {/* Features */}
          <Route path="/quiz" element={<QuizHome />} />
          <Route path="/quiz/:id/play" element={<QuizPlay />} />
          <Route path="/quiz/:id/result" element={<QuizResult />} />
          <Route path="/qa" element={<QandAPage />} />
          <Route path="/tutor-qa" element={<TutorQandA />} />

          {/* Student Signup Flow */}
          <Route path="/signup/sverify" element={<StudentSignUp />} />
          <Route path="/signup/interests" element={<StudentSignUpStep2 />} />
          <Route path="/signup/test" element={<PlacementTest />} />

          {/* Tutor/Combined Signup Flow */}
          <Route path="/stsignup/stverify" element={<Studenttutor />} />
          <Route path="/stsignup/stexperiance" element={<Stexperiance />} />
          <Route path="/stsignup/mailverify" element={<Stmailverify />} />
          <Route path="/tutor/stverify" element={<TutorSignup />} />
          <Route path="/tutor/dashboard" element={<TutorDashboardPage />} />
          <Route path="/edit-course" element={<EditCoursePage />} />
          <Route
            path="/tutor/courses/:courseId/chapter/:chapterId/lesson/:lessonId/edit"
            element={<ProtectedRoute><TutorLessonEditorPage /></ProtectedRoute>}
          />
          <Route
            path="/tutor/courses/:courseId/chapter/:chapterId/lesson/:lessonId/preview"
            element={<ProtectedRoute><TutorLessonPreviewPage /></ProtectedRoute>}
          />
          <Route path="/tutor/create-quiz" element={<ProtectedRoute><TutorCreateQuizPage /></ProtectedRoute>} />
          <Route path="/tutor/edit-quiz/:id" element={<ProtectedRoute><TutorCreateQuizPage /></ProtectedRoute>} />

          <Route path="/daily-quiz" element={<ProtectedRoute><DailyQuizStart /></ProtectedRoute>} />
          <Route path="/daily-quiz/play" element={<ProtectedRoute><DailyQuizGame /></ProtectedRoute>} />
          <Route path="/daily-quiz/result" element={<ProtectedRoute><DailyQuizResult /></ProtectedRoute>} />
          <Route path="/vocabulary-quiz" element={<ProtectedRoute><VocabularyQuizStart /></ProtectedRoute>} />
          <Route
            path="/vocabulary-quiz/play"
            element={<ProtectedRoute><VocabularyQuizGame /></ProtectedRoute>}
          />
          <Route
            path="/vocabulary-quiz/result"
            element={<ProtectedRoute><VocabularyQuizResult /></ProtectedRoute>}
          />
          <Route path="/grammar-quiz" element={<ProtectedRoute><GrammarQuizStart /></ProtectedRoute>} />
          <Route path="/grammar-quiz/play" element={<ProtectedRoute><GrammarQuizGame /></ProtectedRoute>} />
          <Route path="/grammar-quiz/result" element={<ProtectedRoute><GrammarQuizResult /></ProtectedRoute>} />
          <Route path="/reading-quiz" element={<ProtectedRoute><ReadingQuizStart /></ProtectedRoute>} />
          <Route path="/reading-quiz/play" element={<ProtectedRoute><ReadingQuizGame /></ProtectedRoute>} />
          <Route path="/reading-quiz/result" element={<ProtectedRoute><ReadingQuizResult /></ProtectedRoute>} />
          <Route path="/waiting-approval" element={<Waitingapproval />} />
          <Route path="/admin/dashboard" element={<Admin />} />

          <Route path="/daily-quiz" element={<DailyQuizStart />} />
          <Route path="/daily-quiz/play" element={<DailyQuizGame />} />
          <Route path="/daily-quiz/result" element={<DailyQuizResult />} />
          <Route path="/vocabulary-quiz" element={<VocabularyQuizStart />} />
          <Route
            path="/vocabulary-quiz/play"
            element={<VocabularyQuizGame />}
          />
          <Route
            path="/vocabulary-quiz/result"
            element={<VocabularyQuizResult />}
          />
          <Route path="/grammar-quiz" element={<GrammarQuizStart />} />
          <Route path="/grammar-quiz/play" element={<GrammarQuizGame />} />
          <Route path="/grammar-quiz/result" element={<GrammarQuizResult />} />
          <Route path="/reading-quiz" element={<ReadingQuizStart />} />
          <Route path="/reading-quiz/play" element={<ReadingQuizGame />} />
          <Route path="/reading-quiz/result" element={<ProtectedRoute><ReadingQuizResult /></ProtectedRoute>} />
          <Route path="/idioms-quiz" element={<ProtectedRoute><IdiomsQuizStart /></ProtectedRoute>} />
          <Route path="/idioms-quiz/play" element={<ProtectedRoute><IdiomsQuizGame /></ProtectedRoute>} />
          <Route path="/idioms-quiz/result" element={<ProtectedRoute><IdiomsQuizResult /></ProtectedRoute>} />
          <Route path="/writing-quiz" element={<ProtectedRoute><WritingQuizStart /></ProtectedRoute>} />
          <Route path="/writing-quiz/play" element={<ProtectedRoute><WritingQuizGame /></ProtectedRoute>} />
          <Route path="/writing-quiz/result" element={<ProtectedRoute><WritingQuizResult /></ProtectedRoute>} />
          <Route path="/sentence-quiz" element={<ProtectedRoute><SentenceQuizStart /></ProtectedRoute>} />
          <Route path="/sentence-quiz/play" element={<ProtectedRoute><SentenceQuizGame /></ProtectedRoute>} />
          <Route
            path="/sentence-quiz/result"
            element={<ProtectedRoute><SentenceQuizResult /></ProtectedRoute>}
          />
          <Route path="/admin/requests" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
          <Route path="/admin/student-tutors" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
          <Route path="/admin/moderation" element={<ProtectedRoute><Admin /></ProtectedRoute>} /> {/* Added this line */}
          <Route path="/admin/placement-questions" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
          <Route path="/admin/question-approval" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
          <Route path="/admin/course-approval" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
          <Route path="/forgotpassword" element={<ForgotPassword />} />

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}

export default App;