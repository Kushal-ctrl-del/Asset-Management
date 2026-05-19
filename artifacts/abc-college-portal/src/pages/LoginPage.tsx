import React, { useState } from 'react';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { GraduationCap, Loader2 } from 'lucide-react';
import { useAuthContext } from '../context/AuthContext';
import { useStore } from '../hooks/useStore';
import { User } from '../types';
import { simulateLatency } from '../lib/mockApi';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['Student', 'Faculty', 'Admin']),
  rememberMe: z.boolean().default(false)
});

type LoginForm = z.infer<typeof loginSchema>;

export function LoginPage() {
  const navigate = useNavigate();
  const { login, currentUser } = useAuthContext();
  const [users] = useStore<User[]>('abc_users', []);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { role: 'Student', rememberMe: false }
  });

  if (currentUser) {
    return <Navigate to="/dashboard" replace />;
  }

  const onSubmit = async (data: LoginForm) => {
    setLoading(true);
    await simulateLatency(null, 1000);
    
    const user = users.find(u => 
      u.email.toLowerCase() === data.email.toLowerCase() && 
      u.password === data.password && 
      u.role === data.role
    );

    if (user) {
      login(user, data.rememberMe);
      toast.success('Login successful!');
      navigate('/dashboard');
    } else {
      toast.error('Invalid credentials or role mismatch.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-soft-bg dark:bg-background p-4">
      <div className="w-full max-w-md bg-card rounded-3xl shadow-xl border border-border p-8">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-primary/30">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-center">Welcome Back</h1>
          <p className="text-slate-500 text-sm mt-1">Please sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Role</label>
            <select {...register('role')} className="input">
              <option value="Student">Student</option>
              <option value="Faculty">Faculty</option>
              <option value="Admin">Admin</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input 
              {...register('email')} 
              type="email" 
              placeholder="user@abc.edu" 
              className="input"
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input 
              {...register('password')} 
              type="password" 
              placeholder="••••••••" 
              className="input"
            />
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" {...register('rememberMe')} className="rounded border-slate-300 text-primary focus:ring-primary" />
              <span className="text-slate-600 dark:text-slate-400">Remember me</span>
            </label>
            <Link to="/forgot-password" className="text-primary hover:underline font-medium">
              Forgot password?
            </Link>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full btn-primary h-11 flex items-center justify-center text-lg mt-2"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sign In'}
          </button>
        </form>
        
        <div className="mt-6 text-center text-xs text-slate-500">
          Demo: student@abc.edu / student123 (Student)<br/>
          faculty@abc.edu / faculty123 (Faculty)
        </div>
      </div>
    </div>
  );
}
