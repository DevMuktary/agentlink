'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import GlobalLoader from '@/components/GlobalLoader';
import { 
  Search, CheckCircle2, XCircle, Clock, 
  Smartphone, Monitor, Eye, Copy, Hash, User 
} from 'lucide-react';

export default function BvnRetrievalHistory() {
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
      // Filter for BVN Retrieval Services
      const logs = res.data.filter((r: any) => r.serviceType.startsWith('BVN_RETRIEVAL_'));
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
        r.requestData?.phone_number?.includes(q) || 
        r.requestData?.ticket_id?.toLowerCase().includes(q) ||
        r.id.toLowerCase().includes(q)
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
    <div className="space-y-6 animate-in fade-in duration-500 relative">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Search className="w-8 h-8 text-cyan-600 dark:text-cyan-400" /> BVN Retrieval History
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Track your BVN searches via Phone or CRM.</p>
        </div>
        
        <div className="relative w-full md:w-auto">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search Phone or Ticket ID..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full md:w-64 pl-10 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700">
              <tr>
                <th className="px-6 py-4 font-semibold text-gray-500 dark:text-gray-400">Date</th>
                <th className="px-6 py-4 font-semibold text-gray-500 dark:text-gray-400">Method</th>
                <th className="px-6 py-4 font-semibold text-gray-500 dark:text-gray-400">Identifier</th>
                <th className="px-6 py-4 font-semibold text-gray-500 dark:text-gray-400">Status</th>
                <th className="px-6 py-4 font-semibold text-gray-500 dark:text-gray-400 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {filteredRequests.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      {item.serviceType === 'BVN_RETRIEVAL_PHONE' ? (
                        <span className="flex items-center gap-1 text-cyan-600 dark:text-cyan-400"><Smartphone className="w-4 h-4"/> By Phone</span>
                      ) : (
                        <span className="flex items-center gap-1 text-purple-600 dark:text-purple-400"><Monitor className="w-4 h-4"/> By CRM</span>
                      )}
                    </td>
                    <td className="px-6 py-4 font-mono text-gray-600 dark:text-gray-300">
                        {item.requestData?.phone_number || item.requestData?.ticket_id || '---'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        item.status === 'COMPLETED' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                        item.status === 'FAILED' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                        'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => setSelectedItem(item)} className="text-gray-500 dark:text-gray-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition">
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
            onClick={() => setSelectedItem(null)}
          />

          <div className="relative bg-white dark:bg-gray-800 rounded-xl max-w-lg w-full shadow-2xl overflow-hidden animate-in zoom-in-95 flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900/50 shrink-0">
              <h3 className="font-bold text-lg text-gray-900 dark:text-white">Retrieval Details</h3>
              <button onClick={() => setSelectedItem(null)} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition">
                <XCircle className="w-6 h-6 text-gray-400 hover:text-red-500" />
              </button>
            </div>
            
            <div className="p-6 space-y-4 overflow-y-auto">
              
              {/* Input Data */}
              <div className="bg-gray-50 dark:bg-gray-700/20 p-4 rounded-lg border border-gray-100 dark:border-gray-700 space-y-3">
                 <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Request Info</p>
                 
                 {selectedItem.serviceType === 'BVN_RETRIEVAL_PHONE' ? (
                    <>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500 dark:text-gray-400">Phone Number</span>
                            <span className="font-mono font-medium text-gray-900 dark:text-white">{selectedItem.requestData.phone_number}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500 dark:text-gray-400">Full Name</span>
                            <span className="font-medium text-gray-900 dark:text-white">{selectedItem.requestData.full_name}</span>
                        </div>
                    </>
                 ) : (
                    <>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500 dark:text-gray-400">Ticket ID</span>
                            <span className="font-mono font-medium text-gray-900 dark:text-white">{selectedItem.requestData.ticket_id}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500 dark:text-gray-400">Agent Code</span>
                            <span className="font-medium text-gray-900 dark:text-white">{selectedItem.requestData.agent_code}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500 dark:text-gray-400">BMS Ticket</span>
                            <span className="font-medium text-gray-900 dark:text-white">{selectedItem.requestData.bms_ticket}</span>
                        </div>
                    </>
                 )}
              </div>

              {/* Result Section */}
              {selectedItem.status === 'COMPLETED' ? (
                 <div className="p-5 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-900/30 rounded-lg text-center">
                    <CheckCircle2 className="w-10 h-10 mx-auto mb-2" />
                    <p className="font-bold">BVN Retrieved</p>
                    
                    <div className="mt-4 bg-white dark:bg-black p-4 rounded border border-green-200 dark:border-green-800 font-mono text-2xl font-bold tracking-widest flex justify-between items-center text-gray-900 dark:text-white">
                        {selectedItem.responseData?.bvn || "XXXXXXXXXXX"}
                        <Copy className="w-5 h-5 cursor-pointer hover:text-green-500" onClick={() => copyToClipboard(selectedItem.responseData?.bvn)} />
                    </div>
                    
                    {selectedItem.responseData?.details && (
                        <div className="mt-4 text-left text-sm space-y-1 bg-white dark:bg-black/20 p-3 rounded">
                             <p><span className="text-gray-500">Name:</span> {selectedItem.responseData.details.firstName} {selectedItem.responseData.details.lastName}</p>
                             <p><span className="text-gray-500">DOB:</span> {selectedItem.responseData.details.dateOfBirth}</p>
                             <p><span className="text-gray-500">Phone:</span> {selectedItem.responseData.details.phoneNumber}</p>
                        </div>
                    )}
                 </div>
              ) : selectedItem.status === 'FAILED' ? (
                 <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900/30 rounded-lg text-center">
                    <XCircle className="w-8 h-8 mx-auto mb-2" />
                    <p className="font-bold">Retrieval Failed</p>
                    <p className="text-sm mt-1">{selectedItem.adminNote || "No record found or invalid details."}</p>
                 </div>
              ) : (
                 <div className="text-center text-gray-500 dark:text-gray-400 italic text-sm py-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                    Request is processing. Check back shortly.
                 </div>
              )}

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
