'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import GlobalLoader from '@/components/GlobalLoader';
import { 
  CheckCircle2, XCircle, Clock, Search, Eye, Filter, Phone, FileBadge
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
      // Fetch both types
      const res = await axios.get('/api/user/requests'); 
      // Filter for Identity services only
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

    // Type Filter
    if (filterType === 'NIN') {
      result = result.filter(r => r.serviceType === 'NIN_VERIFICATION');
    } else if (filterType === 'PHONE') {
      result = result.filter(r => r.serviceType === 'NIN_SEARCH_BY_PHONE');
    }

    // Search Filter
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
      
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Identity History</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Track NIN & Phone verification logs.</p>
        </div>
        
        <div className="flex gap-2">
          {/* Type Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <select 
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm appearance-none cursor-pointer"
            >
              <option value="ALL">All Methods</option>
              <option value="NIN">By NIN Number</option>
              <option value="PHONE">By Phone Number</option>
            </select>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search Reference / ID..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm w-64"
            />
          </div>
        </div>
      </div>

      {/* HISTORY TABLE */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-6 py-4 font-semibold text-gray-500 dark:text-gray-400">Date</th>
                <th className="px-6 py-4 font-semibold text-gray-500 dark:text-gray-400">Type</th>
                <th className="px-6 py-4 font-semibold text-gray-500 dark:text-gray-400">Input Data</th>
                <th className="px-6 py-4 font-semibold text-gray-500 dark:text-gray-400">Cost</th>
                <th className="px-6 py-4 font-semibold text-gray-500 dark:text-gray-400">Status</th>
                <th className="px-6 py-4 font-semibold text-gray-500 dark:text-gray-400 text-right">Result</th>
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
                      {new Date(item.createdAt).toLocaleString('en-NG')}
                    </td>
                    <td className="px-6 py-4">
                      {item.serviceType === 'NIN_VERIFICATION' ? (
                        <span className="inline-flex items-center px-2 py-1 bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 text-xs rounded-md font-medium">
                          <FileBadge className="w-3 h-3 mr-1" /> By NIN
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 text-xs rounded-md font-medium">
                          <Phone className="w-3 h-3 mr-1" /> By Phone
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 font-mono text-gray-700 dark:text-gray-200">
                      {item.requestData?.nin || item.requestData?.phone || '---'}
                    </td>
                    <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">
                      -₦{Number(item.cost).toFixed(2)}
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
                          className="text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium flex items-center justify-end w-full"
                        >
                          <Eye className="w-4 h-4 mr-1" /> View
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

      {/* RESULT MODAL (Same as before) */}
      {selectedResult && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-lg w-full shadow-2xl overflow-hidden animate-in zoom-in-95">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Verification Result</h3>
              <button onClick={() => setSelectedResult(null)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
                <XCircle className="w-6 h-6 text-gray-500" />
              </button>
            </div>
            
            <div className="p-6">
              {selectedResult.photo && (
                <div className="flex justify-center mb-6">
                  <img 
                    src={`data:image/jpeg;base64,${selectedResult.photo}`} 
                    alt="User Photo" 
                    className="w-32 h-32 rounded-full object-cover border-4 border-gray-200 dark:border-gray-600 shadow-md"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                  <span className="text-gray-500 dark:text-gray-400 text-xs uppercase">First Name</span>
                  <p className="font-semibold text-gray-900 dark:text-white mt-1">{selectedResult.firstname || 'N/A'}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                  <span className="text-gray-500 dark:text-gray-400 text-xs uppercase">Surname</span>
                  <p className="font-semibold text-gray-900 dark:text-white mt-1">{selectedResult.surname || 'N/A'}</p>
                </div>
                {/* Add other fields as needed */}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
