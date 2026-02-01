'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import GlobalLoader from '@/components/GlobalLoader';
import { RefreshCw, Eye, X, User, Calendar, Hash, MapPin, FileText } from 'lucide-react';

// Define the shape of the Response Data based on your JSON example
interface ResponseData {
  message?: string;
  data?: {
    photo?: string;
    firstName?: string;
    firstname?: string;
    lastName?: string;
    surname?: string;
    middleName?: string;
    middlename?: string;
    gender?: string;
    dateOfBirth?: string;
    birthdate?: string;
    nin?: string;
    idNumber?: string;
    tracking_id?: string;
    telephoneno?: string;
    residence_address?: string;
    residence_state?: string;
    religion?: string;
    birthcountry?: string;
  };
}

export default function PersonalizationHistoryPage() {
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<any[]>([]);
  const [selectedItem, setSelectedItem] = useState<any | null>(null); // State for the modal

  useEffect(() => { fetchHistory(); }, []);

  const fetchHistory = async () => {
    try {
      const res = await axios.get('/api/user/requests?type=NIN_PERSONALIZATION');
      setRequests(res.data);
    } catch (error) { console.error("Failed to load history"); } finally { setLoading(false); }
  };

  // Helper to safely get fields (handling the mixed casing in your API response)
  const getField = (data: any, ...keys: string[]) => {
    if (!data) return 'N/A';
    for (const key of keys) {
      if (data[key]) return data[key];
    }
    return 'N/A';
  };

  if (loading) return <GlobalLoader />;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 relative">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">NIN Personalization History</h1>
        <button onClick={fetchHistory} className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 transition">
          <RefreshCw className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-6 py-4 font-semibold text-gray-500 dark:text-gray-400">Date</th>
                <th className="px-6 py-4 font-semibold text-gray-500 dark:text-gray-400">Tracking ID</th>
                <th className="px-6 py-4 font-semibold text-gray-500 dark:text-gray-400">Cost</th>
                <th className="px-6 py-4 font-semibold text-gray-500 dark:text-gray-400">Status</th>
                <th className="px-6 py-4 font-semibold text-right text-gray-500 dark:text-gray-400">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {requests.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-500">No personalization requests found.</td></tr>
              ) : (
                requests.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{new Date(item.createdAt).toLocaleString()}</td>
                    <td className="px-6 py-4 font-mono text-gray-700 dark:text-gray-200">{item.requestData?.trackingId || '---'}</td>
                    <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">-₦{Number(item.cost).toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${item.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : item.status === 'FAILED' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {item.status === 'COMPLETED' && item.responseData?.data ? (
                        <button 
                          onClick={() => setSelectedItem(item)}
                          className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-white bg-black dark:bg-white dark:text-black rounded-lg hover:opacity-80 transition"
                        >
                          <Eye className="w-3 h-3" /> View Result
                        </button>
                      ) : (
                        <span className="text-xs text-gray-400 italic">
                          {item.status === 'FAILED' ? 'Failed' : 'Processing'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- RESULT MODAL --- */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-zinc-800">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                Personalization Details
              </h3>
              <button 
                onClick={() => setSelectedItem(null)}
                className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Scrollable Area */}
            <div className="p-6 overflow-y-auto">
              <div className="flex flex-col md:flex-row gap-8">
                
                {/* Left Column: Photo */}
                <div className="flex-shrink-0 flex flex-col items-center space-y-3">
                  <div className="w-40 h-48 bg-gray-100 dark:bg-zinc-800 rounded-lg border border-gray-200 dark:border-zinc-700 flex items-center justify-center overflow-hidden shadow-sm">
                    {selectedItem.responseData?.data?.photo ? (
                      <img 
                        src={`data:image/jpeg;base64,${selectedItem.responseData.data.photo}`} 
                        alt="User Photo" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-16 h-16 text-gray-300" />
                    )}
                  </div>
                  <span className="text-xs font-mono text-gray-400">
                    {getField(selectedItem.responseData?.data, 'tracking_id')}
                  </span>
                </div>

                {/* Right Column: Details Grid */}
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-4">
                  
                  {/* Full Name */}
                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Full Name</label>
                    <p className="text-lg font-medium text-gray-900 dark:text-white">
                      {getField(selectedItem.responseData?.data, 'firstname', 'firstName')} {' '}
                      {getField(selectedItem.responseData?.data, 'middlename', 'middleName')} {' '}
                      {getField(selectedItem.responseData?.data, 'surname', 'lastName')}
                    </p>
                  </div>

                  {/* NIN Number */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                      <Hash className="w-3 h-3" /> NIN
                    </label>
                    <p className="text-base font-mono font-medium text-gray-900 dark:text-white bg-gray-50 dark:bg-zinc-800 px-2 py-1 rounded inline-block">
                      {getField(selectedItem.responseData?.data, 'nin', 'NIN', 'idNumber')}
                    </p>
                  </div>

                  {/* Gender */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                      <User className="w-3 h-3" /> Gender
                    </label>
                    <p className="text-base text-gray-900 dark:text-white">
                      {getField(selectedItem.responseData?.data, 'gender')}
                    </p>
                  </div>

                  {/* Date of Birth */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> Date of Birth
                    </label>
                    <p className="text-base text-gray-900 dark:text-white">
                      {getField(selectedItem.responseData?.data, 'birthdate', 'dateOfBirth')}
                    </p>
                  </div>

                  {/* Phone */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Phone</label>
                    <p className="text-base text-gray-900 dark:text-white">
                      {getField(selectedItem.responseData?.data, 'telephoneno') || 'N/A'}
                    </p>
                  </div>

                  {/* Address (Full Width) */}
                  <div className="sm:col-span-2 space-y-1 pt-2 border-t border-gray-100 dark:border-zinc-800">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> Address
                    </label>
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                      {getField(selectedItem.responseData?.data, 'residence_address', 'residence_addr') !== 'N/A' 
                        ? getField(selectedItem.responseData?.data, 'residence_address', 'residence_addr') 
                        : 'No address provided'}
                      {getField(selectedItem.responseData?.data, 'residence_state') !== 'N/A' && `, ${getField(selectedItem.responseData?.data, 'residence_state')}`}
                    </p>
                  </div>

                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50 dark:bg-zinc-800/50 flex justify-end">
              <button 
                onClick={() => setSelectedItem(null)}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
