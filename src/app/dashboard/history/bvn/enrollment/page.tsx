'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import GlobalLoader from '@/components/GlobalLoader';
import { 
  Smartphone, Search, CheckCircle2, XCircle, 
  User, CreditCard, MapPin, Calendar, Mail, Eye
} from 'lucide-react';

export default function BvnEnrollmentHistory() {
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
      const logs = res.data.filter((r: any) => r.serviceType === 'ANDROID_BVN_ENROLLMENT');
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
        r.requestData?.first_name?.toLowerCase().includes(q) || 
        r.requestData?.last_name?.toLowerCase().includes(q) ||
        r.requestData?.bvn?.includes(q)
      ));
    } else {
      setFilteredRequests(requests);
    }
  }, [searchQuery, requests]);

  if (loading) return <GlobalLoader />;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Smartphone className="w-8 h-8 text-fuchsia-600" /> Android Enrollment
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Track BVN Enrollment requests.</p>
        </div>
        
        <div className="relative w-full md:w-auto">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search Name or BVN..." 
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
                <th className="px-6 py-4 font-semibold text-gray-500">Agent Name</th>
                <th className="px-6 py-4 font-semibold text-gray-500">Wallet ID</th>
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
                    <td className="px-6 py-4 font-medium text-fuchsia-600">
                      {item.requestData?.first_name} {item.requestData?.last_name}
                    </td>
                    <td className="px-6 py-4 font-mono text-gray-600">
                      {item.requestData?.parkway_wallet_id}
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
                      <button onClick={() => setSelectedItem(item)} className="text-fuchsia-600 hover:text-fuchsia-700 text-xs font-medium border border-fuchsia-200 bg-fuchsia-50 px-3 py-1 rounded-md">
                        View
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
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full shadow-2xl overflow-hidden animate-in zoom-in-95 max-h-[90vh] flex flex-col">
            
            <div className="p-5 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900/50">
              <h3 className="font-bold text-lg">Enrollment Data</h3>
              <button onClick={() => setSelectedItem(null)}><XCircle className="w-6 h-6 text-gray-400 hover:text-red-500" /></button>
            </div>
            
            <div className="p-6 space-y-6 overflow-y-auto">
              
              {/* Personal Info */}
              <div>
                  <h4 className="text-xs font-bold text-gray-400 uppercase mb-3 flex items-center gap-2">
                    <User className="w-4 h-4" /> Personal Details
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-sm bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg">
                      <p><span className="text-gray-500 block text-xs">Full Name</span> <span className="font-medium">{selectedItem.requestData?.first_name} {selectedItem.requestData?.last_name}</span></p>
                      <p><span className="text-gray-500 block text-xs">Date of Birth</span> <span className="font-medium">{selectedItem.requestData?.date_of_birth}</span></p>
                      <p><span className="text-gray-500 block text-xs">Phone</span> <span className="font-medium">{selectedItem.requestData?.phone_number}</span></p>
                      <p><span className="text-gray-500 block text-xs">Email</span> <span className="font-medium truncate">{selectedItem.requestData?.email}</span></p>
                  </div>
              </div>

              {/* Bank & Location */}
              <div>
                  <h4 className="text-xs font-bold text-gray-400 uppercase mb-3 flex items-center gap-2">
                    <CreditCard className="w-4 h-4" /> Banking & Location
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-sm bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg">
                      <p><span className="text-gray-500 block text-xs">Bank Name</span> <span className="font-medium">{selectedItem.requestData?.bank_name}</span></p>
                      <p><span className="text-gray-500 block text-xs">Account No</span> <span className="font-medium">{selectedItem.requestData?.account_number}</span></p>
                      <p><span className="text-gray-500 block text-xs">Wallet ID</span> <span className="font-medium">{selectedItem.requestData?.parkway_wallet_id}</span></p>
                      <p><span className="text-gray-500 block text-xs">BVN</span> <span className="font-medium">{selectedItem.requestData?.bvn}</span></p>
                      
                      <div className="col-span-2 pt-2 border-t border-gray-200 dark:border-gray-700"></div>
                      
                      <p><span className="text-gray-500 block text-xs">State</span> <span className="font-medium">{selectedItem.requestData?.state_of_residence}</span></p>
                      <p><span className="text-gray-500 block text-xs">LGA</span> <span className="font-medium">{selectedItem.requestData?.local_government}</span></p>
                      <p className="col-span-2"><span className="text-gray-500 block text-xs">Address</span> <span className="font-medium">{selectedItem.requestData?.home_address}</span></p>
                  </div>
              </div>

              {/* Status */}
              {selectedItem.status === 'COMPLETED' ? (
                 <div className="p-4 bg-green-50 text-green-700 border border-green-200 rounded-lg text-center">
                    <CheckCircle2 className="w-8 h-8 mx-auto mb-2" />
                    <p className="font-bold">Enrollment Successful</p>
                    <p className="text-xs mt-1">Check your email for NIBSS credentials.</p>
                 </div>
              ) : selectedItem.status === 'FAILED' ? (
                 <div className="p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg flex gap-2">
                    <XCircle className="w-5 h-5 shrink-0" />
                    <div>
                        <p className="font-bold">Enrollment Failed</p>
                        <p className="text-sm">{selectedItem.adminNote || 'Application rejected.'}</p>
                    </div>
                 </div>
              ) : (
                 <p className="text-center text-gray-500 italic text-sm">Processing...</p>
              )}

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
