'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ShieldCheck, History, AlertTriangle, 
  CheckCircle2, Loader2, ArrowRight, Info,
  Clock, X 
} from 'lucide-react';

type ServiceData = {
  id: string;
  name: string;
  code: string;
  isActive: boolean;
  price: number;
};

export default function IpeClearanceClient({ service }: { service: ServiceData | null }) {
  const [trackingId, setTrackingId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successData, setSuccessData] = useState<any>(null);
  const [showModal, setShowModal] = useState(true);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const isServiceDown = !service || !service.isActive;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessData(null);
    
    if (trackingId.trim().length < 10) {
      setError('Please enter a valid Tracking ID.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/v1/identity/ipe-clearance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trackingId: trackingId.trim() })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Submission failed.');

      setSuccessData({
        reference: data.reference,
        charged_amount: service?.price || 0,
        trackingId: trackingId
      });
      setTrackingId('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {error && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] w-[90%] max-w-sm animate-in slide-in-from-bottom-10 fade-in duration-300">
          <div className="flex items-center gap-3 p-4 bg-red-600 text-white rounded-2xl shadow-2xl border border-red-500">
            <AlertTriangle size={20} />
            <span className="font-semibold text-sm">{error}</span>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full shadow-2xl p-8 border border-slate-200 dark:border-slate-800">
            <h2 className="text-xl font-bold mb-4">IPE Clearance Terms</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              IPE Clearance is a sensitive process. By proceeding, you agree that you have provided the correct Tracking ID.
            </p>
            <button onClick={() => setShowModal(false)} className="w-full py-3.5 bg-red-600 text-white font-bold rounded-xl">I Understand</button>
          </div>
        </div>
      )}

      <div className="animate-in fade-in max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold flex items-center gap-3 text-red-600">
            <ShieldCheck size={26} /> IPE Clearance
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800">
            {successData ? (
              <div className="text-center py-10">
                <CheckCircle2 size={48} className="text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold">Request Submitted</h3>
                <Link href="/dashboard/history/nin/ipe-clearance" className="mt-6 block bg-red-600 text-white py-3 rounded-xl">Track Status</Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold mb-2">Tracking ID</label>
                  <input className="w-full p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200" required value={trackingId} onChange={(e) => setTrackingId(e.target.value.toUpperCase())} placeholder="Enter Tracking ID" />
                </div>
                <button type="submit" disabled={isServiceDown || loading} className="w-full py-4 bg-red-600 text-white font-bold rounded-xl">Submit Clearance</button>
              </form>
            )}
          </div>
          
          <div className="lg:col-span-1 space-y-6">
             <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6">
                <h3 className="font-bold mb-4">Track Status</h3>
                <Link href="/dashboard/history/nin/ipe-clearance" className="w-full py-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between px-4 text-sm font-bold">
                    View History <ArrowRight size={16} />
                </Link>
             </div>
          </div>
        </div>
      </div>
    </>
  );
}
