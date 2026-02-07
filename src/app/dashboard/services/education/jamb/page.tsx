'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import GlobalLoader from '@/components/GlobalLoader';
import { 
  GraduationCap, Search, CheckCircle2, XCircle, 
  FileText, Download, Copy, Eye, Calendar, Hash, Loader2, AlertCircle 
} from 'lucide-react';

const JAMB_SERVICES = [
  { id: 'JAMB_ADMISSION_LETTER', name: 'Admission Letter Printing' },
  { id: 'JAMB_ORIGINAL_RESULT', name: 'Original Result Printing' },
  { id: 'JAMB_REGISTRATION_SLIP', name: 'Registration Slip Printing' },
  { id: 'JAMB_PROFILE_CODE_RETRIEVAL', name: 'Profile Code Retrieval' },
];

export default function JambPage() {
  // --- FORM STATE ---
  const [selectedService, setSelectedService] = useState(JAMB_SERVICES[0].id);
  const [formData, setFormData] = useState({
    full_name: '',
    reg_number: '', 
    exam_year: '',
    retrieval_id: '' 
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formStatus, setFormStatus] = useState<{ type: 'success' | 'error', msg: string } | null>(null);

  // --- HISTORY STATE ---
  const [historyLoading, setHistoryLoading] = useState(true);
  const [requests, setRequests] = useState<any[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<any>(null);

  // --- INITIAL LOAD ---
  useEffect(() => {
    fetchHistory();
  }, []);

  // --- SEARCH FILTER ---
  useEffect(() => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      setFilteredRequests(requests.filter(r => 
        r.requestData?.regNumber?.toLowerCase().includes(q) || 
        r.requestData?.retrieval_id?.toLowerCase().includes(q) ||
        r.id.toLowerCase().includes(q)
      ));
    } else {
      setFilteredRequests(requests);
    }
  }, [searchQuery, requests]);

  const fetchHistory = async () => {
    try {
      const res = await axios.get('/api/user/requests'); 
      const logs = res.data.filter((r: any) => r.serviceType.startsWith('JAMB_'));
      setRequests(logs);
      setFilteredRequests(logs);
    } catch (error) {
      console.error("Failed to load history");
    } finally {
      setHistoryLoading(false);
    }
  };

  // --- FORM SUBMIT ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setFormStatus(null);

    try {
      await axios.post('/api/education/jamb', {
        service_type: selectedService,
        ...formData
      });
      setFormStatus({ type: 'success', msg: 'Request Submitted Successfully!' });
      setFormData({ full_name: '', reg_number: '', exam_year: '', retrieval_id: '' }); // Reset
      fetchHistory(); // Refresh table immediately
    } catch (error: any) {
      setFormStatus({ type: 'error', msg: error.response?.data?.error || 'Request Failed' });
    } finally {
      setFormLoading(false);
    }
  };

  // --- HELPERS ---
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied!');
  };

  const handleDownload = (base64: string, filename: string) => {
    if (!base64) return alert("File not ready.");
    const pdfString = base64.startsWith('data:') ? base64 : `data:application/pdf;base64,${base64}`;
    const link = document.createElement('a');
    link.href = pdfString;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getServiceName = (type: string) => {
    return type.replace('JAMB_', '').replace(/_/g, ' ');
  };

  if (historyLoading) return <GlobalLoader />;

  const isRetrieval = selectedService === 'JAMB_PROFILE_CODE_RETRIEVAL';

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      
      {/* 1. NEW REQUEST SECTION */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-6 border-b border-gray-100 dark:border-gray-700 pb-4">
          <div className="p-3 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-lg">
            <GraduationCap size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">New JAMB Request</h1>
            <p className="text-sm text-gray-500">Select a service to begin.</p>
          </div>
        </div>

        {formStatus && (
          <div className={`p-4 mb-6 rounded-lg flex items-center gap-2 text-sm font-medium ${
            formStatus.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {formStatus.type === 'success' ? <CheckCircle2 size={16}/> : <AlertCircle size={16}/>}
            {formStatus.msg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Select Service</label>
                <select 
                  className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-sm"
                  value={selectedService}
                  onChange={(e) => setSelectedService(e.target.value)}
                >
                  {JAMB_SERVICES.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
            </div>

            {isRetrieval ? (
                // --- PROFILE CODE INPUTS ---
                <div className="animate-in fade-in slide-in-from-top-2">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Search Identifier</label>
                    <input 
                      type="text" required placeholder="Enter Reg No, Phone Number, OR Email"
                      className="w-full p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-sm"
                      value={formData.retrieval_id}
                      onChange={e => setFormData({...formData, retrieval_id: e.target.value})}
                    />
                    <p className="text-xs text-gray-400 mt-1">We will search using the value provided.</p>
                </div>
            ) : (
                // --- DOCUMENT INPUTS ---
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
                    <div className="col-span-1 md:col-span-2">
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Full Name</label>
                      <input 
                        type="text" required placeholder="Surname Firstname Middlename"
                        className="w-full p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-sm"
                        value={formData.full_name}
                        onChange={e => setFormData({...formData, full_name: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Reg Number / Profile Code</label>
                      <input 
                        type="text" required placeholder="e.g. 2024192838BA"
                        className="w-full p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-sm"
                        value={formData.reg_number}
                        onChange={e => setFormData({...formData, reg_number: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Exam Year</label>
                      <select 
                        required
                        className="w-full p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-sm"
                        value={formData.exam_year}
                        onChange={e => setFormData({...formData, exam_year: e.target.value})}
                      >
                        <option value="">Select Year</option>
                        {Array.from({length: 10}, (_, i) => new Date().getFullYear() - i).map(year => (
                            <option key={year} value={year}>{year}</option>
                        ))}
                      </select>
                    </div>
                </div>
            )}

            <button 
                type="submit" 
                disabled={formLoading}
                className="w-full py-3.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg shadow-lg shadow-purple-900/20 transition flex items-center justify-center gap-2"
            >
                {formLoading ? <Loader2 className="animate-spin" /> : 'Process Request'}
            </button>
        </form>
      </div>

      {/* 2. HISTORY SECTION */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Request History</h2>
            <div className="relative w-full md:w-auto">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input 
                    type="text" 
                    placeholder="Search History..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full md:w-64 pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm"
                />
            </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700">
                <tr>
                    <th className="px-6 py-4 font-semibold text-gray-500 dark:text-gray-400">Date</th>
                    <th className="px-6 py-4 font-semibold text-gray-500 dark:text-gray-400">Service</th>
                    <th className="px-6 py-4 font-semibold text-gray-500 dark:text-gray-400">Details</th>
                    <th className="px-6 py-4 font-semibold text-gray-500 dark:text-gray-400">Status</th>
                    <th className="px-6 py-4 font-semibold text-gray-500 dark:text-gray-400 text-right">Action</th>
                </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {filteredRequests.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                        <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                        {new Date(item.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 font-medium text-green-700 dark:text-green-400">
                        {getServiceName(item.serviceType)}
                        </td>
                        <td className="px-6 py-4 font-mono text-gray-500 dark:text-gray-400">
                            {item.requestData?.regNumber && `Reg: ${item.requestData.regNumber}`}
                            {item.requestData?.retrieval_id && `ID: ${item.requestData.retrieval_id}`}
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
                        <button onClick={() => setSelectedItem(item)} className="text-gray-500 dark:text-gray-400 hover:text-green-600 transition">
                            <Eye className="w-4 h-4" />
                        </button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
            </div>
        </div>
      </div>

      {/* DETAILS MODAL */}
      {selectedItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setSelectedItem(null)} />
          <div className="relative bg-white dark:bg-gray-800 rounded-xl max-w-lg w-full shadow-2xl overflow-hidden animate-in zoom-in-95 flex flex-col max-h-[90vh]">
            
            <div className="p-5 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900/50">
              <h3 className="font-bold text-lg text-gray-900 dark:text-white">Request Details</h3>
              <button onClick={() => setSelectedItem(null)} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition">
                <XCircle className="w-6 h-6 text-gray-400 hover:text-red-500" />
              </button>
            </div>
            
            <div className="p-6 space-y-4 overflow-y-auto">
               <div className="bg-gray-50 dark:bg-gray-700/20 p-4 rounded-lg border border-gray-100 dark:border-gray-700 space-y-3">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Input Data</p>
                  
                  {selectedItem.requestData?.regNumber && (
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Reg No:</span>
                        <span className="font-mono font-medium">{selectedItem.requestData.regNumber}</span>
                    </div>
                  )}
                  {selectedItem.requestData?.examYear && (
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Year:</span>
                        <span className="font-medium">{selectedItem.requestData.examYear}</span>
                    </div>
                  )}
                  {selectedItem.requestData?.retrieval_id && (
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Search ID:</span>
                        <span className="font-mono font-medium">{selectedItem.requestData.retrieval_id}</span>
                    </div>
                  )}
               </div>

               {/* RESULTS */}
               {selectedItem.status === 'COMPLETED' && (
                  <div className="p-5 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 rounded-lg text-center">
                    <CheckCircle2 className="w-10 h-10 mx-auto mb-2" />
                    
                    {selectedItem.serviceType === 'JAMB_PROFILE_CODE_RETRIEVAL' ? (
                        <div className="mt-2">
                            <p className="font-bold">Profile Code Retrieved</p>
                            <div className="mt-2 bg-white dark:bg-black p-3 rounded border border-green-200 font-mono text-xl font-bold tracking-widest flex justify-between items-center">
                                {selectedItem.responseData?.profile_code || "Unknown"}
                                <Copy className="w-4 h-4 cursor-pointer hover:text-green-500" onClick={() => copyToClipboard(selectedItem.responseData?.profile_code)} />
                            </div>
                        </div>
                    ) : (
                        <div className="mt-2">
                            <p className="font-bold">Document Ready</p>
                            {(selectedItem.responseData?.document_base64 || selectedItem.responseData?.url) && (
                               <button 
                                 onClick={() => handleDownload(
                                    selectedItem.responseData.document_base64 || selectedItem.responseData.url, 
                                    'JAMB_Document.pdf'
                                 )}
                                 className="mt-3 w-full py-2 bg-green-600 hover:bg-green-700 text-white rounded font-bold flex items-center justify-center gap-2 transition"
                               >
                                  <Download className="w-4 h-4" /> Download PDF
                               </button>
                            )}
                        </div>
                    )}
                  </div>
               )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
