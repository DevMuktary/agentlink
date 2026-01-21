import Sidebar from '@/components/Sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navigation */}
      <Sidebar />

      {/* Main Content Area */}
      {/* CHANGE: Increased 'pt-14' to 'pt-20' to push content down below the mobile header */}
      <main className="lg:pl-64 pt-20 lg:pt-0 min-h-screen transition-all duration-300">
        <div className="w-full mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
