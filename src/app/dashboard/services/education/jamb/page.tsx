'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import GlobalLoader from '@/components/GlobalLoader';
import { 
  GraduationCap, Search, CheckCircle2, XCircle, 
  FileText, Download, Copy, Eye, Calendar, User, Hash
} from 'lucide-react';

export default function JambHistory() {
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
      // Filter for JAMB Services
      const logs = res.data.filter((r: any) => r.serviceType.startsWith('JAMB_'));
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
        r.requestData?.regNumber?.toLowerCase().includes(q) || 
        r.requestData?.nin?.includes(q) ||
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

  // Base64 Download Helper
  const handleDownload = (base64: string, filename: string) => {
    if (!base64) return alert("File not ready.");
    const pdfString = base64.startsWith('data:') ? base64 : `data:application/pdf;base64,${base64}`;
    const link = document.createElement('a');
    link.href = pdfString;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Helper to get formatted Service Name
  const getServiceName = (type: string) => {
    return type.replace('JAMB_', '').replace(/_/g, ' ');
  };

  if (loading) return <GlobalLoader />;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 relative">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <GraduationCap className="w-8 h-8 text-green-600 dark:text-green-500" /> JAMB Services
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Results, Admission Letters, and Profile Codes.</p>
        </div>
        
        <div className="relative w-full md:w-auto">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search Reg No or NIN..." 
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
                <th className="px-6 py-4 font-semibold text-gray-500 dark:text-gray-400">Service</th>
                <th className="px-6 py-4 font-semibold text-gray-500 dark:text-gray-400">Details</th>
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
                    <td className="px-6 py-4 font-medium text-green-700 dark:text-green-400">
                      {getServiceName(item.serviceType)}
                    </td>
                    <td className="px-6 py-4 font-mono text-gray-500 dark:text-gray-400">
                        {/* Intelligent Display based on what data we have */}
                        {item.requestData?.regNumber && `Reg: ${item.requestData.regNumber}`}
                        {item.requestData?.nin && `NIN: ${item.requestData.nin}`}
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
                      <button onClick={() => setSelectedItem(item)} className="text-gray-500 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition">
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Details Modal (Fixed Z-Index and Scrolling) */}
      {selectedItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
            onClick={() => setSelectedItem(null)}
          />

          {/* Card Content */}
          <div className="relative bg-white dark:bg-gray-800 rounded-xl max-w-lg w-full shadow-2xl overflow-hidden animate-in zoom-in-95 flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900/50 shrink-0">
              <h3 className="font-bold text-lg text-gray-900 dark:text-white">Request Details</h3>
              <button onClick={() => setSelectedItem(null)} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition">
                <XCircle className="w-6 h-6 text-gray-400 hover:text-red-500" />
              </button>
            </div>
            
            {/* Scrollable Body */}
            <div className="p-6 space-y-4 overflow-y-auto">
              
              {/* Data Section */}
              <div className="bg-gray-50 dark:bg-gray-700/20 p-4 rounded-lg border border-gray-100 dark:border-gray-700 space-y-3">
                 <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Input Data</p>
                 
                 {selectedItem.requestData?.regNumber && (
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500 dark:text-gray-400 flex items-center gap-2"><Hash className="w-4 h-4"/> Registration No</span>
                        <span className="font-mono font-medium text-gray-900 dark:text-white">{selectedItem.requestData.regNumber}</span>
                    </div>
                 )}
                 
                 {selectedItem.requestData?.examYear && (
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500 dark:text-gray-400 flex items-center gap-2"><Calendar className="w-4 h-4"/> Exam Year</span>
                        <span className="font-medium text-gray-900 dark:text-white">{selectedItem.requestData.examYear}</span>
                    </div>
                 )}

                 {selectedItem.requestData?.nin && (
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500 dark:text-gray-400 flex items-center gap-2"><Hash className="w-4 h-4"/> NIN</span>
                        <span className="font-mono font-medium text-gray-900 dark:text-white">{selectedItem.requestData.nin}</span>
                    </div>
                 )}

                 {selectedItem.requestData?.dob && (
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500 dark:text-gray-400 flex items-center gap-2"><Calendar className="w-4 h-4"/> Date of Birth</span>
                        <span className="font-medium text-gray-900 dark:text-white">{selectedItem.requestData.dob}</span>
                    </div>
                 )}
              </div>

              {/* SUCCESS RESULT */}
              {selectedItem.status === 'COMPLETED' ? (
                 <div className="p-5 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-900/30 rounded-lg text-center">
                    <CheckCircle2 className="w-10 h-10 mx-auto mb-2" />
                    
                    {/* CASE: Profile Code */}
                    {selectedItem.serviceType === 'JAMB_PROFILE_CODE_RETRIEVAL' ? (
                        <div className="mt-2">
                            <p className="font-bold">Profile Code Retrieved</p>
                            <div className="mt-2 bg-white dark:bg-black p-3 rounded border border-green-200 dark:border-green-800 font-mono text-xl font-bold tracking-widest flex justify-between items-center text-gray-900 dark:text-white">
                                {selectedItem.responseData?.profile_code || "Unknown"}
                                <Copy className="w-4 h-4 cursor-pointer hover:text-green-500" onClick={() => copyToClipboard(selectedItem.responseData?.profile_code)} />
                            </div>
                        </div>
                    ) : (
                        /* CASE: Document Download */
                        <div className="mt-2">
                            <p className="font-bold">Document Ready</p>
                            {(selectedItem.responseData?.document_base64 || selectedItem.responseData?.file || selectedItem.responseData?.url) && (
                               <button 
                                 onClick={() => handleDownload(
                                    selectedItem.responseData.document_base64 || selectedItem.responseData.file || selectedItem.responseData.url, 
                                    'JAMB_Document.pdf'
                                 )}
                                 className="mt-3 w-full py-2 bg-green-600 hover:bg-green-700 text-white rounded font-bold flex items-center justify-center gap-2 transition"
                               >
                                  <Download className="w-4 h-4" /> Download PDF
                               </button>
                            )}
                        </div>
                    )}
                 </div>
              ) : selectedItem.status === 'FAILED' ? (
                 <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900/30 rounded-lg text-center">
                    <XCircle className="w-8 h-8 mx-auto mb-2" />
                    <p className="font-bold">Request Failed</p>
                    <p className="text-sm mt-1">{selectedItem.adminNote || "Unable to process request."}</p>
                 </div>
              ) : (
                 <div className="text-center text-gray-500 dark:text-gray-400 italic text-sm py-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                    Waiting for Admin processing...
                 </div>
              )}

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
