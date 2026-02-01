import Sidebar from '@/components/Sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // ADDED: dark:bg-slate-900 dark:text-slate-50
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 font-sans text-slate-900 dark:text-slate-50 transition-colors duration-300">
      <Sidebar />

      <main className="lg:pl-64 pt-20 lg:pt-8 min-h-screen transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 md:px-6 pb-20">
          {children}
        </div>
      </main>
    </div>
  );
}
