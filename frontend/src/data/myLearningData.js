export const enrolledCourses = [
  {
    id: 1,
    title: "Academic Vocabulary Builder",
    provider: "English Tutor",
    type: "Free Course",
    progress: 0,
    status: "in_progress",
    expiresInDays: 10,
    completedDate: null,
  },
  {
    id: 2,
    title: "Research Paper Mastery",
    provider: "English Tutor",
    type: "Free Course",
    progress: 100,
    status: "completed",
    expiresInDays: null,
    completedDate: "Mar 15, 2024",
  },
];

export const learningProgress = {
  coursesCompleted: 1,
  hoursStudied: 48,
  streakDays: 7,
};

export const recommendedCourses = [
  {
    id: 101,
    title: "Advanced English Writing",
    description:
      "Master advanced writing techniques and improve your communication skills.",
    rating: 4.8,
    reviews: "2.1k",
  },
  {
    id: 102,
    title: "Business English",
    description:
      "Professional English for workplace communication and presentations.",
    rating: 4.9,
    reviews: "1.8k",
  },
];

export const weekSchedule = [
  { id: 1, title: "Grammar Practice", time: "Today, 3:00 PM", isToday: true },
  {
    id: 2,
    title: "Vocabulary Quiz",
    time: "Tomorrow, 2:00 PM",
    isToday: false,
  },
  {
    id: 3,
    title: "Speaking Practice",
    time: "Friday, 4:00 PM",
    isToday: false,
  },
];

export const categories = [
  "All",
  "Writing",
  "Grammar",
  "Speaking",
  "Vocabulary",
  "Business",
];
