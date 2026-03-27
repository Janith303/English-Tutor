export default function WelcomeHeroBanner({ student }) {
  return (
    <div className="bg-blue-600 rounded-2xl px-8 py-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">

      <div>
        <h1 className="text-white text-2xl md:text-3xl font-bold mb-1">
          Welcome to your learning journey!
        </h1>
        <p className="text-blue-100 text-sm">
          Continue building your English skills with our recommended courses
        </p>
      </div>

      <div className="flex gap-3 flex-shrink-0">
        <div className="bg-white/20 backdrop-blur-sm rounded-xl px-5 py-3 text-white min-w-[140px]">
          <p className="text-blue-100 text-xs mb-1">Selected Area</p>
          <p className="font-bold text-sm">{student?.selectedArea}</p>
        </div>
        <div className="bg-white/20 backdrop-blur-sm rounded-xl px-5 py-3 text-white min-w-[120px]">
          <p className="text-blue-100 text-xs mb-1">Your Level</p>
          <p className="font-bold text-sm">{student?.level}</p>
        </div>
      </div>
    </div>
  );
}
 