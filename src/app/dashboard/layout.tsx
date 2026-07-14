import Sidebar from '@/components/Sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // Base background color established here to prevent double-layering
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B1120] font-sans text-slate-900 dark:text-slate-50 transition-colors duration-300">
      <Sidebar />

      {/* 
        lg:ml-64 ensures the main content perfectly clears a 256px fixed sidebar. 
        pt-24 clears the mobile header, lg:pt-8 gives perfect desktop top-spacing.
      */}
      <main className="lg:ml-64 pt-24 lg:pt-8 min-h-screen flex flex-col transition-all duration-300">
        <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
          {children}
        </div>
      </main>
    </div>
  );
}
