import Link from 'next/link';

export default function DocsHome() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans">
      {/* --- HEADER --- */}
      <header className="bg-blue-900 text-white py-12">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-4xl font-bold mb-4">AGENTHUB Developer API</h1>
          <p className="text-lg text-blue-200 max-w-2xl mx-auto">
            The unified API for Identity Verification, Corporate Registration, Education, and Utility services in Nigeria.
          </p>
          <div className="mt-8">
            <Link href="/dashboard" className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded shadow transition">
              Go to Dashboard
            </Link>
          </div>
        </div>
      </header>

      {/* --- MAIN CONTENT --- */}
      <main className="container mx-auto px-6 py-12">
        
        {/* 1. GETTING STARTED */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6 border-b pb-2 border-gray-200">🚀 Getting Started</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Link href="/docs/authentication" className="block p-6 bg-white rounded-lg shadow hover:shadow-md transition border border-gray-100">
              <h3 className="text-xl font-semibold text-blue-800 mb-2">Authentication</h3>
              <p className="text-gray-600 text-sm">Learn how to generate API Keys and authenticate your requests securely.</p>
            </Link>
            <Link href="/docs/errors" className="block p-6 bg-white rounded-lg shadow hover:shadow-md transition border border-gray-100">
              <h3 className="text-xl font-semibold text-blue-800 mb-2">Errors & Responses</h3>
              <p className="text-gray-600 text-sm">Standard response formats, error codes, and handling best practices.</p>
            </Link>
            <Link href="/docs/webhooks" className="block p-6 bg-white rounded-lg shadow hover:shadow-md transition border border-gray-100">
              <h3 className="text-xl font-semibold text-blue-800 mb-2">Webhooks</h3>
              <p className="text-gray-600 text-sm">Listen for real-time events like completion of manual jobs.</p>
            </Link>
          </div>
        </section>

        {/* 2. IDENTITY SERVICES */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6 border-b pb-2 border-gray-200">🆔 Identity Services</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <DocCard 
              title="NIN Services" 
              desc="Verification, Validation, Modification, and Slip Generation." 
              href="/docs/identity/nin" 
            />
            <DocCard 
              title="BVN Services" 
              desc="Enrollment, Modification, Retrieval, and Verification." 
              href="/docs/identity/bvn" 
            />
            <DocCard 
              title="IPE Clearance" 
              desc="NIN IPE Clearance processing and slip generation." 
              href="/docs/identity/ipe" 
            />
            <DocCard 
              title="NIN Personalization" 
              desc="Apply for Plastic ID personalization." 
              href="/docs/identity/personalization" 
            />
            <DocCard 
              title="VNIN Generation" 
              desc="Enterprise VNIN generation for corporate use." 
              href="/docs/identity/vnin" 
            />
          </div>
        </section>

        {/* 3. CORPORATE SERVICES */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6 border-b pb-2 border-gray-200">🏢 Corporate Services</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <DocCard 
              title="CAC Registration" 
              desc="Business Name and Company registration automation." 
              href="/docs/corporate/cac" 
            />
            <DocCard 
              title="Tax ID (TIN)" 
              desc="Individual and Non-Individual Tax ID generation." 
              href="/docs/corporate/tin" 
            />
          </div>
        </section>

        {/* 4. UTILITIES & EDUCATION */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6 border-b pb-2 border-gray-200">🎓 Utilities & Education</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
             <DocCard 
              title="JAMB Services" 
              desc="Result printing, Admission letters, and Profile codes." 
              href="/docs/education/jamb" 
            />
            <DocCard 
              title="Airtime & Data" 
              desc="VTU services for MTN, Glo, Airtel, and 9mobile." 
              href="/docs/utilities/vtu" 
            />
            <DocCard 
              title="Electricity & Cables" 
              desc="Bill payments for Discos and Cable TV subscriptions." 
              href="/docs/utilities/bills" 
            />
          </div>
        </section>

      </main>

      {/* --- FOOTER --- */}
      <footer className="bg-gray-800 text-gray-400 py-8 text-center">
        <p>&copy; {new Date().getFullYear()} AGENTHUB Technology. All rights reserved.</p>
        <p className="text-sm mt-2">Powered by Xpresspoint Tech</p>
      </footer>
    </div>
  );
}

// Simple Card Component for cleaner code
function DocCard({ title, desc, href }: { title: string, desc: string, href: string }) {
  return (
    <Link href={href} className="group block p-6 bg-white rounded-lg shadow hover:shadow-lg transition border border-gray-100">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-bold text-gray-800 group-hover:text-blue-600 transition">{title}</h3>
        <span className="text-gray-400 group-hover:text-blue-500">&rarr;</span>
      </div>
      <p className="text-gray-600 text-sm leading-relaxed">{desc}</p>
    </Link>
  );
}
