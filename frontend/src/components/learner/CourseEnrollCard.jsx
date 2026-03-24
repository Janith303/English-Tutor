import starImg from "../images/star.png";
import avatarImg from "../images/avatar.png";
import thunderboltImg from "../images/thunder-bolt.png";
import wallclockImg from "../images/wall-clock.png";

export default function CourseEnrollCard({ course, onEnroll }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-4 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5 bg-blue-50 text-blue-600 text-xs font-medium px-3 py-1.5 rounded-full">
          {course.level}
        </span>
        <div className="flex items-center gap-1">
          <img src={starImg} alt="Rating Star" className="w-4 h-4" />
          <span className="text-sm font-semibold text-gray-700">
            {course.rating}
          </span>
        </div>
      </div>

      <h3 className="font-bold text-gray-900 text-lg leading-snug">
        {course.title}
      </h3>

      <div className="flex items-center gap-2">
        <img
          src={avatarImg}
          alt="Instructor Avatar"
          className="w-8 h-8 rounded-full object-cover"
        />
        <span className="text-gray-600 text-sm">{course.instructor}</span>
      </div>

      <p className="text-gray-500 text-sm leading-relaxed">
        {course.description}
      </p>

      <div className="bg-blue-50 rounded-xl px-4 py-3">
        <div className="flex items-center gap-1.5 text-blue-400 text-xs font-medium mb-1">
          <img src={thunderboltImg} alt="Focus Area" className="w-3.5 h-3.5" />
          Focus Area
        </div>
        <p className="text-blue-600 text-sm font-semibold">
          {course.focusArea}
        </p>
      </div>

      <div className="flex items-center justify-between text-gray-400 text-sm">
        <div className="flex items-center gap-1.5">
          <svg
            className="w-4 h-4 text-blue-500 fill-blue-500"
            viewBox="0 0 24 24"
          >
            <path d="M8 5v14l11-7z" />
          </svg>
          <span className="text-gray-500">{course.totalLessons} Lessons</span>
        </div>
        <div className="flex items-center gap-1.5">
          <img src={wallclockImg} alt="Duration" className="w-4 h-4" />
          <span>{course.durationWeeks} weeks</span>
        </div>
      </div>

      <button
        onClick={() => onEnroll && onEnroll(course)}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl py-3.5 flex items-center justify-center gap-2 transition-colors duration-200 mt-auto"
      >
        Enroll Now
      </button>
    </div>
  );
}
