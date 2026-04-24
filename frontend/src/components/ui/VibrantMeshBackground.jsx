export default function VibrantMeshBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
    >
      <div className="absolute -top-[20%] -left-[10%] h-[44rem] w-[44rem] rounded-full bg-cyan-400/40 blur-[130px] animate-pulse" />
      <div className="absolute -top-[10%] -right-[15%] h-[50rem] w-[50rem] rounded-full bg-fuchsia-400/30 blur-[160px]" />
      <div className="absolute top-[30%] right-[10%] h-[37.5rem] w-[37.5rem] rounded-full bg-blue-500/30 blur-[140px]" />
      <div className="absolute -bottom-[10%] left-[5%] h-[31.25rem] w-[31.25rem] rounded-full bg-pink-400/30 blur-[120px]" />
    </div>
  );
}
