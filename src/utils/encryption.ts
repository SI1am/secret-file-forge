
/**
 * File encryption utilities for secure file storage
 */

/**
 * Encrypts a file using AES-GCM encryption
 * 
 * @param file - The file to encrypt
 * @param password - The password to use for encryption
 * @returns Promise with the encrypted data as ArrayBuffer
 */
export const encryptFile = async (file: File, password: string): Promise<ArrayBuffer> => {
  try {
    // Convert the file to an ArrayBuffer for encryption
    const fileBuffer = await file.arrayBuffer();
    
    // Generate a random salt for key derivation
    const salt = crypto.getRandomValues(new Uint8Array(16));
    
    // Generate a random initialization vector (IV)
    const iv = crypto.getRandomValues(new Uint8Array(12));
    
    // Derive an encryption key from the password using PBKDF2
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(password),
      { name: 'PBKDF2' },
      false,
      ['deriveBits', 'deriveKey']
    );
    
    const key = await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt,
        iterations: 100000,
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt']
    );
    
    // Encrypt the file
    const encryptedContent = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv
      },
      key,
      fileBuffer
    );
    
    // Create a combined buffer with salt + iv + encryptedContent
    const encryptedBuffer = new Uint8Array(
      salt.byteLength + iv.byteLength + encryptedContent.byteLength
    );
    
    encryptedBuffer.set(salt, 0);
    encryptedBuffer.set(iv, salt.byteLength);
    encryptedBuffer.set(
      new Uint8Array(encryptedContent),
      salt.byteLength + iv.byteLength
    );
    
    return encryptedBuffer.buffer;
  } catch (error) {
    console.error('Error encrypting file:', error);
    throw new Error('Failed to encrypt file. See console for details.');
  }
};

/**
 * Decrypts a file encrypted with AES-GCM
 * 
 * @param encryptedData - The encrypted data as ArrayBuffer
 * @param password - The password used for encryption
 * @param fileName - The original file name (for creating a File object)
 * @param fileType - The MIME type of the file
 * @returns Promise with the decrypted file
 */
export const decryptFile = async (
  encryptedData: ArrayBuffer,
  password: string,
  fileName: string,
  fileType: string
): Promise<File> => {
  try {
    const encryptedBuffer = new Uint8Array(encryptedData);
    
    // Extract salt, iv, and encrypted content
    const salt = encryptedBuffer.slice(0, 16);
    const iv = encryptedBuffer.slice(16, 16 + 12);
    const encryptedContent = encryptedBuffer.slice(16 + 12);
    
    // Derive the key from the password using the same parameters
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(password),
      { name: 'PBKDF2' },
      false,
      ['deriveBits', 'deriveKey']
    );
    
    const key = await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt,
        iterations: 100000,
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['decrypt']
    );
    
    // Decrypt the file
    const decryptedContent = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv
      },
      key,
      encryptedContent
    );
    
    // Create a new File object with the decrypted content
    return new File([decryptedContent], fileName, { type: fileType });
  } catch (error) {
    console.error('Error decrypting file:', error);
    throw new Error('Failed to decrypt file. The password might be incorrect.');
  }
};

/**
 * Generates a secure random encryption key
 * 
 * @returns A secure random encryption key as a hex string
 */
export const generateEncryptionKey = (): string => {
  const keyBytes = crypto.getRandomValues(new Uint8Array(32));
  return Array.from(keyBytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
};

/**
 * Encrypts text using AES-GCM
 * 
 * @param text - The text to encrypt
 * @param password - The password to use for encryption
 * @returns Promise with the encrypted data as a Base64 string
 */
export const encryptText = async (text: string, password: string): Promise<string> => {
  try {
    const textBuffer = new TextEncoder().encode(text);
    
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));
    
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(password),
      { name: 'PBKDF2' },
      false,
      ['deriveBits', 'deriveKey']
    );
    
    const key = await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt,
        iterations: 100000,
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt']
    );
    
    const encryptedContent = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv
      },
      key,
      textBuffer
    );
    
    const result = new Uint8Array(
      salt.byteLength + iv.byteLength + encryptedContent.byteLength
    );
    
    result.set(salt, 0);
    result.set(iv, salt.byteLength);
    result.set(
      new Uint8Array(encryptedContent),
      salt.byteLength + iv.byteLength
    );
    
    // Convert to Base64 for storage
    return btoa(String.fromCharCode(...result));
  } catch (error) {
    console.error('Error encrypting text:', error);
    throw new Error('Failed to encrypt text');
  }
};

/**
 * Decrypts text encrypted with AES-GCM
 * 
 * @param encryptedBase64 - The encrypted text as a Base64 string
 * @param password - The password used for encryption
 * @returns Promise with the decrypted text
 */
export const decryptText = async (encryptedBase64: string, password: string): Promise<string> => {
  try {
    // Convert Base64 to Uint8Array
    const encryptedBytes = Uint8Array.from(atob(encryptedBase64), c => c.charCodeAt(0));
    
    const salt = encryptedBytes.slice(0, 16);
    const iv = encryptedBytes.slice(16, 16 + 12);
    const encryptedContent = encryptedBytes.slice(16 + 12);
    
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(password),
      { name: 'PBKDF2' },
      false,
      ['deriveBits', 'deriveKey']
    );
    
    const key = await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt,
        iterations: 100000,
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['decrypt']
    );
    
    const decryptedContent = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv
      },
      key,
      encryptedContent
    );
    
    return new TextDecoder().decode(decryptedContent);
  } catch (error) {
    console.error('Error decrypting text:', error);
    throw new Error('Failed to decrypt text. The password might be incorrect.');
  }
};
