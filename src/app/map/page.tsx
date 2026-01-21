// src/app/map/page.tsx
import JobMap from "@/components/job-map/JobMap";

export default function MapPage() {
  return (
    <div className="min-h-screen bg-[#0F1012] p-6 lg:p-10 flex flex-col">
      <JobMap />
    </div>
  );
}