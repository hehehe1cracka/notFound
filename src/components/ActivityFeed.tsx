import { ActivityUpdate } from '@/types/momentum';
import { formatRelativeTime } from '@/lib/momentum';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { motion } from 'framer-motion';
import { CheckCircle2, Milestone, RefreshCw, UserPlus, Camera } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ActivityFeedProps {
  activities: ActivityUpdate[];
  className?: string;
}

const activityIcons = {
  update: RefreshCw,
  milestone: Milestone,
  task_completed: CheckCircle2,
  member_joined: UserPlus,
  gallery_post: Camera,
};

const activityColors = {
  update: 'text-primary',
  milestone: 'text-momentum-yellow',
  task_completed: 'text-momentum-green',
  member_joined: 'text-primary',
  gallery_post: 'text-primary',
};

export function ActivityFeed({ activities, className }: ActivityFeedProps) {
  if (activities.length === 0) {
    return (
      <div className={cn('text-center py-12', className)}>
        <p className="text-muted-foreground text-sm">No activity yet</p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {activities.map((activity, index) => {
        const Icon = (activityIcons[activity.type as keyof typeof activityIcons] || RefreshCw) as any;
        const userName = activity.userName || 'Anonymous';
        return (
          <motion.div
            key={activity.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2, delay: index * 0.05 }}
            className="flex gap-3 group"
          >
            <div className="relative shrink-0">
              <Avatar className="h-8 w-8 border border-border">
                <AvatarFallback className="bg-secondary text-xs font-display">
                  {userName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className={cn(
                'absolute -bottom-1 -right-1 p-0.5 rounded-full bg-background border border-border',
                activityColors[activity.type as keyof typeof activityColors]
              )}>
                <Icon className="h-3 w-3" />
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm">{userName}</span>
                <span className="text-xs text-muted-foreground">
                  {formatRelativeTime(activity.createdAt)}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-0.5 leading-relaxed">
                {activity.content}
              </p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
