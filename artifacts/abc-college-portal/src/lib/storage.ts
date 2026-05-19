import studentsSeed from '../data/students.json';
import coursesSeed from '../data/courses.json';
import marksSeed from '../data/marks.json';
import attendanceSeed from '../data/attendance.json';
import timetableSeed from '../data/timetable.json';
import booksSeed from '../data/books.json';
import notificationsSeed from '../data/notifications.json';
import feesSeed from '../data/fees.json';
import assignmentsSeed from '../data/assignments.json';

export function getItem<T>(key: string): T | null {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.error(`Error reading ${key} from localStorage`, error);
    return null;
  }
}

export function setItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error writing ${key} to localStorage`, error);
  }
}

export function removeItem(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing ${key} from localStorage`, error);
  }
}

export function getSessionItem<T>(key: string): T | null {
  try {
    const item = sessionStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.error(`Error reading ${key} from sessionStorage`, error);
    return null;
  }
}

export function setSessionItem<T>(key: string, value: T): void {
  try {
    sessionStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error writing ${key} to sessionStorage`, error);
  }
}

export function removeSessionItem(key: string): void {
  try {
    sessionStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing ${key} from sessionStorage`, error);
  }
}

function hydrateFromSeed(seedData: any, storageKey: string) {
  if (!localStorage.getItem(storageKey)) {
    setItem(storageKey, seedData);
  }
}

export function hydrateAllSeeds() {
  hydrateFromSeed(studentsSeed, 'abc_users');
  hydrateFromSeed(coursesSeed, 'abc_courses');
  hydrateFromSeed(marksSeed, 'abc_marks');
  hydrateFromSeed(attendanceSeed, 'abc_attendance');
  hydrateFromSeed(timetableSeed, 'abc_timetable');
  hydrateFromSeed(booksSeed, 'abc_books');
  hydrateFromSeed(notificationsSeed, 'abc_notifications');
  hydrateFromSeed(feesSeed, 'abc_fees');
  hydrateFromSeed(assignmentsSeed, 'abc_assignments');

  // Initialize empty arrays if not present
  const emptyArrays = [
    'abc_leave_requests',
    'abc_assignment_submissions',
    'abc_book_requests',
    'abc_documents',
    'abc_faculty_attendance',
    'abc_lms_uploads'
  ];

  emptyArrays.forEach(key => {
    if (!localStorage.getItem(key)) {
      setItem(key, []);
    }
  });
}
