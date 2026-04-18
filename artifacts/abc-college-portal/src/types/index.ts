export type Role = "Student" | "Faculty" | "Admin";

export interface User {
  id: string;
  role: Role;
  name: string;
  email: string;
  password: string;
  rollNo?: string;
  employeeId?: string;
  course?: string;
  semester?: number;
  section?: string;
  photo?: string;
  dob?: string;
  bloodGroup?: string;
  phone?: string;
  address?: string;
  parentName?: string;
  parentPhone?: string;
}

export interface Course {
  id: string;
  code: string;
  name: string;
  credits: number;
  faculty: string;
  progress: number;
  semester: number;
  units: { title: string; topics: string[] }[];
}

export interface Mark {
  id: string;
  studentId: string;
  semester: number;
  subject: string;
  internal: number;
  external: number;
  total: number;
  grade: string;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  subject: string;
  date: string;
  status: "Present" | "Absent" | "Leave";
}

export interface LeaveRequest {
  id: string;
  studentId: string;
  name: string;
  reason: string;
  from: string;
  to: string;
  type: "Medical" | "Personal";
  documentName?: string;
  documentData?: string;
  status: "Pending" | "Approved" | "Rejected";
  createdAt: string;
}

export interface FeeTransaction {
  id: string;
  studentId: string;
  date: string;
  type: string;
  amount: number;
  transactionId: string;
  status: "Paid" | "Due";
}

export interface Assignment {
  id: string;
  subject: string;
  title: string;
  brief: string;
  deadline: string;
  status: "Pending" | "Submitted" | "Graded";
  marks?: number;
}

export interface NotificationItem {
  id: string;
  category: "Circulars" | "Events" | "Holidays";
  date: string;
  title: string;
  description: string;
  attachment?: string;
  readBy: string[];
}
