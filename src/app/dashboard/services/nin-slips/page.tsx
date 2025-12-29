'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import GlobalLoader from '@/components/GlobalLoader';
import { 
  CheckCircle2, XCircle, Search, Eye, Filter, Download, FileText, Printer
} from 'lucide-react';

export default function NinSlipHistoryPage() {
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<any[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<any[]>([]);
  const [selectedResult, setSelectedResult] = useState<any>(null);
  
  // Filters
  const [filterType, setFilterType] = useState('ALL'); 
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await axios.get('/api/user/requests'); 
      // Filter for SLIP services only
      const slipLogs = res.data.filter((r: any) => 
        ['NIN_SLIP_PREMIUM', 'NIN_SLIP_STANDARD', 'NIN_SLIP_REGULAR'].includes(r.serviceType)
      );
      setRequests(slipLogs);
      setFilteredRequests(slipLogs);
    } catch (error) {
      console.error("Failed to load history");
    } finally {
      setLoading(false);
    }
  };

  // Handle Filtering
  useEffect(() => {
    let result = requests;

    if (filterType !== 'ALL') {
      result = result.filter(r => r.serviceType === filterType);
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(r => 
        r.id.toLowerCase().includes(q) || 
        r.requestData?.nin?.includes(q)
      );
    }

    setFilteredRequests(result);
  }, [filterType, searchQuery, requests]);

  // Function to handle PDF Download
  const downloadPdf = (base64String: string, filename: string) => {
    if (!base64String) return;
    const link = document.createElement('a');
    link.href = `data:application/pdf;base64,${base64String}`;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) return <GlobalLoader />;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">NIN Slip History</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">View and download generated slips.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          {/* Type Filter */}
          <div className="relative w-full sm:w-auto">
            <Filter className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <select 
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full sm:w-48 pl-10 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm appearance-none cursor-pointer"
            >
              <option value="ALL">All Slip Types</option>
              <option value="NIN_SLIP_PREMIUM">Premium Slips</option>
              <option value="NIN_SLIP_STANDARD">Standard Slips</option>
              <option value="NIN_SLIP_REGULAR">Regular Slips</option>
            </select>
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search NIN..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-64 pl-10 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700">
              <tr>
                <th className="px-6 py-4 font-semibold text-gray-500 dark:text-gray-400">Date</th>
                <th className="px-6 py-4 font-semibold text-gray-500 dark:text-gray-400">Slip Type</th>
                <th className="px-6 py-4 font-semibold text-gray-500 dark:text-gray-400">NIN Number</th>
                <th className="px-6 py-4 font-semibold text-gray-500 dark:text-gray-400">Cost</th>
                <th className="px-6 py-4 font-semibold text-gray-500 dark:text-gray-400">Status</th>
                <th className="px-6 py-4 font-semibold text-gray-500 dark:text-gray-400 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">No slips found.</td>
                </tr>
              ) : (
                filteredRequests.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                      {new Date(item.createdAt).toLocaleString('en-NG', {
                        year: '2-digit', month: 'short', day: 'numeric',
                        hour: '2-digit', minute: '2-digit'
                      })}
                    </td>
                    <td className="px-6 py-4">
                       <span className={`inline-flex items-center px-2 py-1 text-xs rounded-md font-medium ${
                         item.serviceType === 'NIN_SLIP_PREMIUM' ? 'bg-amber-100 text-amber-700' :
                         item.serviceType === 'NIN_SLIP_STANDARD' ? 'bg-blue-100 text-blue-700' :
                         'bg-gray-100 text-gray-700'
                       }`}>
                         <FileText className="w-3 h-3 mr-1" /> 
                         {item.serviceType.replace('NIN_SLIP_', '')}
                       </span>
                    </td>
                    <td className="px-6 py-4 font-mono text-gray-700 dark:text-gray-200">
                      {item.requestData?.nin || '---'}
                    </td>
                    <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">
                      -₦{Number(item.cost).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        item.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                        item.status === 'FAILED' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {item.status === 'COMPLETED' && item.responseData && (
                        <div className="flex justify-end gap-2">
                            {/* Direct Download Button in Table */}
                            <button 
                            onClick={() => downloadPdf(item.responseData.pdf_base64, `NIN_${item.requestData.nin}.pdf`)}
                            className="inline-flex items-center justify-center bg-blue-50 hover:bg-blue-100 text-blue-600 px-3 py-1.5 rounded-md text-xs font-medium transition-colors"
                            >
                            <Download className="w-3.5 h-3.5 mr-1.5" /> PDF
                            </button>
                            
                            <button 
                            onClick={() => setSelectedResult(item.responseData)}
                            className="inline-flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-md text-xs font-medium transition-colors"
                            >
                            <Eye className="w-3.5 h-3.5 mr-1.5" /> View
                            </button>
                        </div>
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
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-lg w-full shadow-2xl flex flex-col max-h-[90vh] animate-in zoom-in-95">
            
            <div className="p-5 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center shrink-0">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Slip Details</h3>
              <button onClick={() => setSelectedResult(null)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
                <XCircle className="w-6 h-6 text-gray-500" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              {/* Photo */}
              {selectedResult.photo && (
                <div className="flex flex-col items-center mb-6">
                  <div className="w-32 h-32 rounded-lg p-1 border-2 border-blue-500 overflow-hidden bg-gray-100">
                    <img 
                      src={`data:image/jpeg;base64,${selectedResult.photo}`} 
                      alt="User Photo" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <DetailBox label="Full Name" value={`${selectedResult.firstname} ${selectedResult.surname}`} />
                <DetailBox label="NIN" value={selectedResult.nin} />
                <DetailBox label="Phone" value={selectedResult.telephoneno} />
                <DetailBox label="Birth Date" value={selectedResult.birthdate} />
              </div>
            </div>

            <div className="p-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-3 shrink-0 rounded-b-xl">
              <button 
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center shadow-lg shadow-blue-500/30"
                onClick={() => downloadPdf(selectedResult.pdf_base64, `NIN_Slip.pdf`)}
              >
                <Download className="w-4 h-4 mr-2" /> Download PDF
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

function DetailBox({ label, value }: { label: string, value: any }) {
  return (
    <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
      <span className="text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wide">{label}</span>
      <p className="font-semibold text-gray-900 dark:text-white mt-0.5 truncate">{value || 'N/A'}</p>
    </div>
  );
}
