'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import GlobalLoader from '@/components/GlobalLoader';
import { 
  CheckCircle2, XCircle, Clock, Search, Filter, 
  FileCog, User, Phone, MapPin, Eye, Copy, AlertCircle, ImageIcon
} from 'lucide-react';

export default function NinModificationHistory() {
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<any[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [selectedItem, setSelectedItem] = useState<any>(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await axios.get('/api/user/requests'); 
      const logs = res.data.filter((r: any) => 
        ['NIN_MODIFICATION_NAME', 'NIN_MODIFICATION_PHONE', 'NIN_MODIFICATION_ADDRESS'].includes(r.serviceType)
      );
      setRequests(logs);
      setFilteredRequests(logs);
    } catch (error) {
      console.error("Failed to load history");
    } finally {
      setLoading(false);
    }
  };

  // ... (Filter Logic remains the same) ...
  useEffect(() => {
    let result = requests;
    if (filterType === 'NAME') result = result.filter(r => r.serviceType === 'NIN_MODIFICATION_NAME');
    if (filterType === 'PHONE') result = result.filter(r => r.serviceType === 'NIN_MODIFICATION_PHONE');
    if (filterType === 'ADDRESS') result = result.filter(r => r.serviceType === 'NIN_MODIFICATION_ADDRESS');

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(r => r.requestData?.nin?.includes(q) || r.id.toLowerCase().includes(q));
    }
    setFilteredRequests(result);
  }, [filterType, searchQuery, requests]);

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
            <FileCog className="w-8 h-8 text-teal-600" /> NIN Modification
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Track Name, Phone, and Address corrections.</p>
        </div>
        {/* ... Search/Filter controls (Same as before) ... */}
         <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <select 
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full sm:w-48 pl-4 pr-8 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm"
          >
            <option value="ALL">All Modifications</option>
            <option value="NAME">Change of Name</option>
            <option value="PHONE">Change of Phone</option>
            <option value="ADDRESS">Change of Address</option>
          </select>

          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search NIN..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-64 pl-10 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700">
              <tr>
                <th className="px-6 py-4 font-semibold text-gray-500">Date</th>
                <th className="px-6 py-4 font-semibold text-gray-500">Type</th>
                <th className="px-6 py-4 font-semibold text-gray-500">NIN</th>
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
                    <td className="px-6 py-4">
                      {item.serviceType === 'NIN_MODIFICATION_NAME' && <span className="flex items-center gap-1 text-blue-600"><User className="w-4 h-4"/> Name Change</span>}
                      {item.serviceType === 'NIN_MODIFICATION_PHONE' && <span className="flex items-center gap-1 text-green-600"><Phone className="w-4 h-4"/> Phone Change</span>}
                      {item.serviceType === 'NIN_MODIFICATION_ADDRESS' && <span className="flex items-center gap-1 text-orange-600"><MapPin className="w-4 h-4"/> Address Change</span>}
                    </td>
                    <td className="px-6 py-4 font-mono">{item.requestData?.nin}</td>
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
                      <button onClick={() => setSelectedItem(item)} className="text-gray-500 hover:text-blue-600 transition flex items-center justify-end gap-1 ml-auto">
                        <Eye className="w-4 h-4" /> View
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* RESULT / DETAILS MODAL */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-lg w-full shadow-2xl overflow-hidden animate-in zoom-in-95 max-h-[90vh] flex flex-col">
            
            <div className="p-5 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900/50 shrink-0">
              <h3 className="font-bold text-lg">Request Details</h3>
              <button onClick={() => setSelectedItem(null)}><XCircle className="w-6 h-6 text-gray-400 hover:text-red-500" /></button>
            </div>
            
            <div className="p-6 space-y-5 overflow-y-auto">
              
              {/* --- SUCCESS IMAGE (If Completed) --- */}
              {selectedItem.status === 'COMPLETED' && (
                <div className="space-y-2">
                   <div className="flex items-center gap-2 text-green-700 bg-green-50 p-3 rounded-lg border border-green-200">
                      <CheckCircle2 className="w-5 h-5" />
                      <span className="font-bold">Modification Successful</span>
                   </div>
                   
                   {/* THE IMAGE DISPLAY */}
                   <div className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl p-2 bg-gray-50 dark:bg-gray-900/30 flex justify-center">
                      {(selectedItem.responseData?.image || selectedItem.responseData?.url) ? (
                        <img 
                          src={selectedItem.responseData?.image || selectedItem.responseData?.url} 
                          alt="Modified Document" 
                          className="max-h-64 object-contain rounded-lg shadow-sm"
                        />
                      ) : (
                        <div className="h-32 flex flex-col items-center justify-center text-gray-400">
                            <ImageIcon className="w-8 h-8 mb-2" />
                            <span className="text-xs">No image provided by admin</span>
                        </div>
                      )}
                   </div>
                   {(selectedItem.responseData?.image || selectedItem.responseData?.url) && (
                      <a 
                        href={selectedItem.responseData?.image || selectedItem.responseData?.url} 
                        target="_blank" 
                        rel="noreferrer"
                        className="block w-full text-center py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition"
                      >
                        Download / View Full Size
                      </a>
                   )}
                </div>
              )}

              {/* --- FAILED REASON (If Failed) --- */}
              {selectedItem.status === 'FAILED' && (
                 <div className="p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg flex flex-col gap-1">
                    <div className="flex items-center gap-2 font-bold">
                        <XCircle className="w-5 h-5 shrink-0" />
                        Modification Failed
                    </div>
                    <p className="text-sm pl-7 text-red-600/90">
                        Reason: <span className="font-semibold">{selectedItem.adminNote || 'Declined by Admin (No reason provided)'}</span>
                    </p>
                    <p className="text-xs pl-7 mt-2 text-red-500">
                        *Check your wallet history for any processed refunds.
                    </p>
                 </div>
              )}

              {/* Data Summary */}
              <div className="space-y-3 pt-2 border-t border-gray-100 dark:border-gray-700">
                <p className="font-semibold text-gray-500 text-xs uppercase">Original Request Data</p>
                <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="p-3 border rounded-lg bg-gray-50 dark:bg-gray-700/20">
                        <span className="block text-xs text-gray-400">NIN</span>
                        <span className="font-medium font-mono">{selectedItem.requestData?.nin}</span>
                    </div>
                     <div className="p-3 border rounded-lg bg-gray-50 dark:bg-gray-700/20">
                        <span className="block text-xs text-gray-400">Request ID</span>
                        <span className="font-medium font-mono truncate">{selectedItem.id}</span>
                    </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
