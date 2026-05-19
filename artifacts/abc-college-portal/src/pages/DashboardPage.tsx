import React, { useMemo } from 'react';
import { SectionTitle } from '../components/SectionTitle';
import { StatCard } from '../components/StatCard';
import { useAuthContext } from '../context/AuthContext';
import { useStore } from '../hooks/useStore';
import { 
  AttendanceRecord, Mark, Assignment, FeeTransaction, 
  TimetableEntry, Course, FacultyAttendanceRecord, NotificationItem
} from '../types';
import { cardClass } from '../lib/utils';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Calendar, BookOpen, Clock, AlertCircle, FileText, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export function DashboardPage() {
  const { currentUser } = useAuthContext();
  const role = currentUser?.role || 'Student';

  if (role === 'Student') return <StudentDashboard />;
  if (role === 'Faculty') return <FacultyDashboard />;
  return <AdminDashboard />;
}

function StudentDashboard() {
  const { currentUser } = useAuthContext();
  const [attendance] = useStore<AttendanceRecord[]>('abc_attendance', []);
  const [marks] = useStore<Mark[]>('abc_marks', []);
  const [assignments] = useStore<Assignment[]>('abc_assignments', []);
  const [fees] = useStore<FeeTransaction[]>('abc_fees', []);
  const [timetable] = useStore<TimetableEntry[]>('abc_timetable', []);
  const [notifications] = useStore<NotificationItem[]>('abc_notifications', []);

  const stats = useMemo(() => {
    const myAtt = attendance.filter(a => a.studentId === currentUser?.id);
    const present = myAtt.filter(a => a.status === 'Present').length;
    const attPercent = myAtt.length ? Math.round((present / myAtt.length) * 100) : 0;

    const myMarks = marks.filter(m => m.studentId === currentUser?.id);
    const totalMarks = myMarks.reduce((acc, m) => acc + (m.total / 10), 0);
    const cgpa = myMarks.length ? (totalMarks / myMarks.length).toFixed(2) : '0.00';

    const pendingAss = assignments.filter(a => new Date(a.deadline) > new Date()).length; // rough
    
    const myFees = fees.filter(f => f.studentId === currentUser?.id && f.status === 'Due');
    const dues = myFees.reduce((acc, f) => acc + f.amount, 0);

    return { attPercent, cgpa, pendingAss, dues };
  }, [attendance, marks, assignments, fees, currentUser]);

  const attData = [
    { name: 'Jan', percent: 85 },
    { name: 'Feb', percent: 78 },
    { name: 'Mar', percent: 92 },
    { name: 'Apr', percent: 88 },
    { name: 'May', percent: stats.attPercent || 80 },
  ];

  const todayClasses = timetable.filter(t => t.type === 'Class' && t.day === new Date().toLocaleDateString('en-US', { weekday: 'long' }));

  return (
    <div className="space-y-6">
      <SectionTitle 
        title={`Good ${new Date().getHours() < 12 ? 'Morning' : 'Afternoon'}, ${currentUser?.name.split(' ')[0]}!`} 
        subtitle="Here's what's happening with your academics today."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Attendance" value={`${stats.attPercent}%`} icon={Calendar} iconColor="text-blue-600" iconBg="bg-blue-50 dark:bg-blue-900/20" />
        <StatCard label="Current CGPA" value={stats.cgpa} icon={BookOpen} iconColor="text-purple-600" iconBg="bg-purple-50 dark:bg-purple-900/20" />
        <StatCard label="Pending Assignments" value={stats.pendingAss} icon={FileText} iconColor="text-orange-600" iconBg="bg-orange-50 dark:bg-orange-900/20" />
        <StatCard label="Fees Due" value={`₹${stats.dues.toLocaleString()}`} icon={AlertCircle} iconColor={stats.dues > 0 ? "text-red-600" : "text-green-600"} iconBg={stats.dues > 0 ? "bg-red-50 dark:bg-red-900/20" : "bg-green-50 dark:bg-green-900/20"} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className={cardClass("col-span-2")}>
          <h3 className="text-lg font-semibold mb-4">Attendance Trend</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={attData}>
                <defs>
                  <linearGradient id="colorAtt" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Area type="monotone" dataKey="percent" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorAtt)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-6">
          <div className={cardClass()}>
            <h3 className="text-lg font-semibold mb-4">Today's Classes</h3>
            {todayClasses.length === 0 ? (
              <div className="text-center p-4 text-slate-500">No classes today! 🎉</div>
            ) : (
              <div className="space-y-3">
                {todayClasses.map(cls => (
                  <div key={cls.id} className="flex items-start gap-3 p-3 rounded-xl bg-soft-bg dark:bg-background border border-border">
                    <div className="p-2 rounded-lg bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{cls.subject}</p>
                      <p className="text-xs text-slate-500">{cls.time} • {cls.room}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className={cardClass()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Announcements</h3>
              <Link to="/notifications" className="text-xs text-primary hover:underline">View all</Link>
            </div>
            <div className="space-y-4">
              {notifications.slice(0, 3).map(n => (
                <div key={n.id} className="border-b border-border pb-3 last:border-0 last:pb-0">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">{n.category}</span>
                  <p className="font-medium text-sm mt-0.5 line-clamp-2">{n.title}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FacultyDashboard() {
  const { currentUser } = useAuthContext();
  const [courses] = useStore<Course[]>('abc_courses', []);
  const [timetable] = useStore<TimetableEntry[]>('abc_timetable', []);
  const [facultyAtt] = useStore<FacultyAttendanceRecord[]>('abc_faculty_attendance', []);

  const myCourses = courses.filter(c => c.faculty === currentUser?.name);
  const mySubjects = myCourses.map(c => c.subject);
  const myClasses = timetable.filter(t => t.type === 'Class' && mySubjects.includes(t.subject));
  const conductedCount = facultyAtt.filter(a => a.facultyId === currentUser?.id && a.status === 'Conducted').length;

  const progressData = myCourses.map(c => ({
    name: c.code,
    completed: Math.floor(Math.random() * 60) + 40 // mock progress
  }));

  return (
    <div className="space-y-6">
      <SectionTitle 
        title={`Welcome, ${currentUser?.name}`} 
        subtitle="Faculty Workspace"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Assigned Subjects" value={myCourses.length} icon={BookOpen} iconColor="text-indigo-600" />
        <StatCard label="Weekly Classes" value={myClasses.length} icon={Calendar} iconColor="text-blue-600" />
        <StatCard label="Classes Conducted" value={conductedCount} icon={CheckCircle} iconColor="text-green-600" />
        <StatCard label="Pending Evaluations" value={12} icon={FileText} iconColor="text-orange-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={cardClass()}>
          <h3 className="text-lg font-semibold mb-4">Syllabus Progress</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={progressData} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" domain={[0, 100]} />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} />
                <Tooltip cursor={{fill: 'transparent'}} />
                <Bar dataKey="completed" fill="#4f46e5" radius={[0, 4, 4, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className={cardClass()}>
          <h3 className="text-lg font-semibold mb-4">Today's Teaching Plan</h3>
          <div className="space-y-3">
            {myClasses.filter(t => t.day === new Date().toLocaleDateString('en-US', { weekday: 'long' })).map(cls => (
              <div key={cls.id} className="flex items-center justify-between p-4 rounded-xl border border-border hover:bg-soft-bg transition-colors">
                <div>
                  <p className="font-semibold">{cls.subject}</p>
                  <p className="text-sm text-slate-500 flex items-center mt-1">
                    <Clock className="w-3.5 h-3.5 mr-1" /> {cls.time} • {cls.room}
                  </p>
                </div>
                <Link to="/attendance" className="btn-secondary text-sm py-1.5 px-3">Mark Att.</Link>
              </div>
            ))}
            {myClasses.filter(t => t.day === new Date().toLocaleDateString('en-US', { weekday: 'long' })).length === 0 && (
              <div className="text-center p-8 text-slate-500">No classes assigned for today.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function AdminDashboard() {
  return (
    <div className="space-y-6">
      <SectionTitle title="System Administration" subtitle="Overview of college metrics" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Students" value={850} icon={BookOpen} />
        <StatCard label="Total Faculty" value={64} icon={CheckCircle} />
        <StatCard label="Active Courses" value={24} icon={FileText} />
        <StatCard label="Leave Requests" value={8} icon={AlertCircle} iconColor="text-amber-600" />
      </div>
      <div className={cardClass("text-center py-12")}>
        <p className="text-slate-500">Admin metrics and configuration panels go here.</p>
      </div>
    </div>
  );
}
