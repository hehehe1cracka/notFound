import { Task } from '@/types/momentum';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatRelativeTime } from '@/lib/momentum';
import { motion } from 'framer-motion';
import { User, Clock, ArrowRight, Calendar, AlertCircle, Zap, Trophy, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TaskBoardProps {
  tasks: Task[];
  onTaskClick?: (task: Task) => void;
  onClaimTask?: (task: Task) => void;
  className?: string;
  currentUserId?: string;
}

const statusConfig = {
  open: { label: 'Open', variant: 'outline' as const },
  in_progress: { label: 'In Progress', variant: 'secondary' as const },
  submitted: { label: 'Submitted', variant: 'default' as const },
  completed: { label: 'Completed', variant: 'default' as const },
  overdue: { label: 'Overdue', variant: 'destructive' as const },
};

const priorityConfig = {
  low: { color: 'text-blue-500', bgColor: 'bg-blue-500/10', label: 'Low' },
  medium: { color: 'text-yellow-500', bgColor: 'bg-yellow-500/10', label: 'Medium' },
  high: { color: 'text-orange-500', bgColor: 'bg-orange-500/10', label: 'High' },
  urgent: { color: 'text-red-500', bgColor: 'bg-red-500/10', label: 'Urgent' },
};

const isOverdue = (task: Task): boolean => {
  if (!task.deadline) return false;
  return task.deadline < Date.now() && task.status !== 'completed';
};


export function TaskBoard({ tasks, onTaskClick, onClaimTask, className, currentUserId }: TaskBoardProps) {
  // Filter logic:
  // Open: Status is open OR (Mode is everyone AND Status is in_progress AND User NOT in participants)
  const openTasks = tasks.filter(t =>
    t.status === 'open' ||
    (t.participationMode === 'everyone' && t.status === 'in_progress' && (!currentUserId || !t.participants?.includes(currentUserId)))
  );

  // In Progress: (Status is in_progress AND (Mode is NOT everyone OR User IS in participants)) OR Status is submitted
  const inProgressTasks = tasks.filter(t =>
    (t.status === 'in_progress' && (t.participationMode !== 'everyone' || (currentUserId && t.participants?.includes(currentUserId)))) ||
    t.status === 'submitted'
  );

  const completedTasks = tasks.filter(t => t.status === 'completed');

  const TaskCard = ({ task, index }: { task: Task; index: number }) => {
    const taskIsOverdue = isOverdue(task);
    const displayStatus = taskIsOverdue ? 'overdue' : task.status;

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, delay: index * 0.03 }}
      >
        <Card
          className={cn(
            "p-4 card-hover bg-card border-border/50 cursor-pointer group",
            taskIsOverdue && "border-red-500/30 bg-red-500/5"
          )}
          onClick={() => onTaskClick?.(task)}
        >
          <div className="flex items-start justify-between gap-2 mb-2">
            <h4 className="font-medium text-sm group-hover:text-primary transition-colors line-clamp-2 flex-1">
              {task.title}
            </h4>
            <Badge
              variant={statusConfig[displayStatus].variant}
              className={cn(
                'shrink-0 text-xs',
                task.status === 'completed' && 'bg-momentum-green/20 text-momentum-green border-momentum-green/30'
              )}
            >
              {statusConfig[displayStatus].label}
            </Badge>
          </div>

          {/* Priority, Mode, and XP Badges */}
          <div className="flex items-center flex-wrap gap-2 mb-2">
            {task.priority && (
              <Badge
                variant="outline"
                className={cn(
                  'text-xs',
                  priorityConfig[task.priority].bgColor,
                  priorityConfig[task.priority].color
                )}
              >
                <AlertCircle className="h-3 w-3 mr-1" />
                {priorityConfig[task.priority].label}
              </Badge>
            )}
            {task.participationMode === 'everyone' && (
              <Badge variant="outline" className="text-xs bg-purple-500/10 text-purple-500 border-purple-500/30">
                <Users className="h-3 w-3 mr-1" />
                Team Task
              </Badge>
            )}
            {task.xpReward && (
              <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/30">
                <Trophy className="h-3 w-3 mr-1" />
                +{task.xpReward} XP
              </Badge>
            )}
          </div>

          <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
            {task.description}
          </p>

          {/* Deadline Warning */}
          {task.deadline && (
            <div className={cn(
              "flex items-center gap-1 mt-2 text-xs",
              taskIsOverdue ? "text-red-500" : "text-muted-foreground"
            )}>
              <Calendar className="h-3 w-3" />
              <span>
                {taskIsOverdue ? 'Overdue: ' : 'Due: '}
                {formatRelativeTime(task.deadline)}
              </span>
            </div>
          )}

          <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <User className="h-3 w-3" />
                <span>
                  {task.participationMode === 'everyone' && task.participants && task.participants.length > 0
                    ? `${task.participants.length} participants`
                    : task.createdByName}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>{formatRelativeTime(task.createdAt)}</span>
              </div>
            </div>

            {(task.status === 'open' || (task.participationMode === 'everyone' && task.status === 'in_progress')) && onClaimTask && (
              <Button
                size="sm"
                variant="ghost"
                className="h-7 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  onClaimTask(task);
                }}
              >
                Claim <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            )}
          </div>
        </Card>
      </motion.div>
    );
  };

  return (
    <div className={cn('grid gap-6 md:grid-cols-3', className)}>
      <div className="space-y-3">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-2 h-2 rounded-full bg-muted-foreground" />
          <h3 className="font-display font-medium text-sm">Open</h3>
          <span className="text-xs text-muted-foreground">({openTasks.length})</span>
        </div>
        <div className="space-y-3">
          {openTasks.map((task, i) => (
            <TaskCard key={task.id} task={task} index={i} />
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-2 h-2 rounded-full bg-momentum-yellow" />
          <h3 className="font-display font-medium text-sm">In Progress</h3>
          <span className="text-xs text-muted-foreground">({inProgressTasks.length})</span>
        </div>
        <div className="space-y-3">
          {inProgressTasks.map((task, i) => (
            <TaskCard key={task.id} task={task} index={i} />
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-2 h-2 rounded-full bg-momentum-green" />
          <h3 className="font-display font-medium text-sm">Completed</h3>
          <span className="text-xs text-muted-foreground">({completedTasks.length})</span>
        </div>
        <div className="space-y-3">
          {completedTasks.map((task, i) => (
            <TaskCard key={task.id} task={task} index={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
