import React, { useState } from 'react';
import { SectionTitle } from '../components/SectionTitle';
import { cardClass, daysUntil, fileToBase64, formatDate } from '../lib/utils';
import { useAuthContext } from '../context/AuthContext';
import { useStore } from '../hooks/useStore';
import { Assignment, Submission, Course } from '../types';
import { UploadCloud, FileText, CheckCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';

export function AssignmentsPage() {
  const { currentUser } = useAuthContext();
  if (currentUser?.role === 'Faculty') return <FacultyAssignments />;
  return <StudentAssignments />;
}

function StudentAssignments() {
  const { currentUser } = useAuthContext();
  const [assignments] = useStore<Assignment[]>('abc_assignments', []);
  const [submissions, setSubmissions] = useStore<Submission[]>('abc_assignment_submissions', []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, assignmentId: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      return toast.error("File size must be under 5MB");
    }

    try {
      const base64 = await fileToBase64(file);
      const newSub: Submission = {
        id: `sub${Date.now()}`,
        assignmentId,
        studentId: currentUser!.id,
        fileBase64: base64,
        submittedAt: new Date().toISOString()
      };
      
      setSubmissions(prev => [...prev.filter(s => !(s.assignmentId === assignmentId && s.studentId === currentUser!.id)), newSub]);
      toast.success("Assignment submitted successfully!");
    } catch (err) {
      toast.error("Error uploading file");
    }
  };

  return (
    <div className="space-y-6">
      <SectionTitle title="Assignments" subtitle="Manage and submit your coursework" />
      
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {assignments.map(a => {
          const sub = submissions.find(s => s.assignmentId === a.id && s.studentId === currentUser?.id);
          const remaining = daysUntil(a.deadline);
          const isOverdue = remaining < 0;
          const isUrgent = remaining >= 0 && remaining <= 2;

          return (
            <div key={a.id} className={cardClass(`flex flex-col relative ${!sub && isUrgent ? 'ring-2 ring-red-500' : ''}`)}>
              {sub && <div className="absolute top-4 right-4 text-green-500"><CheckCircle className="w-6 h-6" /></div>}
              
              <div className="flex-1">
                <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-md">{a.subject}</span>
                <h3 className="text-lg font-bold mt-3 mb-2 leading-tight">{a.title}</h3>
                <p className="text-sm text-slate-500 line-clamp-3 mb-4">{a.brief}</p>
              </div>
              
              <div className="border-t border-border pt-4 mt-auto">
                <div className="flex items-center justify-between text-sm mb-4">
                  <span className="text-slate-500 flex items-center">
                    <Clock className="w-4 h-4 mr-1.5" /> 
                    {isOverdue ? 'Overdue' : `${remaining} days left`}
                  </span>
                  <span className="font-medium text-slate-900 dark:text-white">{formatDate(a.deadline)}</span>
                </div>

                {sub ? (
                  <div className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 text-sm p-3 rounded-lg flex items-center justify-center font-medium">
                    Submitted on {formatDate(sub.submittedAt)}
                  </div>
                ) : (
                  <div>
                    <input 
                      type="file" 
                      id={`file-${a.id}`} 
                      className="hidden" 
                      onChange={(e) => handleUpload(e, a.id)}
                      accept=".pdf,.doc,.docx,.zip"
                    />
                    <label 
                      htmlFor={`file-${a.id}`}
                      className="btn-primary w-full h-10 flex items-center justify-center cursor-pointer"
                    >
                      <UploadCloud className="w-4 h-4 mr-2" /> Upload Work
                    </label>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function FacultyAssignments() {
  const { currentUser } = useAuthContext();
  const [courses] = useStore<Course[]>('abc_courses', []);
  const [assignments, setAssignments] = useStore<Assignment[]>('abc_assignments', []);
  
  const mySubjects = courses.filter(c => c.faculty === currentUser?.name).map(c => c.subject);
  const myAssignments = assignments.filter(a => mySubjects.includes(a.subject));

  const [subject, setSubject] = useState(mySubjects[0] || '');
  const [title, setTitle] = useState('');
  const [brief, setBrief] = useState('');
  const [deadline, setDeadline] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !title || !brief || !deadline) return toast.error('Fill all fields');

    const newAss: Assignment = {
      id: `as${Date.now()}`,
      subject, title, brief, deadline, createdBy: currentUser!.id
    };

    setAssignments(prev => [...prev, newAss]);
    toast.success('Assignment published');
    setTitle(''); setBrief(''); setDeadline('');
  };

  return (
    <div className="space-y-6">
      <SectionTitle title="Manage Assignments" subtitle="Create and evaluate coursework" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className={cardClass("lg:col-span-1 h-fit")}>
          <h3 className="text-lg font-semibold mb-4">Create New</h3>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Subject</label>
              <select value={subject} onChange={e => setSubject(e.target.value)} className="input">
                {mySubjects.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <input value={title} onChange={e => setTitle(e.target.value)} className="input" placeholder="e.g. Lab Assignment 1" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Deadline</label>
              <input type="datetime-local" value={deadline} onChange={e => setDeadline(e.target.value)} className="input" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Brief Description</label>
              <textarea value={brief} onChange={e => setBrief(e.target.value)} className="input h-24 resize-none" />
            </div>
            <button type="submit" className="w-full btn-primary">Publish Assignment</button>
          </form>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-lg font-semibold">Published Assignments</h3>
          {myAssignments.length === 0 ? (
            <div className="text-center p-8 border border-dashed rounded-xl text-slate-500">No assignments created yet.</div>
          ) : (
            myAssignments.map(a => (
              <div key={a.id} className={cardClass("flex items-start justify-between")}>
                <div>
                  <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-md mb-2 inline-block">{a.subject}</span>
                  <h4 className="font-semibold text-lg">{a.title}</h4>
                  <p className="text-sm text-slate-500 flex items-center mt-1">
                    <Clock className="w-3.5 h-3.5 mr-1" /> Due: {formatDate(a.deadline)}
                  </p>
                </div>
                <button className="btn-secondary text-sm">View Submissions</button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
