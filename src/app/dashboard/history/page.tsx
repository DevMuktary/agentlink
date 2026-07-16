'use client';

import Link from 'next/link';
import { 
  History, ShieldCheck, UserCheck, Fingerprint, FileBadge, 
  RefreshCcw, Search, School, Landmark, Receipt, Building2, 
  GraduationCap, Wifi, Smartphone, Users, FileText, ArrowLeft
} from 'lucide-react';

export default function HistoryDirectory() {
  return (
    <div className="animate-in fade-in duration-500">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <div className="p-2 bg-blue-50 dark:bg-blue-500/10 rounded-lg text-blue-600 dark:text-blue-400">
              <History size={24} />
            </div>
            Transaction History
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 font-medium">
            Select a category below to view your past logs and generated documents.
          </p>
        </div>
        
        <Link 
          href="/dashboard"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-semibold hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors border border-slate-200 dark:border-slate-700"
        >
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>
      </div>

      {/* DIRECTORY GRID */}
      <div className="space-y-10">
        
        <CategorySection title="Identity Logs" icon={<Fingerprint size={18} className="text-blue-600 dark:text-blue-400"/>}>
          <HistoryItem title="NIN Verification Logs" href="/dashboard/history/nin-verification" icon={<UserCheck size={20} />} color="text-blue-600 bg-blue-50 dark:bg-blue-500/10 dark:text-blue-400"/>
          <HistoryItem title="NIN Validation History" href="/dashboard/history/nin/validation" icon={<Search size={20} />} color="text-blue-600 bg-blue-50 dark:bg-blue-500/10 dark:text-blue-400"/>
          <HistoryItem title="VNIN Slip History" href="/dashboard/history/vnin" icon={<FileBadge size={20} />} color="text-indigo-600 bg-indigo-50 dark:bg-indigo-500/10 dark:text-indigo-400"/>
          <HistoryItem title="NIN Personalization" href="/dashboard/history/nin/personalization" icon={<Users size={20} />} color="text-purple-600 bg-purple-50 dark:bg-purple-500/10 dark:text-purple-400"/>
          <HistoryItem title="Modification History" href="/dashboard/history/nin/modification" icon={<FileText size={20} />} color="text-orange-600 bg-orange-50 dark:bg-orange-500/10 dark:text-orange-400"/>
          <HistoryItem title="NIN Slip History" href="/dashboard/history/nin-slips" icon={<FileBadge size={20} />} color="text-indigo-600 bg-indigo-50 dark:bg-indigo-500/10 dark:text-indigo-400"/>
          <HistoryItem title="Slip Generation History" href="/dashboard/history/slips/history" icon={<FileText size={20} />} color="text-blue-600 bg-blue-50 dark:bg-blue-500/10 dark:text-blue-400"/>
          <HistoryItem title="IPE Clearance Logs" href="/dashboard/history/nin/ipe-clearance" icon={<ShieldCheck size={20} />} color="text-red-600 bg-red-50 dark:bg-red-500/10 dark:text-red-400"/>
        </CategorySection>

        <CategorySection title="Banking Logs" icon={<Landmark size={18} className="text-teal-600 dark:text-teal-400"/>}>
          <HistoryItem title="BVN Verification Logs" href="/dashboard/history/bvn/verification" icon={<ShieldCheck size={20} />} color="text-teal-600 bg-teal-50 dark:bg-teal-500/10 dark:text-teal-400"/>
          <HistoryItem title="VNIN to NIBSS History" href="/dashboard/history/bvn/vnin-to-nibss" icon={<RefreshCcw size={20} />} color="text-teal-600 bg-teal-50 dark:bg-teal-500/10 dark:text-teal-400"/>
          <HistoryItem title="BVN USER History" href="/dashboard/history/bvn/enrollment" icon={<UserCheck size={20} />} color="text-teal-600 bg-teal-50 dark:bg-teal-500/10 dark:text-teal-400"/>
          <HistoryItem title="BVN Modification Logs" href="/dashboard/history/bvn/modification" icon={<FileText size={20} />} color="text-teal-600 bg-teal-50 dark:bg-teal-500/10 dark:text-teal-400"/>
          <HistoryItem title="Premium Slip History" href="/dashboard/history/bvn-slip" icon={<FileBadge size={20} />} color="text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 dark:text-emerald-400"/>
          <HistoryItem title="Retrieval History" href="/dashboard/history/bvn/retrieval" icon={<Search size={20} />} color="text-cyan-600 bg-cyan-50 dark:bg-cyan-500/10 dark:text-cyan-400"/>
        </CategorySection>

        <CategorySection title="Corporate Logs" icon={<Building2 size={18} className="text-purple-600 dark:text-purple-400"/>}>
          <HistoryItem title="CAC Registration Logs" href="/dashboard/history/corporate/cac" icon={<Building2 size={20} />} color="text-purple-600 bg-purple-50 dark:bg-purple-500/10 dark:text-purple-400"/>
          <HistoryItem title="Tax ID Logs" href="/dashboard/history/corporate/tax-id icon={<Receipt size={20} />} color="text-purple-600 bg-purple-50 dark:bg-purple-500/10 dark:text-purple-400"/>
        </CategorySection>

        <CategorySection title="Education Logs" icon={<GraduationCap size={18} className="text-pink-600 dark:text-pink-400"/>}>
          <HistoryItem title="JAMB Services History" href="/dashboard/history/education/jamb" icon={<School size={20} />} color="text-pink-600 bg-pink-50 dark:bg-pink-500/10 dark:text-pink-400"/>
          <HistoryItem title="Exam Pins History" href="/dashboard/history/education/exam-pins" icon={<FileBadge size={20} />} color="text-pink-600 bg-pink-50 dark:bg-pink-500/10 dark:text-pink-400"/>
        </CategorySection>

        <CategorySection title="Utility Logs" icon={<Wifi size={18} className="text-orange-600 dark:text-orange-400"/>}>
          <HistoryItem title="Airtime History" href="/dashboard/history/utilities" icon={<Smartphone size={20} />} color="text-cyan-600 bg-cyan-50 dark:bg-cyan-500/10 dark:text-cyan-400"/>
          <HistoryItem title="Data Bundle History" href="/dashboard/history/utilities/data" icon={<Wifi size={20} />} color="text-cyan-600 bg-cyan-50 dark:bg-cyan-500/10 dark:text-cyan-400"/>
        </CategorySection>
        
      </div>
    </div>
  );
}

// --- COMPONENTS ---

function CategorySection({ title, icon, children }: { title: string, icon: any, children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <div className="p-1.5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
          {icon}
        </div>
        <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm tracking-wide uppercase">{title}</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {children}
      </div>
    </div>
  );
}

function HistoryItem({ title, href, icon, color }: { title: string, href: string, icon: any, color: string }) {
  return (
    <Link 
      href={href} 
      className="flex items-center gap-4 p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-blue-300 dark:hover:border-slate-600 transition-all active:scale-[0.98] group"
    >
      <div className={`h-11 w-11 rounded-full flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110 ${color}`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-sm text-slate-700 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {title}
        </h4>
      </div>
      <div className="text-slate-300 dark:text-slate-600 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-transform duration-300 group-hover:-rotate-12">
        <History size={18} strokeWidth={2.5} />
      </div>
    </Link>
  );
}
