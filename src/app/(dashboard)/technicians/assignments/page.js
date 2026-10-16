import { Suspense } from "react";
import TechnicianAssignmentsView from "@views/technicians/assignments";

export const metadata = {
  title: "Task Assignments & Dispatch | ElectroCare",
  description: "Real-time technician workload, task assignments, and dispatch management.",
};

export default function TechnicianAssignmentsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center p-16">
          <span className="loading loading-spinner loading-md text-primary" />
        </div>
      }
    >
      <TechnicianAssignmentsView />
    </Suspense>
  );
}
