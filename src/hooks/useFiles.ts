
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "sonner";

export interface File {
  id: string;
  name: string;
  size: number;
  type: string;
  created_at: string;
  encrypted_data: string;
  is_encrypted: boolean;
  is_masked: boolean;
  has_watermark: boolean;
  is_public: boolean;
  shared_with: string[];
  expires_at: string | null;
}

export const useFiles = () => {
  const queryClient = useQueryClient();

  const { data: files, isLoading } = useQuery({
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

      return data;
    }
  });

  const { data: file, isLoading: isLoadingFile } = useQuery({
    queryKey: ['file'],
    enabled: false, // This query won't run automatically
    queryFn: async ({ queryKey }) => {
      const [_, fileId] = queryKey;
      const { data, error } = await supabase
        .from('files')
        .select('*')
        .eq('id', fileId)
        .single();

      if (error) {
        toast.error('Failed to fetch file');
        throw error;
      }

      return data;
    }
  });

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
      const { error } = await supabase
        .from('files')
        .update(updates)
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
    files,
    file,
    isLoading,
    isLoadingFile,
    deleteFile,
    updateFile
  };
};
