'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import GlobalLoader from '@/components/GlobalLoader';
import { 
  Clock, CheckCircle2, XCircle, Search, RefreshCw, 
  ShieldCheck, Eye, Copy, AlertCircle, FileText
} from 'lucide-react';

export default function IpeHistoryPage() {
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<any[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<any[]>([]);
  const [selectedResult, setSelectedResult] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchHistory();
  }, []);

  // Filter Logic
  useEffect(() => {
    if (!searchQuery) {
      setFilteredRequests(requests);
    } else {
      const lowerQ = searchQuery.toLowerCase();
      setFilteredRequests(requests.filter(r => 
        r.requestData?.trackingId?.toLowerCase().includes(lowerQ) ||
        r.id.toLowerCase().includes(lowerQ)
      ));
    }
  }, [searchQuery, requests]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/user/requests?type=IPE_CLEARANCE');
      setRequests(res.data);
      setFilteredRequests(res.data);
    } catch (error) {
      console.error("Failed to load history");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  if (loading && requests.length === 0) return <GlobalLoader />;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="w-8 h-8 text-blue-600" />
            IPE Clearance History
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Track your IPE clearance requests and view results.</p>
        </div>

        <div className="flex gap-3 w-full md:w-auto">
           {/* Search */}
           <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search Tracking ID..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
          
          {/* Refresh Button */}
          <button 
            onClick={fetchHistory} 
            className="p-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition text-gray-600 dark:text-gray-300"
            title="Refresh Status"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700">
              <tr>
                <th className="px-6 py-4 font-semibold text-gray-500 dark:text-gray-400">Date Submitted</th>
                <th className="px-6 py-4 font-semibold text-gray-500 dark:text-gray-400">Old Tracking ID</th>
                <th className="px-6 py-4 font-semibold text-gray-500 dark:text-gray-400">Cost</th>
                <th className="px-6 py-4 font-semibold text-gray-500 dark:text-gray-400">Status</th>
                <th className="px-6 py-4 font-semibold text-gray-500 dark:text-gray-400 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {filteredRequests.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-500">No requests found matching your filters.</td></tr>
              ) : (
                filteredRequests.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                      {new Date(item.createdAt).toLocaleString('en-NG', {
                         year: '2-digit', month: 'short', day: 'numeric',
                         hour: '2-digit', minute: '2-digit'
                      })}
                    </td>
                    <td className="px-6 py-4 font-mono text-gray-700 dark:text-gray-200 flex items-center gap-2">
                      {item.requestData?.trackingId || '---'}
                      <button onClick={() => copyToClipboard(item.requestData?.trackingId)} className="text-gray-400 hover:text-blue-500 transition">
                        <Copy className="w-3 h-3" />
                      </button>
                    </td>
                    <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">
                      -₦{Number(item.cost).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      {item.status === 'COMPLETED' && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                          <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Completed
                        </span>
                      )}
                      {item.status === 'FAILED' && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                          <XCircle className="w-3.5 h-3.5 mr-1" /> Failed
                        </span>
                      )}
                      {item.status === 'PROCESSING' && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 animate-pulse">
                          <Clock className="w-3.5 h-3.5 mr-1" /> Processing
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => setSelectedResult(item)}
                        className="inline-flex items-center justify-center bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 px-3 py-1.5 rounded-md text-xs font-medium transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5 mr-1.5" /> View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DETAILS MODAL */}
      {selectedResult && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-lg w-full shadow-2xl flex flex-col max-h-[90vh] animate-in zoom-in-95">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center shrink-0">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                {selectedResult.status === 'COMPLETED' ? (
                  <CheckCircle2 className="w-6 h-6 text-green-500" />
                ) : selectedResult.status === 'FAILED' ? (
                  <XCircle className="w-6 h-6 text-red-500" />
                ) : (
                  <Clock className="w-6 h-6 text-yellow-500" />
                )}
                Transaction Details
              </h3>
              <button onClick={() => setSelectedResult(null)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
                <XCircle className="w-6 h-6 text-gray-500" />
              </button>
            </div>
            
            {/* Content */}
            <div className="p-6 overflow-y-auto space-y-4">
              
              {/* Status Message Banner */}
              <div className={`p-4 rounded-lg border ${
                selectedResult.status === 'COMPLETED' ? 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300' : 
                selectedResult.status === 'FAILED' ? 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300' :
                'bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-300'
              }`}>
                <div className="flex gap-3">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <p className="text-sm font-medium">
                    {selectedResult.status === 'PROCESSING' 
                      ? 'This request is currently being processed by the provider. Please check back later.' 
                      : selectedResult.responseData?.message || selectedResult.responseData?.error || 'Transaction completed.'}
                  </p>
                </div>
              </div>

              {/* Data Grid */}
              <div className="grid grid-cols-1 gap-4 text-sm">
                <DetailBox label="Old Tracking ID" value={selectedResult.requestData?.trackingId} copyable />
                
                {/* Show NEW ID if Completed */}
                {selectedResult.status === 'COMPLETED' && selectedResult.responseData && (
                   <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800">
                     <span className="text-blue-600 dark:text-blue-400 text-xs uppercase tracking-wide font-bold">New Tracking ID</span>
                     <div className="flex items-center justify-between mt-1">
                        <p className="font-mono text-xl font-bold text-gray-900 dark:text-white">
                          {selectedResult.responseData.new_tracking_id || selectedResult.responseData.tracking_id || '---'}
                        </p>
                        <button 
                          onClick={() => copyToClipboard(selectedResult.responseData.new_tracking_id || selectedResult.responseData.tracking_id)}
                          className="p-2 hover:bg-blue-100 dark:hover:bg-blue-800 rounded-md transition"
                        >
                          <Copy className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        </button>
                     </div>
                   </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <DetailBox label="Service Type" value="IPE Clearance" />
                  <DetailBox label="Amount Charged" value={`₦${Number(selectedResult.cost).toLocaleString()}`} />
                  <DetailBox label="Date" value={new Date(selectedResult.createdAt).toLocaleString()} />
                  <DetailBox label="Reference" value={selectedResult.requestData?.clientReference || 'N/A'} />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-3 shrink-0 rounded-b-xl">
              <button 
                onClick={() => setSelectedResult(null)}
                className="px-4 py-2 bg-white border border-gray-300 dark:bg-gray-800 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

function DetailBox({ label, value, copyable = false }: { label: string, value: any, copyable?: boolean }) {
  const copy = () => {
    navigator.clipboard.writeText(value);
    alert('Copied!');
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg relative group">
      <span className="text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wide">{label}</span>
      <p className="font-semibold text-gray-900 dark:text-white mt-0.5 truncate pr-8">{value || 'N/A'}</p>
      {copyable && value && (
        <button onClick={copy} className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 opacity-0 group-hover:opacity-100 transition-opacity bg-white dark:bg-gray-600 rounded shadow-sm hover:text-blue-600">
          <Copy className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
