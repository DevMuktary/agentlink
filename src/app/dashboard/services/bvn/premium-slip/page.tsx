'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import GlobalLoader from '@/components/GlobalLoader';
import { 
  FileText, Search, Download, Eye, 
  CheckCircle2, XCircle, Copy, FileBadge 
} from 'lucide-react';

export default function BvnPremiumSlipHistory() {
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
      // Filter strictly for BVN Premium Slips
      const logs = res.data.filter((r: any) => r.serviceType === 'BVN_PREMIUM_SLIP');
      setRequests(logs);
      setFilteredRequests(logs);
    } catch (error) {
      console.error("Failed to load history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!searchQuery) {
      setFilteredRequests(requests);
    } else {
      const q = searchQuery.toLowerCase();
      setFilteredRequests(requests.filter(r => 
        r.requestData?.bvn?.includes(q) || 
        r.id.toLowerCase().includes(q)
      ));
    }
  }, [searchQuery, requests]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied!');
  };

  // Helper to handle PDF download from Base64
  const handleDownload = (base64: string, filename: string) => {
    if (!base64) return alert("No PDF data found");
    
    // Ensure the prefix exists
    const pdfString = base64.startsWith('data:application/pdf;base64,') 
      ? base64 
      : `data:application/pdf;base64,${base64}`;
      
    const link = document.createElement('a');
    link.href = pdfString;
    link.download = filename || 'bvn-premium-slip.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) return <GlobalLoader />;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <FileBadge className="w-8 h-8 text-amber-600" /> BVN Premium Slips
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Archive of generated High-Resolution BVN Slips.</p>
        </div>
        
        <div className="relative w-full md:w-auto">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search by BVN..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full md:w-64 pl-10 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 outline-none transition-all"
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
                <th className="px-6 py-4 font-semibold text-gray-500">BVN Number</th>
                <th className="px-6 py-4 font-semibold text-gray-500">Status</th>
                <th className="px-6 py-4 font-semibold text-gray-500 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {filteredRequests.length === 0 ? (
                <tr><td colSpan={4} className="px-6 py-12 text-center text-gray-500">No slips generated yet.</td></tr>
              ) : (
                filteredRequests.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 font-mono font-medium text-gray-700 dark:text-gray-200">
                      {item.requestData?.bvn}
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
                      <div className="flex justify-end gap-2">
                         <button 
                           onClick={() => setSelectedItem(item)} 
                           className="text-gray-500 hover:text-blue-600 transition p-2 bg-gray-100 dark:bg-gray-800 rounded-md"
                           title="View Details"
                         >
                           <Eye className="w-4 h-4" />
                         </button>
                         {item.status === 'COMPLETED' && item.responseData?.pdf_base64 && (
                           <button 
                             onClick={() => handleDownload(item.responseData.pdf_base64, `bvn_slip_${item.requestData.bvn}.pdf`)}
                             className="text-white bg-amber-600 hover:bg-amber-700 transition p-2 rounded-md flex items-center gap-1 text-xs"
                             title="Download PDF"
                           >
                             <Download className="w-4 h-4" /> Download
                           </button>
                         )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Details Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-lg w-full shadow-2xl overflow-hidden animate-in zoom-in-95">
            
            <div className="p-5 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900/50">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-600" /> Slip Details
              </h3>
              <button onClick={() => setSelectedItem(null)}><XCircle className="w-6 h-6 text-gray-400 hover:text-red-500" /></button>
            </div>
            
            <div className="p-6 space-y-6">
              
              {/* Request Info */}
              <div className="flex justify-between p-3 bg-gray-50 dark:bg-gray-700/20 rounded-lg border border-dashed border-gray-200 dark:border-gray-700">
                  <div>
                    <span className="block text-xs text-gray-400 uppercase">BVN Number</span>
                    <span className="font-mono font-bold text-lg">{selectedItem.requestData?.bvn}</span>
                  </div>
                  <div className="text-right">
                    <span className="block text-xs text-gray-400 uppercase">Request ID</span>
                    <div className="flex items-center justify-end gap-1">
                      <span className="font-mono text-sm">{selectedItem.id.slice(0, 8)}...</span>
                      <Copy className="w-3 h-3 cursor-pointer" onClick={() => copyToClipboard(selectedItem.id)} />
                    </div>
                  </div>
              </div>

              {/* Success Action */}
              {selectedItem.status === 'COMPLETED' && selectedItem.responseData?.pdf_base64 ? (
                <div className="text-center space-y-3">
                   <div className="bg-green-50 text-green-700 p-3 rounded-lg flex items-center justify-center gap-2 text-sm font-medium">
                      <CheckCircle2 className="w-4 h-4" /> PDF Generated Successfully
                   </div>
                   
                   <button 
                     onClick={() => handleDownload(selectedItem.responseData.pdf_base64, `bvn_slip_${selectedItem.requestData.bvn}.pdf`)}
                     className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold flex items-center justify-center gap-2 transition-transform active:scale-95"
                   >
                     <Download className="w-5 h-5" /> Download Premium Slip
                   </button>
                   
                   {/* Preview Data (Optional) */}
                   <div className="mt-4 text-left text-sm text-gray-500 bg-gray-50 p-3 rounded border">
                      <p><span className="font-bold">Name:</span> {selectedItem.responseData.first_name} {selectedItem.responseData.last_name}</p>
                      <p><span className="font-bold">Phone:</span> {selectedItem.responseData.phone_number}</p>
                   </div>
                </div>
              ) : selectedItem.status === 'FAILED' ? (
                <div className="bg-red-50 text-red-700 p-4 rounded-lg text-center">
                    <XCircle className="w-8 h-8 mx-auto mb-2" />
                    <p className="font-bold">Generation Failed</p>
                    <p className="text-sm">{selectedItem.responseData?.error || 'Provider rejected the request.'}</p>
                </div>
              ) : (
                <p className="text-center text-gray-500 italic">Processing request...</p>
              )}

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
