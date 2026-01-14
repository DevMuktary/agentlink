'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import GlobalLoader from '@/components/GlobalLoader';
import { 
  Zap, Search, CheckCircle2, XCircle, 
  Smartphone, Filter
} from 'lucide-react';

export default function DataHistory() {
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<any[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [networkFilter, setNetworkFilter] = useState('ALL');

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await axios.get('/api/user/requests'); 
      // Filter for DATA Only
      const logs = res.data.filter((r: any) => r.serviceType === 'DATA');
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

    // Filter Network
    if (networkFilter !== 'ALL') {
        result = result.filter(r => r.requestData?.network === networkFilter);
    }

    // Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(r => 
        r.requestData?.phone_number?.includes(q) || 
        r.requestData?.plan_name?.toLowerCase().includes(q)
      );
    }
    setFilteredRequests(result);
  }, [searchQuery, networkFilter, requests]);

  if (loading) return <GlobalLoader />;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Zap className="w-8 h-8 text-blue-600" /> Data Bundles
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Track your internet data transactions.</p>
        </div>
        
        <div className="flex gap-2 w-full md:w-auto">
           <select 
             value={networkFilter}
             onChange={(e) => setNetworkFilter(e.target.value)}
             className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
           >
             <option value="ALL">All Networks</option>
             <option value="MTN">MTN</option>
             <option value="GLO">GLO</option>
             <option value="AIRTEL">AIRTEL</option>
             <option value="9MOBILE">9MOBILE</option>
           </select>

           <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input 
                type="text" 
                placeholder="Search Phone..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
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
                <th className="px-6 py-4 font-semibold text-gray-500">Network</th>
                <th className="px-6 py-4 font-semibold text-gray-500">Plan</th>
                <th className="px-6 py-4 font-semibold text-gray-500">Phone</th>
                <th className="px-6 py-4 font-semibold text-gray-500">Amount</th>
                <th className="px-6 py-4 font-semibold text-gray-500">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {filteredRequests.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-500">No data transactions found.</td></tr>
              ) : (
                filteredRequests.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 font-bold">
                      <span className={`px-2 py-1 rounded text-xs ${
                        item.requestData?.network === 'MTN' ? 'bg-yellow-100 text-yellow-800' :
                        item.requestData?.network === 'GLO' ? 'bg-green-100 text-green-800' :
                        item.requestData?.network === 'AIRTEL' ? 'bg-red-100 text-red-800' :
                        'bg-lime-100 text-lime-800'
                      }`}>
                        {item.requestData?.network}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-700 dark:text-gray-200">
                       {item.requestData?.plan_name || 'Data Bundle'}
                    </td>
                    <td className="px-6 py-4 font-mono text-gray-500">
                       {item.requestData?.phone_number}
                    </td>
                    <td className="px-6 py-4 font-mono font-medium">
                       ₦{item.cost}
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
