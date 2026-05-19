import React, { useState } from 'react';
import { SectionTitle } from '../components/SectionTitle';
import { cardClass } from '../lib/utils';
import { useAuthContext } from '../context/AuthContext';
import { useStore } from '../hooks/useStore';
import { AttendanceRecord, Course, FacultyAttendanceRecord, User, LeaveRequest } from '../types';
import { toast } from 'sonner';

export function AttendancePage() {
  const { currentUser } = useAuthContext();
  if (currentUser?.role === 'Student') return <StudentAttendance />;
  if (currentUser?.role === 'Faculty') return <FacultyAttendance />;
  return <div className="p-8 text-center text-slate-500">Admin Attendance View not implemented yet.</div>;
}

function StudentAttendance() {
  const { currentUser } = useAuthContext();
  const [attendance] = useStore<AttendanceRecord[]>('abc_attendance', []);
  const [courses] = useStore<Course[]>('abc_courses', []);
  const [leaveRequests, setLeaveRequests] = useStore<LeaveRequest[]>('abc_leave_requests', []);
  
  const [reason, setReason] = useState('');
  const [type, setType] = useState<'Medical' | 'Personal'>('Medical');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const myAtt = attendance.filter(a => a.studentId === currentUser?.id);
  const present = myAtt.filter(a => a.status === 'Present').length;
  const overall = myAtt.length ? Math.round((present / myAtt.length) * 100) : 0;
  const isDanger = overall < 75;

  const subjectStats = courses.map(c => {
    const subjAtt = myAtt.filter(a => a.subject === c.subject);
    const subPres = subjAtt.filter(a => a.status === 'Present').length;
    const subPerc = subjAtt.length ? Math.round((subPres / subjAtt.length) * 100) : 0;
    return { subject: c.subject, attended: subPres, total: subjAtt.length, percent: subPerc };
  });

  const handleLeaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !endDate || !reason) return toast.error('Fill all fields');
    
    const newRequest: LeaveRequest = {
      id: `lv${Date.now()}`,
      studentId: currentUser!.id,
      type,
      reason,
      startDate,
      endDate,
      status: 'Pending'
    };
    
    setLeaveRequests(prev => [...prev, newRequest]);
    toast.success('Leave request submitted');
    setReason(''); setStartDate(''); setEndDate('');
  };

  return (
    <div className="space-y-6">
      <SectionTitle title="Attendance" subtitle="Track your presence and apply for leaves" />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className={cardClass("flex items-center justify-between")}>
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Overall Attendance</h3>
              <p className="text-sm text-slate-500 mt-1">Minimum 75% required to sit for exams.</p>
            </div>
            <div className={`text-4xl font-black ${isDanger ? 'text-red-500' : 'text-green-500'}`}>
              {overall}%
            </div>
          </div>

          <div className={cardClass()}>
            <h3 className="text-lg font-semibold mb-4">Subject-wise Breakdown</h3>
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Subject</th>
                    <th>Attended</th>
                    <th>Total</th>
                    <th>Percentage</th>
                  </tr>
                </thead>
                <tbody>
                  {subjectStats.map(s => (
                    <tr key={s.subject}>
                      <td className="font-medium">{s.subject}</td>
                      <td>{s.attended}</td>
                      <td>{s.total}</td>
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                            <div className={`h-2 rounded-full ${s.percent < 75 ? 'bg-red-500' : 'bg-green-500'}`} style={{ width: `${s.percent}%` }}></div>
                          </div>
                          <span className="text-xs w-8">{s.percent}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className={cardClass()}>
            <h3 className="text-lg font-semibold mb-4">Apply for Leave</h3>
            <form onSubmit={handleLeaveSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium mb-1">Type</label>
                <select value={type} onChange={e => setType(e.target.value as any)} className="input text-sm py-1.5">
                  <option value="Medical">Medical</option>
                  <option value="Personal">Personal</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium mb-1">From</label>
                  <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="input text-sm py-1.5" />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">To</label>
                  <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="input text-sm py-1.5" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Reason</label>
                <textarea value={reason} onChange={e => setReason(e.target.value)} className="input text-sm py-1.5 h-20 resize-none" placeholder="Explain your reason..." />
              </div>
              <button type="submit" className="w-full btn-primary text-sm">Submit Request</button>
            </form>
          </div>
          
          <div className={cardClass()}>
            <h3 className="text-lg font-semibold mb-4">Leave History</h3>
            <div className="space-y-3">
              {leaveRequests.filter(l => l.studentId === currentUser?.id).reverse().slice(0,5).map(l => (
                <div key={l.id} className="text-sm border border-border p-3 rounded-lg">
                  <div className="flex justify-between mb-1">
                    <span className="font-medium">{l.type}</span>
                    <span className={`text-xs font-bold ${l.status === 'Approved' ? 'text-green-500' : l.status === 'Rejected' ? 'text-red-500' : 'text-orange-500'}`}>{l.status}</span>
                  </div>
                  <p className="text-xs text-slate-500">{new Date(l.startDate).toLocaleDateString()} - {new Date(l.endDate).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FacultyAttendance() {
  const { currentUser } = useAuthContext();
  const [courses] = useStore<Course[]>('abc_courses', []);
  const [users] = useStore<User[]>('abc_users', []);
  const [attendance, setAttendance] = useStore<AttendanceRecord[]>('abc_attendance', []);
  
  const mySubjects = courses.filter(c => c.faculty === currentUser?.name).map(c => c.subject);
  const students = users.filter(u => u.role === 'Student');

  const [selectedSubj, setSelectedSubj] = useState(mySubjects[0] || '');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const handleMarkStudent = (studentId: string, status: 'Present' | 'Absent' | 'Leave') => {
    setAttendance(prev => {
      // Remove existing record for same day/subj/student
      const filtered = prev.filter(a => !(a.studentId === studentId && a.subject === selectedSubj && a.date === selectedDate));
      return [...filtered, {
        id: `att${Date.now()}-${studentId}`,
        studentId,
        subject: selectedSubj,
        date: selectedDate,
        status
      }];
    });
  };

  const getStatus = (studentId: string) => {
    return attendance.find(a => a.studentId === studentId && a.subject === selectedSubj && a.date === selectedDate)?.status;
  };

  if (mySubjects.length === 0) {
    return <div className="p-8 text-center text-slate-500">No subjects assigned to you.</div>;
  }

  return (
    <div className="space-y-6">
      <SectionTitle title="Mark Attendance" subtitle="Record student presence for your classes" />
      
      <div className={cardClass("flex flex-wrap gap-4 items-end bg-soft-bg dark:bg-background")}>
        <div>
          <label className="block text-sm font-medium mb-1">Subject</label>
          <select value={selectedSubj} onChange={e => setSelectedSubj(e.target.value)} className="input w-64">
            {mySubjects.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Date</label>
          <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="input w-48" />
        </div>
      </div>

      <div className={cardClass()}>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Roll No</th>
                <th>Name</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {students.map(student => {
                const status = getStatus(student.id);
                return (
                  <tr key={student.id}>
                    <td className="text-slate-500">{student.rollNumber}</td>
                    <td className="font-medium text-slate-900 dark:text-white">{student.name}</td>
                    <td className="text-right space-x-2">
                      <button 
                        onClick={() => handleMarkStudent(student.id, 'Present')}
                        className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors ${status === 'Present' ? 'bg-green-500 text-white border-green-500' : 'bg-card text-slate-600 border-border hover:bg-green-50 dark:hover:bg-green-900/20'}`}
                      >
                        P
                      </button>
                      <button 
                        onClick={() => handleMarkStudent(student.id, 'Absent')}
                        className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors ${status === 'Absent' ? 'bg-red-500 text-white border-red-500' : 'bg-card text-slate-600 border-border hover:bg-red-50 dark:hover:bg-red-900/20'}`}
                      >
                        A
                      </button>
                      <button 
                        onClick={() => handleMarkStudent(student.id, 'Leave')}
                        className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors ${status === 'Leave' ? 'bg-orange-500 text-white border-orange-500' : 'bg-card text-slate-600 border-border hover:bg-orange-50 dark:hover:bg-orange-900/20'}`}
                      >
                        L
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
