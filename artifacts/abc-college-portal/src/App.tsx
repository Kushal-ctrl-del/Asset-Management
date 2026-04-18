import { useEffect, useMemo, useRef, useState } from "react";
import { BrowserRouter, Link, Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { toast, Toaster } from "sonner";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { z } from "zod";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  CartesianGrid,
  Cell,
  LineChart,
  Line,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Bell,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  CreditCard,
  Download,
  Eye,
  EyeOff,
  FileText,
  GraduationCap,
  Home,
  LibraryBig,
  LogOut,
  Menu,
  Moon,
  Search,
  ShieldCheck,
  Sparkles,
  Sun,
  Upload,
  UserRound,
  Wallet,
  X,
} from "lucide-react";
import { AuthProvider, useAuthContext } from "./context/AuthContext";
import { ThemeProvider, useTheme } from "./context/ThemeContext";
import { processPayment, sendOtp, simulateLatency } from "./lib/mockApi";
import { getItem, getSessionItem, hydrateAllSeeds, setItem } from "./lib/storage";
import type { Assignment, AttendanceRecord, Course, FeeTransaction, LeaveRequest, Mark, NotificationItem, User } from "./types";

type Book = { id: string; title: string; author: string; category: string; available: number; issuedTo?: string; issueDate?: string; dueDate?: string };
type TimetableEntry = { id: string; day: string; time: string; subject: string; room: string; type: "Class" | "Exam"; semester: number };
type Submission = { id: string; assignmentId: string; studentId: string; fileName: string; fileData: string; submittedAt: string; status: string; marks?: number };
type DocumentRecord = { id: string; userId: string; type: string; name: string; data: string };

const roleOptions = ["Student", "Faculty", "Admin"] as const;
const navItems = [
  ["/dashboard", "Dashboard", Home],
  ["/academics", "Academics", GraduationCap],
  ["/attendance", "Attendance", CalendarDays],
  ["/fees", "Fees", Wallet],
  ["/timetable", "Timetable", ClipboardList],
  ["/assignments", "Assignments", FileText],
  ["/library", "Library", LibraryBig],
  ["/notifications", "Notifications", Bell],
  ["/profile", "Profile", UserRound],
] as const;

const passwordSchema = z.string().min(6, "Password must be at least 6 characters");

function useStore<T>(key: string, fallback: T) {
  const [value, setValue] = useState<T>(() => getItem<T>(key) ?? fallback);
  const update = (next: T | ((current: T) => T)) => {
    setValue((current) => {
      const resolved = typeof next === "function" ? (next as (current: T) => T)(current) : next;
      setItem(key, resolved);
      return resolved;
    });
  };
  return [value, update] as const;
}

function downloadPdf(title: string, rows: string[]) {
  const doc = new jsPDF();
  doc.setFontSize(18);
  doc.text("ABC College", 20, 20);
  doc.setFontSize(12);
  doc.text("Empowering Minds, Shaping Futures", 20, 28);
  doc.setFontSize(15);
  doc.text(title, 20, 42);
  rows.forEach((row, index) => doc.text(row, 20, 56 + index * 8));
  doc.save(`${title.toLowerCase().replace(/\s+/g, "-")}.pdf`);
}

async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function daysUntil(date: string) {
  return Math.ceil((new Date(date).getTime() - Date.now()) / 86_400_000);
}

function cardClass(extra = "") {
  return `rounded-3xl border border-white/60 bg-white/75 p-5 shadow-xl shadow-indigo-100/50 backdrop-blur-xl transition hover:-translate-y-1 hover:shadow-2xl dark:border-white/10 dark:bg-slate-900/70 dark:shadow-black/20 ${extra}`;
}

function StatCard({ icon: Icon, label, value, sub, color }: { icon: any; label: string; value: string; sub: string; color: string }) {
  return (
    <motion.div whileHover={{ scale: 1.02 }} className={cardClass("overflow-hidden")}> 
      <div className={`mb-5 inline-flex rounded-2xl bg-gradient-to-br ${color} p-3 text-white shadow-lg`}><Icon size={22} /></div>
      <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
      <div className="mt-1 flex items-end justify-between">
        <h3 className="font-heading text-3xl font-bold text-slate-900 dark:text-white">{value}</h3>
        <span className="text-xs text-emerald-600 dark:text-emerald-300">{sub}</span>
      </div>
    </motion.div>
  );
}

function ProtectedRoute({ children, roles }: { children: React.ReactNode; roles?: string[] }) {
  const { currentUser } = useAuthContext();
  if (!currentUser) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(currentUser.role)) return <Navigate to="/dashboard" replace />;
  return children;
}

function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="grid min-h-screen bg-slate-950 lg:grid-cols-[1.05fr_.95fr]">
      <section className="relative hidden overflow-hidden p-12 text-white lg:block">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(16,185,129,.45),transparent_30%),radial-gradient(circle_at_70%_30%,rgba(236,72,153,.45),transparent_30%),linear-gradient(135deg,#4F46E5,#7c3aed,#ec4899)]" />
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 flex h-full flex-col justify-between">
          <div>
            <div className="mb-12 inline-flex items-center gap-3 rounded-full border border-white/30 bg-white/15 px-5 py-3 backdrop-blur">
              <GraduationCap /> ABC College
            </div>
            <h1 className="font-heading text-6xl font-black leading-tight">Empowering Minds, Shaping Futures</h1>
            <p className="mt-6 max-w-xl text-lg text-indigo-50">A secure academic command center for attendance, marks, assignments, fees, library records and campus communication.</p>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {["99% uptime", "8 departments", "24/7 portal"].map((item) => <div key={item} className="rounded-3xl bg-white/15 p-5 backdrop-blur"><span className="font-semibold">{item}</span></div>)}
          </div>
        </motion.div>
      </section>
      <section className="flex items-center justify-center bg-[var(--soft-bg)] p-6 dark:bg-slate-950">{children}</section>
    </main>
  );
}

function LoginPage() {
  const { login } = useAuthContext();
  const navigate = useNavigate();
  const [email, setEmail] = useState("student@abc.edu");
  const [password, setPassword] = useState("student123");
  const [role, setRole] = useState<(typeof roleOptions)[number]>("Student");
  const [remember, setRemember] = useState(false);
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    await simulateLatency(true, 500);
    const ok = await login(email, password, role, remember);
    setLoading(false);
    if (!ok) return toast.error("Invalid email, password or role.");
    toast.success("Welcome to ABC College.");
    navigate("/dashboard");
  };
  const demo = [
    ["Student", "student@abc.edu", "student123"],
    ["Faculty", "faculty@abc.edu", "faculty123"],
    ["Admin", "admin@abc.edu", "admin123"],
  ];
  return (
    <AuthShell>
      <motion.form initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} onSubmit={submit} className="w-full max-w-md rounded-[2rem] border border-white/60 bg-white/85 p-8 shadow-2xl backdrop-blur dark:border-white/10 dark:bg-slate-900/80">
        <div className="mb-8">
          <div className="mb-4 inline-flex rounded-2xl bg-indigo-600 p-3 text-white"><ShieldCheck /></div>
          <h1 className="font-heading text-3xl font-bold text-slate-950 dark:text-white">Student Portal Login</h1>
          <p className="mt-2 text-slate-500 dark:text-slate-400">Access your personalized ABC College workspace.</p>
        </div>
        <label className="field-label">Email</label>
        <input aria-label="Email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} type="email" autoComplete="username" required />
        <label className="field-label mt-4">Password</label>
        <div className="relative">
          <input aria-label="Password" className="input pr-12" value={password} onChange={(e) => setPassword(e.target.value)} type={show ? "text" : "password"} autoComplete="current-password" required />
          <button type="button" aria-label="Toggle password visibility" onClick={() => setShow((v) => !v)} className="absolute right-3 top-3 text-slate-500">{show ? <EyeOff size={18} /> : <Eye size={18} />}</button>
        </div>
        <label className="field-label mt-4">Role</label>
        <select aria-label="Role" className="input" value={role} onChange={(e) => setRole(e.target.value as any)}>{roleOptions.map((item) => <option key={item}>{item}</option>)}</select>
        <div className="my-5 flex items-center justify-between text-sm">
          <label className="flex items-center gap-2"><input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} /> Remember me</label>
          <Link className="font-semibold text-indigo-600" to="/forgot-password">Forgot Password</Link>
        </div>
        <button className="btn-primary w-full" disabled={loading}>{loading ? "Signing in..." : "Sign in"}</button>
        <div className="mt-6 rounded-2xl bg-indigo-50 p-4 text-sm dark:bg-indigo-950/40">
          <p className="mb-3 font-semibold text-slate-800 dark:text-white">Demo credentials</p>
          {demo.map(([r, e, p]) => <button type="button" key={r} onClick={() => { setRole(r as any); setEmail(e); setPassword(p); }} className="mb-2 flex w-full justify-between rounded-xl bg-white px-3 py-2 text-left dark:bg-slate-800"><span>{r}</span><span className="text-slate-500">{e} / {p}</span></button>)}
        </div>
      </motion.form>
    </AuthShell>
  );
}

function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<"email" | "otp" | "reset">("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const request = async () => {
    setLoading(true);
    const result = await sendOtp(email);
    setLoading(false);
    if (!result.success) return toast.error(result.message);
    toast.success(result.message);
    setStep("otp");
  };
  const verify = () => {
    const record = getSessionItem<{ email: string; code: string; expiresAt: number }>("abc_password_otp");
    if (!record || record.email !== email || record.code !== otp) return toast.error("Invalid OTP.");
    if (Date.now() > record.expiresAt) return toast.error("OTP expired. Request a new one.");
    setStep("reset");
  };
  const reset = () => {
    const parsed = passwordSchema.safeParse(password);
    if (!parsed.success) return toast.error(parsed.error.issues[0].message);
    const users = getItem<User[]>("abc_users") || [];
    setItem("abc_users", users.map((user) => user.email.toLowerCase() === email.toLowerCase() ? { ...user, password } : user));
    toast.success("Password updated. Please sign in.");
    navigate("/login");
  };
  return (
    <AuthShell>
      <div className="w-full max-w-md rounded-[2rem] bg-white/90 p-8 shadow-2xl dark:bg-slate-900/90">
        <h1 className="font-heading text-3xl font-bold">Reset Password</h1>
        <p className="mt-2 text-slate-500">OTP expires in five minutes. Demo OTP is 123456.</p>
        {step === "email" && <div className="mt-6"><label className="field-label">Registered email</label><input className="input" value={email} onChange={(e) => setEmail(e.target.value)} /><button className="btn-primary mt-5 w-full" onClick={request}>{loading ? "Sending..." : "Send OTP"}</button></div>}
        {step === "otp" && <div className="mt-6"><label className="field-label">OTP</label><input className="input tracking-[.4em]" value={otp} onChange={(e) => setOtp(e.target.value)} maxLength={6} /><button className="btn-primary mt-5 w-full" onClick={verify}>Verify OTP</button></div>}
        {step === "reset" && <div className="mt-6"><label className="field-label">New password</label><input className="input" type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} /><button className="btn-primary mt-5 w-full" onClick={reset}>Update password</button></div>}
        <Link className="mt-5 inline-block text-sm font-semibold text-indigo-600" to="/login">Back to login</Link>
      </div>
    </AuthShell>
  );
}

function AppLayout({ children }: { children: React.ReactNode }) {
  const { currentUser, logout } = useAuthContext();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(() => sessionStorage.getItem("abc_sidebar_collapsed") === "true");
  const [query, setQuery] = useState("");
  const [notifications] = useStore<NotificationItem[]>("abc_notifications", []);
  const [courses] = useStore<Course[]>("abc_courses", []);
  const unread = notifications.filter((n) => currentUser && !n.readBy.includes(currentUser.id)).length;
  const results = query ? courses.filter((course) => course.name.toLowerCase().includes(query.toLowerCase()) || course.code.toLowerCase().includes(query.toLowerCase())).slice(0, 5) : [];
  const toggleCollapse = () => { const next = !collapsed; setCollapsed(next); sessionStorage.setItem("abc_sidebar_collapsed", String(next)); };
  return (
    <div className="min-h-screen bg-[var(--soft-bg)] text-slate-800 dark:bg-slate-950 dark:text-slate-100">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-xl focus:bg-white focus:p-3">Skip to content</a>
      <aside className={`fixed left-0 top-0 z-30 hidden h-screen border-r border-white/60 bg-white/75 p-4 shadow-xl backdrop-blur-xl transition-all dark:border-white/10 dark:bg-slate-900/80 lg:block ${collapsed ? "w-24" : "w-72"}`}>
        <div className="mb-8 flex items-center justify-between"><div className="flex items-center gap-3"><span className="rounded-2xl bg-gradient-to-br from-indigo-600 to-pink-500 p-3 text-white"><GraduationCap /></span>{!collapsed && <div><h2 className="font-heading font-bold">ABC College</h2><p className="text-xs text-slate-500">Student Portal</p></div>}</div><button aria-label="Collapse sidebar" onClick={toggleCollapse}>{collapsed ? <ChevronRight /> : <ChevronLeft />}</button></div>
        <nav className="space-y-2">{navItems.map(([path, label, Icon]) => <Link key={path} title={label} to={path} className={`flex items-center gap-3 rounded-2xl px-4 py-3 transition ${location.pathname === path ? "bg-indigo-600 text-white shadow-lg" : "hover:bg-indigo-50 dark:hover:bg-white/10"}`}><Icon size={20} />{!collapsed && <span>{label}</span>}</Link>)}</nav>
      </aside>
      <div className={`transition-all ${collapsed ? "lg:pl-24" : "lg:pl-72"}`}>
        <header className="sticky top-0 z-20 border-b border-white/60 bg-white/70 px-4 py-4 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/70 md:px-8">
          <div className="flex items-center gap-4">
            <button className="lg:hidden" aria-label="Menu"><Menu /></button>
            <div className="relative flex-1"><Search className="absolute left-4 top-3 text-slate-400" size={18} /><input className="input pl-11" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search courses and records" />{results.length > 0 && <div className="absolute z-40 mt-2 w-full rounded-2xl bg-white p-2 shadow-2xl dark:bg-slate-900">{results.map((course) => <button key={course.id} className="block w-full rounded-xl px-4 py-2 text-left hover:bg-indigo-50 dark:hover:bg-white/10" onClick={() => { setQuery(""); navigate("/academics"); }}>{course.code} - {course.name}</button>)}</div>}</div>
            <button aria-label="Toggle dark mode" className="icon-btn" onClick={toggleTheme}>{theme === "dark" ? <Sun /> : <Moon />}</button>
            <button aria-label="Notifications" className="icon-btn relative" onClick={() => navigate("/notifications")}><Bell />{unread > 0 && <span className="absolute -right-1 -top-1 rounded-full bg-pink-500 px-1.5 text-xs text-white">{unread}</span>}</button>
            <div className="hidden text-right sm:block"><p className="font-semibold">{currentUser?.name}</p><p className="text-xs text-slate-500">{currentUser?.role}</p></div>
            <button className="icon-btn" aria-label="Logout" onClick={() => { logout(); toast.success("Logged out"); navigate("/login"); }}><LogOut /></button>
          </div>
        </header>
        <main id="main" className="p-4 md:p-8"><AnimatePresence mode="wait"><motion.div key={location.pathname} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>{children}</motion.div></AnimatePresence></main>
        <footer className="px-8 pb-8 text-center text-sm text-slate-500">ABC College | Empowering Minds, Shaping Futures</footer>
      </div>
    </div>
  );
}

function SectionTitle({ title, subtitle }: { title: string; subtitle: string }) {
  return <div className="mb-6"><h1 className="font-heading text-3xl font-black text-slate-950 dark:text-white">{title}</h1><p className="mt-1 text-slate-500 dark:text-slate-400">{subtitle}</p></div>;
}

function DashboardPage() {
  const { currentUser } = useAuthContext();
  const [attendance] = useStore<AttendanceRecord[]>("abc_attendance", []);
  const [marks] = useStore<Mark[]>("abc_marks", []);
  const [assignments] = useStore<Assignment[]>("abc_assignments", []);
  const [fees] = useStore<FeeTransaction[]>("abc_fees", []);
  const [timetable] = useStore<TimetableEntry[]>("abc_timetable", []);
  const [notifications] = useStore<NotificationItem[]>("abc_notifications", []);
  const present = attendance.filter((a) => a.studentId === currentUser?.id && a.status === "Present").length;
  const total = attendance.filter((a) => a.studentId === currentUser?.id).length || 1;
  const attendancePercent = Math.round((present / total) * 100);
  const cgpa = (marks.filter((m) => m.studentId === currentUser?.id).reduce((sum, m) => sum + m.total, 0) / Math.max(marks.filter((m) => m.studentId === currentUser?.id).length, 1) / 10).toFixed(2);
  const due = fees.filter((f) => f.studentId === currentUser?.id && f.status === "Due").reduce((sum, f) => sum + f.amount, 0);
  const today = new Date().toLocaleDateString("en-US", { weekday: "long" });
  const chart = ["Nov", "Dec", "Jan", "Feb", "Mar", "Apr"].map((month, index) => ({ month, attendance: [78, 82, 84, 80, 87, attendancePercent][index] }));
  const greeting = new Date().getHours() < 12 ? "Good morning" : new Date().getHours() < 17 ? "Good afternoon" : "Good evening";
  return (
    <>
      <SectionTitle title={`${greeting}, ${currentUser?.name?.split(" ")[0]}`} subtitle="Here is your academic snapshot for today." />
      <div className="mb-6 grid gap-4 lg:grid-cols-4"><StatCard icon={CheckCircle2} label="Attendance" value={`${attendancePercent}%`} sub="target 75%" color="from-emerald-500 to-teal-500" /><StatCard icon={Sparkles} label="Current CGPA" value={cgpa} sub="rising" color="from-indigo-600 to-violet-600" /><StatCard icon={ClipboardList} label="Pending Assignments" value={String(assignments.filter((a) => a.status === "Pending").length)} sub="active" color="from-amber-500 to-orange-500" /><StatCard icon={CreditCard} label="Fees Due" value={`₹${due.toLocaleString()}`} sub="next due Apr 20" color="from-pink-500 to-rose-500" /></div>
      <div className="grid gap-6 xl:grid-cols-[1.4fr_.8fr]">
        <div className={cardClass()}><h2 className="mb-4 font-heading text-xl font-bold">Six-month attendance</h2><div className="h-72"><ResponsiveContainer><AreaChart data={chart}><defs><linearGradient id="attendance" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#4F46E5" stopOpacity={0.45}/><stop offset="100%" stopColor="#4F46E5" stopOpacity={0}/></linearGradient></defs><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="month" /><YAxis /><Tooltip /><Area type="monotone" dataKey="attendance" stroke="#4F46E5" fill="url(#attendance)" /></AreaChart></ResponsiveContainer></div></div>
        <div className={cardClass()}><h2 className="mb-4 font-heading text-xl font-bold">Recent announcements</h2><div className="space-y-3">{notifications.slice(0, 3).map((n) => <Link to="/notifications" key={n.id} className="block rounded-2xl bg-indigo-50 p-4 dark:bg-white/10"><span className="text-xs font-semibold text-indigo-600">{n.category}</span><p className="font-semibold">{n.title}</p></Link>)}</div></div>
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-2"><div className={cardClass()}><h2 className="mb-4 font-heading text-xl font-bold">Today's timetable</h2><div className="flex gap-3 overflow-x-auto pb-2">{timetable.filter((t) => t.day === today).map((t) => <div key={t.id} className="min-w-56 rounded-2xl bg-gradient-to-br from-indigo-600 to-pink-500 p-4 text-white"><p className="text-sm opacity-80">{t.time} • {t.room}</p><p className="font-semibold">{t.subject}</p></div>)}{timetable.filter((t) => t.day === today).length === 0 && <p className="text-slate-500">No classes scheduled today.</p>}</div></div><div className={cardClass()}><h2 className="mb-4 font-heading text-xl font-bold">Quick actions</h2><div className="grid grid-cols-2 gap-3">{[["Apply Leave","/attendance"],["Pay Fees","/fees"],["View Marks","/academics"],["Submit Assignment","/assignments"]].map(([label,path]) => <Link key={label} to={path} className="rounded-2xl bg-slate-100 p-4 font-semibold hover:bg-indigo-600 hover:text-white dark:bg-white/10">{label}</Link>)}</div></div></div>
    </>
  );
}

function AcademicsPage() {
  const { currentUser } = useAuthContext();
  const [courses] = useStore<Course[]>("abc_courses", []);
  const [marks] = useStore<Mark[]>("abc_marks", []);
  const studentMarks = marks.filter((m) => m.studentId === currentUser?.id);
  const semesters = Array.from(new Set(studentMarks.map((m) => m.semester)));
  const [sem, setSem] = useState(4);
  const gradeData = ["A+", "A", "B+", "B"].map((grade) => ({ grade, count: studentMarks.filter((m) => m.grade === grade).length }));
  return <><SectionTitle title="Academics" subtitle="Courses, syllabus, marks and semester performance." /><div className="grid gap-4 lg:grid-cols-4">{courses.map((course) => <div className={cardClass()} key={course.id}><p className="text-sm text-indigo-600">{course.code} • {course.credits} credits</p><h3 className="mt-1 font-heading text-lg font-bold">{course.name}</h3><p className="mt-2 text-sm text-slate-500">{course.faculty}</p><div className="mt-4 h-2 rounded-full bg-slate-200 dark:bg-slate-700"><div className="h-2 rounded-full bg-emerald-500" style={{ width: `${course.progress}%` }} /></div><details className="mt-4"><summary className="cursor-pointer font-semibold">Syllabus</summary>{course.units.map((u) => <div key={u.title} className="mt-3 rounded-xl bg-slate-50 p-3 dark:bg-white/10"><p className="font-semibold">{u.title}</p><p className="text-sm text-slate-500">{u.topics.join(", ")}</p></div>)}<button className="btn-secondary mt-3" onClick={() => downloadPdf(`${course.name} Syllabus`, course.units.map((u) => `${u.title}: ${u.topics.join(", ")}`))}>Download PDF</button></details></div>)}</div><div className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_.8fr]"><div className={cardClass()}><div className="mb-4 flex flex-wrap gap-2">{semesters.map((s) => <button key={s} className={sem === s ? "btn-primary" : "btn-secondary"} onClick={() => setSem(s)}>Semester {s}</button>)}</div><table className="data-table"><thead><tr><th>Subject</th><th>Internal</th><th>External</th><th>Total</th><th>Grade</th></tr></thead><tbody>{studentMarks.filter((m) => m.semester === sem).map((m) => <tr key={m.id}><td>{m.subject}</td><td>{m.internal}</td><td>{m.external}</td><td>{m.total}</td><td><span className="badge">{m.grade}</span></td></tr>)}</tbody></table><button className="btn-primary mt-4" onClick={() => downloadPdf(`Semester ${sem} Marksheet`, studentMarks.filter((m) => m.semester === sem).map((m) => `${m.subject}: ${m.total} (${m.grade})`))}>Download marksheet</button></div><div className={cardClass()}><h2 className="mb-4 font-heading text-xl font-bold">Grade distribution</h2><div className="h-64"><ResponsiveContainer><BarChart data={gradeData}><XAxis dataKey="grade" /><YAxis allowDecimals={false} /><Tooltip /><Bar dataKey="count" fill="#4F46E5" radius={[10,10,0,0]} /></BarChart></ResponsiveContainer></div><p className="text-sm text-slate-500">SGPA {((studentMarks.filter((m) => m.semester === sem).reduce((a,b) => a + b.total, 0) / Math.max(studentMarks.filter((m) => m.semester === sem).length, 1)) / 10).toFixed(2)} • CGPA {(studentMarks.reduce((a,b) => a + b.total, 0) / Math.max(studentMarks.length,1) / 10).toFixed(2)}</p></div></div></>;
}

function AttendancePage() {
  const { currentUser } = useAuthContext();
  const [attendance] = useStore<AttendanceRecord[]>("abc_attendance", []);
  const [leaves, setLeaves] = useStore<LeaveRequest[]>("abc_leave_requests", []);
  const [form, setForm] = useState({ reason: "", from: "", to: "", type: "Medical" as "Medical" | "Personal", documentName: "", documentData: "" });
  const records = attendance.filter((a) => a.studentId === "s1");
  const percent = Math.round((records.filter((a) => a.status === "Present").length / Math.max(records.length, 1)) * 100);
  const subjects = Array.from(new Set(records.map((r) => r.subject))).map((subject) => { const rows = records.filter((r) => r.subject === subject); const attended = rows.filter((r) => r.status === "Present").length; return { subject, attended, total: rows.length, pct: Math.round((attended / rows.length) * 100) }; });
  const submit = () => { if (!form.reason || !form.from || !form.to) return toast.error("Complete leave request details."); setLeaves([{ id: crypto.randomUUID(), studentId: currentUser?.id || "s1", name: currentUser?.name || "Student", status: "Pending", createdAt: new Date().toISOString(), ...form }, ...leaves]); setForm({ reason: "", from: "", to: "", type: "Medical", documentName: "", documentData: "" }); toast.success("Leave request submitted."); };
  const decide = (id: string, status: "Approved" | "Rejected") => { setLeaves(leaves.map((l) => l.id === id ? { ...l, status } : l)); toast.success(`Leave ${status.toLowerCase()}.`); };
  return <><SectionTitle title="Attendance" subtitle="Track class presence, daily logs and leave workflows." /><div className="grid gap-6 xl:grid-cols-[.8fr_1.2fr]"><div className={cardClass(percent < 75 ? "ring-2 ring-rose-400" : "")}><h2 className="font-heading text-xl font-bold">Overall attendance</h2><p className={`mt-4 text-6xl font-black ${percent < 75 ? "text-rose-500" : "text-emerald-500"}`}>{percent}%</p><p className="mt-3 text-sm text-slate-500">{percent < 75 ? "Below mandatory 75 percent. Meet your mentor." : "You are above the required threshold."}</p></div><div className={cardClass()}><table className="data-table"><thead><tr><th>Subject</th><th>Attended</th><th>Total</th><th>Percent</th></tr></thead><tbody>{subjects.map((s) => <tr key={s.subject}><td>{s.subject}</td><td>{s.attended}</td><td>{s.total}</td><td>{s.pct}%</td></tr>)}</tbody></table></div></div><div className="mt-6 grid gap-6 xl:grid-cols-2"><div className={cardClass()}><h2 className="mb-4 font-heading text-xl font-bold">Daily logs</h2><div className="grid grid-cols-7 gap-2">{records.slice(-21).map((r) => <div key={r.id} title={`${r.date} ${r.subject}`} className={`rounded-xl p-3 text-center text-xs text-white ${r.status === "Present" ? "bg-emerald-500" : r.status === "Absent" ? "bg-rose-500" : "bg-amber-500"}`}>{new Date(r.date).getDate()}<br />{r.status[0]}</div>)}</div></div><div className={cardClass()}><h2 className="mb-4 font-heading text-xl font-bold">Leave request</h2><textarea className="input min-h-24" placeholder="Reason" value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} /><div className="mt-3 grid grid-cols-2 gap-3"><input className="input" type="date" value={form.from} onChange={(e) => setForm({ ...form, from: e.target.value })} /><input className="input" type="date" value={form.to} onChange={(e) => setForm({ ...form, to: e.target.value })} /></div><select className="input mt-3" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as any })}><option>Medical</option><option>Personal</option></select><input className="mt-3" type="file" onChange={async (e) => { const file = e.target.files?.[0]; if (file) setForm({ ...form, documentName: file.name, documentData: await fileToBase64(file) }); }} /><button className="btn-primary mt-4" onClick={submit}>Submit leave request</button></div></div><div className={`${cardClass()} mt-6`}><h2 className="mb-4 font-heading text-xl font-bold">Leave history</h2><table className="data-table"><thead><tr><th>Name</th><th>Dates</th><th>Type</th><th>Status</th><th>Action</th></tr></thead><tbody>{leaves.map((l) => <tr key={l.id}><td>{l.name}</td><td>{l.from} to {l.to}</td><td>{l.type}</td><td><span className="badge">{l.status}</span></td><td>{currentUser?.role !== "Student" && l.status === "Pending" && <div className="flex gap-2"><button className="btn-secondary" onClick={() => decide(l.id, "Approved")}>Approve</button><button className="btn-secondary" onClick={() => decide(l.id, "Rejected")}>Reject</button></div>}</td></tr>)}</tbody></table></div></>;
}

function FeesPage() {
  const { currentUser } = useAuthContext();
  const [fees, setFees] = useStore<FeeTransaction[]>("abc_fees", []);
  const [modal, setModal] = useState(false);
  const [method, setMethod] = useState("UPI");
  const rows = fees.filter((f) => f.studentId === "s1");
  const paid = rows.filter((f) => f.status === "Paid").reduce((a, b) => a + b.amount, 0);
  const due = rows.filter((f) => f.status === "Due").reduce((a, b) => a + b.amount, 0);
  const breakdown = ["Tuition", "Hostel", "Library", "Exam", "Misc"].map((name, i) => ({ name, value: [63000, 22000, 2500, 3500, 4000][i] }));
  const pay = async () => { const result = await processPayment(due, method); setFees(fees.map((f) => f.status === "Due" ? { ...f, status: "Paid", date: result.date, transactionId: result.transactionId } : f)); setModal(false); toast.success("Payment successful. Receipt generated."); };
  return <><SectionTitle title="Fees" subtitle="Payment history, dues, receipts and simulated online payments." /><div className="grid gap-4 md:grid-cols-3"><StatCard icon={Wallet} label="Total" value={`₹${(paid + due).toLocaleString()}`} sub="semester" color="from-indigo-600 to-violet-600" /><StatCard icon={CheckCircle2} label="Paid" value={`₹${paid.toLocaleString()}`} sub="cleared" color="from-emerald-500 to-teal-500" /><StatCard icon={CreditCard} label="Due" value={`₹${due.toLocaleString()}`} sub="Apr 20" color="from-pink-500 to-rose-500" /></div><div className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_.8fr]"><div className={cardClass()}><div className="mb-4 flex justify-between"><h2 className="font-heading text-xl font-bold">Payment history</h2><button className="btn-primary" disabled={!due} onClick={() => setModal(true)}>Pay dues</button></div><table className="data-table"><thead><tr><th>Date</th><th>Type</th><th>Amount</th><th>Transaction</th><th>Receipt</th></tr></thead><tbody>{rows.map((f) => <tr key={f.id}><td>{f.date}</td><td>{f.type}</td><td>₹{f.amount.toLocaleString()}</td><td>{f.transactionId}</td><td><button className="btn-secondary" onClick={() => downloadPdf("Fee Receipt", [`Student: ${currentUser?.name}`, `Type: ${f.type}`, `Amount: ₹${f.amount}`, `Transaction: ${f.transactionId}`, `Status: ${f.status}`])}>Download</button></td></tr>)}</tbody></table></div><div className={cardClass()}><h2 className="mb-4 font-heading text-xl font-bold">Fee breakdown</h2><div className="h-72"><ResponsiveContainer><PieChart><Pie data={breakdown} dataKey="value" nameKey="name" outerRadius={90}>{breakdown.map((_, i) => <Cell key={i} fill={["#4F46E5", "#10B981", "#F59E0B", "#EC4899", "#64748B"][i]} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer></div></div></div>{modal && <Modal title="Simulated online payment" onClose={() => setModal(false)}><select className="input" value={method} onChange={(e) => setMethod(e.target.value)}><option>UPI</option><option>Card</option><option>Netbanking</option></select><p className="my-4 text-slate-500">You are paying ₹{due.toLocaleString()} using {method}.</p><button className="btn-primary w-full" onClick={pay}>Process payment</button></Modal>}</>;
}

function TimetablePage() {
  const [entries] = useStore<TimetableEntry[]>("abc_timetable", []);
  const [sem, setSem] = useState(4);
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const classes = entries.filter((e) => e.type === "Class" && e.semester === sem);
  const exams = entries.filter((e) => e.type === "Exam" && e.semester === sem);
  return <><SectionTitle title="Timetable" subtitle="Weekly schedule, exam countdowns and printable downloads." /><div className="mb-4 flex gap-3"><select className="input max-w-xs" value={sem} onChange={(e) => setSem(Number(e.target.value))}><option value={4}>Semester 4</option><option value={3}>Semester 3</option></select><button className="btn-secondary" onClick={() => window.print()}>Print</button><button className="btn-primary" onClick={() => downloadPdf("Timetable", classes.map((c) => `${c.day} ${c.time} ${c.subject} ${c.room}`))}>Download PDF</button></div><div className="grid gap-4 lg:grid-cols-6">{days.map((day) => <div key={day} className={cardClass()}><h3 className="mb-3 font-heading font-bold">{day}</h3>{classes.filter((e) => e.day === day).map((e) => <div key={e.id} className="mb-3 rounded-2xl bg-gradient-to-br from-indigo-600 to-pink-500 p-4 text-white"><p className="text-sm opacity-80">{e.time} • {e.room}</p><p className="font-semibold">{e.subject}</p></div>)}</div>)}</div><div className="mt-6 grid gap-4 md:grid-cols-3">{exams.map((e) => <div className={cardClass()} key={e.id}><p className="text-sm text-slate-500">{e.day} • {e.time}</p><h3 className="font-heading text-xl font-bold">{e.subject}</h3><p className="mt-3 text-indigo-600">{daysUntil(e.day)} days remaining</p></div>)}</div></>;
}

function AssignmentsPage() {
  const { currentUser } = useAuthContext();
  const [assignments] = useStore<Assignment[]>("abc_assignments", []);
  const [submissions, setSubmissions] = useStore<Submission[]>("abc_assignment_submissions", []);
  const submitFile = async (assignmentId: string, file?: File) => { if (!file) return; const data = await fileToBase64(file); setSubmissions([{ id: crypto.randomUUID(), assignmentId, studentId: currentUser?.id || "s1", fileName: file.name, fileData: data, submittedAt: new Date().toISOString(), status: "Submitted" }, ...submissions]); toast.success("Assignment submitted."); };
  return <><SectionTitle title="Assignments" subtitle="Submit work, track deadlines and download briefs." /><div className="grid gap-4 lg:grid-cols-3">{assignments.map((a) => <div key={a.id} className={cardClass(daysUntil(a.deadline) <= 1 ? "ring-2 ring-rose-400" : "")}><p className="text-sm text-indigo-600">{a.subject}</p><h3 className="mt-1 font-heading text-xl font-bold">{a.title}</h3><p className="mt-3 text-sm text-slate-500">{a.brief}</p><p className="mt-4 font-semibold">Due in {daysUntil(a.deadline)} days</p><label className="mt-4 flex cursor-pointer items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-indigo-300 p-5"><Upload size={18} /> Upload submission<input className="hidden" type="file" onChange={(e) => submitFile(a.id, e.target.files?.[0])} /></label><button className="btn-secondary mt-3" onClick={() => downloadPdf(`${a.title} Brief`, [a.brief, `Deadline: ${a.deadline}`])}>Download brief</button></div>)}</div><div className={`${cardClass()} mt-6`}><h2 className="mb-4 font-heading text-xl font-bold">Submitted work</h2><table className="data-table"><thead><tr><th>Date</th><th>Assignment</th><th>File</th><th>Status</th></tr></thead><tbody>{submissions.map((s) => <tr key={s.id}><td>{new Date(s.submittedAt).toLocaleString()}</td><td>{assignments.find((a) => a.id === s.assignmentId)?.title}</td><td>{s.fileName}</td><td><span className="badge">{s.status}</span></td></tr>)}</tbody></table></div></>;
}

function LibraryPage() {
  const { currentUser } = useAuthContext();
  const [books] = useStore<Book[]>("abc_books", []);
  const [requests, setRequests] = useStore<any[]>("abc_book_requests", []);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("All");
  const cats = ["All", ...Array.from(new Set(books.map((b) => b.category)))];
  const filtered = books.filter((b) => (cat === "All" || b.category === cat) && `${b.title} ${b.author}`.toLowerCase().includes(q.toLowerCase()));
  const issued = books.filter((b) => b.issuedTo === "s1");
  const fine = (due?: string) => Math.max(0, -daysUntil(due || new Date().toISOString()) * 5);
  const request = (book: Book) => { setRequests([{ id: crypto.randomUUID(), userId: currentUser?.id, title: book.title, status: "Requested", date: new Date().toISOString() }, ...requests]); toast.success("Book request saved."); };
  return <><SectionTitle title="Library" subtitle="Issued books, search, requests and fine calculation." /><div className="grid gap-4 md:grid-cols-2">{issued.map((b) => <div className={cardClass()} key={b.id}><h3 className="font-heading text-xl font-bold">{b.title}</h3><p className="text-slate-500">{b.author}</p><p className="mt-3">Issued {b.issueDate} • Due {b.dueDate}</p><p className="mt-2 font-semibold text-rose-500">Fine: ₹{fine(b.dueDate)}</p></div>)}</div><div className={`${cardClass()} mt-6`}><div className="mb-4 grid gap-3 md:grid-cols-[1fr_220px]"><input className="input" placeholder="Search 30+ books" value={q} onChange={(e) => setQ(e.target.value)} /><select className="input" value={cat} onChange={(e) => setCat(e.target.value)}>{cats.map((c) => <option key={c}>{c}</option>)}</select></div><div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{filtered.map((b) => <div key={b.id} className="rounded-2xl bg-slate-50 p-4 dark:bg-white/10"><h3 className="font-semibold">{b.title}</h3><p className="text-sm text-slate-500">{b.author} • {b.category}</p><button className="btn-secondary mt-3" onClick={() => request(b)}>Request Book</button></div>)}</div></div><div className={`${cardClass()} mt-6`}><h2 className="font-heading text-xl font-bold">Request history</h2>{requests.map((r) => <p key={r.id} className="mt-3 rounded-2xl bg-slate-50 p-3 dark:bg-white/10">{r.title} • {r.status}</p>)}</div></>;
}

function NotificationsPage() {
  const { currentUser } = useAuthContext();
  const [items, setItems] = useStore<NotificationItem[]>("abc_notifications", []);
  const [tab, setTab] = useState("Circulars");
  const [date, setDate] = useState("");
  const mark = (id: string) => setItems(items.map((n) => n.id === id && currentUser ? { ...n, readBy: n.readBy.includes(currentUser.id) ? n.readBy.filter((u) => u !== currentUser.id) : [...n.readBy, currentUser.id] } : n));
  const filtered = items.filter((n) => n.category === tab && (!date || n.date >= date));
  return <><SectionTitle title="Notifications" subtitle="Circulars, events, holidays and unread state." /><div className="mb-4 flex flex-wrap gap-3">{["Circulars", "Events", "Holidays"].map((t) => <button key={t} className={tab === t ? "btn-primary" : "btn-secondary"} onClick={() => setTab(t)}>{t}</button>)}<input className="input max-w-xs" type="date" value={date} onChange={(e) => setDate(e.target.value)} /></div><div className="grid gap-4 lg:grid-cols-2">{filtered.map((n) => <div className={cardClass()} key={n.id}><div className="flex items-start justify-between gap-4"><div><span className="badge">{n.category}</span><h3 className="mt-3 font-heading text-xl font-bold">{n.title}</h3><p className="mt-2 text-slate-500">{n.description}</p><p className="mt-3 text-sm">{n.date} {n.attachment && `• ${n.attachment}`}</p></div><button className="btn-secondary" onClick={() => mark(n.id)}>{currentUser && n.readBy.includes(currentUser.id) ? "Read" : "Mark read"}</button></div></div>)}</div></>;
}

function ProfilePage() {
  const { currentUser, updateCurrentUser } = useAuthContext();
  const [draft, setDraft] = useState<User>(currentUser!);
  const [docs, setDocs] = useStore<DocumentRecord[]>("abc_documents", []);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const cardRef = useRef<HTMLDivElement>(null);
  useEffect(() => { if (currentUser) setDraft(currentUser); }, [currentUser]);
  const save = () => { updateCurrentUser(draft); toast.success("Profile saved."); };
  const changePassword = () => { if (currentPassword !== currentUser?.password) return toast.error("Current password is incorrect."); const parsed = passwordSchema.safeParse(newPassword); if (!parsed.success) return toast.error(parsed.error.issues[0].message); updateCurrentUser({ ...currentUser, password: newPassword }); setCurrentPassword(""); setNewPassword(""); toast.success("Password changed."); };
  const downloadPng = async () => { if (!cardRef.current) return; const canvas = await html2canvas(cardRef.current); const link = document.createElement("a"); link.download = "abc-digital-id.png"; link.href = canvas.toDataURL(); link.click(); };
  return <><SectionTitle title="Profile" subtitle="Personal details, documents, digital ID and password." /><div className="grid gap-6 xl:grid-cols-[1.1fr_.9fr]"><div className={cardClass()}><div className="grid gap-3 md:grid-cols-2"><input className="input" value={draft.name || ""} onChange={(e) => setDraft({ ...draft, name: e.target.value })} /><input className="input" value={draft.rollNo || draft.employeeId || ""} onChange={(e) => setDraft({ ...draft, rollNo: e.target.value })} /><input className="input" type="date" value={draft.dob || ""} onChange={(e) => setDraft({ ...draft, dob: e.target.value })} /><input className="input" placeholder="Blood group" value={draft.bloodGroup || ""} onChange={(e) => setDraft({ ...draft, bloodGroup: e.target.value })} /><input className="input" placeholder="Phone" value={draft.phone || ""} onChange={(e) => setDraft({ ...draft, phone: e.target.value })} /><input className="input" placeholder="Parent phone" value={draft.parentPhone || ""} onChange={(e) => setDraft({ ...draft, parentPhone: e.target.value })} /></div><textarea className="input mt-3 min-h-24" placeholder="Address" value={draft.address || ""} onChange={(e) => setDraft({ ...draft, address: e.target.value })} /><label className="mt-3 block"><span className="field-label">Photo upload</span><input type="file" onChange={async (e) => { const file = e.target.files?.[0]; if (file) setDraft({ ...draft, photo: await fileToBase64(file) }); }} /></label><button className="btn-primary mt-4" onClick={save}>Save profile</button><div className="mt-8"><h2 className="font-heading text-xl font-bold">Documents</h2><div className="mt-3 grid gap-3 md:grid-cols-3">{["Aadhaar", "10th", "12th"].map((type) => <label key={type} className="rounded-2xl border border-dashed border-indigo-300 p-4 text-center"><Upload className="mx-auto mb-2" />{type}<input className="hidden" type="file" onChange={async (e) => { const file = e.target.files?.[0]; if (file) setDocs([{ id: crypto.randomUUID(), userId: currentUser?.id || "", type, name: file.name, data: await fileToBase64(file) }, ...docs]); }} /></label>)}</div>{docs.filter((d) => d.userId === currentUser?.id).map((d) => <p key={d.id} className="mt-2 rounded-xl bg-slate-50 p-3 dark:bg-white/10">{d.type}: {d.name}</p>)}</div></div><div className={cardClass()}><div ref={cardRef} className="group relative h-72 rounded-[2rem] [perspective:1000px]"><div className="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-indigo-600 via-violet-600 to-pink-500 p-6 text-white shadow-2xl transition duration-700 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)]"><div className="absolute inset-0 p-6 [backface-visibility:hidden]"><p className="text-sm opacity-80">ABC College Digital ID</p><h3 className="mt-5 font-heading text-2xl font-black">{draft.name}</h3><p>{draft.rollNo || draft.employeeId}</p><p>{draft.course || draft.role}</p></div><div className="absolute inset-0 rounded-[2rem] bg-slate-950 p-6 [backface-visibility:hidden] [transform:rotateY(180deg)]"><div className="grid grid-cols-[100px_1fr] gap-4"><div className="grid h-24 w-24 grid-cols-5 gap-1 bg-white p-2">{Array.from({ length: 25 }).map((_, i) => <span key={i} className={(i * 7) % 3 ? "bg-slate-900" : "bg-white"} />)}</div><div><p>Emergency: {draft.parentPhone || "Not set"}</p><div className="mt-6 flex h-12 items-end gap-1">{Array.from({ length: 24 }).map((_, i) => <span key={i} className="bg-white" style={{ height: `${16 + ((i * 13) % 28)}px`, width: 3 }} />)}</div></div></div></div></div></div><button className="btn-primary mt-4 w-full" onClick={downloadPng}>Download ID as PNG</button><div className="mt-8"><h2 className="font-heading text-xl font-bold">Change password</h2><input className="input mt-3" type="password" autoComplete="current-password" placeholder="Current password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} /><input className="input mt-3" type="password" autoComplete="new-password" placeholder="New password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} /><button className="btn-secondary mt-3" onClick={changePassword}>Update password</button></div></div></div></>;
}

function Modal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4" role="dialog" aria-modal="true"><motion.div initial={{ scale: .95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900"><div className="mb-4 flex justify-between"><h2 className="font-heading text-xl font-bold">{title}</h2><button aria-label="Close modal" onClick={onClose}><X /></button></div>{children}</motion.div></div>;
}

function NotFoundPage() {
  return <div className="grid min-h-[70vh] place-items-center"><div className={cardClass("max-w-lg text-center")}><h1 className="font-heading text-6xl font-black text-indigo-600">404</h1><p className="mt-4 text-xl font-semibold">This classroom does not exist.</p><Link className="btn-primary mt-6 inline-flex" to="/dashboard">Return to dashboard</Link></div></div>;
}

function AppRoutes() {
  return <Routes><Route path="/login" element={<LoginPage />} /><Route path="/forgot-password" element={<ForgotPasswordPage />} /><Route path="/reset-password" element={<ForgotPasswordPage />} />{[["/dashboard", <DashboardPage />], ["/academics", <AcademicsPage />], ["/attendance", <AttendancePage />], ["/fees", <FeesPage />], ["/timetable", <TimetablePage />], ["/assignments", <AssignmentsPage />], ["/library", <LibraryPage />], ["/notifications", <NotificationsPage />], ["/profile", <ProfilePage />]].map(([path, element]) => <Route key={path as string} path={path as string} element={<ProtectedRoute><AppLayout>{element as React.ReactNode}</AppLayout></ProtectedRoute>} />)}<Route path="/" element={<Navigate to="/dashboard" replace />} /><Route path="*" element={<ProtectedRoute><AppLayout><NotFoundPage /></AppLayout></ProtectedRoute>} /></Routes>;
}

function Boot() {
  const [ready, setReady] = useState(false);
  useEffect(() => { document.title = "ABC College | Student Portal"; hydrateAllSeeds().then(() => setReady(true)); }, []);
  if (!ready) return <div className="grid min-h-screen place-items-center bg-[var(--soft-bg)]"><div className="rounded-3xl bg-white p-8 shadow-xl"><div className="mb-4 h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" /><p>Hydrating ABC College portal...</p></div></div>;
  return <AuthProvider><BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, "")} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}><AppRoutes /></BrowserRouter></AuthProvider>;
}

export default function App() {
  return <ThemeProvider><Boot /><Toaster richColors position="top-right" /></ThemeProvider>;
}
