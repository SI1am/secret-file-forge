
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ActivityLog {
  id: string;
  user_id: string;
  action: string;
  file_id: string | null;
  file_name: string | null;
  details: any;
  created_at: string;
}

export const useActivityLogs = () => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('activity_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
        
      if (error) throw error;
      
      setLogs(data || []);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching activity logs:', err);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const logActivity = async (
    action: string, 
    fileId?: string, 
    fileName?: string, 
    details?: any
  ) => {
    try {
      // First ensure we have a user_id
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        throw new Error('User must be authenticated to log activities');
      }
      
      const { error } = await supabase
        .from('activity_logs')
        .insert([{
          user_id: session.user.id,
          action,
          file_id: fileId,
          file_name: fileName,
          details: details || {}
        }]);
      
      if (error) throw error;
      
      // Re-fetch logs to update the list
      fetchLogs();
      return true;
    } catch (err) {
      console.error('Error logging activity:', err);
      return false;
    }
  };
  
  useEffect(() => {
    fetchLogs();
  }, []);
  
  return {
    logs,
    isLoading,
    error,
    fetchLogs,
    logActivity
  };
};

export default useActivityLogs;
