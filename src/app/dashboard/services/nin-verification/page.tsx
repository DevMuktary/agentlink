'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import GlobalLoader from '@/components/GlobalLoader';
import { 
  CheckCircle2, XCircle, Clock, Search, Eye, Filter, Phone, FileBadge, Download, Printer
} from 'lucide-react';

export default function NinHistoryPage() {
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<any[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<any[]>([]);
  const [selectedResult, setSelectedResult] = useState<any>(null);
  
  // Filters
  const [filterType, setFilterType] = useState('ALL'); // ALL, NIN, PHONE
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await axios.get('/api/user/requests'); 
      const identityLogs = res.data.filter((r: any) => 
        r.serviceType === 'NIN_VERIFICATION' || r.serviceType === 'NIN_SEARCH_BY_PHONE'
      );
      setRequests(identityLogs);
      setFilteredRequests(identityLogs);
    } catch (error) {
      console.error("Failed to load history");
    } finally {
      setLoading(false);
    }
  };

  // Handle Filtering
  useEffect(() => {
    let result = requests;

    if (filterType === 'NIN') {
      result = result.filter(r => r.serviceType === 'NIN_VERIFICATION');
    } else if (filterType === 'PHONE') {
      result = result.filter(r => r.serviceType === 'NIN_SEARCH_BY_PHONE');
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(r => 
        r.id.toLowerCase().includes(q) || 
        r.requestData?.nin?.includes(q) || 
        r.requestData?.phone?.includes(q)
      );
    }

    setFilteredRequests(result);
  }, [filterType, searchQuery, requests]);

  if (loading) return <GlobalLoader />;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Identity History</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Track NIN & Phone verification logs.</p>
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
              <option value="ALL">All Methods</option>
              <option value="NIN">By NIN Number</option>
              <option value="PHONE">By Phone Number</option>
            </select>
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search ID or Number..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-64 pl-10 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
        </div>
      </div>

      {/* HISTORY TABLE CONTAINER */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700">
              <tr>
                <th className="px-6 py-4 font-semibold text-gray-500 dark:text-gray-400">Date</th>
                <th className="px-6 py-4 font-semibold text-gray-500 dark:text-gray-400">Type</th>
                <th className="px-6 py-4 font-semibold text-gray-500 dark:text-gray-400">Input Data</th>
                <th className="px-6 py-4 font-semibold text-gray-500 dark:text-gray-400">Cost</th>
                <th className="px-6 py-4 font-semibold text-gray-500 dark:text-gray-400">Status</th>
                <th className="px-6 py-4 font-semibold text-gray-500 dark:text-gray-400 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">No records found matching filters.</td>
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
                      {item.serviceType === 'NIN_VERIFICATION' ? (
                        <span className="inline-flex items-center px-2 py-1 bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 text-xs rounded-md font-medium">
                          <FileBadge className="w-3 h-3 mr-1" /> NIN Lookup
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 text-xs rounded-md font-medium">
                          <Phone className="w-3 h-3 mr-1" /> Phone Lookup
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 font-mono text-gray-700 dark:text-gray-200">
                      {item.requestData?.nin || item.requestData?.phone || '---'}
                    </td>
                    <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">
                      -₦{Number(item.cost).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        item.status === 'COMPLETED' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                        item.status === 'FAILED' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {item.status === 'COMPLETED' && item.responseData && (
                        <button 
                          onClick={() => setSelectedResult(item.responseData)}
                          className="inline-flex items-center justify-center bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 px-3 py-1.5 rounded-md text-xs font-medium transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5 mr-1.5" /> View
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* RESULT MODAL (Refined for Mobile) */}
      {selectedResult && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-lg w-full shadow-2xl flex flex-col max-h-[90vh] animate-in zoom-in-95">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center shrink-0">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Verification Result</h3>
              <button onClick={() => setSelectedResult(null)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
                <XCircle className="w-6 h-6 text-gray-500" />
              </button>
            </div>
            
            {/* Scrollable Content */}
            <div className="p-6 overflow-y-auto">
              
              {/* Photo Section */}
              {selectedResult.photo && (
                <div className="flex flex-col items-center mb-6">
                  <div className="w-32 h-32 rounded-full p-1 border-2 border-blue-500 overflow-hidden bg-gray-100">
                    <img 
                      src={`data:image/jpeg;base64,${selectedResult.photo}`} 
                      alt="User Photo" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 font-medium">Verified Identity</p>
                </div>
              )}

              {/* Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <DetailBox label="First Name" value={selectedResult.firstname} />
                <DetailBox label="Surname" value={selectedResult.surname} />
                <DetailBox label="Middle Name" value={selectedResult.middlename} />
                <DetailBox label="Date of Birth" value={selectedResult.birthdate} />
                <DetailBox label="Gender" value={selectedResult.gender} />
                <DetailBox label="Phone Number" value={selectedResult.telephoneno} />
                <DetailBox label="NIN" value={selectedResult.nin} />
                <DetailBox label="LGA of Origin" value={selectedResult.birthlga} />
                <DetailBox label="State of Origin" value={selectedResult.birthstate} />
                <DetailBox label="Address" value={selectedResult.residence_AdressLine1} fullWidth />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-3 shrink-0 rounded-b-xl">
              <button 
                className="px-4 py-2 bg-white border border-gray-300 dark:bg-gray-800 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors flex items-center"
                onClick={() => window.print()}
              >
                <Printer className="w-4 h-4 mr-2" /> Print
              </button>
              <button 
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center"
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

// Helper Component for consistency
function DetailBox({ label, value, fullWidth = false }: { label: string, value: any, fullWidth?: boolean }) {
  return (
    <div className={`bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg ${fullWidth ? 'sm:col-span-2' : ''}`}>
      <span className="text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wide">{label}</span>
      <p className="font-semibold text-gray-900 dark:text-white mt-0.5 truncate">{value || 'N/A'}</p>
    </div>
  );
}
