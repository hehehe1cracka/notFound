import { Announcement } from '@/types/momentum';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatRelativeTime } from '@/lib/momentum';
import { motion, AnimatePresence } from 'framer-motion';
import { Megaphone, Pin, X, AlertCircle, Info, AlertTriangle, AlertOctagon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface AnnouncementBannerProps {
    announcements: Announcement[];
    onDismiss?: (announcementId: string) => void;
    isFounder?: boolean;
}

const priorityConfig = {
    low: {
        icon: Info,
        color: 'text-blue-500',
        bgColor: 'bg-blue-500/10',
        borderColor: 'border-blue-500/30',
        label: 'Info',
    },
    medium: {
        icon: AlertCircle,
        color: 'text-yellow-500',
        bgColor: 'bg-yellow-500/10',
        borderColor: 'border-yellow-500/30',
        label: 'Notice',
    },
    high: {
        icon: AlertTriangle,
        color: 'text-orange-500',
        bgColor: 'bg-orange-500/10',
        borderColor: 'border-orange-500/30',
        label: 'Important',
    },
    urgent: {
        icon: AlertOctagon,
        color: 'text-red-500',
        bgColor: 'bg-red-500/10',
        borderColor: 'border-red-500/30',
        label: 'Urgent',
    },
};

export function AnnouncementBanner({ announcements, onDismiss, isFounder }: AnnouncementBannerProps) {
    const [dismissedIds, setDismissedIds] = useState<string[]>([]);

    // Filter out expired and dismissed announcements
    const activeAnnouncements = announcements.filter(
        (a) =>
            !dismissedIds.includes(a.id) &&
            (!a.expiresAt || a.expiresAt > Date.now())
    );

    // Sort by priority and pinned status
    const sortedAnnouncements = activeAnnouncements.sort((a, b) => {
        if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;

        const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

    const handleDismiss = (id: string) => {
        setDismissedIds([...dismissedIds, id]);
        onDismiss?.(id);
    };

    if (sortedAnnouncements.length === 0) return null;

    return (
        <div className="space-y-3 mb-6">
            <AnimatePresence mode="popLayout">
                {sortedAnnouncements.map((announcement, index) => {
                    const config = priorityConfig[announcement.priority];
                    const Icon = config.icon;

                    return (
                        <motion.div
                            key={announcement.id}
                            initial={{ opacity: 0, y: -10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, x: 100, scale: 0.95 }}
                            transition={{ duration: 0.2, delay: index * 0.05 }}
                        >
                            <Card
                                className={cn(
                                    'p-4 border-2',
                                    config.bgColor,
                                    config.borderColor,
                                    announcement.isPinned && 'shadow-lg'
                                )}
                            >
                                <div className="flex items-start gap-3">
                                    <div className={cn('p-2 rounded-lg', config.bgColor)}>
                                        <Icon className={cn('h-5 w-5', config.color)} />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2 mb-1">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <h4 className="font-semibold text-sm">{announcement.title}</h4>
                                                {announcement.isPinned && (
                                                    <Badge variant="outline" className="text-xs gap-1">
                                                        <Pin className="h-3 w-3" />
                                                        Pinned
                                                    </Badge>
                                                )}
                                                <Badge variant="outline" className={cn('text-xs', config.color)}>
                                                    {config.label}
                                                </Badge>
                                            </div>
                                        </div>

                                        <p className="text-sm text-muted-foreground mb-2 whitespace-pre-wrap">
                                            {announcement.content}
                                        </p>

                                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                            <div className="flex items-center gap-1">
                                                <Megaphone className="h-3 w-3" />
                                                <span>{announcement.userName}</span>
                                            </div>
                                            <span>•</span>
                                            <span>{formatRelativeTime(announcement.createdAt)}</span>
                                            {announcement.expiresAt && (
                                                <>
                                                    <span>•</span>
                                                    <span>Expires {formatRelativeTime(announcement.expiresAt)}</span>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6 shrink-0"
                                        onClick={() => handleDismiss(announcement.id)}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            </Card>
                        </motion.div>
                    );
                })}
            </AnimatePresence>
        </div>
    );
}
