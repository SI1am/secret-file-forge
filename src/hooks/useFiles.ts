
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "sonner";
import { Json } from '@/integrations/supabase/types';

export interface File {
  id: string;
  name: string;
  size: number;
  type: string;
  created_at: string;
  encrypted_data: string;
  encryption_key?: string;
  is_encrypted: boolean;
  is_masked: boolean;
  has_watermark: boolean;
  is_public: boolean;
  shared_with: string[];
  expires_at: string | null;
  tags?: string[];
  upload_date?: Date;
  expires?: Date;
  watermark_data?: Json;
  masking_config?: Json;
}

export const useFiles = () => {
  const queryClient = useQueryClient();

  const { data: files = [], isLoading } = useQuery({
    queryKey: ['files'],
    queryFn: async () => {
      console.log('Fetching files...');
      const { data, error } = await supabase
        .from('files')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching files:', error);
        toast.error('Failed to fetch files: ' + error.message);
        throw error;
      }

      console.log('Files fetched:', data);

      // Transform the data to match our File interface
      return data?.map(file => ({
        ...file,
        is_encrypted: !!file.encryption_key, // Determine is_encrypted based on encryption_key
        shared_with: file.shared_with || [],
        upload_date: file.created_at ? new Date(file.created_at) : undefined,
        expires: file.expires_at ? new Date(file.expires_at) : undefined,
        tags: file.tags || [] // Add default empty tags array to ensure it always exists
      })) || [];
    },
    refetchOnWindowFocus: true, // Re-fetch when the window regains focus
    refetchOnReconnect: true // Re-fetch when the user reconnects
  });

  // Modify this query to accept a fileId parameter
  const getFileById = (fileId?: string) => {
    return useQuery({
      queryKey: ['file', fileId],
      enabled: !!fileId, // Only run when fileId is provided
      queryFn: async () => {
        if (!fileId) return null;
        
        console.log('Fetching file by ID:', fileId);
        const { data, error } = await supabase
          .from('files')
          .select('*')
          .eq('id', fileId)
          .single();

        if (error) {
          console.error('Error fetching file by ID:', error);
          toast.error('Failed to fetch file: ' + error.message);
          throw error;
        }

        console.log('File fetched:', data);

        // Transform to match our File interface
        return data ? {
          ...data,
          is_encrypted: !!data.encryption_key,
          shared_with: data.shared_with || [],
          upload_date: data.created_at ? new Date(data.created_at) : undefined,
          expires: data.expires_at ? new Date(data.expires_at) : undefined,
          tags: data.tags || [] // Add default empty tags array
        } : null;
      }
    });
  };

  // Create a mutation for uploading files
  const uploadFile = useMutation({
    mutationFn: async (fileData: {
      name: string;
      size: number;
      type: string;
      encrypted_data: string;
      user_id: string;
    }) => {
      console.log('Uploading file:', fileData.name);
      const { data, error } = await supabase
        .from('files')
        .insert([fileData])
        .select()
        .single();

      if (error) {
        console.error('Error uploading file:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files'] });
      toast.success('File uploaded successfully');
    },
    onError: (error) => {
      console.error('Upload error:', error);
      toast.error('Failed to upload file');
    }
  });

  const deleteFile = useMutation({
    mutationFn: async (fileId: string) => {
      console.log('Deleting file:', fileId);
      const { error } = await supabase
        .from('files')
        .delete()
        .eq('id', fileId);

      if (error) {
        console.error('Error deleting file:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files'] });
      toast.success('File deleted successfully');
    },
    onError: (error) => {
      console.error('Delete error:', error);
      toast.error('Failed to delete file');
    }
  });

  const updateFile = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<File> & { id: string }) => {
      console.log('Updating file:', id, updates);
      // Transform our File interface back to match the database schema
      const dbUpdates = { ...updates };
      
      // Handle specific field transformations
      if ('is_encrypted' in updates) {
        dbUpdates.encryption_key = updates.is_encrypted ? 'encrypted' : null;
        delete dbUpdates.is_encrypted;
      }
      
      const { error } = await supabase
        .from('files')
        .update(dbUpdates)
        .eq('id', id);

      if (error) {
        console.error('Error updating file:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files'] });
      toast.success('File updated successfully');
    },
    onError: (error) => {
      console.error('Update error:', error);
      toast.error('Failed to update file');
    }
  });

  // Log file activity
  const logActivity = async (action: string, fileId?: string, fileName?: string, details?: any) => {
    try {
      const { error } = await supabase.from('activity_logs').insert([
        {
          action,
          file_id: fileId,
          file_name: fileName,
          details: details || {}
        }
      ]);

      if (error) {
        console.error('Error logging activity:', error);
      }
    } catch (err) {
      console.error('Failed to log activity:', err);
    }
  };

  return {
    files: files as File[],
    isLoading,
    uploadFile,
    deleteFile,
    updateFile,
    getFileById,
    logActivity
  };
};
