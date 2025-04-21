
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import { FileUp, Download, Share2, FileText, Clock, Activity } from 'lucide-react';
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

export const ActivityLogs = () => {
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchActivityLogs = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('activity_logs')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(20);

        if (error) {
          console.error("Error fetching activity logs:", error);
          throw error;
        }

        const mappedActivities = (data || []).map(item => ({
          id: item.id,
          user_id: item.user_id,
          action: item.action,
          resource_id: item.resource_id || null,
          resource_type: item.resource_type || null,
          details: item.details || {},
          created_at: item.created_at,
        }));

        setActivities(mappedActivities);
      } catch (err) {
        console.error("Failed to fetch activity logs:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchActivityLogs();
  }, []);

  const getActivityIcon = (action: string) => {
    switch (action) {
      case 'uploaded':
        return <FileUp className="h-4 w-4 text-green-500" />;
      case 'downloaded':
        return <Download className="h-4 w-4 text-blue-500" />;
      case 'shared':
        return <Share2 className="h-4 w-4 text-purple-500" />;
      case 'viewed':
        return <FileText className="h-4 w-4 text-yellow-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getActivityMessage = (activity: ActivityLog) => {
    switch (activity.action) {
      case 'uploaded':
        return `You uploaded "${activity.resource_id}"`;
      case 'downloaded':
        return `You downloaded "${activity.resource_id}"`;
      case 'shared':
        // Fix: Add type check for details.shared_with
        return typeof activity.details === 'object' && activity.details && 'shared_with' in activity.details
          ? `You shared "${activity.resource_id}" with ${String(activity.details.shared_with)}`
          : `You shared "${activity.resource_id}"`;
      case 'viewed':
        return `You viewed "${activity.resource_id}"`;
      default:
        return `Activity: ${activity.action} ${activity.resource_id ? `- ${activity.resource_id}` : ''}`;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length > 0 ? (
          <div className="space-y-4">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3">
                <div className="mt-1 rounded-full bg-muted p-1">
                  {getActivityIcon(activity.action)}
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">{getActivityMessage(activity)}</p>
                  <div className="flex text-xs text-muted-foreground">
                    <Clock className="h-3 w-3 mr-1" />
                    <span>{formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-muted-foreground">
            <Activity className="h-12 w-12 mx-auto mb-2 opacity-20" />
            <p>No recent activity found</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ActivityLogs;
