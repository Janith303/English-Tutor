import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Trash2, Eye, ChevronLeft, ChevronRight, Save } from "lucide-react";

export default function TutorCreateQuizPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [touched, setTouched] = useState({});
  const [touchedQuestions, setTouchedQuestions] = useState([]);

  const [quiz, setQuiz] = useState({
    title: "",
    description: "",
    category: "",
    difficulty: "",
    timeLimit: 15,
    passingScore: 70,
    randomize: false,
    immediateResults: true,
    questions: [
      {
        id: 1,
        questionText: "",
        marks: 10,
        type: "Multiple Choice",
        options: ["", "", "", ""],
        correctAnswer: null,
      },
    ],
  });

  const [errors, setErrors] = useState({
    title: "",
    description: "",
    questions: [],
  });

  const categories = [
    "Vocabulary",
    "Grammar",
    "Reading",
    "Idioms",
    "Writing",
    "Sentence Structure",
  ];

  const difficulties = ["Easy", "Medium", "Hard"];

  const validateTitle = (value) => {
    if (!value.trim()) return "Title is required";
    if (value.trim().length < 5) return "Title must be at least 5 characters";
    if (value.length > 100) return "Title must not exceed 100 characters";
    return "";
  };

  const validateDescription = (value) => {
    if (!value.trim()) return "Description is required";
    if (value.trim().length < 10) return "Description must be at least 10 characters";
    if (value.length > 300) return "Description must not exceed 300 characters";
    return "";
  };

  const validateQuestion = (question) => {
    const err = {};
    if (!question.questionText.trim()) {
      err.questionText = "Question text is required";
    }
    if (question.options.some((opt) => !opt.trim())) {
      err.options = "All answer options must be filled";
    }
    if (question.correctAnswer === null) {
      err.correctAnswer = "Please select a correct answer";
    }
    return err;
  };

  const handleInputChange = (field, value) => {
    setQuiz((prev) => ({ ...prev, [field]: value }));
    setTouched((prev) => ({ ...prev, [field]: true }));

    if (field === "title") {
      setErrors((prev) => ({ ...prev, title: validateTitle(value) }));
    } else if (field === "description") {
      setErrors((prev) => ({ ...prev, description: validateDescription(value) }));
    }
  };

  const handleQuestionChange = (index, field, value) => {
    const updatedQuestions = [...quiz.questions];
    updatedQuestions[index] = { ...updatedQuestions[index], [field]: value };
    setQuiz((prev) => ({ ...prev, questions: updatedQuestions }));

    const updatedTouched = [...touchedQuestions];
    updatedTouched[index] = true;
    setTouchedQuestions(updatedTouched);

    if (field === "questionText" || field === "options" || field === "correctAnswer") {
      const questionErrors = [...errors.questions];
      questionErrors[index] = validateQuestion(updatedQuestions[index]);
      setErrors((prev) => ({ ...prev, questions: questionErrors }));
    }
  };

  const handleOptionChange = (questionIndex, optionIndex, value) => {
    const updatedQuestions = [...quiz.questions];
    const updatedOptions = [...updatedQuestions[questionIndex].options];
    updatedOptions[optionIndex] = value;
    updatedQuestions[questionIndex] = {
      ...updatedQuestions[questionIndex],
      options: updatedOptions,
    };
    setQuiz((prev) => ({ ...prev, questions: updatedQuestions }));

    const updatedTouched = [...touchedQuestions];
    updatedTouched[questionIndex] = true;
    setTouchedQuestions(updatedTouched);

    const questionErrors = [...errors.questions];
    questionErrors[questionIndex] = validateQuestion(updatedQuestions[questionIndex]);
    setErrors((prev) => ({ ...prev, questions: questionErrors }));
  };

  const handleCorrectAnswer = (questionIndex, optionIndex) => {
    handleQuestionChange(questionIndex, "correctAnswer", optionIndex);
  };

  const addQuestion = () => {
    const newQuestion = {
      id: quiz.questions.length + 1,
      questionText: "",
      marks: 10,
      type: "Multiple Choice",
      options: ["", "", "", ""],
      correctAnswer: null,
    };
    setQuiz((prev) => ({
      ...prev,
      questions: [...prev.questions, newQuestion],
    }));
    setErrors((prev) => ({
      ...prev,
      questions: [...prev.questions, {}],
    }));
    setTouchedQuestions([...touchedQuestions, false]);
  };

  const deleteQuestion = (index) => {
    if (quiz.questions.length === 1) return;
    const updatedQuestions = quiz.questions.filter((_, i) => i !== index);
    const updatedErrors = errors.questions.filter((_, i) => i !== index);
    const updatedTouched = touchedQuestions.filter((_, i) => i !== index);
    setQuiz((prev) => ({ ...prev, questions: updatedQuestions }));
    setErrors((prev) => ({ ...prev, questions: updatedErrors }));
    setTouchedQuestions(updatedTouched);
  };

  const validateStep1 = () => {
    const titleError = validateTitle(quiz.title);
    const descError = validateDescription(quiz.description);
    setErrors({ title: titleError, description: descError, questions: [] });
    setTouched({ title: true, description: true });
    return !titleError && !descError;
  };

  const validateStep2 = () => {
    const questionErrors = quiz.questions.map((q) => validateQuestion(q));
    setErrors((prev) => ({ ...prev, questions: questionErrors }));
    setTouchedQuestions(quiz.questions.map(() => true));
    return questionErrors.every(
      (err) => Object.keys(err).length === 0
    );
  };

  const handleNext = () => {
    if (validateStep1()) {
      setCurrentStep(2);
    }
  };

  const handlePrev = () => {
    setCurrentStep(1);
  };

  const handleSaveDraft = () => {
    console.log("Saving draft:", quiz);
    alert("Quiz saved as draft!");
  };

  const handlePreview = () => {
    if (currentStep === 1) {
      if (validateStep1()) {
        setCurrentStep(2);
      }
    } else {
      if (validateStep2()) {
        console.log("Preview quiz:", quiz);
        alert("Preview mode coming soon!");
      }
    }
  };

  const handlePublish = () => {
    if (validateStep2()) {
      console.log("Publishing quiz:", quiz);
      alert("Quiz published successfully!");
      navigate("/tutor/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-8 h-16 flex items-center">
          <button
            onClick={() => navigate("/tutor/dashboard")}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ChevronLeft size={20} />
            Back to Dashboard
          </button>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-8 py-8">
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Create New Quiz</h1>
            <p className="text-gray-500 mt-1">
              Add questions, set answers and configure quiz settings
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleSaveDraft}
              className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-5 py-2.5 rounded-lg font-semibold transition-colors"
            >
              <Save size={18} />
              Save Draft
            </button>
            <button
              onClick={handlePreview}
              className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-5 py-2.5 rounded-lg font-semibold transition-colors"
            >
              <Eye size={18} />
              Preview
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4 mb-8">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
              currentStep >= 1
                ? "bg-indigo-600 text-white"
                : "bg-gray-200 text-gray-600"
            }`}
          >
            1
          </div>
          <div
            className={`flex-1 h-1 rounded ${
              currentStep >= 2 ? "bg-indigo-600" : "bg-gray-200"
            }`}
          />
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
              currentStep >= 2
                ? "bg-indigo-600 text-white"
                : "bg-gray-200 text-gray-600"
            }`}
          >
            2
          </div>
        </div>

        {currentStep === 1 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">
                Quiz Details
              </h2>
              <div className="flex flex-col gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quiz Title
                  </label>
                  <input
                    type="text"
                    value={quiz.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    placeholder="Enter quiz title"
                    className="w-full rounded-lg border border-slate-300 px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                  {touched.title && errors.title && (
                    <p className="text-red-500 text-sm mt-1">{errors.title}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={quiz.description}
                    onChange={(e) =>
                      handleInputChange("description", e.target.value)
                    }
                    placeholder="Describe what this quiz covers"
                    rows={4}
                    className="w-full rounded-lg border border-slate-300 px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none"
                  />
                  {touched.description && errors.description && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.description}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    value={quiz.category}
                    onChange={(e) =>
                      handleInputChange("category", e.target.value)
                    }
                    className="w-full rounded-lg border border-slate-300 px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
                  >
                    <option value="">Select a category</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Difficulty Level
                  </label>
                  <select
                    value={quiz.difficulty}
                    onChange={(e) =>
                      handleInputChange("difficulty", e.target.value)
                    }
                    className="w-full rounded-lg border border-slate-300 px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
                  >
                    <option value="">Select difficulty</option>
                    {difficulties.map((diff) => (
                      <option key={diff} value={diff}>
                        {diff}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">
                Quiz Settings
              </h2>
              <div className="flex flex-col gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Time Limit (minutes)
                  </label>
                  <input
                    type="number"
                    value={quiz.timeLimit}
                    onChange={(e) =>
                      handleInputChange("timeLimit", parseInt(e.target.value) || 0)
                    }
                    min={1}
                    className="w-full rounded-lg border border-slate-300 px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Passing Score (%)
                  </label>
                  <input
                    type="number"
                    value={quiz.passingScore}
                    onChange={(e) =>
                      handleInputChange(
                        "passingScore",
                        parseInt(e.target.value) || 0
                      )
                    }
                    min={0}
                    max={100}
                    className="w-full rounded-lg border border-slate-300 px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="flex items-center justify-between py-3 border-b border-slate-100">
                  <div>
                    <p className="font-medium text-gray-900">Randomize Questions</p>
                    <p className="text-sm text-gray-500">
                      Shuffle question order for each attempt
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      handleInputChange("randomize", !quiz.randomize)
                    }
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      quiz.randomize ? "bg-indigo-600" : "bg-gray-300"
                    }`}
                  >
                    <span
                      className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                        quiz.randomize ? "left-7" : "left-1"
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium text-gray-900">Immediate Results</p>
                    <p className="text-sm text-gray-500">
                      Show results right after submission
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      handleInputChange("immediateResults", !quiz.immediateResults)
                    }
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      quiz.immediateResults ? "bg-indigo-600" : "bg-gray-300"
                    }`}
                  >
                    <span
                      className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                        quiz.immediateResults ? "left-7" : "left-1"
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900">
                Quiz Questions
              </h2>
              <p className="text-sm text-gray-500">
                Create and manage your quiz questions
              </p>
            </div>

            <div className="flex flex-col gap-6">
              {quiz.questions.map((question, qIndex) => (
                <div
                  key={question.id}
                  className="border border-slate-200 rounded-xl p-5 bg-slate-50"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900">
                      Question {qIndex + 1}
                    </h3>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <label className="text-sm text-gray-600">Marks:</label>
                        <input
                          type="number"
                          value={question.marks}
                          onChange={(e) =>
                            handleQuestionChange(
                              qIndex,
                              "marks",
                              parseInt(e.target.value) || 0
                            )
                          }
                          min={1}
                          className="w-20 rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        />
                      </div>
                      <button
                        onClick={() => deleteQuestion(qIndex)}
                        disabled={quiz.questions.length === 1}
                        className={`p-2 rounded-lg transition-colors ${
                          quiz.questions.length === 1
                            ? "text-gray-300 cursor-not-allowed"
                            : "text-red-500 hover:bg-red-50"
                        }`}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Question Text
                      </label>
                      <textarea
                        value={question.questionText}
                        onChange={(e) =>
                          handleQuestionChange(
                            qIndex,
                            "questionText",
                            e.target.value
                          )
                        }
                        placeholder="Enter your question"
                        rows={2}
                        className="w-full rounded-lg border border-slate-300 px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none"
                      />
                      {touchedQuestions[qIndex] &&
                        errors.questions[qIndex]?.questionText && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.questions[qIndex].questionText}
                          </p>
                        )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Answer Options (select the correct one)
                      </label>
                      <div className="flex flex-col gap-3">
                        {question.options.map((option, oIndex) => (
                          <div
                            key={oIndex}
                            className="flex items-center gap-3"
                          >
                            <input
                              type="radio"
                              name={`correct-${qIndex}`}
                              checked={question.correctAnswer === oIndex}
                              onChange={() => handleCorrectAnswer(qIndex, oIndex)}
                              className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                            />
                            <input
                              type="text"
                              value={option}
                              onChange={(e) =>
                                handleOptionChange(qIndex, oIndex, e.target.value)
                              }
                              placeholder={`Option ${String.fromCharCode(65 + oIndex)}`}
                              className="flex-1 rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                            />
                          </div>
                        ))}
                      </div>
                      {touchedQuestions[qIndex] &&
                        errors.questions[qIndex]?.options && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.questions[qIndex].options}
                          </p>
                        )}
                      {touchedQuestions[qIndex] &&
                        errors.questions[qIndex]?.correctAnswer && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.questions[qIndex].correctAnswer}
                          </p>
                        )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={addQuestion}
              className="mt-6 w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-slate-300 rounded-lg text-indigo-600 hover:border-indigo-600 hover:bg-indigo-50 transition-colors font-medium"
            >
              <Plus size={20} />
              Add Question
            </button>
          </div>
        )}

        <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-200">
          <button
            onClick={handlePrev}
            disabled={currentStep === 1}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-semibold transition-colors ${
              currentStep === 1
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-slate-100 hover:bg-slate-200 text-slate-700"
            }`}
          >
            <ChevronLeft size={18} />
            Prev
          </button>

          {currentStep === 1 ? (
            <button
              onClick={handleNext}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg font-semibold transition-colors"
            >
              Next
              <ChevronRight size={18} />
            </button>
          ) : (
            <button
              onClick={handlePublish}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg font-semibold transition-colors"
            >
              Preview & Publish
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
