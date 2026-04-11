export default function LoadingScreen() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <img
        src="/logo-cjc.png"
        alt="Cargando"
        style={{
          width: 120,
          height: 120,
          objectFit: "contain",
          animation: "blur-pulse 1.8s ease-in-out infinite",
        }}
      />
    </div>
  );
}
