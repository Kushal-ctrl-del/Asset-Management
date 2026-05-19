import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { GraduationCap, Loader2, ArrowLeft } from 'lucide-react';
import { sendOtp } from '../lib/mockApi';
import { getSessionItem, removeSessionItem, setItem, getItem } from '../lib/storage';
import { User } from '../types';

export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return toast.error('Email is required');
    
    setLoading(true);
    const res = await sendOtp(email);
    setLoading(false);
    
    if (res.success) {
      toast.success(res.message);
      setStep(2);
    } else {
      toast.error(res.message);
    }
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    const sessionOtp = getSessionItem<{email: string, code: string, expiresAt: number}>('abc_password_otp');
    
    if (!sessionOtp) return toast.error('OTP session expired. Please request again.');
    if (Date.now() > sessionOtp.expiresAt) return toast.error('OTP expired.');
    if (sessionOtp.email !== email.toLowerCase()) return toast.error('Email mismatch.');
    if (sessionOtp.code !== otp) return toast.error('Invalid OTP code.');
    
    toast.success('OTP verified');
    setStep(3);
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) return toast.error('Password must be at least 6 characters');
    
    const users = getItem<User[]>('abc_users') || [];
    const updatedUsers = users.map(u => 
      u.email.toLowerCase() === email.toLowerCase() ? { ...u, password: newPassword } : u
    );
    
    setItem('abc_users', updatedUsers);
    removeSessionItem('abc_password_otp');
    
    toast.success('Password updated successfully! Please login.');
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-soft-bg dark:bg-background p-4">
      <div className="w-full max-w-md bg-card rounded-3xl shadow-xl border border-border p-8">
        <div className="flex flex-col items-center mb-6">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-primary/30">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-center">Reset Password</h1>
          <p className="text-slate-500 text-sm mt-1 text-center">
            {step === 1 && "Enter your email to receive an OTP"}
            {step === 2 && "Enter the 6-digit OTP sent to your email"}
            {step === 3 && "Create a new strong password"}
          </p>
        </div>

        {step === 1 && (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input 
                type="email" 
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="user@abc.edu" 
                className="input"
              />
            </div>
            <button type="submit" disabled={loading} className="w-full btn-primary h-11 flex items-center justify-center">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Send OTP'}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">OTP Code</label>
              <input 
                type="text" 
                value={otp}
                onChange={e => setOtp(e.target.value)}
                placeholder="123456" 
                className="input text-center tracking-[0.5em] text-lg font-mono"
                maxLength={6}
              />
            </div>
            <button type="submit" className="w-full btn-primary h-11">Verify OTP</button>
            <p className="text-xs text-center text-slate-500">Hint: Use 123456</p>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">New Password</label>
              <input 
                type="password" 
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="••••••••" 
                className="input"
              />
            </div>
            <button type="submit" className="w-full btn-primary h-11">Reset Password</button>
          </form>
        )}

        <div className="mt-6 text-center">
          <Link to="/login" className="inline-flex items-center text-sm text-slate-500 hover:text-primary transition-colors">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
