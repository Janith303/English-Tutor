import starImg from "../images/star.png";
import avatarImg from "../images/avatar.png";
import thunderboltImg from "../images/thunder-bolt.png";
import wallclockImg from "../images/wall-clock.png";

export default function CourseEnrollCard({ course, onEnroll }) {
  return (
    <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-5 flex flex-col gap-4 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5 bg-[#DBEAFE] text-[#2563EB] text-xs font-medium px-3 py-1.5 rounded-full">
          {course.level}
        </span>
        <div className="flex items-center gap-1">
          <img src={starImg} alt="Rating Star" className="w-4 h-4" />
          <span className="text-sm font-semibold text-[#475569]">
            {course.rating}
          </span>
        </div>
      </div>

      <h3 className="font-bold text-[#0F172A] text-lg leading-snug">
        {course.title}
      </h3>

      <div className="flex items-center gap-2">
        <img
          src={avatarImg}
          alt="Instructor Avatar"
          className="w-8 h-8 rounded-full object-cover"
        />
        <span className="text-[#475569] text-sm">{course.instructor}</span>
      </div>

      <p className="text-[#475569] text-sm leading-relaxed">
        {course.description}
      </p>

      <div className="bg-[#EFF6FF] rounded-xl px-4 py-3">
        <div className="flex items-center gap-1.5 text-[#2563EB] text-xs font-medium mb-1">
          <img src={thunderboltImg} alt="Focus Area" className="w-3.5 h-3.5" />
          Focus Area
        </div>
        <p className="text-[#2563EB] text-sm font-semibold">
          {course.focusArea}
        </p>
      </div>

      <div className="flex items-center justify-between text-[#94A3B8] text-sm">
        <div className="flex items-center gap-1.5">
          <svg
            className="w-4 h-4 text-[#2563EB] fill-[#2563EB]"
            viewBox="0 0 24 24"
          >
            <path d="M8 5v14l11-7z" />
          </svg>
          <span className="text-[#475569]">{course.totalLessons} Lessons</span>
        </div>
        <div className="flex items-center gap-1.5">
          <img src={wallclockImg} alt="Duration" className="w-4 h-4" />
          <span>{course.durationWeeks} weeks</span>
        </div>
      </div>

      <button
        onClick={() => onEnroll && onEnroll(course)}
        className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold text-sm rounded-xl py-3.5 flex items-center justify-center gap-2 transition-colors duration-200 mt-auto"
      >
        Enroll Now
      </button>
    </div>
  );
}
