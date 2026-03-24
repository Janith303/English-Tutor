import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Home from "./components/home/Home";
import Login from "./components/home/login";

import LearnerDashboard from "./pages/LearnerDashboard";
import PersonalizedLearningHub from "./pages/PersonalizedLearningHub";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<LearnerDashboard />} />
        <Route path="/hub" element={<PersonalizedLearningHub />} />
      </Routes>
    </Router>
  );
}

export default App;