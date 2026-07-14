'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import GlobalLoader from '@/components/GlobalLoader';
import { 
  CheckCircle2, XCircle, Search, UserCheck, 
  Eye, Copy, Smartphone, Calendar, MapPin
} from 'lucide-react';

export default function BvnVerificationHistory() {
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
      // Filter strictly for BVN Verification
      const logs = res.data.filter((r: any) => r.serviceType === 'BVN_VERIFICATION');
      setRequests(logs);
      setFilteredRequests(logs);
    } catch (error) {
      console.error("Failed to load history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!searchQuery) {
      setFilteredRequests(requests);
    } else {
      const q = searchQuery.toLowerCase();
      setFilteredRequests(requests.filter(r => 
        r.requestData?.bvn?.includes(q) || 
        r.id.toLowerCase().includes(q)
      ));
    }
  }, [searchQuery, requests]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied!');
  };

  if (loading) return <GlobalLoader />;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <UserCheck className="w-8 h-8 text-cyan-600" /> BVN Verification History
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">View all your verified BVN records.</p>
        </div>
        
        <div className="relative w-full md:w-auto">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search by BVN..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full md:w-64 pl-10 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 outline-none transition-all"
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
                <th className="px-6 py-4 font-semibold text-gray-500">BVN Number</th>
                <th className="px-6 py-4 font-semibold text-gray-500">Status</th>
                <th className="px-6 py-4 font-semibold text-gray-500">Cost</th>
                <th className="px-6 py-4 font-semibold text-gray-500 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {filteredRequests.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-500">No verification records found.</td></tr>
              ) : (
                filteredRequests.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                      {new Date(item.createdAt).toLocaleDateString()} <span className="text-xs text-gray-400">{new Date(item.createdAt).toLocaleTimeString()}</span>
                    </td>
                    <td className="px-6 py-4 font-mono font-medium text-gray-700 dark:text-gray-200">
                      {item.requestData?.bvn}
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
                    <td className="px-6 py-4 text-gray-600">
                       ₦{item.cost}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => setSelectedItem(item)} 
                        className="text-cyan-600 hover:text-cyan-700 font-medium text-xs flex items-center justify-end gap-1 ml-auto"
                      >
                        <Eye className="w-4 h-4" /> View Result
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
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full shadow-2xl overflow-hidden animate-in zoom-in-95 max-h-[90vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900/50">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-cyan-600" /> Verification Result
              </h3>
              <button onClick={() => setSelectedItem(null)}><XCircle className="w-6 h-6 text-gray-400 hover:text-red-500" /></button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              
              {/* Request Info */}
              <div className="flex justify-between items-center mb-6 p-3 bg-gray-50 dark:bg-gray-700/20 rounded-lg">
                <div className="flex gap-4 text-sm">
                   <div>
                      <span className="block text-xs text-gray-400 uppercase">BVN Searched</span>
                      <span className="font-mono font-bold text-lg">{selectedItem.requestData?.bvn}</span>
                   </div>
                   <div>
                      <span className="block text-xs text-gray-400 uppercase">Request ID</span>
                      <div className="flex items-center gap-1">
                        <span className="font-mono font-medium">{selectedItem.id}</span>
                        <Copy className="w-3 h-3 cursor-pointer text-gray-400 hover:text-blue-500" onClick={() => copyToClipboard(selectedItem.id)} />
                      </div>
                   </div>
                </div>
              </div>

              {/* SUCCESS STATE */}
              {selectedItem.status === 'COMPLETED' && selectedItem.responseData && (
                <div className="flex flex-col md:flex-row gap-6">
                   
                   {/* Photo Section */}
                   <div className="shrink-0 flex flex-col items-center">
                      <div className="w-40 h-40 rounded-lg bg-gray-200 dark:bg-gray-700 overflow-hidden border-2 border-white shadow-md">
                        {selectedItem.responseData.photo ? (
                          <img 
                            src={selectedItem.responseData.photo.startsWith('data:') ? selectedItem.responseData.photo : `data:image/jpeg;base64,${selectedItem.responseData.photo}`} 
                            alt="BVN Photo" 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">No Photo</div>
                        )}
                      </div>
                      <span className="mt-2 text-xs font-bold px-2 py-1 bg-green-100 text-green-700 rounded-full flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Verified
                      </span>
                   </div>

                   {/* Details Grid */}
                   <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <DetailBox label="First Name" value={selectedItem.responseData.firstName} />
                      <DetailBox label="Surname" value={selectedItem.responseData.surname} />
                      <DetailBox label="Middle Name" value={selectedItem.responseData.middleName} />
                      <DetailBox label="Gender" value={selectedItem.responseData.gender} />
                      
                      <div className="col-span-2 border-t border-dashed border-gray-200 dark:border-gray-700 my-1"></div>

                      <DetailBox label="Date of Birth" value={selectedItem.responseData.dateOfBirth} icon={Calendar} />
                      <DetailBox label="Phone Number" value={selectedItem.responseData.phoneNumber} icon={Smartphone} />
                      <DetailBox label="State of Origin" value={selectedItem.responseData.stateOfOrigin} icon={MapPin} />
                      <DetailBox label="NIN (Linked)" value={selectedItem.responseData.nin || 'N/A'} />
                   </div>
                </div>
              )}

              {/* FAILED STATE */}
              {selectedItem.status === 'FAILED' && (
                 <div className="text-center py-8 bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-100 dark:border-red-900/20">
                    <XCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
                    <h3 className="text-red-700 font-bold mb-1">Verification Failed</h3>
                    <p className="text-red-600 text-sm">
                      {selectedItem.responseData?.error || 'The provider could not verify this BVN.'}
                    </p>
                 </div>
              )}

            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper Component for Data Fields
function DetailBox({ label, value, icon: Icon }: any) {
  return (
    <div className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg border border-gray-100 dark:border-gray-800">
      <span className="text-xs text-gray-400 uppercase tracking-wider block mb-1 flex items-center gap-1">
        {Icon && <Icon className="w-3 h-3" />} {label}
      </span>
      <span className="font-semibold text-gray-800 dark:text-gray-200 block truncate">
        {value || 'N/A'}
      </span>
    </div>
  );
}
