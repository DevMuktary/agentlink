'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import GlobalLoader from '@/components/GlobalLoader';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Search, 
  Eye,
  FileText
} from 'lucide-react';

export default function NinHistoryPage() {
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<any[]>([]);
  const [selectedResult, setSelectedResult] = useState<any>(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      // We need a generic API to fetch requests by type. 
      // For now, we assume this endpoint exists or we filter client-side.
      // In a real app, you'd create: /api/user/requests?type=NIN_VERIFICATION
      const res = await axios.get('/api/user/requests?type=NIN_VERIFICATION'); 
      setRequests(res.data);
    } catch (error) {
      console.error("Failed to load history");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <GlobalLoader />;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">NIN Verification History</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">View logs of all NIN checks performed via API.</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search Reference..." 
            className="pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm w-64"
          />
        </div>
      </div>

      {/* HISTORY TABLE */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-6 py-4 font-semibold text-gray-500 dark:text-gray-400">Date</th>
                <th className="px-6 py-4 font-semibold text-gray-500 dark:text-gray-400">Reference</th>
                <th className="px-6 py-4 font-semibold text-gray-500 dark:text-gray-400">NIN Number</th>
                <th className="px-6 py-4 font-semibold text-gray-500 dark:text-gray-400">Status</th>
                <th className="px-6 py-4 font-semibold text-gray-500 dark:text-gray-400 text-right">Result</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {requests.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">No verification history found.</td>
                </tr>
              ) : (
                requests.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                      {new Date(item.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-gray-500">
                      {item.id.slice(0, 8)}...
                    </td>
                    <td className="px-6 py-4 font-mono text-gray-700 dark:text-gray-200">
                      {item.requestData?.nin || '---'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        item.status === 'COMPLETED' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                        item.status === 'FAILED' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {item.status === 'COMPLETED' && <CheckCircle2 className="w-3 h-3 mr-1" />}
                        {item.status === 'FAILED' && <XCircle className="w-3 h-3 mr-1" />}
                        {item.status === 'PROCESSING' && <Clock className="w-3 h-3 mr-1" />}
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {item.status === 'COMPLETED' && item.responseData && (
                        <button 
                          onClick={() => setSelectedResult(item.responseData)}
                          className="text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium flex items-center justify-end w-full"
                        >
                          <Eye className="w-4 h-4 mr-1" /> View
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* RESULT MODAL */}
      {selectedResult && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-lg w-full shadow-2xl overflow-hidden animate-in zoom-in-95">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Verification Result</h3>
              <button onClick={() => setSelectedResult(null)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
                <XCircle className="w-6 h-6 text-gray-500" />
              </button>
            </div>
            
            <div className="p-6">
              {/* If response contains a photo (Base64) */}
              {selectedResult.photo && (
                <div className="flex justify-center mb-6">
                  <img 
                    src={`data:image/jpeg;base64,${selectedResult.photo}`} 
                    alt="User Photo" 
                    className="w-32 h-32 rounded-full object-cover border-4 border-gray-200 dark:border-gray-600 shadow-md"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                  <span className="text-gray-500 dark:text-gray-400 text-xs uppercase">First Name</span>
                  <p className="font-semibold text-gray-900 dark:text-white mt-1">{selectedResult.firstname || 'N/A'}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                  <span className="text-gray-500 dark:text-gray-400 text-xs uppercase">Surname</span>
                  <p className="font-semibold text-gray-900 dark:text-white mt-1">{selectedResult.surname || 'N/A'}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                  <span className="text-gray-500 dark:text-gray-400 text-xs uppercase">Date of Birth</span>
                  <p className="font-semibold text-gray-900 dark:text-white mt-1">{selectedResult.birthdate || 'N/A'}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                  <span className="text-gray-500 dark:text-gray-400 text-xs uppercase">Gender</span>
                  <p className="font-semibold text-gray-900 dark:text-white mt-1">{selectedResult.gender || 'N/A'}</p>
                </div>
              </div>

              {/* JSON Dump for debugging (Hidden by default, useful for dev) */}
              {/* <pre className="mt-4 text-xs bg-gray-900 text-green-400 p-4 rounded overflow-auto h-32">
                {JSON.stringify(selectedResult, null, 2)}
              </pre> */}
            </div>

            <div className="p-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-700 flex justify-end">
              <button 
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                onClick={() => window.print()} // Simple print for now
              >
                Print Slip
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
