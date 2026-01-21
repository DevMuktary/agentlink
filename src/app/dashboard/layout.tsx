import Sidebar from "@/components/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-gray-50 font-sans text-gray-900">
      {/* Sidebar - Hidden on mobile, fixed on desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-[#0f172a] text-white border-r border-gray-800">
        <Sidebar />
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header (Optional: You can add a hamburger menu here later) */}
        
        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
           <div className="max-w-7xl mx-auto">
             {children}
           </div>
        </div>
      </main>
    </div>
  );
}
