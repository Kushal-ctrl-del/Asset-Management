import React, { useState } from 'react';
import { SectionTitle } from '../components/SectionTitle';
import { cardClass, daysUntil } from '../lib/utils';
import { useStore } from '../hooks/useStore';
import { TimetableEntry, Course } from '../types';
import { useAuthContext } from '../context/AuthContext';
import { Clock, MapPin, Printer } from 'lucide-react';

export function TimetablePage() {
  const { currentUser } = useAuthContext();
  const [timetable] = useStore<TimetableEntry[]>('abc_timetable', []);
  const [courses] = useStore<Course[]>('abc_courses', []);

  // Filter based on role
  let filteredTimetable = timetable;
  if (currentUser?.role === 'Faculty') {
    const mySubjects = courses.filter(c => c.faculty === currentUser.name).map(c => c.subject);
    filteredTimetable = timetable.filter(t => mySubjects.includes(t.subject));
  }

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const exams = filteredTimetable.filter(t => t.type === 'Exam').sort((a, b) => new Date(a.date!).getTime() - new Date(b.date!).getTime());

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <SectionTitle title="Timetable" subtitle={currentUser?.role === 'Faculty' ? "Your teaching schedule" : "Class schedule for current semester"} />
        <button onClick={handlePrint} className="icon-btn print:hidden">
          <Printer className="w-5 h-5 text-slate-600" />
        </button>
      </div>

      {exams.length > 0 && (
        <div className="mb-8 print:hidden">
          <h3 className="text-lg font-semibold mb-4">Upcoming Exams</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {exams.map(ex => {
              const remaining = daysUntil(ex.date!);
              return (
                <div key={ex.id} className={cardClass(`relative overflow-hidden ${remaining <= 7 ? 'ring-2 ring-red-500' : ''}`)}>
                  <div className="absolute top-0 left-0 w-1 h-full bg-primary"></div>
                  <h4 className="font-bold text-lg">{ex.subject}</h4>
                  <div className="mt-3 space-y-1.5 text-sm text-slate-500">
                    <p className="flex items-center"><Clock className="w-4 h-4 mr-2" /> {ex.time}</p>
                    <p className="flex items-center"><MapPin className="w-4 h-4 mr-2" /> {ex.room}</p>
                    <p className="font-medium text-slate-900 dark:text-white mt-2">
                      {new Date(ex.date!).toLocaleDateString('en-US', { dateStyle: 'medium' })}
                    </p>
                  </div>
                  <div className="absolute top-4 right-4 bg-soft-bg px-2.5 py-1 rounded text-xs font-bold text-primary">
                    {remaining} days
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className={cardClass("overflow-hidden p-0")}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse min-w-[800px]">
            <thead>
              <tr>
                <th className="p-4 border-b border-border bg-soft-bg dark:bg-background font-semibold w-32">Day</th>
                <th className="p-4 border-b border-border bg-soft-bg dark:bg-background font-semibold">Schedule</th>
              </tr>
            </thead>
            <tbody>
              {days.map(day => {
                const classes = filteredTimetable.filter(t => t.type === 'Class' && t.day === day).sort((a,b) => a.time.localeCompare(b.time));
                return (
                  <tr key={day} className="border-b border-border last:border-0 hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors">
                    <td className="p-4 font-medium text-slate-900 dark:text-white border-r border-border align-top">{day}</td>
                    <td className="p-4">
                      {classes.length === 0 ? (
                        <span className="text-slate-400 italic">No classes scheduled</span>
                      ) : (
                        <div className="flex flex-wrap gap-3">
                          {classes.map(cls => (
                            <div key={cls.id} className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-lg p-3 min-w-[200px]">
                              <p className="font-semibold text-indigo-900 dark:text-indigo-100">{cls.subject}</p>
                              <div className="mt-2 text-xs text-indigo-700 dark:text-indigo-300 space-y-1">
                                <p className="flex items-center"><Clock className="w-3.5 h-3.5 mr-1.5" /> {cls.time}</p>
                                <p className="flex items-center"><MapPin className="w-3.5 h-3.5 mr-1.5" /> {cls.room}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
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
