
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Json } from '@/integrations/supabase/types';

interface ActivityLog {
  id: string;
  user_id: string;
  action: string;
  resource_id: string | null;
  resource_type: string | null;
  details: Json;
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

      // Map to ActivityLog type structure
      const mappedLogs = (data || []).map(item => ({
        id: item.id,
        user_id: item.user_id,
        action: item.action,
        resource_id: item.resource_id || null,
        resource_type: item.resource_type || null,
        details: item.details || {},
        created_at: item.created_at,
      }));
      
      setLogs(mappedLogs);
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
    resourceId?: string, 
    resourceType?: string, 
    details?: any
  ) => {
    try {
      // Ensure user is authenticated
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.user) {
        throw new Error('User must be authenticated to log activities');
      }

      const { error } = await supabase
        .from('activity_logs')
        .insert([{
          user_id: session.user.id,
          action,
          resource_id: resourceId || null,
          resource_type: resourceType || null,
          details: details || {}
        }]);
        
      if (error) throw error;

      // Re-fetch logs to update list
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
    logActivity,
  };
};

export default useActivityLogs;
