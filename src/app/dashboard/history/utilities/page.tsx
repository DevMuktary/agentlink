'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import GlobalLoader from '@/components/GlobalLoader';
import { 
  Wifi, Search, CheckCircle2, XCircle, 
  Smartphone, Zap
} from 'lucide-react';

export default function UtilitiesHistory() {
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<any[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await axios.get('/api/user/requests'); 
      // FIX: Check if it starts with 'AIRTIME' to catch AIRTIME_MTN, AIRTIME_GLO, etc.
      const logs = res.data.filter((r: any) => 
        r.serviceType?.startsWith('AIRTIME') || r.serviceType === 'DATA'
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

    // FIX: Filter Type Logic Updated
    if (typeFilter === 'AIRTIME') {
        result = result.filter(r => r.serviceType?.startsWith('AIRTIME'));
    } else if (typeFilter === 'DATA') {
        result = result.filter(r => r.serviceType === 'DATA');
    }

    // Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(r => 
        r.requestData?.phone_number?.includes(q) || 
        r.requestData?.network?.toLowerCase().includes(q)
      );
    }
    setFilteredRequests(result);
  }, [searchQuery, typeFilter, requests]);

  if (loading) return <GlobalLoader />;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Wifi className="w-8 h-8 text-green-600" /> Utilities History
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Track Airtime and Data transactions.</p>
        </div>
        
        <div className="flex gap-2 w-full md:w-auto">
           <select 
             value={typeFilter}
             onChange={(e) => setTypeFilter(e.target.value)}
             className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm px-3 py-2.5 outline-none"
           >
             <option value="ALL">All Services</option>
             <option value="AIRTIME">Airtime</option>
             <option value="DATA">Data Bundle</option>
           </select>

           <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input 
                type="text" 
                placeholder="Search Phone..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm outline-none"
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
                <th className="px-6 py-4 font-semibold text-gray-500">Service</th>
                <th className="px-6 py-4 font-semibold text-gray-500">Details</th>
                <th className="px-6 py-4 font-semibold text-gray-500">Amount</th>
                <th className="px-6 py-4 font-semibold text-gray-500">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {filteredRequests.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      {/* FIX: Checking if it starts with AIRTIME instead of strict equality */}
                      {item.serviceType?.startsWith('AIRTIME') ? (
                        <span className="flex items-center gap-1 text-orange-600"><Smartphone className="w-4 h-4" /> Airtime</span>
                      ) : (
                        <span className="flex items-center gap-1 text-blue-600"><Zap className="w-4 h-4" /> Data</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                       <span className="font-bold">{item.requestData?.network}</span> - {item.requestData?.phone_number}
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
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
