// src/app/map/page.tsx
import { Suspense } from "react";
import JobMap from "@/components/job-map/JobMap";

function MapPageContent() {
  return (
    <div className="min-h-screen bg-[#0F1012] p-6 lg:p-10 flex flex-col">
      <JobMap />
    </div>
  );
}

export default function MapPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0F1012] p-6 lg:p-10 flex items-center justify-center text-white">로딩 중...</div>}>
      <MapPageContent />
    </Suspense>
  );
}