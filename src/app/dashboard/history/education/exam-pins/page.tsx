'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import GlobalLoader from '@/components/GlobalLoader';
import { 
  GraduationCap, Search, CheckCircle2, XCircle, 
  Eye, Copy, Printer, Hash
} from 'lucide-react';

export default function ExamPinHistory() {
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
      // Filter for Exam Services
      const logs = res.data.filter((r: any) => r.serviceType.startsWith('EXAM_PIN_'));
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
        r.serviceType.toLowerCase().includes(q) || 
        r.id.toLowerCase().includes(q)
      ));
    } else {
      setFilteredRequests(requests);
    }
  }, [searchQuery, requests]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  const getExamName = (type: string) => {
    if (type === 'EXAM_PIN_WAEC') return 'WAEC';
    if (type === 'EXAM_PIN_NECO') return 'NECO';
    if (type === 'EXAM_PIN_NABTEB') return 'NABTEB';
    if (type === 'EXAM_PIN_JAMB_UTME') return 'JAMB UTME';
    if (type === 'EXAM_PIN_JAMB_DE') return 'JAMB DE';
    return type;
  };

  if (loading) return <GlobalLoader />;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <GraduationCap className="w-8 h-8 text-purple-600" /> Exam Pins
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">History of generated exam scratch cards.</p>
        </div>
        
        <div className="relative w-full md:w-auto">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full md:w-64 pl-10 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-purple-500"
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
                <th className="px-6 py-4 font-semibold text-gray-500">Exam</th>
                <th className="px-6 py-4 font-semibold text-gray-500 text-center">Qty</th>
                <th className="px-6 py-4 font-semibold text-gray-500">Amount</th>
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
                    <td className="px-6 py-4 font-bold text-gray-800 dark:text-gray-200">
                      {getExamName(item.serviceType)}
                    </td>
                    <td className="px-6 py-4 text-center font-mono">
                      {item.requestData?.quantity}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-600">
                       ₦{Number(item.cost).toLocaleString()}
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
                      {item.status === 'COMPLETED' && (
                        <button 
                            onClick={() => setSelectedItem(item)} 
                            className="text-white bg-purple-600 hover:bg-purple-700 px-3 py-1.5 rounded-md text-xs font-bold transition flex items-center gap-1 ml-auto"
                        >
                            <Eye className="w-3 h-3" /> View Pins
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* PIN DISPLAY MODAL */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-lg w-full shadow-2xl overflow-hidden animate-in zoom-in-95">
            <div className="p-5 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900/50">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <Hash className="w-5 h-5 text-purple-600" /> 
                {getExamName(selectedItem.serviceType)} Pins
              </h3>
              <button onClick={() => setSelectedItem(null)}><XCircle className="w-6 h-6 text-gray-400 hover:text-red-500" /></button>
            </div>
            
            <div className="p-6 max-h-[70vh] overflow-y-auto space-y-4">
              
              {/* Pins List */}
              {selectedItem.responseData?.pins && Array.isArray(selectedItem.responseData.pins) ? (
                selectedItem.responseData.pins.map((pin: any, index: number) => (
                    <div key={index} className="bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800 p-4 rounded-lg relative group">
                        <p className="text-xs text-purple-500 uppercase font-bold mb-1">Pin {index + 1}</p>
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-xl font-mono font-bold tracking-widest text-gray-800 dark:text-white select-all">
                                    {pin.pin}
                                </p>
                                {pin.serial && (
                                    <p className="text-sm text-gray-500 font-mono">Serial: {pin.serial}</p>
                                )}
                            </div>
                            <button 
                                onClick={() => copyToClipboard(pin.pin)}
                                className="p-2 bg-white dark:bg-gray-800 rounded shadow-sm hover:text-purple-600 transition"
                                title="Copy Pin"
                            >
                                <Copy className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))
              ) : (
                <p className="text-center text-red-500">No PIN data found in response.</p>
              )}

              <div className="pt-4 border-t border-gray-100 dark:border-gray-700 text-center">
                 <button onClick={() => window.print()} className="text-gray-500 hover:text-gray-900 text-sm flex items-center justify-center gap-2 w-full">
                    <Printer className="w-4 h-4" /> Print / Save
                 </button>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
