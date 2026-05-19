import React, { useState } from 'react';
import { SectionTitle } from '../components/SectionTitle';
import { cardClass } from '../lib/utils';
import { useAuthContext } from '../context/AuthContext';
import { User } from '../types';
import { UserCircle, Mail, Phone, MapPin, Building, GraduationCap, Download, KeyRound } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import html2canvas from 'html2canvas';

const passSchema = z.object({
  current: z.string().min(1, 'Current password is required'),
  newPass: z.string().min(6, 'Must be at least 6 characters')
});

export function ProfilePage() {
  const { currentUser, updateCurrentUser } = useAuthContext();
  const [isFlipped, setIsFlipped] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Editable fields state
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [address, setAddress] = useState(currentUser?.address || '');
  const [bloodGroup, setBloodGroup] = useState(currentUser?.bloodGroup || '');

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(passSchema)
  });

  const handleSaveDetails = () => {
    if (!currentUser) return;
    setIsSaving(true);
    setTimeout(() => {
      updateCurrentUser({ ...currentUser, phone, address, bloodGroup });
      toast.success('Profile details updated');
      setIsSaving(false);
    }, 500);
  };

  const handlePasswordChange = (data: any) => {
    if (!currentUser) return;
    if (data.current !== currentUser.password) {
      return toast.error('Current password is incorrect');
    }
    updateCurrentUser({ ...currentUser, password: data.newPass });
    toast.success('Password changed successfully');
    reset();
  };

  const downloadIDCard = async () => {
    const element = document.getElementById('id-card-front');
    if (!element) return;
    
    // Temporarily ensure it's not flipped for the screenshot
    const wasFlipped = isFlipped;
    if (wasFlipped) setIsFlipped(false);
    
    // Small delay to allow DOM to render flip
    setTimeout(async () => {
      try {
        const canvas = await html2canvas(element, { scale: 2, useCORS: true, backgroundColor: null });
        const link = document.createElement('a');
        link.download = `ID_Card_${currentUser?.name.replace(/\s+/g, '_')}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      } catch (err) {
        toast.error('Failed to download ID card');
      }
      if (wasFlipped) setIsFlipped(true);
    }, 100);
  };

  if (!currentUser) return null;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <SectionTitle title="My Profile" subtitle="Manage your personal details and security" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Col: ID Card & Quick Details */}
        <div className="space-y-6">
          <div className={cardClass("p-6 flex flex-col items-center")}>
            {/* 3D ID Card Container */}
            <div className="relative w-full max-w-[280px] h-[400px] perspective-1000 group cursor-pointer mb-6" onClick={() => setIsFlipped(!isFlipped)}>
              <div className={`w-full h-full relative preserve-3d transition-transform duration-700 ${isFlipped ? 'rotate-y-180' : ''}`}>
                
                {/* Front */}
                <div id="id-card-front" className="absolute inset-0 backface-hidden bg-gradient-to-br from-indigo-600 to-indigo-900 rounded-2xl p-6 text-white shadow-xl flex flex-col items-center border border-indigo-400/30 overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-24 bg-white/10 -skew-y-6 transform origin-top-left"></div>
                  
                  <div className="w-full flex items-center justify-between relative z-10 mb-6">
                    <span className="font-bold tracking-widest text-xs opacity-80">ABC COLLEGE</span>
                    <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full">{currentUser.role.toUpperCase()}</span>
                  </div>
                  
                  <div className="w-28 h-28 rounded-full bg-white/20 p-1 mb-4 relative z-10 backdrop-blur-sm">
                    <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-indigo-900">
                      {currentUser.avatar ? (
                        <img src={currentUser.avatar} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                      ) : (
                        <UserCircle className="w-20 h-20 opacity-20" />
                      )}
                    </div>
                  </div>
                  
                  <h2 className="text-xl font-bold relative z-10 text-center">{currentUser.name}</h2>
                  <p className="text-indigo-200 text-sm mt-1 relative z-10 font-medium">
                    {currentUser.role === 'Student' ? currentUser.rollNumber : currentUser.employeeId}
                  </p>
                  
                  <div className="mt-auto w-full pt-4 border-t border-white/20 relative z-10">
                    <p className="text-[10px] text-center text-indigo-200">
                      {currentUser.role === 'Student' ? `B.Tech - Sem ${currentUser.semester}` : currentUser.department}
                    </p>
                  </div>
                </div>

                {/* Back */}
                <div className="absolute inset-0 backface-hidden rotate-y-180 bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-xl border border-border flex flex-col items-center justify-center text-center">
                  <div className="w-32 h-32 bg-slate-100 dark:bg-slate-700 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-600 flex items-center justify-center mb-6">
                    <span className="text-xs text-slate-400">QR Code Area</span>
                  </div>
                  <div className="text-xs text-slate-500 space-y-1">
                    <p>Blood Group: <strong>{bloodGroup || 'N/A'}</strong></p>
                    <p>DOB: <strong>01 Jan 2005</strong></p>
                    <p className="mt-4">If found, please return to:<br/>ABC College Campus</p>
                  </div>
                </div>
                
              </div>
            </div>
            
            <button onClick={downloadIDCard} className="btn-secondary w-full flex items-center justify-center text-sm py-2">
              <Download className="w-4 h-4 mr-2" /> Download ID Card
            </button>
            <p className="text-xs text-slate-400 mt-3">Click card to flip</p>
          </div>
        </div>

        {/* Right Col: Details Form & Password */}
        <div className="lg:col-span-2 space-y-6">
          <div className={cardClass()}>
            <h3 className="text-lg font-semibold mb-6">Personal Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Full Name</label>
                <div className="font-medium text-slate-900 dark:text-white flex items-center bg-muted p-2.5 rounded-lg border border-transparent">
                  <UserCircle className="w-4 h-4 mr-2 text-slate-400" /> {currentUser.name}
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Email Address</label>
                <div className="font-medium text-slate-900 dark:text-white flex items-center bg-muted p-2.5 rounded-lg border border-transparent">
                  <Mail className="w-4 h-4 mr-2 text-slate-400" /> {currentUser.email}
                </div>
              </div>
              
              {currentUser.role === 'Student' && (
                <>
                  <div>
                    <label className="text-xs text-slate-500 mb-1 block">Roll Number</label>
                    <div className="font-medium text-slate-900 dark:text-white flex items-center bg-muted p-2.5 rounded-lg border border-transparent">
                      <GraduationCap className="w-4 h-4 mr-2 text-slate-400" /> {currentUser.rollNumber}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 mb-1 block">Semester</label>
                    <div className="font-medium text-slate-900 dark:text-white flex items-center bg-muted p-2.5 rounded-lg border border-transparent">
                      <Building className="w-4 h-4 mr-2 text-slate-400" /> Semester {currentUser.semester}
                    </div>
                  </div>
                </>
              )}
            </div>

            <hr className="border-border my-6" />
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Phone Number</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="input pl-9" placeholder="+91 9876543210" />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Blood Group</label>
                  <input type="text" value={bloodGroup} onChange={e => setBloodGroup(e.target.value)} className="input" placeholder="e.g. O+" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Residential Address</label>
                <div className="relative">
                  <MapPin className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <textarea value={address} onChange={e => setAddress(e.target.value)} className="input pl-9 h-20 resize-none" placeholder="Enter full address" />
                </div>
              </div>
              
              <button onClick={handleSaveDetails} disabled={isSaving} className="btn-primary w-fit px-6">
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>

          <div className={cardClass()}>
            <div className="flex items-center gap-2 mb-6">
              <KeyRound className="w-5 h-5 text-slate-500" />
              <h3 className="text-lg font-semibold">Change Password</h3>
            </div>
            
            <form onSubmit={handleSubmit(handlePasswordChange)} className="max-w-md space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Current Password</label>
                <input type="password" {...register('current')} className="input" placeholder="Enter current password" />
                {errors.current && <p className="text-xs text-red-500 mt-1">{errors.current.message as string}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">New Password</label>
                <input type="password" {...register('newPass')} className="input" placeholder="Min 6 characters" />
                {errors.newPass && <p className="text-xs text-red-500 mt-1">{errors.newPass.message as string}</p>}
              </div>
              <button type="submit" className="btn-secondary px-6">Update Password</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
