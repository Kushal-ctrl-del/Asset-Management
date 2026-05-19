import { User, PaymentResult } from '../types';
import { getItem, setSessionItem } from './storage';

export const simulateLatency = <T>(value: T, ms: number = 800): Promise<T> => {
  return new Promise(resolve => setTimeout(() => resolve(value), ms));
};

export const sendOtp = async (email: string): Promise<{ success: boolean; message: string }> => {
  await simulateLatency(null, 850);
  
  const users = getItem<User[]>('abc_users') || [];
  const userExists = users.some(u => u.email.toLowerCase() === email.toLowerCase());

  if (!userExists) {
    return { success: false, message: "No account found with this email." };
  }

  const otpPayload = {
    email: email.toLowerCase(),
    code: "123456",
    expiresAt: Date.now() + 5 * 60 * 1000 // 5 mins
  };
  
  setSessionItem('abc_password_otp', otpPayload);
  return { success: true, message: "OTP sent to your email." };
};

export const processPayment = async (amount: number, method: string): Promise<PaymentResult> => {
  await simulateLatency(null, 1200);
  
  return {
    success: true,
    transactionId: `ABC${Date.now()}`,
    amount,
    method,
    date: new Date().toISOString()
  };
};
