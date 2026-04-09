import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Star,
  CheckCircle,
  MessageSquare,
  ShieldCheck,
  Lightbulb,
  TrendingUp,
  GraduationCap,
  Clock,
  User,
  Flame,
} from "lucide-react";
import LearnerTopNav from "./LearnerTopNav";
import {
  createEnrollment,
  getPublishedCourseDetail,
  toLessonRowsFromCourseDetail,
} from "../../api/courseApi";

const TutorDetailsPage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [courseLessons, setCourseLessons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCourse = async () => {
      setLoading(true);
      try {
        const data = await getPublishedCourseDetail(courseId);
        setCourse(data);
        setCourseLessons(toLessonRowsFromCourseDetail(data));
      } catch (error) {
        console.error("Failed to load course detail:", error);
        setCourse(null);
        setCourseLessons([]);
      } finally {
        setLoading(false);
      }
    };

    loadCourse();
  }, [courseId]);

  const [selectedDate, setSelectedDate] = useState("Wed 17");
  const [selectedDuration, setSelectedDuration] = useState("25 mins");
  const [selectedTime, setSelectedTime] = useState(null);

  const lectureNotesData =
    courseLessons.length > 0
      ? courseLessons.map((l) => l.title)
      : [
          "Introduction to Academic Lexis",
          "Analyzing Root Words & Affixes",
          "Transition Words for Essays",
          "Scientific & Technical Terminology",
          "Formal vs. Informal Register",
          "Data Interpretation Vocabulary",
          "Verbs of Attribution (Citing Sources)",
          "Abstract Nouns in Research",
          "Collocations in Academic Writing",
          "Final Assessment & Mastery",
        ];

  const ratings = [
    {
      label: "Reassurance",
      value: "5.0",
      icon: <ShieldCheck className="text-blue-600" size={24} />,
    },
    {
      label: "Clarity",
      value: "5.0",
      icon: <Lightbulb className="text-blue-600" size={24} />,
    },
    {
      label: "Progress",
      value: "5.0",
      icon: <TrendingUp className="text-blue-600" size={24} />,
    },
    {
      label: "Preparation",
      value: "5.0",
      icon: <GraduationCap className="text-blue-600" size={24} />,
    },
  ];

  const schedule = [
    { day: "Mon", date: "15" },
    { day: "Tue", date: "16" },
    { day: "Wed", date: "17" },
    { day: "Thu", date: "18" },
    { day: "Fri", date: "19" },
    { day: "Sat", date: "20" },
    { day: "Sun", date: "21" },
  ];

  const times = ["09:00", "11:30", "15:00", "18:30"];

  const handleEnroll = async () => {
    if (!course?.id) return;

    try {
      await createEnrollment(course.id);
      navigate(`/learning/${course.id}`);
    } catch (error) {
      if (error?.response?.status === 400) {
        navigate(`/learning/${course.id}`);
        return;
      }
      alert("Enrollment failed. Please try again.");
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <LearnerTopNav />
      <div className="flex-1 max-w-5xl mx-auto w-full px-4 py-6">
        <button
          onClick={() => navigate("/dashboard")}
          className="text-blue-600 hover:text-blue-700 font-medium text-sm mb-6 flex items-center gap-2"
        >
          ← Back to Dashboard
        </button>

        <div className="flex items-start justify-between mb-2 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex gap-4">
            <img
              src={
                course?.instructorImage ||
                "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150&h=150"
              }
              alt={course?.instructor || "Instructor"}
              className="w-20 h-20 rounded-full object-cover"
            />
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="bg-green-50 text-green-600 text-xs px-2 py-0.5 rounded border border-green-100 font-medium">
                  Free Course
                </span>
                <span className="text-blue-600 flex items-center gap-1 text-xs font-medium">
                  <CheckCircle
                    size={14}
                    fill="currentColor"
                    className="text-white fill-blue-500"
                  />{" "}
                  University Verified
                </span>
              </div>
              <h1 className="text-3xl font-bold text-gray-800">
                {course?.title || "Course Title"}
              </h1>
              <p className="text-gray-500 italic mt-1">
                with {course?.instructor || "Instructor"}
              </p>
            </div>
          </div>

          <div className="w-72 border rounded-xl p-5 shadow-sm bg-white hover:shadow-lg hover:-translate-y-1 transition-all duration-200">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-blue-600 tracking-wide">
                FREE
              </h2>
              <p className="text-xs text-gray-400 mt-1 uppercase font-semibold">
                No payment required
              </p>
              <button
                onClick={handleEnroll}
                className="w-full mt-4 bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors"
              >
                Enroll Now
              </button>
            </div>

            <div className="space-y-3 text-sm text-gray-600 border-t pt-4">
              <div className="flex items-center gap-3">
                <div className="p-1 bg-gray-100 rounded">
                  <User size={16} />
                </div>
                <span>{courseLessons.length} Lessons Available</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-1 bg-gray-100 rounded">
                  <Star size={16} />
                </div>
                <span>New Tutor</span>
              </div>
            </div>

            <div className="mt-6 bg-orange-50 border border-orange-100 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-orange-600 font-bold text-sm">
                <Flame size={18} fill="currentColor" /> Popular
              </div>
              <p className="text-xs text-orange-800 mt-1">
                11 students joined in the last 2 days
              </p>
            </div>
          </div>
        </div>

        {loading && (
          <div className="mb-8 bg-white rounded-2xl p-6 border border-gray-100 text-sm text-gray-500">
            Loading course details...
          </div>
        )}

        <div className="mb-12 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200">
          <div className="grid grid-cols-4 gap-4">
            {ratings.map((rate, idx) => (
              <div
                key={idx}
                className="bg-blue-50 p-6 rounded-lg text-center flex flex-col items-center gap-3"
              >
                <div className="bg-white p-2 rounded-full shadow-sm">
                  {rate.icon}
                </div>
                <span className="text-2xl font-bold text-gray-800">
                  {rate.value}
                </span>
                <span className="text-xs text-gray-500 uppercase font-semibold">
                  {rate.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-12 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200">
          <div className="bg-gray-50 rounded-xl p-16 flex flex-col items-center justify-center border border-dashed">
            <MessageSquare size={48} className="text-gray-300 mb-4" />
            <p className="text-gray-500 font-medium">No reviews yet</p>
            <p className="text-xs text-gray-400 mt-2">
              Be the first to leave a review for this course
            </p>
          </div>
        </div>

        <div className="mb-12 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200">
          <div className="space-y-3">
            {lectureNotesData.map((lesson, idx) => (
              <div
                key={idx}
                className="flex items-center gap-4 p-4 border rounded-xl hover:shadow-sm cursor-pointer transition-all bg-gray-50"
              >
                <span className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
                  {idx + 1}
                </span>
                <span className="text-gray-700 font-medium">{lesson}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-12 bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200">
          <h3 className="text-xl font-semibold mb-6">Schedule</h3>
          <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg mb-6">
            <p className="text-blue-600 text-sm">
              Choose the time for your first lesson. The timings are displayed
              in your local timezone.
            </p>
          </div>

          <div className="flex gap-4 mb-6">
            <div className="flex bg-gray-100 p-1 rounded-lg">
              {["25 mins", "50 mins"].map((dur) => (
                <button
                  key={dur}
                  onClick={() => setSelectedDuration(dur)}
                  className={`px-4 py-2 text-sm rounded-md transition-all ${selectedDuration === dur ? "bg-white shadow-sm font-semibold" : "text-gray-500"}`}
                >
                  {dur}
                </button>
              ))}
            </div>
            <div className="flex-1 bg-gray-100 rounded-lg"></div>
          </div>

          <div className="grid grid-cols-7 gap-2 mb-6 text-center">
            {schedule.map((item) => (
              <button
                key={item.date}
                onClick={() => setSelectedDate(`${item.day} ${item.date}`)}
                className={`p-3 rounded-xl transition-all ${
                  selectedDate === `${item.day} ${item.date}`
                    ? "bg-blue-600 text-white shadow-lg"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                }`}
              >
                <div className="text-xs uppercase font-medium">{item.day}</div>
                <div className="text-lg font-bold">{item.date}</div>
              </button>
            ))}
          </div>

          <div className="grid grid-cols-4 gap-3">
            {times.map((t) => (
              <button
                key={t}
                onClick={() => setSelectedTime(t)}
                className={`py-3 border rounded-xl font-medium transition-all ${
                  selectedTime === t
                    ? "bg-blue-600 text-white border-blue-600"
                    : "hover:border-blue-500 text-gray-700"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TutorDetailsPage;
