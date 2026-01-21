'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Wallet, 
  Copy, 
  CheckCircle2, 
  FileText, 
  Building2, 
  GraduationCap, 
  Wifi, 
  ShieldCheck, 
  UserCheck, 
  Fingerprint, 
  FileBadge, 
  RefreshCcw, 
  Search,
  School,
  Landmark,
  Receipt
} from 'lucide-react';
import GlobalLoader from '@/components/GlobalLoader';

export default function UserDashboard() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch('/api/user/me');
        const data = await res.json();
        if (data.status) setUser(data.data);
      } catch (error) {
        console.error('Failed to load user', error);
      } finally {
        setLoading(false);
      }
    }
    fetchUser();
  }, []);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return <GlobalLoader />;

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 md:p-8 font-sans text-slate-900">
      
      {/* 1. WELCOME HEADER */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Welcome back, {user?.name?.split(' ')[0] || 'Partner'}
          </h1>
          <p className="mt-1 text-slate-500 text-sm">
            Here is an overview of your API usage and wallet status.
          </p>
        </div>
        <div className="flex items-center gap-3">
           <span className="text-xs font-medium px-3 py-1 bg-blue-50 text-blue-700 rounded-full border border-blue-100">
             {user?.role === 'USER' ? 'Standard Account' : 'Verified Agent'}
           </span>
           <span className="text-xs font-medium px-3 py-1 bg-green-50 text-green-700 rounded-full border border-green-100">
             Active
           </span>
        </div>
      </div>

      {/* 2. HERO STATS ROW */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        
        {/* Wallet Card - Main */}
        <div className="md:col-span-2 bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-6 text-white shadow-lg shadow-blue-200 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
            <Wallet size={120} />
          </div>
          
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div>
              <p className="text-blue-100 font-medium mb-1">Available Balance</p>
              <h2 className="text-4xl font-bold tracking-tight">
                ₦ {Number(user?.walletBalance).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </h2>
            </div>
            
            <div className="mt-6 flex gap-3">
              <Link 
                href="/dashboard/wallet"
                className="bg-white text-blue-700 px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-50 transition-colors shadow-sm"
              >
                Fund Wallet
              </Link>
              <Link 
                href="/dashboard/wallet"
                className="bg-blue-700/50 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors backdrop-blur-sm"
              >
                Transaction History
              </Link>
            </div>
          </div>
        </div>

        {/* API Credentials Card */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-center">
           <div className="flex items-center gap-2 mb-4">
             <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
               <ShieldCheck size={20} />
             </div>
             <h3 className="font-semibold text-slate-800">API Credentials</h3>
           </div>
           
           <div className="space-y-4">
             <div>
               <label className="text-xs text-slate-500 uppercase font-semibold tracking-wider">Public Key</label>
               <div className="flex items-center gap-2 mt-1 bg-slate-50 p-2 rounded border border-slate-200">
                 <code className="text-xs text-slate-600 truncate flex-1 font-mono">
                   {user?.apiKeyPublic || 'Not Generated'}
                 </code>
                 <button 
                   onClick={() => copyToClipboard(user?.apiKeyPublic)}
                   className="text-slate-400 hover:text-blue-600 transition-colors"
                 >
                   {copied ? <CheckCircle2 size={14} className="text-green-500"/> : <Copy size={14} />}
                 </button>
               </div>
             </div>
             
             <div>
               <Link href="/dashboard/developers" className="text-sm text-blue-600 hover:text-blue-700 font-medium hover:underline flex items-center gap-1">
                 View Secret Key & Docs &rarr;
               </Link>
             </div>
           </div>
        </div>
      </div>


      {/* 3. SERVICES SECTION */}
      <div className="space-y-12">
        
        {/* --- IDENTITY SERVICES (NIN) --- */}
        <section>
          <div className="flex items-center gap-3 mb-5 border-b border-slate-200 pb-2">
            <Fingerprint className="text-slate-400" size={20} />
            <h3 className="text-lg font-bold text-slate-800 uppercase tracking-wide">Identity Services (NIN)</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <ServiceCard 
              title="NIN Verification" 
              desc="Verify identity via NIN number"
              href="/dashboard/services/nin-verification"
              icon={<UserCheck size={20} />}
              color="indigo"
            />
            <ServiceCard 
              title="NIN Validation" 
              desc="Validate NIN search status"
              href="/dashboard/services/nin/validation"
              icon={<Search size={20} />}
              color="indigo"
            />
             <ServiceCard 
              title="VNIN Slip Generation" 
              desc="Generate Virtual NIN Slip"
              href="/dashboard/services/nin-slips"
              icon={<FileBadge size={20} />}
              color="indigo"
            />
             <ServiceCard 
              title="VNIN to NIBSS" 
              desc="Push VNIN to NIBSS database"
              href="/dashboard/services/bvn/vnin-to-nibss"
              icon={<RefreshCcw size={20} />}
              color="indigo"
            />
            <ServiceCard 
              title="IPE Clearance" 
              desc="Resolve integration issues"
              href="/dashboard/services/nin/ipe-clearance"
              icon={<ShieldCheck size={20} />}
              color="indigo"
            />
            <ServiceCard 
              title="NIN Modification" 
              desc="Update Name, DOB, Phone"
              href="/dashboard/services/nin/modification"
              icon={<FileText size={20} />}
              color="indigo"
            />
          </div>
        </section>

        {/* --- BANKING SERVICES (BVN) --- */}
        <section>
           <div className="flex items-center gap-3 mb-5 border-b border-slate-200 pb-2">
            <Landmark className="text-slate-400" size={20} />
            <h3 className="text-lg font-bold text-slate-800 uppercase tracking-wide">Banking Services (BVN)</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <ServiceCard 
              title="BVN Verification" 
              desc="Verify bank details deeply"
              href="/dashboard/services/bvn/verification"
              icon={<ShieldCheck size={20} />}
              color="teal"
            />
            <ServiceCard 
              title="BVN Enrollment" 
              desc="New BVN Registration"
              href="/dashboard/services/bvn/enrollment"
              icon={<UserCheck size={20} />}
              color="teal"
            />
            <ServiceCard 
              title="BVN Modification" 
              desc="Update details on BVN"
              href="/dashboard/services/bvn/modification"
              icon={<FileText size={20} />}
              color="teal"
            />
             <ServiceCard 
              title="BVN Premium Slip" 
              desc="High-res BVN Document"
              href="/dashboard/services/bvn/premium-slip"
              icon={<FileBadge size={20} />}
              color="teal"
            />
             <ServiceCard 
              title="BVN Retrieval" 
              desc="Recover lost BVN numbers"
              href="/dashboard/services/bvn/retrieval"
              icon={<Search size={20} />}
              color="teal"
            />
          </div>
        </section>

        {/* --- CORPORATE & UTILITY --- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          
          {/* Corporate */}
          <section>
            <div className="flex items-center gap-3 mb-5 border-b border-slate-200 pb-2">
              <Building2 className="text-slate-400" size={20} />
              <h3 className="text-lg font-bold text-slate-800 uppercase tracking-wide">Corporate Services</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ServiceCard 
                title="CAC Registration" 
                desc="Register Business/Company"
                href="/dashboard/services/cac"
                icon={<Building2 size={20} />}
                color="orange"
              />
              <ServiceCard 
                title="Tax ID (TIN)" 
                desc="Generate/Retrieve TIN"
                href="/dashboard/services/tax-id"
                icon={<Receipt size={20} />}
                color="orange"
              />
            </div>
          </section>

           {/* Education */}
           <section>
            <div className="flex items-center gap-3 mb-5 border-b border-slate-200 pb-2">
              <GraduationCap className="text-slate-400" size={20} />
              <h3 className="text-lg font-bold text-slate-800 uppercase tracking-wide">Education & Exams</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ServiceCard 
                title="JAMB Services" 
                desc="Result, Admission Letter"
                href="/dashboard/services/education/jamb"
                icon={<School size={20} />}
                color="purple"
              />
              <ServiceCard 
                title="Exam Pins" 
                desc="WAEC, NECO Scratch Cards"
                href="/dashboard/services/education/exam-pins"
                icon={<FileText size={20} />}
                color="purple"
              />
            </div>
          </section>
        </div>

        {/* --- UTILITIES --- */}
        <section>
          <div className="flex items-center gap-3 mb-5 border-b border-slate-200 pb-2">
            <Wifi className="text-slate-400" size={20} />
            <h3 className="text-lg font-bold text-slate-800 uppercase tracking-wide">Utilities</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <ServiceCard 
                title="Buy Airtime" 
                desc="VTU Airtime Topup"
                href="/dashboard/services/utilities"
                icon={<Wifi size={20} />}
                color="blue"
              />
               <ServiceCard 
                title="Buy Data" 
                desc="SME & Direct Data"
                href="/dashboard/services/utilities/data"
                icon={<Wifi size={20} />}
                color="blue"
              />
          </div>
        </section>

      </div>
    </div>
  );
}

// --- HELPER COMPONENT FOR CLEAN CARDS ---
function ServiceCard({ title, desc, href, icon, color }: { title: string; desc: string; href: string; icon: any; color: string }) {
  // Map color names to Tailwind classes
  const colors: any = {
    indigo: 'bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white',
    teal: 'bg-teal-50 text-teal-600 group-hover:bg-teal-600 group-hover:text-white',
    orange: 'bg-orange-50 text-orange-600 group-hover:bg-orange-600 group-hover:text-white',
    purple: 'bg-purple-50 text-purple-600 group-hover:bg-purple-600 group-hover:text-white',
    blue: 'bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white',
  };

  const bgClass = colors[color] || colors.blue;

  return (
    <Link 
      href={href}
      className="group bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all duration-200 flex flex-col justify-between h-full"
    >
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-lg transition-colors duration-200 ${bgClass}`}>
          {icon}
        </div>
      </div>
      
      <div>
        <h4 className="font-semibold text-slate-800 group-hover:text-blue-700 transition-colors">
          {title}
        </h4>
        <p className="text-sm text-slate-500 mt-1 line-clamp-2">
          {desc}
        </p>
      </div>
    </Link>
  );
}
