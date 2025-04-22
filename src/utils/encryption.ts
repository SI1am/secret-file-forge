
import CryptoJS from 'crypto-js';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

/**
 * Encrypts text using AES encryption
 */
export const encryptText = (text: string, passphrase: string): string => {
  try {
    return CryptoJS.AES.encrypt(text, passphrase).toString();
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt text');
  }
};

/**
 * Decrypts encrypted text using AES encryption
 */
export const decryptText = (encryptedText: string, passphrase: string): string => {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedText, passphrase);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt text. Check your decryption key.');
  }
};

/**
 * Encrypts a file using AES encryption
 */
export const encryptFile = async (
  file: File,
  passphrase: string
): Promise<{ encryptedData: string; fileName: string; fileType: string; fileSize: number }> => {
  try {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        try {
          const fileData = event.target?.result as ArrayBuffer;
          if (!fileData) {
            reject(new Error('Failed to read file data'));
            return;
          }
          
          // Convert ArrayBuffer to Word Array for CryptoJS
          const wordArray = CryptoJS.lib.WordArray.create(fileData);
          
          // Encrypt the data
          const encryptedData = CryptoJS.AES.encrypt(wordArray, passphrase).toString();
          
          // Log successful encryption
          logEncryptionActivity('encrypted', file.name);
          
          resolve({
            encryptedData,
            fileName: file.name,
            fileType: file.type,
            fileSize: file.size
          });
        } catch (error) {
          console.error('Encryption processing error:', error);
          reject(new Error('Failed to encrypt file'));
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
      
      reader.readAsArrayBuffer(file);
    });
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt file');
  }
};

/**
 * Decrypts a file using AES encryption
 */
export const decryptFile = async (
  encryptedData: ArrayBuffer,
  passphrase: string,
  fileName: string,
  fileType: string
): Promise<Blob> => {
  try {
    // Convert ArrayBuffer to string for CryptoJS
    const encryptedText = new TextDecoder().decode(encryptedData);
    
    // Decrypt the data
    const decrypted = CryptoJS.AES.decrypt(encryptedText, passphrase);
    
    // Convert WordArray to ArrayBuffer
    const wordArray = decrypted.words;
    const arrayBuffer = new ArrayBuffer(wordArray.length * 4);
    const dataView = new DataView(arrayBuffer);
    
    for (let i = 0; i < wordArray.length; i++) {
      dataView.setInt32(i * 4, wordArray[i], false);
    }
    
    // Create a Blob from the decrypted data
    const decryptedBlob = new Blob([arrayBuffer], { type: fileType });
    
    // Log successful decryption
    logEncryptionActivity('decrypted', fileName);
    
    return decryptedBlob;
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt file. Check your decryption key.');
  }
};

/**
 * Convert a file to base64 encoded string
 */
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

/**
 * Download a file from a base64 string
 */
export const downloadBase64File = (base64Data: string, fileName: string) => {
  const linkSource = base64Data;
  const downloadLink = document.createElement('a');
  
  downloadLink.href = linkSource;
  downloadLink.download = fileName;
  downloadLink.click();
};

/**
 * Log encryption/decryption activity to Supabase
 */
const logEncryptionActivity = async (action: string, fileName: string) => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;
    
    // Find the file by name
    const { data: files } = await supabase
      .from('files')
      .select('id')
      .eq('name', fileName)
      .limit(1);
      
    const fileId = files && files.length > 0 ? files[0].id : null;
    
    // Log the activity
    await supabase.from('activity_logs').insert({
      user_id: session.user.id,
      action: action,
      resource_id: fileId,
      resource_type: 'file',
      details: { fileName }
    });
    
    // Show toast notification
    const message = action === 'encrypted' 
      ? 'File encrypted successfully' 
      : 'File decrypted successfully';
    toast.success(message);
    
  } catch (error) {
    console.error('Failed to log encryption activity:', error);
  }
};
