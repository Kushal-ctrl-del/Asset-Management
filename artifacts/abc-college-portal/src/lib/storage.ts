import students from "../data/students.json";
import courses from "../data/courses.json";
import marks from "../data/marks.json";
import attendance from "../data/attendance.json";
import timetable from "../data/timetable.json";
import books from "../data/books.json";
import notifications from "../data/notifications.json";
import fees from "../data/fees.json";
import assignments from "../data/assignments.json";

const seedRegistry: Record<string, unknown> = {
  "/src/data/students.json": students,
  "students.json": students,
  "/src/data/courses.json": courses,
  "courses.json": courses,
  "/src/data/marks.json": marks,
  "marks.json": marks,
  "/src/data/attendance.json": attendance,
  "attendance.json": attendance,
  "/src/data/timetable.json": timetable,
  "timetable.json": timetable,
  "/src/data/books.json": books,
  "books.json": books,
  "/src/data/notifications.json": notifications,
  "notifications.json": notifications,
  "/src/data/fees.json": fees,
  "fees.json": fees,
  "/src/data/assignments.json": assignments,
  "assignments.json": assignments,
};

export function getItem<T>(key: string): T | null {
  const raw = localStorage.getItem(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function setItem<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

export function removeItem(key: string): void {
  localStorage.removeItem(key);
}

export function getSessionItem<T>(key: string): T | null {
  const raw = sessionStorage.getItem(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function setSessionItem<T>(key: string, value: T): void {
  sessionStorage.setItem(key, JSON.stringify(value));
}

export function removeSessionItem(key: string): void {
  sessionStorage.removeItem(key);
}

export async function hydrateFromSeed(seedPath: string, storageKey: string): Promise<void> {
  if (localStorage.getItem(storageKey)) return;
  const seed = seedRegistry[seedPath];
  if (seed === undefined) throw new Error(`Missing seed for ${seedPath}`);
  setItem(storageKey, seed);
}

export async function hydrateAllSeeds(): Promise<void> {
  await Promise.all([
    hydrateFromSeed("/src/data/students.json", "abc_users"),
    hydrateFromSeed("/src/data/courses.json", "abc_courses"),
    hydrateFromSeed("/src/data/marks.json", "abc_marks"),
    hydrateFromSeed("/src/data/attendance.json", "abc_attendance"),
    hydrateFromSeed("/src/data/timetable.json", "abc_timetable"),
    hydrateFromSeed("/src/data/books.json", "abc_books"),
    hydrateFromSeed("/src/data/notifications.json", "abc_notifications"),
    hydrateFromSeed("/src/data/fees.json", "abc_fees"),
    hydrateFromSeed("/src/data/assignments.json", "abc_assignments"),
  ]);
  if (!localStorage.getItem("abc_leave_requests")) setItem("abc_leave_requests", []);
  if (!localStorage.getItem("abc_assignment_submissions")) setItem("abc_assignment_submissions", []);
  if (!localStorage.getItem("abc_book_requests")) setItem("abc_book_requests", []);
  if (!localStorage.getItem("abc_documents")) setItem("abc_documents", []);
}
