import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "sonner";
import { encryptText, fileToBase64 } from '@/utils/encryption';

/**
 * Hook for file security operations
 */
export const useFileSecurity = () => {
  const queryClient = useQueryClient();
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [isDecrypting, setIsDecrypting] = useState(false);

  /**
   * Encrypt a file
   */
  const encryptFile = useMutation({
    mutationFn: async ({ 
      fileId, 
      encryptionKey, 
      fileData 
    }: { 
      fileId: string; 
      encryptionKey: string;
      fileData?: string;
    }) => {
      setIsEncrypting(true);
      try {
        // Get the file if fileData not provided
        let data = fileData;
        
        if (!data) {
          const { data: file, error: fetchError } = await supabase
            .from('files')
            .select('encrypted_data')
            .eq('id', fileId)
            .single();
            
          if (fetchError) throw fetchError;
          data = file.encrypted_data;
        }
        
        if (!data) {
          throw new Error('No file data available to encrypt');
        }
        
        // Encrypt the data
        const encryptedData = encryptText(data, encryptionKey);
        
        // Update the file in the database
        const { error: updateError } = await supabase
          .from('files')
          .update({
            encrypted_data: encryptedData,
            encryption_key: 'encrypted', // We don't store the actual key
            is_encrypted: true
          })
          .eq('id', fileId);
          
        if (updateError) throw updateError;
        
        // Log the encryption activity
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          await supabase.from('activity_logs').insert({
            user_id: session.user.id,
            action: 'encrypted',
            resource_id: fileId,
            resource_type: 'file',
            details: {}
          });
        }
        
        return { success: true };
      } finally {
        setIsEncrypting(false);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['file'] });
      toast.success('File encrypted successfully');
    },
    onError: (error) => {
      console.error('Encryption error:', error);
      toast.error('Failed to encrypt file');
    }
  });
  
  /**
   * Decrypt a file
   */
  const decryptFile = useMutation({
    mutationFn: async ({ 
      fileId, 
      decryptionKey 
    }: { 
      fileId: string; 
      decryptionKey: string;
    }) => {
      setIsDecrypting(true);
      try {
        // First check if the file exists and is encrypted
        const { data: file, error: fetchError } = await supabase
          .from('files')
          .select('*')
          .eq('id', fileId)
          .single();
          
        if (fetchError) throw fetchError;
        
        // Check if the file has encryption_key set
        if (!file.encryption_key) {
          throw new Error('File is not encrypted');
        }
        
        return { success: true, decryptedData: file.encrypted_data };
      } finally {
        setIsDecrypting(false);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['file'] });
    },
    onError: (error) => {
      console.error('Decryption error:', error);
      toast.error('Failed to decrypt file');
    }
  });
  
  /**
   * Upload and encrypt a file
   */
  const uploadEncryptedFile = async (file: File, encryptionKey: string) => {
    try {
      // Convert file to base64
      const base64Data = await fileToBase64(file);
      
      // Encrypt the base64 data
      const encryptedData = encryptText(base64Data, encryptionKey);
      
      // Upload the encrypted file to Supabase
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        throw new Error('User must be authenticated to upload files');
      }
      
      const { data, error } = await supabase
        .from('files')
        .insert({
          name: file.name,
          size: file.size,
          type: file.type,
          encrypted_data: encryptedData,
          user_id: session.user.id,
          is_encrypted: true,
          encryption_key: 'encrypted' // We don't store the actual key
        })
        .select()
        .single();
        
      if (error) throw error;
      
      // Log the activity
      await supabase.from('activity_logs').insert({
        user_id: session.user.id,
        action: 'uploaded_encrypted',
        resource_id: data.id,
        resource_type: 'file',
        details: { name: file.name }
      });
      
      return data;
    } catch (error) {
      console.error('Upload encrypted file error:', error);
      throw error;
    }
  };
  
  return {
    encryptFile,
    decryptFile,
    uploadEncryptedFile,
    isEncrypting,
    isDecrypting
  };
};
