import Sidebar from '@/components/Sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Sidebar Component 
        - Handles the fixed Sidebar on Desktop 
        - Handles the Hamburger Header on Mobile
      */}
      <Sidebar />

      {/* Main Content Area 
        - lg:pl-64: Pushes content to the right on large screens (to make room for Sidebar)
        - pt-20: Adds top padding on mobile (so content isn't hidden behind the fixed mobile header)
        - lg:pt-8: Resets top padding on desktop
        - px-4 md:px-8: Horizontal breathing room
      */}
      <main className="lg:pl-64 pt-20 lg:pt-8 min-h-screen transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 md:px-6 pb-20">
          {children}
        </div>
      </main>
    </div>
  );
}
