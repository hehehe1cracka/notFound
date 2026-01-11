import { MomentumStatus, MOMENTUM_THRESHOLDS } from '@/types/momentum';

// Calculate momentum status based on activity data
export function calculateMomentum(
  lastActivityAt: number,
  weeklyUpdateCount: number,
  taskCompletionRate: number
): MomentumStatus {
  const now = Date.now();
  const daysSinceActivity = (now - lastActivityAt) / (1000 * 60 * 60 * 24);

  // Red: Inactive for more than 7 days
  if (daysSinceActivity > MOMENTUM_THRESHOLDS.YELLOW_DAYS) {
    return 'red';
  }

  // Yellow: Activity slowing down
  if (
    daysSinceActivity > MOMENTUM_THRESHOLDS.GREEN_DAYS ||
    weeklyUpdateCount < MOMENTUM_THRESHOLDS.MIN_WEEKLY_UPDATES
  ) {
    return 'yellow';
  }

  // Green: Active and healthy
  return 'green';
}

// Check if startup should be archived
export function shouldArchive(lastActivityAt: number): boolean {
  const daysSinceActivity = (Date.now() - lastActivityAt) / (1000 * 60 * 60 * 24);
  return daysSinceActivity > MOMENTUM_THRESHOLDS.ARCHIVE_DAYS;
}

// Get momentum display info
export function getMomentumInfo(status: MomentumStatus) {
  switch (status) {
    case 'green':
      return {
        label: 'Active',
        description: 'Regular updates and progress',
        color: 'momentum-green',
        dotClass: 'momentum-dot-green',
      };
    case 'yellow':
      return {
        label: 'Slowing',
        description: 'Activity has decreased recently',
        color: 'momentum-yellow',
        dotClass: 'momentum-dot-yellow',
      };
    case 'red':
      return {
        label: 'Inactive',
        description: 'No recent activity',
        color: 'momentum-red',
        dotClass: 'momentum-dot-red',
      };
    default:
      return {
        label: 'Unknown',
        description: 'Status unavailable',
        color: 'text-muted-foreground',
        dotClass: 'bg-muted',
      };
  }
}

// Format relative time
export function formatRelativeTime(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);

  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;

  return new Date(timestamp).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}
