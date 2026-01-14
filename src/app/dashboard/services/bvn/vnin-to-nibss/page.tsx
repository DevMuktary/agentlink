'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import GlobalLoader from '@/components/GlobalLoader';
import { 
  ArrowRightLeft, Search, CheckCircle2, XCircle, 
  FileText, Copy, Eye, User
} from 'lucide-react';

export default function VninToNibssHistory() {
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<any[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<any>(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await axios.get('/api/user/requests'); 
      const logs = res.data.filter((r: any) => r.serviceType === 'VNIN_TO_NIBSS');
      setRequests(logs);
      setFilteredRequests(logs);
    } catch (error) {
      console.error("Failed to load history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      setFilteredRequests(requests.filter(r => 
        r.requestData?.ticket_id?.toLowerCase().includes(q) || 
        r.requestData?.full_name?.toLowerCase().includes(q) ||
        r.requestData?.nin?.includes(q)
      ));
    } else {
      setFilteredRequests(requests);
    }
  }, [searchQuery, requests]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied!');
  };

  if (loading) return <GlobalLoader />;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <ArrowRightLeft className="w-8 h-8 text-violet-600" /> VNIN to NIBSS
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Track VNIN validation submissions to NIBSS.</p>
        </div>
        
        <div className="relative w-full md:w-auto">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search Ticket ID or Name..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full md:w-64 pl-10 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700">
              <tr>
                <th className="px-6 py-4 font-semibold text-gray-500">Date</th>
                <th className="px-6 py-4 font-semibold text-gray-500">Ticket ID</th>
                <th className="px-6 py-4 font-semibold text-gray-500">Full Name</th>
                <th className="px-6 py-4 font-semibold text-gray-500">Status</th>
                <th className="px-6 py-4 font-semibold text-gray-500 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {filteredRequests.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 font-mono text-violet-600 font-medium">
                      {item.requestData?.ticket_id}
                    </td>
                    <td className="px-6 py-4 text-gray-700 dark:text-gray-200">
                      {item.requestData?.full_name}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        item.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                        item.status === 'FAILED' ? 'bg-red-100 text-red-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => setSelectedItem(item)} className="text-gray-500 hover:text-violet-600">
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Details Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-lg w-full shadow-2xl overflow-hidden animate-in zoom-in-95">
            <div className="p-5 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
              <h3 className="font-bold text-lg">Request Details</h3>
              <button onClick={() => setSelectedItem(null)}><XCircle className="w-6 h-6 text-gray-400 hover:text-red-500" /></button>
            </div>
            
            <div className="p-6 space-y-4">
              
              {/* Submission Data */}
              <div className="bg-violet-50 dark:bg-violet-900/10 p-4 rounded-lg border border-violet-100 dark:border-violet-800 text-sm space-y-3">
                 <div className="flex justify-between items-center border-b border-violet-200 dark:border-violet-700 pb-2">
                    <span className="text-gray-500">Ticket ID</span>
                    <span className="font-mono font-bold text-violet-700 dark:text-violet-300">{selectedItem.requestData?.ticket_id}</span>
                 </div>
                 
                 <div>
                    <span className="text-xs text-violet-500 uppercase font-bold block mb-1">Candidate</span>
                    <div className="flex items-center gap-2">
                       <User className="w-4 h-4 text-gray-400" />
                       <span className="font-medium text-lg">{selectedItem.requestData?.full_name}</span>
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div>
                        <span className="text-xs text-gray-400 uppercase">NIN</span>
                        <p className="font-mono font-medium">{selectedItem.requestData?.nin}</p>
                    </div>
                    <div>
                        <span className="text-xs text-gray-400 uppercase">BVN</span>
                        <p className="font-mono font-medium">{selectedItem.requestData?.bvn}</p>
                    </div>
                 </div>
              </div>

              {/* Status Section */}
              {selectedItem.status === 'COMPLETED' ? (
                 <div className="p-4 bg-green-50 text-green-700 border border-green-200 rounded-lg text-center">
                    <CheckCircle2 className="w-10 h-10 mx-auto mb-2" />
                    <p className="font-bold text-lg">Successful</p>
                    <p className="text-sm mt-1">It has been successfully sent to NIBSS.</p>
                 </div>
              ) : selectedItem.status === 'FAILED' ? (
                 <div className="p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg text-center">
                    <XCircle className="w-8 h-8 mx-auto mb-2" />
                    <p className="font-bold">Submission Failed</p>
                    <p className="text-sm">{selectedItem.adminNote || "Request rejected."}</p>
                 </div>
              ) : (
                 <div className="text-center text-gray-500 italic text-sm">
                    Processing request...
                 </div>
              )}

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
