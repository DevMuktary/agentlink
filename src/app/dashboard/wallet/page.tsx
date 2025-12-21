'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import GlobalLoader from '@/components/GlobalLoader';
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  Download,
  CreditCard,
  History,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';

export default function WalletPage() {
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [showFundModal, setShowFundModal] = useState(false);
  
  // Computed Stats
  const [stats, setStats] = useState({ totalDeposits: 0, totalSpent: 0 });

  useEffect(() => {
    fetchWalletData();
  }, []);

  const fetchWalletData = async () => {
    try {
      const [userRes, txRes] = await Promise.all([
        axios.get('/api/user/me'),
        axios.get('/api/user/transactions')
      ]);
      
      setUserData(userRes.data);
      setTransactions(txRes.data);

      // Calculate Totals from History
      const txs = txRes.data;
      const deposits = txs
        .filter((t: any) => t.type === 'DEPOSIT' && t.status === 'COMPLETED')
        .reduce((acc: number, curr: any) => acc + Number(curr.amount), 0);
        
      const spent = txs
        .filter((t: any) => t.type !== 'DEPOSIT' && t.status === 'COMPLETED')
        .reduce((acc: number, curr: any) => acc + Number(curr.amount), 0);

      setStats({ totalDeposits: deposits, totalSpent: spent });

    } catch (error) {
      console.error("Error loading wallet data");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (transactions.length === 0) return alert("No transactions to download.");

    // Create CSV Content
    const headers = ["Date,Reference,Type,Amount,Status"];
    const rows = transactions.map(tx => {
      const date = new Date(tx.createdAt).toLocaleDateString('en-NG');
      const amount = Number(tx.amount).toFixed(2);
      return `${date},${tx.reference},${tx.type},${amount},${tx.status}`;
    });

    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    
    // Trigger Download
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `transactions_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-NG', {
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  if (loading) return <GlobalLoader />;

  const balance = Number(userData?.walletBalance || 0);
  const isLowBalance = balance < 1000;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* HEADER & BALANCE SECTION */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* Balance Card */}
        <div className="flex-1 bg-gradient-to-r from-blue-900 to-blue-800 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-blue-200 text-sm font-medium uppercase tracking-wider">Wallet Balance</h2>
            <div className="mt-3 flex items-baseline">
              <span className="text-5xl font-bold tracking-tight">
                ₦{balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>
            
            <div className="mt-8 flex gap-3">
              <button 
                onClick={() => setShowFundModal(true)}
                className="bg-white text-blue-900 px-6 py-3 rounded-xl font-bold shadow-md hover:bg-blue-50 transition-all flex items-center"
              >
                <CreditCard className="w-5 h-5 mr-2" />
                Fund Wallet
              </button>
            </div>
          </div>
          {/* Decorative Circles */}
          <div className="absolute right-0 top-0 h-64 w-64 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl pointer-events-none"></div>
        </div>

        {/* Stats Card */}
        <div className="flex-1 bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col justify-center gap-6">
          
          {/* Account Status Row */}
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-4">
            <div className="flex items-center space-x-3">
              <div className={`p-2.5 rounded-full ${isLowBalance ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'}`}>
                {isLowBalance ? <AlertTriangle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Account Status</p>
                <p className={`font-bold ${isLowBalance ? 'text-orange-600' : 'text-green-600'}`}>
                  {isLowBalance ? "Low Balance" : "Good Standing"}
                </p>
              </div>
            </div>
          </div>

          {/* Deposits & Spent Row */}
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-full">
                <ArrowDownLeft className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase">In</p>
                <p className="font-bold text-gray-900 dark:text-white">₦{stats.totalDeposits.toLocaleString()}</p>
              </div>
            </div>

            <div className="h-8 w-px bg-gray-200 dark:bg-gray-700"></div>

            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-full">
                <ArrowUpRight className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase">Out</p>
                <p className="font-bold text-gray-900 dark:text-white">₦{stats.totalSpent.toLocaleString()}</p>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* TRANSACTION HISTORY */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <History className="w-5 h-5 text-gray-500" />
            <h3 className="font-bold text-lg text-gray-900 dark:text-white">Transaction History</h3>
          </div>
          
          <div className="flex gap-2">
            <button 
              onClick={handleDownload}
              className="flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg transition-colors text-sm font-medium"
            >
              <Download className="w-4 h-4 mr-2" />
              Download CSV
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Reference</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Type</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                    No transactions found yet.
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                      {formatDate(tx.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-sm font-mono text-gray-500 dark:text-gray-400">
                      {tx.reference}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        tx.type === 'DEPOSIT' 
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                          : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                      }`}>
                        {tx.type.replace('_', ' ')}
                      </span>
                    </td>
                    <td className={`px-6 py-4 text-sm font-bold ${
                      tx.type === 'DEPOSIT' ? 'text-green-600 dark:text-green-400' : 'text-gray-900 dark:text-white'
                    }`}>
                      {tx.type === 'DEPOSIT' ? '+' : '-'}₦{Number(tx.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`flex items-center ${
                        tx.status === 'COMPLETED' ? 'text-green-600' : 
                        tx.status === 'PENDING' ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {tx.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* FUND WALLET MODAL */}
      {showFundModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6 shadow-2xl animate-in zoom-in-95">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Fund Wallet</h3>
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800 mb-6">
              <p className="text-sm text-blue-800 dark:text-blue-300">
                To fund your wallet, please make a bank transfer to the account below. Your wallet will be credited automatically.
              </p>
            </div>
            
            <div className="space-y-4 mb-6">
              <div className="flex justify-between py-2 border-b dark:border-gray-700">
                <span className="text-gray-500 dark:text-gray-400">Bank Name</span>
                <span className="font-bold dark:text-white">Moniepoint</span>
              </div>
              <div className="flex justify-between py-2 border-b dark:border-gray-700">
                <span className="text-gray-500 dark:text-gray-400">Account Number</span>
                <span className="font-bold text-xl dark:text-white select-all">8012345678</span>
              </div>
              <div className="flex justify-between py-2 border-b dark:border-gray-700">
                <span className="text-gray-500 dark:text-gray-400">Account Name</span>
                <span className="font-bold dark:text-white">AgentLink Systems</span>
              </div>
            </div>

            <button 
              onClick={() => setShowFundModal(false)}
              className="w-full bg-gray-900 dark:bg-white dark:text-black text-white py-3 rounded-lg font-bold hover:opacity-90 transition-opacity"
            >
              I have sent the money
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
