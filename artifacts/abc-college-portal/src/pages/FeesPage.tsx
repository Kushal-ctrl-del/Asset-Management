import React, { useState } from 'react';
import { SectionTitle } from '../components/SectionTitle';
import { StatCard } from '../components/StatCard';
import { Modal } from '../components/Modal';
import { cardClass, formatDate } from '../lib/utils';
import { useAuthContext } from '../context/AuthContext';
import { useStore } from '../hooks/useStore';
import { FeeTransaction } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { CreditCard, Download, Loader2, IndianRupee, CheckCircle2 } from 'lucide-react';
import { processPayment } from '../lib/mockApi';
import { toast } from 'sonner';
import { downloadPdf } from '../lib/pdf';

export function FeesPage() {
  const { currentUser } = useAuthContext();
  const [fees, setFees] = useStore<FeeTransaction[]>('abc_fees', []);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [payMethod, setPayMethod] = useState('upi');
  const [isProcessing, setIsProcessing] = useState(false);

  const myFees = fees.filter(f => f.studentId === currentUser?.id);
  const total = myFees.reduce((sum, f) => sum + f.amount, 0);
  const paid = myFees.filter(f => f.status === 'Paid').reduce((sum, f) => sum + f.amount, 0);
  const due = myFees.filter(f => f.status === 'Due').reduce((sum, f) => sum + f.amount, 0);

  const chartData = myFees.map(f => ({ name: f.type, value: f.amount }));
  const COLORS = ['#4f46e5', '#ec4899', '#f59e0b', '#10b981', '#6366f1'];

  const handlePayAll = async () => {
    setIsProcessing(true);
    const res = await processPayment(due, payMethod);
    setIsProcessing(false);

    if (res.success) {
      setFees(prev => prev.map(f => 
        (f.studentId === currentUser?.id && f.status === 'Due') 
          ? { ...f, status: 'Paid', transactionId: res.transactionId, date: res.date } 
          : f
      ));
      toast.success('Payment successful! Receipt generated.');
      setIsModalOpen(false);
    }
  };

  const handleDownloadReceipt = (f: FeeTransaction) => {
    downloadPdf(`Receipt_${f.transactionId}`, ['Type', 'Amount', 'Date', 'Transaction ID'], [
      [f.type, `Rs. ${f.amount}`, formatDate(f.date!), f.transactionId!]
    ]);
  };

  return (
    <div className="space-y-6">
      <SectionTitle title="Fee Management" subtitle="View breakdown and pay outstanding dues" />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard label="Total Fees" value={`₹${total.toLocaleString()}`} icon={IndianRupee} iconColor="text-blue-600" />
        <StatCard label="Total Paid" value={`₹${paid.toLocaleString()}`} icon={CheckCircle2} iconColor="text-green-600" />
        <div className={cardClass("relative overflow-hidden group")}>
          <div className="absolute inset-0 bg-red-50 dark:bg-red-900/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="relative z-10 flex justify-between items-center h-full">
            <div>
              <p className="text-sm font-medium text-slate-500">Total Due</p>
              <h3 className="text-3xl font-bold text-red-600 mt-1">₹{due.toLocaleString()}</h3>
            </div>
            {due > 0 && (
              <button onClick={() => setIsModalOpen(true)} className="btn-primary shadow-lg shadow-primary/30 animate-pulse">
                Pay Now
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className={cardClass("lg:col-span-2")}>
          <h3 className="text-lg font-semibold mb-4">Transaction History</h3>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Particulars</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {myFees.map((f, i) => (
                  <tr key={i}>
                    <td className="font-medium">{f.type}</td>
                    <td>₹{f.amount.toLocaleString()}</td>
                    <td>
                      <span className={`badge ${f.status === 'Paid' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {f.status}
                      </span>
                    </td>
                    <td className="text-slate-500">{f.date ? formatDate(f.date) : '-'}</td>
                    <td>
                      {f.status === 'Paid' && (
                        <button onClick={() => handleDownloadReceipt(f)} className="p-1.5 rounded-lg text-primary hover:bg-primary/10">
                          <Download className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className={cardClass()}>
          <h3 className="text-lg font-semibold mb-4">Fee Breakdown</h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={chartData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => !isProcessing && setIsModalOpen(false)} title="Complete Payment">
        <div className="space-y-6 p-2">
          <div className="text-center p-4 rounded-xl bg-slate-50 dark:bg-background border border-border">
            <p className="text-sm text-slate-500">Amount to pay</p>
            <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">₹{due.toLocaleString()}</p>
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-medium">Select Payment Method</label>
            <div className="grid grid-cols-2 gap-3">
              {['UPI', 'Credit/Debit Card', 'Net Banking'].map((m) => (
                <div 
                  key={m}
                  onClick={() => setPayMethod(m.toLowerCase())}
                  className={`p-3 rounded-xl border text-sm font-medium cursor-pointer transition-all ${payMethod === m.toLowerCase() ? 'border-primary bg-primary/5 text-primary' : 'border-border hover:border-slate-400'}`}
                >
                  {m}
                </div>
              ))}
            </div>
          </div>

          <button 
            onClick={handlePayAll} 
            disabled={isProcessing}
            className="w-full btn-primary h-11 flex items-center justify-center text-lg"
          >
            {isProcessing ? <><Loader2 className="w-5 h-5 animate-spin mr-2" /> Processing...</> : `Pay ₹${due.toLocaleString()}`}
          </button>
        </div>
      </Modal>
    </div>
  );
}
