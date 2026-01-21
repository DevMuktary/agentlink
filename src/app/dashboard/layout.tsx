import Sidebar from '@/components/Sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navigation (Handles Mobile Header & Sidebar) */}
      <Sidebar />

      {/* Main Content Area 
          - pt-20: Pushes content down below the fixed mobile header (4rem + spacing)
          - lg:pl-64: Pushes content right on desktop
          - px-4: CRITICAL FIX. Prevents content from touching left/right edges on mobile.
      */}
      <main className="lg:pl-64 pt-20 lg:pt-0 min-h-screen transition-all duration-300">
        <div className="w-full mx-auto px-4 md:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
}
