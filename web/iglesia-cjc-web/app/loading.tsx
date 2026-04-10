import LoadingScreen from "@/components/LoadingScreen";

export default function Loading() {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center" style={{ background: "#080E1E" }}>
      <LoadingScreen />
    </div>
  );
}
