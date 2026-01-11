import { useState, useEffect, useRef } from 'react';
import { Task, TaskSubmission, ChatMessage, XP_REWARDS } from '@/types/momentum';
import { useAuth } from '@/hooks/useAuth';
import { ref, push, set, update, onValue, off } from 'firebase/database';
import { database } from '@/lib/firebase';
import { awardTaskCompletionXP } from '@/lib/gamification';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { formatRelativeTime } from '@/lib/momentum';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Send,
    Upload,
    CheckCircle2,
    XCircle,
    Clock,
    User,
    MessageSquare,
    FileText,
    Link as LinkIcon,
    Loader2,
    Calendar,
    Trophy,
    AlertCircle,
    ThumbsUp,
    ThumbsDown,
    Edit3,
    Users
} from 'lucide-react';
import { cn } from '@/lib/utils';


interface TaskDetailDialogProps {
    task: Task | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    startupId: string;
    isFounder?: boolean;
}

export function TaskDetailDialog({
    task,
    open,
    onOpenChange,
    startupId,
    isFounder = false
}: TaskDetailDialogProps) {
    const { user, userProfile } = useAuth();
    const { toast } = useToast();
    const [activeTab, setActiveTab] = useState('details');
    const [submitting, setSubmitting] = useState(false);
    const [claiming, setClaiming] = useState(false);
    const [submissions, setSubmissions] = useState<TaskSubmission[]>([]);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Submission form state
    const [submissionData, setSubmissionData] = useState({
        content: '',
        attachments: [] as string[],
        attachmentInput: ''
    });

    // Chat form state
    const [messageInput, setMessageInput] = useState('');

    // Load submissions and messages when task changes
    useEffect(() => {
        if (!task) return;

        setSubmissions(task.submissions || []);

        // Listen to chat messages
        const messagesRef = ref(database, `taskChats/${task.id}`);
        const unsubscribe = onValue(messagesRef, (snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.val();
                const messagesList = Object.values(data) as ChatMessage[];
                setMessages(messagesList.sort((a, b) => a.createdAt - b.createdAt));
            } else {
                setMessages([]);
            }
        });

        return () => off(messagesRef);
    }, [task]);

    // Auto-scroll to bottom of messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleClaimTask = async () => {
        if (!task || !user || !userProfile) return;

        setClaiming(true);
        try {
            const taskRef = ref(database, `tasks/${startupId}/${task.id}`);
            const updates: any = {};

            if (task.participationMode === 'everyone') {
                const participants = [...(task.participants || []), user.uid];
                updates.participants = participants;
                updates.status = 'in_progress'; // Ensure status reflects activity
            } else {
                updates.assignedTo = user.uid;
                updates.assignedToName = userProfile.displayName;
                updates.status = 'in_progress';
            }

            await update(taskRef, updates);

            toast({
                title: 'Task claimed!',
                description: 'You can now start working on this task.'
            });
            onOpenChange(false);
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to claim task',
                variant: 'destructive'
            });
        } finally {
            setClaiming(false);
        }
    };

    const handleAddAttachment = () => {
        if (!submissionData.attachmentInput.trim()) return;

        setSubmissionData(prev => ({
            ...prev,
            attachments: [...prev.attachments, prev.attachmentInput.trim()],
            attachmentInput: ''
        }));
    };

    const handleRemoveAttachment = (index: number) => {
        setSubmissionData(prev => ({
            ...prev,
            attachments: prev.attachments.filter((_, i) => i !== index)
        }));
    };

    const handleSubmitWork = async () => {
        if (!task || !user || !userProfile || !submissionData.content.trim()) {
            toast({
                title: 'Error',
                description: 'Please provide submission details',
                variant: 'destructive'
            });
            return;
        }

        setSubmitting(true);
        try {
            const submission: TaskSubmission = {
                id: Date.now().toString(),
                taskId: task.id,
                userId: user.uid,
                userName: userProfile.displayName,
                content: submissionData.content,
                attachments: submissionData.attachments,
                createdAt: Date.now(),
                status: 'pending'
            };

            const updatedSubmissions = [...(task.submissions || []), submission];
            const taskRef = ref(database, `tasks/${startupId}/${task.id}`);

            const subUpdates: any = {
                submissions: updatedSubmissions
            };

            // Only change global status to 'submitted' if not in 'everyone' mode
            if (task.participationMode !== 'everyone') {
                subUpdates.status = 'submitted';
            }

            await update(taskRef, subUpdates);

            // Create activity update
            const activityRef = push(ref(database, `activities/${startupId}`));
            await set(activityRef, {
                id: activityRef.key,
                startupId,
                userId: user.uid,
                userName: userProfile.displayName,
                content: `Submitted work for task: ${task.title}`,
                type: 'task_completed',
                createdAt: Date.now(),
                isEditable: false
            });

            toast({
                title: 'Work submitted!',
                description: 'The founder will review your submission.'
            });

            setSubmissionData({ content: '', attachments: [], attachmentInput: '' });
            setActiveTab('submissions');
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to submit work',
                variant: 'destructive'
            });
        } finally {
            setSubmitting(false);
        }
    };

    const handleReviewSubmission = async (
        submission: TaskSubmission,
        approved: boolean,
        comment: string = ''
    ) => {
        if (!task || !user) return;

        try {
            const updatedSubmissions = task.submissions.map(s =>
                s.id === submission.id
                    ? {
                        ...s,
                        status: approved ? 'approved' : 'rejected',
                        reviewComment: comment,
                        reviewScore: approved ? 100 : 0
                    }
                    : s
            );

            const taskRef = ref(database, `tasks/${startupId}/${task.id}`);
            const updates: any = {
                submissions: updatedSubmissions
            };

            if (approved) {
                // Only mark as closed/completed if mode is single OR if this was the last expected submission
                // For 'everyone' mode, we might keep it open. But for now, let's say 'completed' implies THIS submission is done.
                // Actually, for 'everyone' mode, the task status shouldn't necessarily close unless the founder explicitly closes it.
                // But let's assume if it's 'single' mode, we close it.

                if (task.participationMode !== 'everyone') {
                    updates.status = 'completed';
                    updates.completedAt = Date.now();
                }

                // Calculate total XP Reward
                let totalXp = task.xpReward || XP_REWARDS.TASK_COMPLETED;

                // Speed bonus: Completed within 24h
                const isFast = (Date.now() - task.createdAt) < 24 * 60 * 60 * 1000;
                if (isFast) totalXp += XP_REWARDS.SPEED_BONUS;

                // Award XP and check achievements
                const userRef = ref(database, `users/${submission.userId}`);
                const userSnapshot = await (await import('firebase/database')).get(userRef);
                const currentUser = userSnapshot.val();

                if (currentUser) {
                    await awardTaskCompletionXP(submission.userId, currentUser, totalXp);
                }
            }

            await update(taskRef, updates);

            toast({
                title: approved ? 'Submission approved!' : 'Submission rejected',
                description: approved
                    ? 'The task has been marked as completed.'
                    : 'The contributor has been notified.'
            });
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to review submission',
                variant: 'destructive'
            });
        }
    };

    const handleSendMessage = async () => {
        if (!task || !user || !userProfile || !messageInput.trim()) return;

        try {
            const messagesRef = ref(database, `taskChats/${task.id}`);
            const newMessageRef = push(messagesRef);

            const message: ChatMessage = {
                id: newMessageRef.key!,
                contextType: 'task',
                contextId: task.id,
                userId: user.uid,
                userName: userProfile.displayName,
                content: messageInput.trim(),
                createdAt: Date.now()
            };

            await set(newMessageRef, message);
            setMessageInput('');
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to send message',
                variant: 'destructive'
            });
        }
    };

    if (!task) return null;

    const isAssignedToUser = task.assignedTo === user?.uid || (task.participationMode === 'everyone' && task.participants?.includes(user?.uid || ''));

    // Can submit if:
    // 1. Assigned to user (Single mode)
    // 2. User is in participants list (Everyone mode)
    // 3. Status is open or in_progress (and user has claimed/joined)
    const canSubmit = isAssignedToUser && (task.status === 'in_progress' || task.status === 'open');

    const canClaim = !isFounder && !isAssignedToUser && (
        task.status === 'open' ||
        (task.participationMode === 'everyone' && task.status === 'in_progress')
    );

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                            <DialogTitle className="text-2xl font-display">{task.title}</DialogTitle>
                            <DialogDescription className="mt-2">
                                Created by {task.createdByName} • {formatRelativeTime(task.createdAt)}
                            </DialogDescription>
                        </div>
                        <div className="flex flex-col gap-2 items-end">
                            <Badge
                                variant={task.status === 'completed' ? 'default' : 'outline'}
                                className={cn(
                                    task.status === 'completed' && 'bg-momentum-green/20 text-momentum-green border-momentum-green/30'
                                )}
                            >
                                {task.status.replace('_', ' ').toUpperCase()}
                            </Badge>
                            {task.xpReward && (
                                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                                    <Trophy className="h-3 w-3 mr-1" />
                                    +{task.xpReward} XP
                                </Badge>
                            )}
                        </div>
                    </div>
                </DialogHeader>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="details">
                            <FileText className="h-4 w-4 mr-2" />
                            Details
                        </TabsTrigger>
                        <TabsTrigger value="submit">
                            <Upload className="h-4 w-4 mr-2" />
                            Submit
                        </TabsTrigger>
                        <TabsTrigger value="submissions">
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            Submissions ({submissions.length})
                        </TabsTrigger>
                        <TabsTrigger value="chat">
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Chat ({messages.length})
                        </TabsTrigger>
                    </TabsList>

                    <div className="flex-1 overflow-y-auto mt-4">
                        <TabsContent value="details" className="space-y-4 mt-0">
                            <div>
                                <h3 className="font-semibold mb-2">Description</h3>
                                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                    {task.description}
                                </p>
                            </div>

                            <Separator />

                            <div className="grid grid-cols-2 gap-4">
                                {task.deadline && (
                                    <div>
                                        <h4 className="text-sm font-medium mb-1 flex items-center gap-2">
                                            <Calendar className="h-4 w-4" />
                                            Deadline
                                        </h4>
                                        <p className="text-sm text-muted-foreground">
                                            {new Date(task.deadline).toLocaleDateString()} ({formatRelativeTime(task.deadline)})
                                        </p>
                                    </div>
                                )}
                                {task.priority && (
                                    <div>
                                        <h4 className="text-sm font-medium mb-1 flex items-center gap-2">
                                            <AlertCircle className="h-4 w-4" />
                                            Priority
                                        </h4>
                                        <Badge variant="outline" className="text-xs">
                                            {task.priority.toUpperCase()}
                                        </Badge>
                                    </div>
                                )}
                                {task.assignedToName && (
                                    <div>
                                        <h4 className="text-sm font-medium mb-1 flex items-center gap-2">
                                            <User className="h-4 w-4" />
                                            Assigned To
                                        </h4>
                                        <p className="text-sm text-muted-foreground">{task.assignedToName}</p>
                                    </div>
                                )}
                                {task.tags && task.tags.length > 0 && (
                                    <div>
                                        <h4 className="text-sm font-medium mb-1">Tags</h4>
                                        <div className="flex flex-wrap gap-1">
                                            {task.tags.map(tag => (
                                                <Badge key={tag} variant="secondary" className="text-xs">
                                                    {tag}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {canClaim && (
                                <Button onClick={handleClaimTask} className="w-full" disabled={claiming}>
                                    {claiming ? (
                                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                    ) : (
                                        <CheckCircle2 className="h-4 w-4 mr-2" />
                                    )}
                                    Claim This Task
                                </Button>
                            )}
                        </TabsContent>

                        <TabsContent value="submit" className="space-y-4 mt-0">
                            {canSubmit ? (
                                <>
                                    <div className="space-y-2">
                                        <Label htmlFor="submission-content">Describe your work *</Label>
                                        <Textarea
                                            id="submission-content"
                                            placeholder="Explain what you've done, challenges faced, and results achieved..."
                                            value={submissionData.content}
                                            onChange={(e) => setSubmissionData({ ...submissionData, content: e.target.value })}
                                            rows={6}
                                            className="resize-none"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Attachments (Links)</Label>
                                        <div className="flex gap-2">
                                            <Input
                                                placeholder="Add link to GitHub, Figma, Drive, etc..."
                                                value={submissionData.attachmentInput}
                                                onChange={(e) => setSubmissionData({ ...submissionData, attachmentInput: e.target.value })}
                                                onKeyPress={(e) => e.key === 'Enter' && handleAddAttachment()}
                                            />
                                            <Button onClick={handleAddAttachment} variant="outline" size="sm">
                                                <LinkIcon className="h-4 w-4" />
                                            </Button>
                                        </div>
                                        {submissionData.attachments.length > 0 && (
                                            <div className="space-y-1 mt-2">
                                                {submissionData.attachments.map((link, index) => (
                                                    <div key={index} className="flex items-center gap-2 text-sm bg-muted p-2 rounded">
                                                        <LinkIcon className="h-3 w-3" />
                                                        <a href={link} target="_blank" rel="noopener noreferrer" className="flex-1 truncate text-primary hover:underline">
                                                            {link}
                                                        </a>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleRemoveAttachment(index)}
                                                            className="h-6 w-6 p-0"
                                                        >
                                                            <XCircle className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <Button onClick={handleSubmitWork} className="w-full" disabled={submitting || !submissionData.content.trim()}>
                                        {submitting ? (
                                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                        ) : (
                                            <Upload className="h-4 w-4 mr-2" />
                                        )}
                                        Submit Work
                                    </Button>
                                </>
                            ) : (
                                <Card className="p-8 text-center">
                                    <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                    <h3 className="font-semibold mb-2">
                                        {task.status === 'open' ? 'Claim this task first' : 'Not assigned to you'}
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                        {task.status === 'open'
                                            ? 'You need to claim this task before you can submit work.'
                                            : 'Only the assigned person can submit work for this task.'}
                                    </p>
                                </Card>
                            )}
                        </TabsContent>

                        <TabsContent value="submissions" className="space-y-4 mt-0">
                            {submissions.length > 0 ? (
                                <AnimatePresence>
                                    {submissions.map((submission, index) => (
                                        <SubmissionCard
                                            key={submission.id}
                                            submission={submission}
                                            index={index}
                                            isFounder={isFounder}
                                            onReview={handleReviewSubmission}
                                        />
                                    ))}
                                </AnimatePresence>
                            ) : (
                                <Card className="p-8 text-center">
                                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                    <h3 className="font-semibold mb-2">No submissions yet</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Submissions will appear here once work is submitted.
                                    </p>
                                </Card>
                            )}
                        </TabsContent>

                        <TabsContent value="chat" className="flex flex-col h-[400px] mt-0">
                            <div className="flex-1 overflow-y-auto space-y-3 mb-4">
                                {messages.length > 0 ? (
                                    messages.map((message, index) => (
                                        <motion.div
                                            key={message.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            className={cn(
                                                'flex gap-2',
                                                message.userId === user?.uid ? 'flex-row-reverse' : 'flex-row'
                                            )}
                                        >
                                            <div className={cn(
                                                'max-w-[70%] rounded-lg p-3',
                                                message.userId === user?.uid
                                                    ? 'bg-primary text-primary-foreground'
                                                    : 'bg-muted'
                                            )}>
                                                <p className="text-xs font-medium mb-1">{message.userName}</p>
                                                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                                                <p className="text-xs opacity-70 mt-1">
                                                    {formatRelativeTime(message.createdAt)}
                                                </p>
                                            </div>
                                        </motion.div>
                                    ))
                                ) : (
                                    <div className="flex items-center justify-center h-full">
                                        <div className="text-center">
                                            <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                            <p className="text-sm text-muted-foreground">No messages yet. Start the conversation!</p>
                                        </div>
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            <div className="flex gap-2">
                                <Input
                                    placeholder="Type a message..."
                                    value={messageInput}
                                    onChange={(e) => setMessageInput(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                                />
                                <Button onClick={handleSendMessage} disabled={!messageInput.trim()}>
                                    <Send className="h-4 w-4" />
                                </Button>
                            </div>
                        </TabsContent>
                    </div>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}

function SubmissionCard({
    submission,
    index,
    isFounder,
    onReview
}: {
    submission: TaskSubmission;
    index: number;
    isFounder: boolean;
    onReview: (submission: TaskSubmission, approved: boolean, comment: string) => void;
}) {
    const [reviewComment, setReviewComment] = useState('');
    const [showReview, setShowReview] = useState(false);

    const statusConfig = {
        pending: { icon: Clock, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
        approved: { icon: ThumbsUp, color: 'text-green-500', bg: 'bg-green-500/10' },
        rejected: { icon: ThumbsDown, color: 'text-red-500', bg: 'bg-red-500/10' },
        revision_requested: { icon: Edit3, color: 'text-orange-500', bg: 'bg-orange-500/10' }
    };

    const config = statusConfig[submission.status];
    const StatusIcon = config.icon;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
        >
            <Card className="p-4">
                <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium text-sm">{submission.userName}</span>
                        <span className="text-xs text-muted-foreground">
                            {formatRelativeTime(submission.createdAt)}
                        </span>
                    </div>
                    <Badge variant="outline" className={cn('text-xs', config.bg, config.color)}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {submission.status.replace('_', ' ').toUpperCase()}
                    </Badge>
                </div>

                <p className="text-sm text-muted-foreground whitespace-pre-wrap mb-3">
                    {submission.content}
                </p>

                {submission.attachments && submission.attachments.length > 0 && (
                    <div className="space-y-1 mb-3">
                        <Label className="text-xs">Attachments:</Label>
                        {submission.attachments.map((link, i) => (
                            <a
                                key={i}
                                href={link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 text-xs text-primary hover:underline"
                            >
                                <LinkIcon className="h-3 w-3" />
                                {link}
                            </a>
                        ))}
                    </div>
                )}

                {submission.reviewComment && (
                    <div className="mt-3 p-3 bg-muted rounded-lg">
                        <Label className="text-xs">Founder's Review:</Label>
                        <p className="text-sm mt-1">{submission.reviewComment}</p>
                    </div>
                )}

                {isFounder && submission.status === 'pending' && (
                    <div className="mt-3 space-y-2">
                        {showReview ? (
                            <>
                                <Textarea
                                    placeholder="Add review comments (optional)..."
                                    value={reviewComment}
                                    onChange={(e) => setReviewComment(e.target.value)}
                                    rows={2}
                                    className="text-sm"
                                />
                                <div className="flex gap-2">
                                    <Button
                                        size="sm"
                                        onClick={() => {
                                            onReview(submission, true, reviewComment);
                                            setShowReview(false);
                                            setReviewComment('');
                                        }}
                                        className="flex-1 bg-green-600 hover:bg-green-700"
                                    >
                                        <ThumbsUp className="h-4 w-4 mr-2" />
                                        Approve
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="destructive"
                                        onClick={() => {
                                            onReview(submission, false, reviewComment);
                                            setShowReview(false);
                                            setReviewComment('');
                                        }}
                                        className="flex-1"
                                    >
                                        <ThumbsDown className="h-4 w-4 mr-2" />
                                        Reject
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => setShowReview(false)}
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </>
                        ) : (
                            <Button size="sm" variant="outline" onClick={() => setShowReview(true)} className="w-full">
                                Review Submission
                            </Button>
                        )}
                    </div>
                )}
            </Card>
        </motion.div>
    );
}
