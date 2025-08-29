import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// ฟังก์ชันสำหรับ format ราคาแบบไทย
export function formatCurrency(amount, options = {}) {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '฿0.00';
  }
  
  const defaultOptions = {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    ...options
  };
  
  try {
    return new Intl.NumberFormat('th-TH', defaultOptions).format(amount);
  } catch (error) {
    console.error('Error formatting currency:', error);
    // Fallback formatting
    return `฿${parseFloat(amount).toLocaleString('th-TH', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  }
}

// ฟังก์ชันสำหรับ format ตัวเลขแบบไทย (ไม่มีสัญลักษณ์สกุลเงิน)
export function formatNumber(number, options = {}) {
  if (number === null || number === undefined || isNaN(number)) {
    return '0';
  }
  
  const defaultOptions = {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
    ...options
  };
  
  try {
    return new Intl.NumberFormat('th-TH', defaultOptions).format(number);
  } catch (error) {
    console.error('Error formatting number:', error);
    // Fallback formatting
    return parseFloat(number).toLocaleString('th-TH', defaultOptions);
  }
}