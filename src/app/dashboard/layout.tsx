import Sidebar from '@/components/Sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sidebar Component handles the Mobile Header & Navigation */}
      <Sidebar />

      {/* Main Content Area */}
      {/* lg:pl-64 pushes content right on desktop */}
      {/* pt-16 pushes content down on mobile (below the Sidebar's fixed header) */}
      <main className="lg:pl-64 pt-14 lg:pt-0 min-h-screen transition-all duration-300">
        <div className="w-full mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
