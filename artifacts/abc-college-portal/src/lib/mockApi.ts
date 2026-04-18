import { getItem, setSessionItem } from "./storage";
import type { User } from "../types";

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function simulateLatency<T>(value: T, ms = 650): Promise<T> {
  await wait(ms);
  return value;
}

export async function sendOtp(email: string): Promise<{ success: boolean; message: string }> {
  await wait(850);
  const users = getItem<User[]>("abc_users") || [];
  if (!users.some((user) => user.email.toLowerCase() === email.toLowerCase())) {
    return { success: false, message: "No account found for this email." };
  }
  const code = "123456";
  setSessionItem("abc_password_otp", { email, code, expiresAt: Date.now() + 5 * 60 * 1000 });
  return { success: true, message: "OTP sent. Use 123456 for this demo." };
}

export async function processPayment(amount: number, method: string) {
  await wait(1200);
  return {
    success: true,
    transactionId: `ABC${Date.now().toString().slice(-8)}`,
    amount,
    method,
    date: new Date().toISOString().slice(0, 10),
  };
}
