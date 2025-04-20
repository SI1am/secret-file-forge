/**
 * Data masking utility functions for Excel files
 * These functions use patterns to identify and mask sensitive data
 */

// Regular expressions for different types of sensitive data
const PATTERNS = {
  // Email address pattern
  EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  
  // US phone number patterns (several formats)
  PHONE: [
    /^\d{3}-\d{3}-\d{4}$/,                  // 123-456-7890
    /^\(\d{3}\)\s*\d{3}-\d{4}$/,            // (123) 456-7890
    /^\d{3}\.\d{3}\.\d{4}$/,                // 123.456.7890
    /^\d{10}$/                              // 1234567890
  ],
  
  // Credit card number patterns
  CREDIT_CARD: [
    /^(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13}|6(?:011|5[0-9][0-9])[0-9]{12})$/, // Major cards
    /^(?:\d{4}[- ]?){3}\d{4}$/              // 1234-5678-9012-3456
  ],
  
  // SSN pattern
  SSN: [
    /^\d{3}-\d{2}-\d{4}$/,                  // 123-45-6789
    /^\d{9}$/                               // 123456789
  ],
  
  // Generic healthcare ID pattern (varies by country/system)
  HEALTH_ID: /^[A-Za-z0-9]{8,15}$/
};

/**
 * Mask sensitive data based on its type
 * 
 * @param value - The data to mask
 * @param dataType - The type of data (email, phone, etc.)
 * @returns The masked data
 */
export const maskData = (value: string, dataType: keyof typeof PATTERNS): string => {
  if (!value) return value;
  
  switch(dataType) {
    case 'EMAIL':
      // Mask everything before @ symbol except first character
      return maskEmail(value);
      
    case 'PHONE':
      // Mask middle digits
      return maskPhone(value);
      
    case 'CREDIT_CARD':
      // Keep last 4 digits
      return maskCreditCard(value);
      
    case 'SSN':
      // Mask all but last 4
      return maskSSN(value);
      
    case 'HEALTH_ID':
      // Mask all but first and last character
      return value.charAt(0) + 
        '*'.repeat(value.length - 2) + 
        value.charAt(value.length - 1);
        
    default:
      // Generic masking of middle characters
      if (value.length <= 4) return '****';
      
      return value.substring(0, 2) + 
        '*'.repeat(value.length - 4) + 
        value.substring(value.length - 2);
  }
};

/**
 * Detect the type of sensitive data
 * 
 * @param value - The data to check
 * @returns The type of data or null if not sensitive
 */
export const detectDataType = (value: string): keyof typeof PATTERNS | null => {
  if (!value || typeof value !== 'string') return null;
  
  // Check each pattern
  if (PATTERNS.EMAIL.test(value)) return 'EMAIL';
  
  if (PATTERNS.PHONE.some(pattern => pattern.test(value))) return 'PHONE';
  
  if (PATTERNS.CREDIT_CARD.some(pattern => pattern.test(value))) return 'CREDIT_CARD';
  
  if (PATTERNS.SSN.some(pattern => pattern.test(value))) return 'SSN';
  
  if (PATTERNS.HEALTH_ID.test(value)) return 'HEALTH_ID';
  
  return null;
};

/**
 * Automatically mask data if it's sensitive
 * 
 * @param value - The data to check and possibly mask
 * @returns The masked data or original if not sensitive
 */
export const autoMaskSensitiveData = (value: string): string => {
  const dataType = detectDataType(value);
  
  if (!dataType) return value;
  
  return maskData(value, dataType);
};

/**
 * Mask an email address
 * example: j***@example.com
 */
const maskEmail = (email: string): string => {
  const parts = email.split('@');
  if (parts.length !== 2) return email;
  
  const username = parts[0];
  const domain = parts[1];
  
  // Keep first character, mask the rest
  const maskedUsername = username.charAt(0) + '*'.repeat(Math.max(username.length - 1, 2));
  
  return `${maskedUsername}@${domain}`;
};

/**
 * Mask a phone number while preserving the format
 * example: (123) ***-7890
 */
const maskPhone = (phone: string): string => {
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');
  
  if (digits.length < 10) {
    // If not enough digits for a standard phone number, mask all but first and last
    return phone.charAt(0) + '*'.repeat(phone.length - 2) + phone.charAt(phone.length - 1);
  }
  
  // Keep first 3 and last 4 digits, mask the rest
  const maskedDigits = digits.substring(0, 3) + '*'.repeat(digits.length - 7) + digits.substring(digits.length - 4);
  
  // Reapply formatting
  if (phone.includes('-')) {
    if (phone.match(/^\d{3}-\d{3}-\d{4}$/)) {
      return `${maskedDigits.substring(0, 3)}-***-${maskedDigits.substring(maskedDigits.length - 4)}`;
    }
  } else if (phone.includes('(') && phone.includes(')')) {
    return `(${maskedDigits.substring(0, 3)}) ***-${maskedDigits.substring(maskedDigits.length - 4)}`;
  } else if (phone.includes('.')) {
    return `${maskedDigits.substring(0, 3)}.***-${maskedDigits.substring(maskedDigits.length - 4)}`;
  }
  
  // No specific format detected
  return maskedDigits;
};

/**
 * Mask a credit card number
 * example: **** **** **** 1234
 */
const maskCreditCard = (cardNumber: string): string => {
  // Remove spaces, dashes, etc.
  const digits = cardNumber.replace(/\D/g, '');
  
  if (digits.length < 12) {
    // If too short, mask everything
    return '*'.repeat(cardNumber.length);
  }
  
  // Keep only last 4 digits
  const lastFour = digits.substring(digits.length - 4);
  const maskedPart = '*'.repeat(digits.length - 4);
  
  // Format with spaces every 4 digits
  if (cardNumber.includes(' ') || cardNumber.includes('-')) {
    return '**** '.repeat(3) + lastFour;
  }
  
  return maskedPart + lastFour;
};

/**
 * Mask an SSN
 * example: ***-**-6789
 */
const maskSSN = (ssn: string): string => {
  // Remove non-digit characters
  const digits = ssn.replace(/\D/g, '');
  
  if (digits.length !== 9) {
    // If not standard SSN length, mask all but last 4
    if (digits.length <= 4) return '*'.repeat(ssn.length);
    return '*'.repeat(ssn.length - 4) + ssn.substring(ssn.length - 4);
  }
  
  // Format as ***-**-1234
  if (ssn.includes('-')) {
    return `***-**-${digits.substring(digits.length - 4)}`;
  }
  
  // No dashes in original
  return `*****${digits.substring(digits.length - 4)}`;
};
