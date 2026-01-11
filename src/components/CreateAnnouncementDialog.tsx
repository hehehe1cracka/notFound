import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Megaphone, Loader2, Calendar } from 'lucide-react';
import { Announcement } from '@/types/momentum';

interface CreateAnnouncementDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onCreateAnnouncement: (announcement: Omit<Announcement, 'id' | 'startupId' | 'userId' | 'userName' | 'createdAt'>) => Promise<void>;
    submitting?: boolean;
}

export function CreateAnnouncementDialog({
    open,
    onOpenChange,
    onCreateAnnouncement,
    submitting = false,
}: CreateAnnouncementDialogProps) {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
    const [isPinned, setIsPinned] = useState(false);
    const [hasExpiration, setHasExpiration] = useState(false);
    const [expirationDays, setExpirationDays] = useState(7);

    const handleSubmit = async () => {
        if (!title.trim() || !content.trim()) return;

        const expiresAt = hasExpiration
            ? Date.now() + expirationDays * 24 * 60 * 60 * 1000
            : undefined;

        await onCreateAnnouncement({
            title,
            content,
            priority,
            isPinned,
            expiresAt,
        });

        // Reset form
        setTitle('');
        setContent('');
        setPriority('medium');
        setIsPinned(false);
        setHasExpiration(false);
        setExpirationDays(7);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Megaphone className="h-5 w-5 text-primary" />
                        Create Announcement
                    </DialogTitle>
                    <DialogDescription>
                        Share important updates with all team members. Announcements appear at the top of the startup page.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 pt-4">
                    {/* Title */}
                    <div className="space-y-2">
                        <Label htmlFor="announcement-title">Title *</Label>
                        <Input
                            id="announcement-title"
                            placeholder="e.g., Team Meeting Tomorrow"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            maxLength={100}
                        />
                        <p className="text-xs text-muted-foreground">{title.length}/100</p>
                    </div>

                    {/* Content */}
                    <div className="space-y-2">
                        <Label htmlFor="announcement-content">Message *</Label>
                        <Textarea
                            id="announcement-content"
                            placeholder="Write your announcement message..."
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            rows={4}
                            maxLength={500}
                        />
                        <p className="text-xs text-muted-foreground">{content.length}/500</p>
                    </div>

                    {/* Priority */}
                    <div className="space-y-2">
                        <Label htmlFor="announcement-priority">Priority</Label>
                        <Select value={priority} onValueChange={(value: any) => setPriority(value)}>
                            <SelectTrigger id="announcement-priority">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="low">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-blue-500" />
                                        <span>Low - General info</span>
                                    </div>
                                </SelectItem>
                                <SelectItem value="medium">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-yellow-500" />
                                        <span>Medium - Team notice</span>
                                    </div>
                                </SelectItem>
                                <SelectItem value="high">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-orange-500" />
                                        <span>High - Important update</span>
                                    </div>
                                </SelectItem>
                                <SelectItem value="urgent">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-red-500" />
                                        <span>Urgent - Critical action needed</span>
                                    </div>
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Pin to top */}
                    <div className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-muted/30">
                        <div className="space-y-0.5">
                            <Label htmlFor="pin-announcement" className="cursor-pointer">
                                Pin to top
                            </Label>
                            <p className="text-xs text-muted-foreground">
                                Keep this announcement at the top of the page
                            </p>
                        </div>
                        <Switch
                            id="pin-announcement"
                            checked={isPinned}
                            onCheckedChange={setIsPinned}
                        />
                    </div>

                    {/* Expiration */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-muted/30">
                            <div className="space-y-0.5">
                                <Label htmlFor="has-expiration" className="cursor-pointer">
                                    Set expiration
                                </Label>
                                <p className="text-xs text-muted-foreground">
                                    Automatically hide after a certain time
                                </p>
                            </div>
                            <Switch
                                id="has-expiration"
                                checked={hasExpiration}
                                onCheckedChange={setHasExpiration}
                            />
                        </div>

                        {hasExpiration && (
                            <div className="space-y-2 pl-3">
                                <Label htmlFor="expiration-days" className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4" />
                                    Expires in (days)
                                </Label>
                                <Input
                                    id="expiration-days"
                                    type="number"
                                    min={1}
                                    max={365}
                                    value={expirationDays}
                                    onChange={(e) => setExpirationDays(parseInt(e.target.value) || 7)}
                                />
                            </div>
                        )}
                    </div>

                    {/* Submit Button */}
                    <Button
                        onClick={handleSubmit}
                        className="w-full"
                        disabled={submitting || !title.trim() || !content.trim()}
                    >
                        {submitting ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Creating...
                            </>
                        ) : (
                            <>
                                <Megaphone className="h-4 w-4 mr-2" />
                                Create Announcement
                            </>
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
