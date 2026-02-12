import Link from 'next/link';
import { 
  Wifi, Smartphone, GraduationCap, Zap, 
  ShieldCheck, ArrowRight, CheckCircle2 
} from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 selection:bg-blue-100">
      
      {/* --- NAVBAR --- */}
      <nav className="fixed w-full z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-xl">
              A
            </div>
            <span className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">AgentHub</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600 dark:text-slate-300">
            <a href="#services" className="hover:text-blue-600 transition">Services</a>
            <a href="#pricing" className="hover:text-blue-600 transition">Pricing</a>
            <a href="#contact" className="hover:text-blue-600 transition">Contact</a>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-slate-900 dark:text-white hover:text-blue-600">
              Log in
            </Link>
            <Link 
              href="/register" 
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-full transition-all shadow-lg shadow-blue-600/20"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <section className="pt-32 pb-20 lg:pt-48 lg:pb-32 px-4 relative overflow-hidden">
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-bold mb-8 animate-in fade-in slide-in-from-bottom-4">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            Instant Delivery Guaranteed
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-6 leading-tight animate-in fade-in slide-in-from-bottom-6 duration-700">
            The Fastest Way to Buy <br className="hidden md:block"/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">
               Data, Airtime & Pins
            </span>
          </h1>
          
          <p className="max-w-2xl mx-auto text-lg text-slate-600 dark:text-slate-400 mb-10 leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-700">
            Experience lightning-fast automated transactions. We provide cheap data bundles, instant airtime top-up, and exam result pins for WAEC, NECO & JAMB.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-10 duration-1000">
            <Link 
              href="/register" 
              className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-xl shadow-blue-600/20 flex items-center justify-center gap-2"
            >
              Create Free Account <ArrowRight size={18} />
            </Link>
            <Link 
              href="/login" 
              className="w-full sm:w-auto px-8 py-4 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-slate-700 transition-all flex items-center justify-center"
            >
              Login to Dashboard
            </Link>
          </div>
        </div>

        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 pointer-events-none">
           <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl mix-blend-multiply dark:bg-blue-900/20"></div>
           <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-400/10 rounded-full blur-3xl mix-blend-multiply dark:bg-cyan-900/20"></div>
        </div>
      </section>

      {/* --- SERVICES GRID --- */}
      <section id="services" className="py-24 bg-slate-50 dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Our Core Services</h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
              Everything you need to stay connected and educated. Delivered instantly.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            
            {/* DATA */}
            <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700 group">
              <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Wifi size={28} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Cheap Data Bundles</h3>
              <p className="text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
                Buy SME, Corporate, and Gifting data for MTN, Glo, Airtel, and 9Mobile. Valid for 30 days.
              </p>
              <ul className="space-y-2 mb-8">
                <li className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                  <CheckCircle2 size={16} className="text-green-500" /> Automated Delivery
                </li>
                <li className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                  <CheckCircle2 size={16} className="text-green-500" /> 30-Day Validity
                </li>
              </ul>
            </div>

            {/* AIRTIME */}
            <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700 group">
              <div className="w-14 h-14 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Smartphone size={28} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Airtime Top-up</h3>
              <p className="text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
                Instant airtime recharge for all Nigerian networks. Get discounts on every recharge you make.
              </p>
              <ul className="space-y-2 mb-8">
                <li className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                  <CheckCircle2 size={16} className="text-green-500" /> Up to 2% Discount
                </li>
                <li className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                  <CheckCircle2 size={16} className="text-green-500" /> Instant VTU
                </li>
              </ul>
            </div>

            {/* EXAM PINS */}
            <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700 group">
              <div className="w-14 h-14 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <GraduationCap size={28} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Exam Result Pins</h3>
              <p className="text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
                Purchase scratch card pins for WAEC, NECO, and NABTEB instantly. View your results without stress.
              </p>
              <ul className="space-y-2 mb-8">
                <li className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                  <CheckCircle2 size={16} className="text-green-500" /> Instant Pin Display
                </li>
                <li className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                  <CheckCircle2 size={16} className="text-green-500" /> Valid for all Years
                </li>
              </ul>
            </div>

          </div>
        </div>
      </section>

      {/* --- NETWORK STRIP --- */}
      <div className="py-12 border-y border-gray-100 dark:border-gray-800 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-6">
            <p className="text-center text-sm font-bold text-gray-400 uppercase tracking-widest mb-8">Supported Providers</p>
            <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
                <span className="text-2xl font-black text-yellow-500">MTN</span>
                <span className="text-2xl font-black text-green-600">GLO</span>
                <span className="text-2xl font-black text-red-600">AIRTEL</span>
                <span className="text-2xl font-black text-green-800">9MOBILE</span>
                <span className="text-xl font-bold text-blue-800">WAEC</span>
                <span className="text-xl font-bold text-green-700">NECO</span>
                <span className="text-xl font-bold text-purple-700">JAMB</span>
            </div>
        </div>
      </div>

      {/* --- WHY CHOOSE US --- */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-16 items-center">
                <div>
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">
                        Why thousands trust us with their <span className="text-blue-600">Daily Top-ups</span>
                    </h2>
                    <p className="text-slate-600 dark:text-slate-400 text-lg mb-8">
                        We have built a system that prioritizes speed and reliability. Whether you are buying for yourself or reselling to others, our platform delivers.
                    </p>
                    
                    <div className="space-y-6">
                        <div className="flex gap-4">
                            <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-full flex items-center justify-center shrink-0">
                                <Zap size={24} />
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-900 dark:text-white text-lg">Automated Delivery</h4>
                                <p className="text-slate-500 dark:text-slate-400 text-sm">Our system runs 24/7. Your orders are processed immediately.</p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-full flex items-center justify-center shrink-0">
                                <ShieldCheck size={24} />
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-900 dark:text-white text-lg">Secure Wallet</h4>
                                <p className="text-slate-500 dark:text-slate-400 text-sm">Your funds are safe. Fund your wallet easily and transact confidently.</p>
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Abstract Visual */}
                <div className="relative h-[400px] bg-slate-100 dark:bg-slate-800 rounded-3xl overflow-hidden flex items-center justify-center">
                    <div className="text-center p-8">
                        <div className="text-6xl font-black text-slate-200 dark:text-slate-700 mb-4">FAST</div>
                        <div className="text-6xl font-black text-blue-600/20">RELIABLE</div>
                        <div className="text-6xl font-black text-slate-200 dark:text-slate-700 mt-4">CHEAP</div>
                    </div>
                </div>
            </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">A</div>
                <span className="text-white font-bold text-lg">AgentHub</span>
            </div>
            <div className="flex gap-8 text-sm">
                <Link href="/login" className="hover:text-white transition">Login</Link>
                <Link href="/register" className="hover:text-white transition">Register</Link>
                <a href="#" className="hover:text-white transition">Privacy Policy</a>
                <a href="#" className="hover:text-white transition">Terms</a>
            </div>
            <div className="text-sm">
                &copy; {new Date().getFullYear()} AgentHub. All rights reserved.
            </div>
        </div>
      </footer>
    </div>
  );
}
