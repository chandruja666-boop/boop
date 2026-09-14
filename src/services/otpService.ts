/**
 * CP Furniture SMS OTP Authentication Service
 * Handles high-security 6-digit OTP generation, simulated telco SMS gateway routing,
 * token verification, countdown expiration, and session issuance.
 */
import { cloudApi } from './cloudApi';

export interface OTPEntry {
  phone: string;
  normalizedPhone: string;
  otp: string;
  expiresAt: number; // timestamp
  sentAt: number;
  attempts: number;
}

export interface SendOTPResult {
  success: boolean;
  message: string;
  otp?: string;
  phone: string;
  normalizedPhone: string;
  expiresAt: number;
  remainingSeconds: number;
}

export interface VerifyOTPResult {
  success: boolean;
  message: string;
  phone: string;
  normalizedPhone: string;
}

// In-memory & localStorage synced OTP storage
const OTP_STORAGE_KEY = 'cp_furniture_active_otps_v1';

class OTPService {
  private getStore(): Record<string, OTPEntry> {
    try {
      const raw = localStorage.getItem(OTP_STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }

  private setStore(store: Record<string, OTPEntry>): void {
    try {
      localStorage.setItem(OTP_STORAGE_KEY, JSON.stringify(store));
    } catch (err) {
      console.warn('Could not persist OTP store', err);
    }
  }

  public normalizePhoneNumber(rawPhone: string): string {
    if (!rawPhone) return '';
    // Strip non-digit characters except leading +
    const clean = rawPhone.replace(/[^\d+]/g, '');
    const digitsOnly = clean.replace(/\D/g, '');

    // If 10 digits, default to Indian +91
    if (digitsOnly.length === 10) {
      return `+91 ${digitsOnly.slice(0, 5)} ${digitsOnly.slice(5)}`;
    }
    if (digitsOnly.length > 10 && digitsOnly.startsWith('91') && digitsOnly.length === 12) {
      const actual = digitsOnly.slice(2);
      return `+91 ${actual.slice(0, 5)} ${actual.slice(5)}`;
    }
    return rawPhone.trim();
  }

  public getRaw10Digits(rawPhone: string): string {
    const digitsOnly = rawPhone.replace(/\D/g, '');
    if (digitsOnly.length >= 10) {
      return digitsOnly.slice(-10);
    }
    return digitsOnly;
  }

  /**
   * Generates and dispatches a 6-digit SMS OTP
   */
  public async sendOTP(rawPhone: string): Promise<SendOTPResult> {
    const raw10 = this.getRaw10Digits(rawPhone);
    if (!raw10 || raw10.length < 10) {
      return {
        success: false,
        message: 'Please enter a valid 10-digit mobile number.',
        phone: rawPhone,
        normalizedPhone: rawPhone,
        expiresAt: 0,
        remainingSeconds: 0
      };
    }

    const normalized = this.normalizePhoneNumber(rawPhone);

    let response;
    try {
      response = await cloudApi.requestOtp(raw10);
    } catch {
      return {
        success: false,
        message: 'OTP service is unavailable. Please try again shortly.',
        phone: rawPhone,
        normalizedPhone: normalized,
        expiresAt: 0,
        remainingSeconds: 0
      };
    }
    const expiresAt = response.expiresAt;

    return {
      success: true,
      message: `6-digit verification code sent to ${normalized}`,
      otp: response.testCode,
      phone: rawPhone,
      normalizedPhone: normalized,
      expiresAt,
      remainingSeconds: 300
    };
  }

  /**
   * Validates submitted 6-digit OTP against active token
   */
  public async verifyOTP(rawPhone: string, userEnteredOtp: string): Promise<VerifyOTPResult> {
    const raw10 = this.getRaw10Digits(rawPhone);
    const normalized = this.normalizePhoneNumber(rawPhone);
    const cleanOtp = (userEnteredOtp || '').trim();

    if (!cleanOtp || cleanOtp.length !== 6) {
      return {
        success: false,
        message: 'Please enter the full 6-digit OTP.',
        phone: rawPhone,
        normalizedPhone: normalized
      };
    }

    try {
      const response = await cloudApi.verifyOtp(raw10, cleanOtp);
      return { success: response.success, message: response.message, phone: rawPhone, normalizedPhone: normalized };
    } catch {
      return { success: false, message: 'OTP verification service unavailable. Please try again.', phone: rawPhone, normalizedPhone: normalized };
    }
  }

  /**
   * Retrieves active in-flight OTP if exists
   */
  public getActiveOTP(rawPhone: string): string | null {
    const raw10 = this.getRaw10Digits(rawPhone);
    const store = this.getStore();
    const entry = store[raw10];
    if (entry && Date.now() < entry.expiresAt) {
      return entry.otp;
    }
    return null;
  }
}

export const otpService = new OTPService();
