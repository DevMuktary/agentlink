'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import GlobalLoader from '@/components/GlobalLoader';
import { 
  FileDigit, Search, CheckCircle2, XCircle, 
  User, Building, Copy, Eye
} from 'lucide-react';

export default function TaxIdHistory() {
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
      const logs = res.data.filter((r: any) => r.serviceType.startsWith('TAX_ID_'));
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
        r.requestData?.first_name?.toLowerCase().includes(q) || 
        r.requestData?.business_name?.toLowerCase().includes(q) ||
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
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <FileDigit className="w-8 h-8 text-indigo-600" /> Tax ID Services
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Track Individual and Corporate Tax ID requests.</p>
        </div>
        
        <div className="relative w-full md:w-auto">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search Name or Business..." 
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
                <th className="px-6 py-4 font-semibold text-gray-500">Type</th>
                <th className="px-6 py-4 font-semibold text-gray-500">Name / Business</th>
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
                      {item.serviceType === 'TAX_ID_INDIVIDUAL' ? (
                        <span className="flex items-center gap-1 text-blue-600"><User className="w-4 h-4" /> Individual</span>
                      ) : (
                        <span className="flex items-center gap-1 text-purple-600"><Building className="w-4 h-4" /> Corporate</span>
                      )}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-700 dark:text-gray-200">
                       {item.requestData?.first_name ? 
                          `${item.requestData.first_name} ${item.requestData.surname}` : 
                          item.requestData?.business_name}
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
                      <button onClick={() => setSelectedItem(item)} className="text-gray-500 hover:text-indigo-600">
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
            <div className="p-5 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900/50">
              <h3 className="font-bold text-lg">Request Details</h3>
              <button onClick={() => setSelectedItem(null)}><XCircle className="w-6 h-6 text-gray-400 hover:text-red-500" /></button>
            </div>
            
            <div className="p-6 space-y-4">
              
              {/* Request Data Display */}
              {selectedItem.serviceType === 'TAX_ID_INDIVIDUAL' ? (
                 <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg space-y-2 text-sm">
                    <p className="text-xs font-bold text-blue-500 uppercase">Individual Applicant</p>
                    <p><span className="text-gray-500">Name:</span> {selectedItem.requestData?.first_name} {selectedItem.requestData?.middle_name} {selectedItem.requestData?.surname}</p>
                    <p><span className="text-gray-500">DOB:</span> {selectedItem.requestData?.dob}</p>
                    <p><span className="text-gray-500">NIN:</span> {selectedItem.requestData?.nin}</p>
                 </div>
              ) : (
                 <div className="p-4 bg-purple-50 border border-purple-100 rounded-lg space-y-2 text-sm">
                    <p className="text-xs font-bold text-purple-500 uppercase">Corporate Applicant</p>
                    <p><span className="text-gray-500">Business:</span> {selectedItem.requestData?.business_name}</p>
                    <p><span className="text-gray-500">RC/BN:</span> {selectedItem.requestData?.rc_number}</p>
                 </div>
              )}

              {/* SUCCESS: Show Tax ID */}
              {selectedItem.status === 'COMPLETED' ? (
                 <div className="p-5 bg-green-50 text-green-700 border border-green-200 rounded-lg text-center">
                    <CheckCircle2 className="w-10 h-10 mx-auto mb-2" />
                    <p className="font-bold text-lg">Tax ID Generated</p>
                    <div className="mt-3 bg-white p-3 rounded border border-green-200 shadow-inner flex items-center justify-between gap-3">
                        <span className="text-2xl font-mono font-bold tracking-widest text-gray-800">
                            {selectedItem.responseData?.tax_id || selectedItem.responseData?.tin || "XXXX-XXXX"}
                        </span>
                        <Copy className="w-5 h-5 cursor-pointer hover:text-green-600" onClick={() => copyToClipboard(selectedItem.responseData?.tax_id)} />
                    </div>
                 </div>
              ) : selectedItem.status === 'FAILED' ? (
                 <div className="p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg text-center">
                    <XCircle className="w-8 h-8 mx-auto mb-2" />
                    <p className="font-bold">Generation Failed</p>
                    <p className="text-sm">{selectedItem.adminNote || "Invalid information provided."}</p>
                 </div>
              ) : (
                 <p className="text-center text-gray-500 italic text-sm">Processing request...</p>
              )}

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
