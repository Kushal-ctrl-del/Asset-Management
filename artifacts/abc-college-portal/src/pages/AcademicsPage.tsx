import React, { useState } from 'react';
import { SectionTitle } from '../components/SectionTitle';
import { cardClass } from '../lib/utils';
import { useStore } from '../hooks/useStore';
import { useAuthContext } from '../context/AuthContext';
import { Course, Mark } from '../types';
import { ChevronDown, ChevronUp, Download } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { downloadPdf } from '../lib/pdf';

export function AcademicsPage() {
  const { currentUser } = useAuthContext();
  const [courses] = useStore<Course[]>('abc_courses', []);
  const [marks] = useStore<Mark[]>('abc_marks', []);
  
  const [semester, setSemester] = useState(4);
  const [expandedCourse, setExpandedCourse] = useState<string | null>(null);

  const myMarks = marks.filter(m => m.studentId === currentUser?.id && m.semester === semester);
  const totalCredits = courses.reduce((acc, c) => acc + c.credits, 0);
  
  const totalGradePoints = myMarks.reduce((acc, m) => {
    const course = courses.find(c => c.subject === m.subject);
    const credits = course?.credits || 0;
    const point = m.total >= 90 ? 10 : m.total >= 80 ? 9 : m.total >= 70 ? 8 : m.total >= 60 ? 7 : 0;
    return acc + (point * credits);
  }, 0);

  const sgpa = totalCredits > 0 ? (totalGradePoints / totalCredits).toFixed(2) : '0.00';

  const chartData = myMarks.map(m => ({
    subject: m.subject.substring(0, 10) + '...',
    score: m.total
  }));

  const handleDownload = () => {
    const rows = myMarks.map(m => [m.subject, m.internal.toString(), m.external.toString(), m.total.toString(), m.grade]);
    downloadPdf(`Marksheet_Sem_${semester}`, ['Subject', 'Internal', 'External', 'Total', 'Grade'], rows);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <SectionTitle title="Academics" subtitle="Syllabus, progress and performance" />
        <select 
          value={semester} 
          onChange={(e) => setSemester(Number(e.target.value))}
          className="input w-40"
        >
          <option value={1}>Semester 1</option>
          <option value={2}>Semester 2</option>
          <option value={3}>Semester 3</option>
          <option value={4}>Semester 4</option>
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Course Subjects</h3>
          {courses.map(course => (
            <div key={course.code} className={cardClass("p-0 overflow-hidden")}>
              <div 
                className="p-4 cursor-pointer hover:bg-soft-bg transition-colors flex items-center justify-between"
                onClick={() => setExpandedCourse(expandedCourse === course.code ? null : course.code)}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold bg-primary/10 text-primary px-2 py-1 rounded">
                      {course.code}
                    </span>
                    <span className="text-xs text-slate-500">{course.credits} Credits</span>
                  </div>
                  <h4 className="font-semibold text-slate-900 dark:text-white mt-1">{course.subject}</h4>
                  <p className="text-xs text-slate-500 mt-1">Prof: {course.faculty}</p>
                </div>
                {expandedCourse === course.code ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
              </div>
              
              {expandedCourse === course.code && (
                <div className="px-4 pb-4 border-t border-border pt-4 bg-soft-bg/50 dark:bg-background">
                  <h5 className="text-sm font-semibold mb-2">Syllabus</h5>
                  <div className="space-y-3">
                    {course.syllabus.map((s, i) => (
                      <div key={i}>
                        <p className="text-xs font-medium text-slate-700 dark:text-slate-300">{s.unit}</p>
                        <ul className="list-disc pl-4 mt-1 space-y-0.5 text-xs text-slate-500">
                          {s.topics.map((t, j) => <li key={j}>{t}</li>)}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="space-y-6">
          <div className={cardClass()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Performance (SGPA: {sgpa})</h3>
              <button onClick={handleDownload} className="btn-secondary text-sm py-1.5 px-3 flex items-center gap-1.5">
                <Download className="w-4 h-4" /> Download PDF
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Subject</th>
                    <th>Int (50)</th>
                    <th>Ext (50)</th>
                    <th>Total</th>
                    <th>Grade</th>
                  </tr>
                </thead>
                <tbody>
                  {myMarks.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-8 text-slate-500">No marks available for this semester.</td>
                    </tr>
                  ) : (
                    myMarks.map(m => (
                      <tr key={m.subject}>
                        <td className="font-medium text-slate-900 dark:text-white">{m.subject}</td>
                        <td>{m.internal}</td>
                        <td>{m.external}</td>
                        <td className="font-semibold">{m.total}</td>
                        <td>
                          <span className="badge bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                            {m.grade}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {myMarks.length > 0 && (
            <div className={cardClass()}>
              <h3 className="text-lg font-semibold mb-4">Score Distribution</h3>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="subject" tick={{fontSize: 12}} />
                    <YAxis domain={[0, 100]} />
                    <Tooltip cursor={{fill: 'transparent'}} />
                    <Bar dataKey="score" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
