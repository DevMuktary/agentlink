'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import GlobalLoader from '@/components/GlobalLoader';
import { 
  GraduationCap, Search, CheckCircle2, XCircle, 
  FileText, Download, Copy, Eye
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
      // Filter for JAMB Services (Starts with JAMB_)
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
        r.requestData?.full_name?.toLowerCase().includes(q) || 
        r.requestData?.reg_number_or_profile?.includes(q) ||
        r.requestData?.reg_number?.includes(q)
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

  if (loading) return <GlobalLoader />;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <GraduationCap className="w-8 h-8 text-green-600" /> JAMB Services
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Results, Admission Letters, and Profile Codes.</p>
        </div>
        
        <div className="relative w-full md:w-auto">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search Name or Reg No..." 
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
                <th className="px-6 py-4 font-semibold text-gray-500">Service</th>
                <th className="px-6 py-4 font-semibold text-gray-500">Identifier</th>
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
                    <td className="px-6 py-4 font-medium text-green-700 dark:text-green-400">
                      {item.requestData?.service_name || item.serviceType.replace('JAMB_', '').replace(/_/g, ' ')}
                    </td>
                    <td className="px-6 py-4 font-mono text-gray-500">
                       {item.requestData?.reg_number_or_profile || item.requestData?.reg_number || item.requestData?.phone_number || 'N/A'}
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
                      <button onClick={() => setSelectedItem(item)} className="text-gray-500 hover:text-green-600">
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
              
              {/* DETAILS DISPLAY */}
              {selectedItem.serviceType === 'JAMB_PROFILE_CODE_RETRIEVAL' ? (
                 <div className="p-4 bg-yellow-50 border border-yellow-100 rounded-lg space-y-2 text-sm">
                    <p className="text-xs font-bold text-yellow-600 uppercase">Retrieval Data</p>
                    {selectedItem.requestData?.reg_number && <p><span className="text-gray-500">Reg No:</span> {selectedItem.requestData.reg_number}</p>}
                    {selectedItem.requestData?.phone_number && <p><span className="text-gray-500">Phone:</span> {selectedItem.requestData.phone_number}</p>}
                    {selectedItem.requestData?.email && <p><span className="text-gray-500">Email:</span> {selectedItem.requestData.email}</p>}
                 </div>
              ) : (
                 <div className="p-4 bg-green-50 border border-green-100 rounded-lg space-y-2 text-sm">
                    <p className="text-xs font-bold text-green-600 uppercase">Candidate Info</p>
                    <p><span className="text-gray-500">Name:</span> {selectedItem.requestData?.full_name}</p>
                    <p><span className="text-gray-500">ID:</span> {selectedItem.requestData?.reg_number_or_profile}</p>
                    <p><span className="text-gray-500">Year:</span> {selectedItem.requestData?.year}</p>
                 </div>
              )}

              {/* SUCCESS RESULT */}
              {selectedItem.status === 'COMPLETED' ? (
                 <div className="p-5 bg-green-50 text-green-700 border border-green-200 rounded-lg text-center">
                    <CheckCircle2 className="w-10 h-10 mx-auto mb-2" />
                    
                    {selectedItem.serviceType === 'JAMB_PROFILE_CODE_RETRIEVAL' ? (
                        <div className="mt-2">
                            <p className="font-bold">Profile Code Retrieved</p>
                            <div className="mt-2 bg-white p-3 rounded border border-green-200 font-mono text-xl font-bold tracking-widest flex justify-between items-center">
                                {selectedItem.responseData?.profile_code || "Unknown"}
                                <Copy className="w-4 h-4 cursor-pointer hover:text-green-500" onClick={() => copyToClipboard(selectedItem.responseData?.profile_code)} />
                            </div>
                        </div>
                    ) : (
                        <div className="mt-2">
                            <p className="font-bold">Document Ready</p>
                            {(selectedItem.responseData?.document_base64 || selectedItem.responseData?.file) && (
                               <button 
                                 onClick={() => handleDownload(selectedItem.responseData.document_base64 || selectedItem.responseData.file, 'JAMB_Document.pdf')}
                                 className="mt-3 w-full py-2 bg-green-600 text-white rounded font-bold flex items-center justify-center gap-2 hover:bg-green-700"
                               >
                                  <Download className="w-4 h-4" /> Download PDF
                               </button>
                            )}
                        </div>
                    )}
                 </div>
              ) : selectedItem.status === 'FAILED' ? (
                 <div className="p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg text-center">
                    <XCircle className="w-8 h-8 mx-auto mb-2" />
                    <p className="font-bold">Request Failed</p>
                    <p className="text-sm">{selectedItem.adminNote || "Unable to process request."}</p>
                 </div>
              ) : (
                 <p className="text-center text-gray-500 italic text-sm">Waiting for Admin processing...</p>
              )}

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
