'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import GlobalLoader from '@/components/GlobalLoader';
import { 
  CheckCircle2, XCircle, Search, FileCog, 
  Building2, Smartphone, AlertCircle, Eye, User, Calendar
} from 'lucide-react';

export default function BvnModificationHistory() {
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
      // Filter for BVN Modification Services
      const logs = res.data.filter((r: any) => r.serviceType.startsWith('BVN_MOD_'));
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
        r.requestData?.bvn?.includes(q) || r.id.toLowerCase().includes(q)
      ));
    } else {
      setFilteredRequests(requests);
    }
  }, [searchQuery, requests]);

  // HELPER: Safely extract data based on API structure
  const getOld = (item: any) => item?.requestData?.identity || {};
  const getNew = (item: any) => item?.requestData?.changes || {};

  if (loading) return <GlobalLoader />;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <FileCog className="w-8 h-8 text-blue-600" /> BVN Modification
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Track your bank detail correction requests.</p>
        </div>
        
        <div className="relative w-full md:w-auto">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search BVN..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full md:w-64 pl-10 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 dark:bg-slate-800/50 border-b border-gray-100 dark:border-gray-700">
              <tr>
                <th className="px-6 py-4 font-semibold text-gray-500 dark:text-gray-400">Date</th>
                <th className="px-6 py-4 font-semibold text-gray-500 dark:text-gray-400">Service</th>
                <th className="px-6 py-4 font-semibold text-gray-500 dark:text-gray-400">Bank</th>
                <th className="px-6 py-4 font-semibold text-gray-500 dark:text-gray-400">BVN</th>
                <th className="px-6 py-4 font-semibold text-gray-500 dark:text-gray-400">Status</th>
                <th className="px-6 py-4 font-semibold text-gray-500 dark:text-gray-400 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {filteredRequests.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 font-medium text-blue-600 dark:text-blue-400">
                      {item.serviceType.replace('BVN_MOD_', '').replace(/_/g, ' ')}
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300 flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-gray-400" />
                      {item.requestData?.bank_name || 'Unknown'}
                    </td>
                    <td className="px-6 py-4 font-mono text-gray-700 dark:text-gray-300">{item.requestData?.bvn}</td>
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
                      <button onClick={() => setSelectedItem(item)} className="text-blue-600 dark:text-blue-400 hover:text-blue-700 text-xs font-medium border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 px-3 py-1 rounded-md">
                        View
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
          <div className="bg-white dark:bg-slate-900 rounded-xl max-w-lg w-full shadow-2xl overflow-hidden animate-in zoom-in-95 max-h-[90vh] flex flex-col border border-gray-200 dark:border-slate-800">
            
            <div className="p-5 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center bg-gray-50 dark:bg-slate-800/50">
              <h3 className="font-bold text-lg text-gray-900 dark:text-white">Modification Details</h3>
              <button onClick={() => setSelectedItem(null)}><XCircle className="w-6 h-6 text-gray-400 hover:text-red-500" /></button>
            </div>
            
            <div className="p-6 space-y-4 overflow-y-auto">
              
              <div className="flex justify-between items-center bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-100 dark:border-blue-800">
                 <span className="text-xs text-blue-600 dark:text-blue-400 font-bold uppercase">Target Bank</span>
                 <span className="font-bold text-blue-800 dark:text-blue-200">{selectedItem.requestData?.bank_name}</span>
              </div>

              {/* Data Comparison Grid */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                 {/* OLD DETAILS (From 'identity' object in API) */}
                 <div className="p-3 border border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-900/10 rounded-lg">
                    <span className="block text-xs font-bold text-red-400 mb-2 uppercase border-b border-red-200 pb-1">Old Details (BVN)</span>
                    
                    <div className="space-y-2">
                        <div>
                            <span className="text-xs text-gray-500 dark:text-gray-400 block">Name</span>
                            <span className="font-medium text-gray-900 dark:text-gray-200">
                                {getOld(selectedItem).first_name} {getOld(selectedItem).surname}
                            </span>
                        </div>
                        {getNew(selectedItem).dates?.old && (
                            <div>
                                <span className="text-xs text-gray-500 dark:text-gray-400 block">DOB</span>
                                <span className="font-medium text-gray-900 dark:text-gray-200">
                                    {getNew(selectedItem).dates?.old}
                                </span>
                            </div>
                        )}
                         {getNew(selectedItem).phone?.old && (
                            <div>
                                <span className="text-xs text-gray-500 dark:text-gray-400 block">Phone</span>
                                <span className="font-medium text-gray-900 dark:text-gray-200">
                                    {getNew(selectedItem).phone?.old}
                                </span>
                            </div>
                        )}
                    </div>
                 </div>

                 {/* NEW DETAILS (From 'changes' object in API) */}
                 <div className="p-3 border border-green-200 dark:border-green-900/50 bg-green-50/50 dark:bg-green-900/10 rounded-lg">
                    <span className="block text-xs font-bold text-green-500 mb-2 uppercase border-b border-green-200 pb-1">New Details (Requested)</span>
                    
                    <div className="space-y-2">
                        {getNew(selectedItem).new_name ? (
                             <div>
                                <span className="text-xs text-gray-500 dark:text-gray-400 block">Name</span>
                                <span className="font-medium text-gray-900 dark:text-gray-200">
                                    {getNew(selectedItem).new_name.first} {getNew(selectedItem).new_name.last}
                                </span>
                            </div>
                        ) : (
                            <span className="text-xs italic text-gray-400">No Name Change</span>
                        )}

                        {getNew(selectedItem).dates?.new ? (
                             <div>
                                <span className="text-xs text-gray-500 dark:text-gray-400 block">DOB</span>
                                <span className="font-medium text-gray-900 dark:text-gray-200">
                                    {getNew(selectedItem).dates?.new}
                                </span>
                            </div>
                        ) : (
                             <span className="text-xs italic text-gray-400 block mt-2">No DOB Change</span>
                        )}

                        {getNew(selectedItem).phone?.new ? (
                             <div>
                                <span className="text-xs text-gray-500 dark:text-gray-400 block">Phone</span>
                                <span className="font-medium text-gray-900 dark:text-gray-200">
                                    {getNew(selectedItem).phone?.new}
                                </span>
                            </div>
                        ) : (
                             <span className="text-xs italic text-gray-400 block mt-2">No Phone Change</span>
                        )}
                    </div>
                 </div>
              </div>

              {/* Status Section */}
              {selectedItem.status === 'COMPLETED' ? (
                 <div className="p-4 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-900/30 rounded-lg text-center">
                    <CheckCircle2 className="w-8 h-8 mx-auto mb-2" />
                    <p className="font-bold">Modification Successful</p>
                    {(selectedItem.responseData?.image || selectedItem.responseData?.url) && (
                      <a 
                        href={selectedItem.responseData?.image || selectedItem.responseData?.url} 
                        target="_blank" 
                        rel="noreferrer"
                        className="mt-3 block w-full py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-bold transition"
                      >
                        View Document
                      </a>
                    )}
                 </div>
              ) : selectedItem.status === 'FAILED' ? (
                 <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900/30 rounded-lg flex gap-2">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <div>
                        <p className="font-bold">Modification Failed</p>
                        <p className="text-sm">{selectedItem.adminNote || 'Request declined.'}</p>
                    </div>
                 </div>
              ) : (
                 <div className="text-center text-gray-500 dark:text-gray-400 text-sm py-4 bg-gray-50 dark:bg-slate-800/50 rounded-lg border border-gray-100 dark:border-slate-800">
                    Request is currently under review by an administrator.
                 </div>
              )}

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
