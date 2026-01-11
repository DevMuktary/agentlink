'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import GlobalLoader from '@/components/GlobalLoader';
import { 
  Building2, Search, CheckCircle2, XCircle, 
  Eye, Download, MapPin, User
} from 'lucide-react';

export default function CacHistory() {
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
      const logs = res.data.filter((r: any) => r.serviceType === 'CAC_REGISTRATION');
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
        r.requestData?.business_details?.proposed_name_1?.toLowerCase().includes(q) || 
        r.id.toLowerCase().includes(q)
      ));
    } else {
      setFilteredRequests(requests);
    }
  }, [searchQuery, requests]);

  // --- BASE64 DOWNLOAD HELPER ---
  const handleDownload = (base64: string, filename: string) => {
    if (!base64) return alert("File data incomplete");
    
    // Ensure standard prefix
    const pdfString = base64.startsWith('data:') 
      ? base64 
      : `data:application/pdf;base64,${base64}`;
      
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
            <Building2 className="w-8 h-8 text-orange-600" /> CAC Registration
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Track Business Name registration requests.</p>
        </div>
        
        <div className="relative w-full md:w-auto">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search Business Name..." 
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
                <th className="px-6 py-4 font-semibold text-gray-500">Proposed Name</th>
                <th className="px-6 py-4 font-semibold text-gray-500">Proprietor</th>
                <th className="px-6 py-4 font-semibold text-gray-500">Status</th>
                <th className="px-6 py-4 font-semibold text-gray-500 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {filteredRequests.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-500">No registrations found.</td></tr>
              ) : (
                filteredRequests.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 font-medium text-orange-600">
                      {item.requestData?.business_details?.proposed_name_1}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {item.requestData?.proprietor_details?.firstname} {item.requestData?.proprietor_details?.surname}
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
                      <button onClick={() => setSelectedItem(item)} className="text-orange-600 hover:text-orange-700 text-xs font-medium border border-orange-200 bg-orange-50 px-3 py-1 rounded-md">
                        View
                      </button>
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
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-lg w-full shadow-2xl overflow-hidden animate-in zoom-in-95 max-h-[90vh] flex flex-col">
            
            <div className="p-5 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900/50">
              <h3 className="font-bold text-lg">CAC Application</h3>
              <button onClick={() => setSelectedItem(null)}><XCircle className="w-6 h-6 text-gray-400 hover:text-red-500" /></button>
            </div>
            
            <div className="p-6 space-y-5 overflow-y-auto">
              
              {/* Business Info */}
              <div className="bg-orange-50 dark:bg-orange-900/10 p-4 rounded-lg border border-orange-100 dark:border-orange-800">
                 <h4 className="text-xs font-bold text-orange-500 uppercase mb-2 flex items-center gap-1">
                    <Building2 className="w-3 h-3" /> Business Details
                 </h4>
                 <div className="space-y-1 text-sm">
                    <p><span className="text-gray-500">Name Option 1:</span> <span className="font-bold">{selectedItem.requestData?.business_details?.proposed_name_1}</span></p>
                    <p><span className="text-gray-500">Name Option 2:</span> {selectedItem.requestData?.business_details?.proposed_name_2}</p>
                    <p><span className="text-gray-500">Nature:</span> {selectedItem.requestData?.business_details?.nature_of_business}</p>
                    <p><span className="text-gray-500">Address:</span> {selectedItem.requestData?.business_details?.address}, {selectedItem.requestData?.business_details?.state}</p>
                 </div>
              </div>

              {/* Proprietor Info */}
              <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                 <h4 className="text-xs font-bold text-gray-500 uppercase mb-2 flex items-center gap-1">
                    <User className="w-3 h-3" /> Proprietor Details
                 </h4>
                 <div className="space-y-1 text-sm">
                    <p><span className="text-gray-500">Name:</span> {selectedItem.requestData?.proprietor_details?.firstname} {selectedItem.requestData?.proprietor_details?.surname}</p>
                    <p><span className="text-gray-500">Phone:</span> {selectedItem.requestData?.proprietor_details?.phone}</p>
                    <p><span className="text-gray-500">NIN:</span> {selectedItem.requestData?.proprietor_details?.nin}</p>
                 </div>
              </div>

              {/* SUCCESS: Download Buttons */}
              {selectedItem.status === 'COMPLETED' ? (
                 <div className="p-4 bg-green-50 text-green-700 border border-green-200 rounded-lg text-center space-y-3">
                    <div className="flex items-center justify-center gap-2 font-bold text-lg">
                        <CheckCircle2 className="w-6 h-6" /> Registration Successful
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 mt-2">
                        {/* Download Certificate */}
                        {selectedItem.responseData?.certificate_base64 && (
                           <button 
                             onClick={() => handleDownload(selectedItem.responseData.certificate_base64, 'CAC_Certificate.pdf')}
                             className="py-2 px-3 bg-green-600 hover:bg-green-700 text-white rounded text-sm font-bold flex flex-col items-center gap-1 text-center w-full"
                           >
                              <Download className="w-4 h-4" /> Download Certificate
                           </button>
                        )}
                        {/* Download Status Report */}
                        {selectedItem.responseData?.status_report_base64 && (
                           <button 
                             onClick={() => handleDownload(selectedItem.responseData.status_report_base64, 'CAC_Status_Report.pdf')}
                             className="py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-bold flex flex-col items-center gap-1 text-center w-full"
                           >
                              <Download className="w-4 h-4" /> Download Status Report
                           </button>
                        )}
                    </div>
                 </div>
              ) : selectedItem.status === 'FAILED' ? (
                 <div className="p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg flex gap-2">
                    <XCircle className="w-5 h-5 shrink-0" />
                    <div>
                        <p className="font-bold">Registration Failed</p>
                        <p className="text-sm">{selectedItem.adminNote || 'Application rejected.'}</p>
                    </div>
                 </div>
              ) : (
                 <p className="text-center text-gray-500 italic text-sm">Application is currently under review at CAC.</p>
              )}

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
