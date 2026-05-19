export type Role = 'Student' | 'Faculty' | 'Admin';

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: Role;
  phone?: string;
  bloodGroup?: string;
  address?: string;
  avatar?: string;
  department?: string; // Faculty/Admin
  semester?: number; // Student
  rollNumber?: string; // Student
  employeeId?: string; // Faculty/Admin
}

export interface Course {
  code: string;
  subject: string;
  faculty: string;
  credits: number;
  syllabus: { unit: string; topics: string[] }[];
}

export interface Mark {
  studentId: string;
  subject: string;
  semester: number;
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
  status: 'Present' | 'Absent' | 'Leave';
}

export interface FacultyAttendanceRecord {
  id: string;
  facultyId: string;
  subject: string;
  date: string;
  status: 'Conducted' | 'Cancelled' | 'Substitution';
  notes?: string;
}

export interface TimetableEntry {
  id: string;
  day?: string; // For regular classes
  date?: string; // For exams
  time: string;
  subject: string;
  room: string;
  type: 'Class' | 'Exam';
}

export interface Book {
  id: string;
  title: string;
  author: string;
  category: string;
  isbn: string;
  status: 'Available' | 'Issued';
  issuedTo?: string;
  issueDate?: string;
  dueDate?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  category: 'Circular' | 'Event' | 'Holiday';
  date: string;
  attachment?: string;
  readBy: string[];
}

export interface FeeTransaction {
  id: string;
  studentId: string;
  type: string;
  amount: number;
  status: 'Paid' | 'Due';
  transactionId?: string;
  date?: string;
}

export interface Assignment {
  id: string;
  subject: string;
  title: string;
  brief: string;
  deadline: string;
  createdBy: string;
}

export interface Submission {
  id: string;
  assignmentId: string;
  studentId: string;
  fileBase64: string;
  submittedAt: string;
}

export interface LeaveRequest {
  id: string;
  studentId: string;
  type: 'Medical' | 'Personal';
  reason: string;
  startDate: string;
  endDate: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  documentBase64?: string;
}

export interface LmsUpload {
  id: string;
  subject: string;
  title: string;
  fileBase64: string;
  uploadedBy: string;
  uploadDate: string;
}

export interface DocumentRecord {
  id: string;
  userId: string;
  title: string;
  fileBase64: string;
  uploadDate: string;
}

export interface PaymentResult {
  success: boolean;
  transactionId: string;
  amount: number;
  method: string;
  date: string;
}
