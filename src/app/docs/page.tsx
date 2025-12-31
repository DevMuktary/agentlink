import Link from 'next/link';
import { ArrowRight, ShieldCheck, Smartphone, Zap, CheckCircle2 } from 'lucide-react';

export default function DocsLanding() {
  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      
      {/* Hero Section */}
      <div className="space-y-6">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white">
          Build with <span className="text-blue-600">AgentLink</span>
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl leading-relaxed">
          The unified API platform for Identity Verification, Utility Payments, and Corporate Services in Nigeria. 
          One integration, endless possibilities.
        </p>
        <div className="flex gap-4">
          <Link href="/docs/nin" className="inline-flex items-center justify-center px-6 py-3 text-base font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition">
            Start Integration <ArrowRight className="ml-2 w-4 h-4" />
          </Link>
          <Link href="/dashboard/developers" className="inline-flex items-center justify-center px-6 py-3 text-base font-medium text-gray-700 bg-gray-100 dark:bg-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-200 transition">
            Get API Keys
          </Link>
        </div>
      </div>

      <hr className="border-gray-200 dark:border-gray-800" />

      {/* Features Grid */}
      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Why AgentLink?</h2>
          <ul className="space-y-3">
            {[
              "99.9% Uptime on all Identity Services",
              "Single Wallet for all transactions",
              "Instant Webhook Notifications",
              "Bank-grade Security & Encryption",
              "Detailed Transaction Logs"
            ].map((item, i) => (
              <li key={i} className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>
        
        {/* Quick Links Card */}
        <div className="grid gap-4">
           <DocCard 
             title="NIN Services" 
             desc="Verification, Validation, IPE Clearance, and Modification."
             icon={ShieldCheck}
             href="/docs/nin"
             color="text-blue-600"
           />
           <DocCard 
             title="BVN Services" 
             desc="Identity recovery, verification and personalization."
             icon={Smartphone}
             href="/docs/bvn"
             color="text-cyan-600"
           />
           <DocCard 
             title="Utility & Corporate" 
             desc="Airtime, Data, CAC, and TIN Registration endpoints."
             icon={Zap}
             href="/docs/utilities"
             color="text-orange-600"
           />
        </div>
      </div>
    </div>
  );
}

function DocCard({ title, desc, icon: Icon, href, color }: any) {
  return (
    <Link href={href} className="flex items-start gap-4 p-5 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-blue-500 hover:shadow-md transition-all group bg-white dark:bg-gray-900">
      <div className={`p-3 rounded-lg bg-gray-50 dark:bg-gray-800 ${color} group-hover:scale-110 transition-transform`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <h3 className="font-bold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">{title}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{desc}</p>
      </div>
    </Link>
  );
}
