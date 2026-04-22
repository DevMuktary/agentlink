import Link from 'next/link';
import { 
  Cpu, Cloud, Layers, Zap, 
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
            <span className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Agent Hub</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600 dark:text-slate-300">
            <a href="#services" className="hover:text-blue-600 transition">Solutions</a>
            <a href="#about" className="hover:text-blue-600 transition">About Us</a>
            <a href="#contact" className="hover:text-blue-600 transition">Contact</a>
          </div>

          <div className="flex items-center gap-4">
            {/* Kept ONLY the Login button as requested */}
            <Link 
              href="/login" 
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-full transition-all shadow-lg shadow-blue-600/20"
            >
              Client Login
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
            Empowering Digital Transformation
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-6 leading-tight animate-in fade-in slide-in-from-bottom-6 duration-700">
            Smart Technology Solutions <br className="hidden md:block"/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">
                For Modern Businesses
            </span>
          </h1>
          
          <p className="max-w-3xl mx-auto text-lg text-slate-600 dark:text-slate-400 mb-10 leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-700">
            Agent Hub Integrated Limited is a forward-thinking technology company committed to delivering innovative, reliable, and scalable digital solutions. We specialize in empowering businesses, entrepreneurs, and organizations with technology that drives growth and competitive advantage.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-10 duration-1000">
            <Link 
              href="/login" 
              className="w-full sm:w-auto px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl transition-all shadow-xl hover:scale-105 flex items-center justify-center gap-2"
            >
              Access Client Portal <ArrowRight size={18} />
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
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Our Core Capabilities</h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
              We provide smart, scalable, and secure technological frameworks tailored to your organizational needs.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            
            {/* SOFTWARE DEV */}
            <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700 group">
              <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Cpu size={28} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Custom Software</h3>
              <p className="text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
                Bespoke software development engineered to solve your unique business challenges and streamline operations.
              </p>
              <ul className="space-y-2 mb-8">
                <li className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                  <CheckCircle2 size={16} className="text-blue-500" /> Web & Mobile Apps
                </li>
                <li className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                  <CheckCircle2 size={16} className="text-blue-500" /> API Development
                </li>
              </ul>
            </div>

            {/* CLOUD INFRASTRUCTURE */}
            <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700 group">
              <div className="w-14 h-14 bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Cloud size={28} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Cloud Solutions</h3>
              <p className="text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
                Scalable and secure cloud hosting, migration, and management to ensure your platforms are always online.
              </p>
              <ul className="space-y-2 mb-8">
                <li className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                  <CheckCircle2 size={16} className="text-cyan-500" /> Infrastructure as Code
                </li>
                <li className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                  <CheckCircle2 size={16} className="text-cyan-500" /> 99.99% Uptime SLA
                </li>
              </ul>
            </div>

            {/* ENTERPRISE ARCHITECTURE */}
            <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700 group">
              <div className="w-14 h-14 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Layers size={28} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Enterprise Systems</h3>
              <p className="text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
                Robust, integrated enterprise systems designed for massive scale and optimal internal efficiency.
              </p>
              <ul className="space-y-2 mb-8">
                <li className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                  <CheckCircle2 size={16} className="text-indigo-500" /> System Integration
                </li>
                <li className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                  <CheckCircle2 size={16} className="text-indigo-500" /> Data Analytics
                </li>
              </ul>
            </div>

          </div>
        </div>
      </section>

      {/* --- TECH STACK STRIP --- */}
      <div className="py-12 border-y border-gray-100 dark:border-gray-800 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-6">
            <p className="text-center text-sm font-bold text-gray-400 uppercase tracking-widest mb-8">Technologies We Master</p>
            <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
                <span className="text-2xl font-black text-blue-500">React</span>
                <span className="text-2xl font-black text-slate-800 dark:text-white">Next.js</span>
                <span className="text-2xl font-black text-green-600">Node.js</span>
                <span className="text-2xl font-black text-orange-500">AWS</span>
                <span className="text-xl font-bold text-blue-700">Python</span>
                <span className="text-xl font-bold text-blue-400">Docker</span>
            </div>
        </div>
      </div>

      {/* --- WHY CHOOSE US --- */}
      <section id="about" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-16 items-center">
                <div>
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">
                        Why modern enterprises trust us for <span className="text-blue-600">Digital Growth</span>
                    </h2>
                    <p className="text-slate-600 dark:text-slate-400 text-lg mb-8">
                        We don't just write code; we build solutions. Our architecture is designed to scale with your business, ensuring that your digital infrastructure is never a bottleneck to your growth.
                    </p>
                    
                    <div className="space-y-6">
                        <div className="flex gap-4">
                            <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-full flex items-center justify-center shrink-0">
                                <Zap size={24} />
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-900 dark:text-white text-lg">High Performance</h4>
                                <p className="text-slate-500 dark:text-slate-400 text-sm">Optimized architectures that guarantee speed, low latency, and a seamless user experience.</p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-full flex items-center justify-center shrink-0">
                                <ShieldCheck size={24} />
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-900 dark:text-white text-lg">Enterprise Security</h4>
                                <p className="text-slate-500 dark:text-slate-400 text-sm">Industry-standard encryption and security protocols to protect your sensitive corporate data.</p>
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Abstract Visual */}
                <div className="relative h-[400px] bg-slate-100 dark:bg-slate-800 rounded-3xl overflow-hidden flex items-center justify-center">
                    <div className="text-center p-8">
                        <div className="text-6xl font-black text-slate-200 dark:text-slate-700 mb-4">INNOVATE</div>
                        <div className="text-6xl font-black text-blue-600/20">SCALE</div>
                        <div className="text-6xl font-black text-slate-200 dark:text-slate-700 mt-4">SUCCEED</div>
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
                <span className="text-white font-bold text-lg">Agent Hub Integrated Ltd.</span>
            </div>
            <div className="flex gap-8 text-sm">
                <Link href="/login" className="hover:text-white transition">Client Login</Link>
                <a href="#" className="hover:text-white transition">Privacy Policy</a>
                <a href="#" className="hover:text-white transition">Terms of Service</a>
            </div>
            <div className="text-sm">
                &copy; {new Date().getFullYear()} Agent Hub Integrated Limited. All rights reserved.
            </div>
        </div>
      </footer>
    </div>
  );
}
