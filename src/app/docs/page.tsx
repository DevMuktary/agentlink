import Link from 'next/link';

export default function DocsLandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      
      {/* 1. NAVBAR / HEADER */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">A</div>
            <span className="text-xl font-bold tracking-tight text-slate-900">AgentHub <span className="text-blue-600">Docs</span></span>
          </div>
          <nav className="flex gap-6 text-sm font-medium text-slate-600">
            <Link href="/dashboard" className="hover:text-blue-600 transition-colors">Dashboard</Link>
            <Link href="mailto:support@agenthub.com" className="hover:text-blue-600 transition-colors">Support</Link>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* 2. HERO SECTION */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 mb-6">
            Build with <span className="text-blue-600">AgentHub</span>
          </h1>
          <p className="text-lg text-slate-600 leading-relaxed">
            The all-in-one API for Identity Verification, Corporate Registration, and Digital Services in Nigeria. 
            Robust, reliable, and designed for developers.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link href="/docs/authentication" className="px-6 py-3 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-all">
              Get Your API Keys
            </Link>
            <Link href="/docs/errors" className="px-6 py-3 bg-white border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-all">
              Error Codes
            </Link>
          </div>
        </div>

        {/* 3. CORE SERVICES GRID */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6 border-l-4 border-blue-600 pl-4">Identity Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* NIN Card */}
            <ServiceCard 
              href="/docs/nin"
              title="NIN Services"
              icon="🆔"
              description="Verify identities, modify data, validate slips, and perform advanced NIN personalization."
              endpoints={['/verify', '/modification', '/validation', '/slip']}
            />

            {/* BVN Card */}
            <ServiceCard 
              href="/docs/bvn"
              title="BVN Services"
              icon="🏦"
              description="Full suite for BVN enrollment, modification, phone retrieval, and VNIN-to-NIBSS submission."
              endpoints={['/enrollment', '/modification', '/retrieval', '/vnin-link']}
            />

            {/* IPE Clearance Card */}
            <ServiceCard 
              href="/docs/ipe"
              title="IPE Clearance"
              icon="✅"
              description="Automated IPE clearance processing with instant status checks and slip generation."
              endpoints={['/clearance', '/status']}
            />
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6 border-l-4 border-green-600 pl-4">Corporate & Tax</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* CAC Card */}
            <ServiceCard 
              href="/docs/cac"
              title="CAC Registration"
              icon="🏢"
              description="Register business names and companies directly via API. Track status and download certificates."
              endpoints={['/register', '/status', '/upload']}
            />

            {/* Tax ID Card */}
            <ServiceCard 
              href="/docs/tax"
              title="Tax ID (TIN)"
              icon="📄"
              description="Generate Individual and Non-Individual Tax Identification Numbers (JTB/FIRS)."
              endpoints={['/generate', '/status']}
            />

          </div>
        </div>

        <div className="mb-16">
          <h2 className="text-2xl font-bold text-slate-900 mb-6 border-l-4 border-purple-600 pl-4">Education & Utilities</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* JAMB Card */}
            <ServiceCard 
              href="/docs/jamb"
              title="JAMB Services"
              icon="🎓"
              description="Process result slips, admission letters, and regularization for higher education."
              endpoints={['/result', '/admission', '/profile-code']}
            />

            {/* Utilities Card */}
            <ServiceCard 
              href="/docs/utilities"
              title="Utilities & Bills"
              icon="⚡"
              description="Vending for Airtime, Data bundles, and Electricity bill payments across all networks."
              endpoints={['/airtime', '/data', '/power']}
            />

            {/* Wallet & General */}
            <ServiceCard 
              href="/docs/wallet"
              title="Wallet & Account"
              icon="💼"
              description="Manage your AgentHub wallet balance, view transaction history, and fund your account."
              endpoints={['/balance', '/transactions']}
            />

          </div>
        </div>

      </main>

      {/* 4. FOOTER */}
      <footer className="bg-slate-900 text-slate-400 py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="mb-4 text-white font-semibold">AgentHub API v1.0</p>
          <p className="text-sm">
            &copy; {new Date().getFullYear()} AgentHub. All rights reserved. 
            <br />
            Built for developers, by developers.
          </p>
        </div>
      </footer>
    </div>
  );
}

// Helper Component for Cards
function ServiceCard({ title, description, icon, href, endpoints }: any) {
  return (
    <Link href={href} className="group block h-full">
      <div className="h-full bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md hover:border-blue-500 transition-all duration-200">
        <div className="flex items-center justify-between mb-4">
          <span className="text-3xl">{icon}</span>
          <span className="text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
            Explore &rarr;
          </span>
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
          {title}
        </h3>
        <p className="text-slate-600 text-sm mb-4 leading-relaxed">
          {description}
        </p>
        
        {/* Endpoint Tags */}
        <div className="flex flex-wrap gap-2">
          {endpoints.map((ep: string) => (
            <span key={ep} className="px-2 py-1 bg-slate-100 text-slate-600 text-xs font-mono rounded border border-slate-200">
              POST {ep}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}
