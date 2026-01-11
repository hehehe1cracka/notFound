import { MomentumStatus } from '@/types/momentum';
import { getMomentumInfo } from '@/lib/momentum';
import { cn } from '@/lib/utils';

interface MomentumIndicatorProps {
  status: MomentumStatus;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function MomentumIndicator({
  status,
  showLabel = true,
  size = 'md',
  className
}: MomentumIndicatorProps) {
  const info = getMomentumInfo(status) || {
    label: 'Unknown',
    color: 'text-muted-foreground',
    dotClass: 'bg-muted'
  };

  const dotSizes = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
  };

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <span
        className={cn(
          'rounded-full animate-pulse-glow',
          dotSizes[size],
          info.dotClass
        )}
      />
      {showLabel && (
        <span className={cn('font-medium', textSizes[size], info.color)}>
          {info.label}
        </span>
      )}
    </div>
  );
}
