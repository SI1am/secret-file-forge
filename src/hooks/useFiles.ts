
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
  encryption_key?: string; // Make this optional
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
      const { data, error } = await supabase
        .from('files')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        toast.error('Failed to fetch files');
        throw error;
      }

      // Transform the data to match our File interface
      return data?.map(file => ({
        ...file,
        is_encrypted: !!file.encryption_key, // Determine is_encrypted based on encryption_key
        shared_with: file.shared_with || [],
        upload_date: file.created_at ? new Date(file.created_at) : undefined,
        expires: file.expires_at ? new Date(file.expires_at) : undefined,
        tags: [] // Add default empty tags array to ensure it always exists
      })) || [];
    }
  });

  // Modify this query to accept a fileId parameter
  const getFileById = (fileId?: string) => {
    return useQuery({
      queryKey: ['file', fileId],
      enabled: !!fileId, // Only run when fileId is provided
      queryFn: async () => {
        if (!fileId) return null;
        
        const { data, error } = await supabase
          .from('files')
          .select('*')
          .eq('id', fileId)
          .single();

        if (error) {
          toast.error('Failed to fetch file');
          throw error;
        }

        // Transform to match our File interface
        return data ? {
          ...data,
          is_encrypted: !!data.encryption_key,
          shared_with: data.shared_with || [],
          upload_date: data.created_at ? new Date(data.created_at) : undefined,
          expires: data.expires_at ? new Date(data.expires_at) : undefined,
          tags: [] // Add default empty tags array
        } : null;
      }
    });
  };

  const deleteFile = useMutation({
    mutationFn: async (fileId: string) => {
      const { error } = await supabase
        .from('files')
        .delete()
        .eq('id', fileId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files'] });
      toast.success('File deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete file');
    }
  });

  const updateFile = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<File> & { id: string }) => {
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

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files'] });
      toast.success('File updated successfully');
    },
    onError: () => {
      toast.error('Failed to update file');
    }
  });

  return {
    files: files as File[],
    isLoading,
    deleteFile,
    updateFile,
    getFileById
  };
};
