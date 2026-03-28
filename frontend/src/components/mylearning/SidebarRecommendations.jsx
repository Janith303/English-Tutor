export default function SidebarRecommendations({ courses }) {
  return (
    <div>
      <h3 className="font-bold text-gray-900 text-base mb-4">Recommended for You</h3>
      <div className="flex flex-col gap-0 divide-y divide-gray-100">
        {courses.map((course) => (
          <div key={course.id} className="py-4 first:pt-0 last:pb-0">
            <h4 className="font-semibold text-gray-900 text-sm mb-1">{course.title}</h4>
            <p className="text-xs text-gray-400 leading-relaxed mb-2">{course.description}</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <span className="text-xs text-gray-500">{course.rating}</span>
                <svg className="w-3 h-3 text-yellow-400 fill-yellow-400" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="text-xs text-gray-400">({course.reviews})</span>
              </div>
              <button className="text-xs text-blue-600 font-semibold hover:underline">
                Enroll
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
 