'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import GlobalLoader from '@/components/GlobalLoader';
import { 
  CheckCircle2, XCircle, Clock, Search, Filter, AlertCircle, FileBadge 
} from 'lucide-react';

export default function NinValidationHistoryPage() {
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<any[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('ALL');

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await axios.get('/api/user/requests'); 
      // Filter for Validation services only
      const logs = res.data.filter((r: any) => 
        r.serviceType === 'NIN_VALIDATION_NO_RECORD' || 
        r.serviceType === 'NIN_VALIDATION_UPDATE_RECORD'
      );
      setRequests(logs);
      setFilteredRequests(logs);
    } catch (error) {
      console.error("Failed to load history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let result = requests;

    if (filterType === 'NO_RECORD') {
      result = result.filter(r => r.serviceType === 'NIN_VALIDATION_NO_RECORD');
    } else if (filterType === 'UPDATE_RECORD') {
      result = result.filter(r => r.serviceType === 'NIN_VALIDATION_UPDATE_RECORD');
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(r => r.requestData?.nin?.includes(q));
    }

    setFilteredRequests(result);
  }, [filterType, searchQuery, requests]);

  if (loading) return <GlobalLoader />;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">NIN Validation History</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Track manual validation requests.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative w-full sm:w-auto">
            <Filter className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <select 
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full sm:w-48 pl-10 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm appearance-none cursor-pointer"
            >
              <option value="ALL">All Types</option>
              <option value="NO_RECORD">No Record Found</option>
              <option value="UPDATE_RECORD">Update Record</option>
            </select>
          </div>

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

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700">
              <tr>
                <th className="px-6 py-4 font-semibold text-gray-500 dark:text-gray-400">Date</th>
                <th className="px-6 py-4 font-semibold text-gray-500 dark:text-gray-400">Validation Type</th>
                <th className="px-6 py-4 font-semibold text-gray-500 dark:text-gray-400">NIN Number</th>
                <th className="px-6 py-4 font-semibold text-gray-500 dark:text-gray-400">Cost</th>
                <th className="px-6 py-4 font-semibold text-gray-500 dark:text-gray-400">Status</th>
                <th className="px-6 py-4 font-semibold text-gray-500 dark:text-gray-400">Admin Feedback</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {filteredRequests.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-500">No requests found.</td></tr>
              ) : (
                filteredRequests.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                      {new Date(item.createdAt).toLocaleString('en-NG')}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-1 text-xs rounded-md font-medium ${
                        item.serviceType === 'NIN_VALIDATION_NO_RECORD' 
                          ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' 
                          : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400'
                      }`}>
                        <FileBadge className="w-3 h-3 mr-1" />
                        {item.serviceType === 'NIN_VALIDATION_NO_RECORD' ? 'No Record Found' : 'Update Record'}
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
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {item.status === 'COMPLETED' && <CheckCircle2 className="w-3 h-3 mr-1" />}
                        {item.status === 'FAILED' && <XCircle className="w-3 h-3 mr-1" />}
                        {item.status === 'PROCESSING' && <Clock className="w-3 h-3 mr-1" />}
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400 truncate max-w-xs">
                      {item.adminNote || 'Awaiting review...'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
