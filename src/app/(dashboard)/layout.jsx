import Sidebar from "../../../views/Sidebar";

export default function DashboardLayout({ children }) {
  return (
    <div className="flex h-screen w-full overflow-hidden">
      {/* Fixed Sidebar */}
      <Sidebar />

      {/* Independently Scrollable Main Content */}
      <main className="flex-1 h-screen overflow-y-auto p-6">
        {children}
      </main>
    </div>
  );
}
