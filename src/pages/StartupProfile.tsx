import { useState, useEffect } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { ref, onValue, push, set, update } from 'firebase/database';
import { database } from '@/lib/firebase';
import { useAuth } from '@/hooks/useAuth';
import { Startup, Task, ActivityUpdate, GalleryPost, User, Announcement } from '@/types/momentum';
import { generateCaption } from '@/lib/gemini';
import { awardXP } from '@/lib/gamification';
import { MomentumIndicator } from '@/components/MomentumIndicator';
import { ActivityFeed } from '@/components/ActivityFeed';
import { TaskBoard } from '@/components/TaskBoard';
import { TaskDetailDialog } from '@/components/TaskDetailDialog';
import { GalleryCard } from '@/components/GalleryCard';
import { AnnouncementBanner } from '@/components/AnnouncementBanner';
import { CreateAnnouncementDialog } from '@/components/CreateAnnouncementDialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Input
} from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { formatRelativeTime, getMomentumInfo } from '@/lib/momentum';
import {
  ArrowLeft,
  Plus,
  Users,
  Calendar,
  MessageSquare,
  Loader2,
  AlertTriangle,
  Send,
  Image as ImageIcon,
  Sparkles,
  Camera,
  Globe,
  Twitter,
  Megaphone,
  Trophy,
  Clock as ClockIcon
} from 'lucide-react';
import Loader from '@/components/Loader';

// Demo data
const demoStartup: Startup = {
  id: 'demo-1',
  name: 'CodeFlow',
  tagline: 'AI-powered code review for faster shipping',
  description: 'We\'re building the next generation of code review tools. Using AI to catch bugs, suggest improvements, and help teams ship faster with confidence.',
  founderId: 'founder-1',
  founderName: 'Sarah Chen',
  createdAt: Date.now() - 1000 * 60 * 60 * 24 * 14,
  momentum: 'green',
  lastActivityAt: Date.now() - 1000 * 60 * 30,
  contributorCount: 5,
  taskCount: 12,
  completedTaskCount: 8,
  isArchived: false,
  contributors: {},
};

const demoActivities: ActivityUpdate[] = [
  {
    id: '1',
    startupId: 'demo-1',
    userId: 'founder-1',
    userName: 'Sarah Chen',
    content: 'Shipped the new dashboard with real-time updates. Performance improved by 40%.',
    type: 'update',
    createdAt: Date.now() - 1000 * 60 * 30,
    isEditable: false,
  },
  {
    id: '2',
    startupId: 'demo-1',
    userId: 'user-2',
    userName: 'Mike Torres',
    content: 'Completed the API rate limiting feature',
    type: 'task_completed',
    createdAt: Date.now() - 1000 * 60 * 60 * 2,
    isEditable: false,
  },
  {
    id: '2.5',
    startupId: 'demo-1',
    userId: 'founder-1',
    userName: 'Sarah Chen',
    content: 'Posted visual proof of the new Landing Page design to the Gallery.',
    type: 'gallery_post',
    createdAt: Date.now() - 1000 * 60 * 60 * 5,
    isEditable: false,
  },
  {
    id: '3',
    startupId: 'demo-1',
    userId: 'user-3',
    userName: 'Lisa Park',
    content: 'Joined the team as a frontend contributor',
    type: 'member_joined',
    createdAt: Date.now() - 1000 * 60 * 60 * 24,
    isEditable: false,
  },
  {
    id: '4',
    startupId: 'demo-1',
    userId: 'founder-1',
    userName: 'Sarah Chen',
    content: 'Reached 1,000 code reviews processed!',
    type: 'milestone',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 2,
    isEditable: false,
  },
  {
    id: '5',
    startupId: 'demo-1',
    userId: 'user-2',
    userName: 'Mike Torres',
    content: 'Optimized PostgreSQL queries for the analytics engine.',
    type: 'update',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 3,
    isEditable: false,
  }
];

const demoTasks: Task[] = [
  {
    id: 't1',
    startupId: 'demo-1',
    title: 'Implement GitHub OAuth integration',
    description: 'Add GitHub OAuth so users can connect their repositories for automatic code review.',
    createdBy: 'founder-1',
    createdByName: 'Sarah Chen',
    status: 'open',
    createdAt: Date.now() - 1000 * 60 * 60 * 5,
    submissions: [],
  },
  {
    id: 't2',
    startupId: 'demo-1',
    title: 'Design the pricing page',
    description: 'Create a clean, conversion-focused pricing page with 3 tiers.',
    createdBy: 'founder-1',
    createdByName: 'Sarah Chen',
    assignedTo: 'user-3',
    assignedToName: 'Lisa Park',
    status: 'in_progress',
    createdAt: Date.now() - 1000 * 60 * 60 * 24,
    submissions: [],
  },
  {
    id: 't3',
    startupId: 'demo-1',
    title: 'API rate limiting',
    description: 'Implement rate limiting to prevent abuse of the API endpoints.',
    createdBy: 'founder-1',
    createdByName: 'Sarah Chen',
    assignedTo: 'user-2',
    assignedToName: 'Mike Torres',
    status: 'completed',
    createdAt: Date.now() - 1000 * 60 * 60 * 48,
    completedAt: Date.now() - 1000 * 60 * 60 * 2,
    submissions: [],
  },
];

export default function StartupProfile() {
  const { id } = useParams<{ id: string }>();
  const { user, userProfile } = useAuth();
  const { toast } = useToast();

  const [startup, setStartup] = useState<Startup | null>(null);
  const [activities, setActivities] = useState<ActivityUpdate[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [galleryDialogOpen, setGalleryDialogOpen] = useState(false);
  const [newUpdate, setNewUpdate] = useState('');
  const [galleryPosts, setGalleryPosts] = useState<GalleryPost[]>([]);
  const [newGalleryPost, setNewGalleryPost] = useState({
    imageUrl: '',
    caption: '',
    type: 'design' as GalleryPost['type'],
  });
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    participationMode: 'single' as 'everyone' | 'single',
    deadline: '',
    xpReward: 50,
  });
  const [submitting, setSubmitting] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [selectedTaskDialogOpen, setSelectedTaskDialogOpen] = useState(false);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [announcementDialogOpen, setAnnouncementDialogOpen] = useState(false);

  useEffect(() => {
    if (!id) return;

    // Check for demo startup
    if (id.startsWith('demo-')) {
      setStartup(demoStartup);
      setActivities(demoActivities);
      setTasks(demoTasks);
      setLoading(false);
      return;
    }

    // Listen for real startup data
    const startupRef = ref(database, `startups/${id}`);
    const unsubStartup = onValue(startupRef, (snapshot) => {
      if (snapshot.exists()) {
        setStartup(snapshot.val());
      }
      setLoading(false);
    });

    const activitiesRef = ref(database, `activities/${id}`);
    const unsubActivities = onValue(activitiesRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        setActivities(Object.values(data) as ActivityUpdate[]);
      }
    });

    const tasksRef = ref(database, `tasks/${id}`);
    const unsubTasks = onValue(tasksRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        setTasks(Object.values(data) as Task[]);
      }
    });

    const galleryRef = ref(database, 'gallery');
    const unsubGallery = onValue(galleryRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const posts = Object.values(data) as GalleryPost[];
        setGalleryPosts(posts.filter(p => p.startupId === id).sort((a, b) => b.createdAt - a.createdAt));
      }
    });

    const announcementsRef = ref(database, `announcements/${id}`);
    const unsubAnnouncements = onValue(announcementsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        setAnnouncements(Object.values(data) as Announcement[]);
      } else {
        setAnnouncements([]);
      }
    });

    return () => {
      unsubStartup();
      unsubActivities();
      unsubTasks();
      unsubGallery();
      unsubAnnouncements();
    };
  }, [id]);

  // Check if following
  const [isFollowing, setIsFollowing] = useState(false);
  useEffect(() => {
    if (!user || !startup) return;
    const followRef = ref(database, `users/${user.uid}/followingStartups/${startup.id}`);
    onValue(followRef, (snapshot) => {
      setIsFollowing(snapshot.exists() && snapshot.val() === true);
    });
  }, [user, startup]);

  const handleFollow = async () => {
    if (!user || !startup) {
      toast({ title: 'Please sign in', description: 'You need to be signed in to follow startups' });
      return;
    }
    const followRef = ref(database, `users/${user.uid}/followingStartups/${startup.id}`);
    if (isFollowing) {
      await set(followRef, null);
      toast({ title: 'Unfollowed', description: `You stopped following ${startup.name}` });
    } else {
      await set(followRef, true);
      toast({ title: 'Following!', description: `You will get updates frame ${startup.name}` });
    }
  };

  const handlePostUpdate = async () => {
    if (!startup || !user || !userProfile || !newUpdate.trim()) return;
    if (startup.id.startsWith('demo-')) {
      toast({ title: 'Demo Mode', description: 'Sign in to post updates to real startups' });
      return;
    }

    setSubmitting(true);
    try {
      const activityRef = push(ref(database, `activities/${startup.id}`));
      await set(activityRef, {
        id: activityRef.key,
        startupId: startup.id,
        userId: user.uid,
        userName: userProfile.displayName,
        content: newUpdate,
        type: 'update',
        createdAt: Date.now(),
        isEditable: true,
      });

      // Update startup's lastActivityAt
      await update(ref(database, `startups/${startup.id}`), {
        lastActivityAt: Date.now(),
      });

      // Award XP for posting an update
      if (userProfile) {
        await awardXP(user.uid, 50, userProfile); // 50 XP for update
      }

      toast({ title: 'Update posted!', description: '+50 XP Earned' });
      setNewUpdate('');
      setUpdateDialogOpen(false);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to post update', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateTask = async () => {
    if (!startup || !user || !userProfile || !newTask.title.trim()) return;
    if (startup.id.startsWith('demo-')) {
      toast({ title: 'Demo Mode', description: 'Sign in to create tasks on real startups' });
      return;
    }

    setSubmitting(true);
    try {
      const taskRef = push(ref(database, `tasks/${startup.id}`));
      const deadlineTimestamp = newTask.deadline
        ? new Date(newTask.deadline).getTime()
        : undefined;

      await set(taskRef, {
        id: taskRef.key,
        startupId: startup.id,
        title: newTask.title,
        description: newTask.description,
        createdBy: user.uid,
        createdByName: userProfile.displayName,
        status: 'open',
        createdAt: Date.now(),
        submissions: [],
        priority: newTask.priority,
        participationMode: newTask.participationMode,
        deadline: deadlineTimestamp || null,
        xpReward: newTask.xpReward || 50,
        participants: [],
      });

      // Update startup task count
      await update(ref(database, `startups/${startup.id}`), {
        taskCount: (startup.taskCount || 0) + 1,
        lastActivityAt: Date.now(),
      });

      // Award XP for creating a task
      if (userProfile) {
        await awardXP(user.uid, 25, userProfile); // 25 XP for creating task
      }

      toast({ title: 'Task created!', description: '+25 XP Earned' });
      setNewTask({
        title: '',
        description: '',
        priority: 'medium',
        participationMode: 'single',
        deadline: '',
        xpReward: 50,
      });
      setTaskDialogOpen(false);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to create task', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleClaimTask = async (task: Task) => {
    if (!user || !userProfile) {
      toast({ title: 'Please sign in', description: 'You need to be signed in to claim tasks' });
      return;
    }
    if (task.id.startsWith('t')) {
      toast({ title: 'Demo Mode', description: 'Sign in to claim tasks on real startups' });
      return;
    }

    try {
      const updates: any = {};

      if (task.participationMode === 'everyone') {
        // Add user to participants if not already there
        if (!task.participants?.includes(user.uid)) {
          updates.participants = [...(task.participants || []), user.uid];
          updates.status = 'in_progress';
        } else {
          toast({ title: 'Already joined', description: 'You are already participating in this task' });
          return;
        }
      } else {
        updates.assignedTo = user.uid;
        updates.assignedToName = userProfile.displayName;
        updates.status = 'in_progress';
      }

      await update(ref(database, `tasks/${startup?.id}/${task.id}`), updates);
      toast({ title: 'Task claimed!', description: 'Good luck with your work!' });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to claim task', variant: 'destructive' });
    }
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setSelectedTaskDialogOpen(true);
  };

  const handlePostGallery = async () => {
    if (!startup || !user || !userProfile || !newGalleryPost.imageUrl || !newGalleryPost.caption) return;
    if (startup.id.startsWith('demo-')) {
      toast({ title: 'Demo Mode', description: 'Sign in to post visuals to real startups' });
      return;
    }

    setSubmitting(true);
    try {
      const galleryRef = push(ref(database, 'gallery'));
      const postId = galleryRef.key;

      const post: GalleryPost = {
        id: postId!,
        startupId: startup.id,
        startupName: startup.name,
        userId: user.uid,
        userName: userProfile.displayName,
        imageUrl: newGalleryPost.imageUrl,
        caption: newGalleryPost.caption,
        type: newGalleryPost.type,
        createdAt: Date.now(),
        pulseScoreIncrease: 20, // Incentive for visual proof
        views: 0,
        saves: 0,
      };

      await set(galleryRef, post);

      // Create an activity update for this gallery post
      const activityRef = push(ref(database, `activities/${startup.id}`));
      await set(activityRef, {
        id: activityRef.key,
        startupId: startup.id,
        userId: user.uid,
        userName: userProfile.displayName,
        content: `Posted a ${newGalleryPost.type} update to the gallery: ${newGalleryPost.caption}`,
        type: 'gallery_post',
        createdAt: Date.now(),
        isEditable: false,
        galleryPostId: postId,
      });

      // Update startup's lastActivityAt
      await update(ref(database, `startups/${startup.id}`), {
        lastActivityAt: Date.now(),
      });

      // Award XP for gallery post
      if (userProfile) {
        await awardXP(user.uid, 30, userProfile); // 30 XP for gallery post
      }

      toast({ title: 'Visual proof posted!', description: '+20 Pulse Score & 30 XP earned' });
      setNewGalleryPost({ imageUrl: '', caption: '', type: 'design' });
      setGalleryDialogOpen(false);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to post visual proof', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateAnnouncement = async (announcement: Omit<Announcement, 'id' | 'startupId' | 'userId' | 'userName' | 'createdAt'>) => {
    if (!startup || !user || !userProfile) return;
    if (startup.id.startsWith('demo-')) {
      toast({ title: 'Demo Mode', description: 'Sign in to create announcements' });
      return;
    }

    setSubmitting(true);
    try {
      const announcementRef = push(ref(database, `announcements/${startup.id}`));
      await set(announcementRef, {
        id: announcementRef.key,
        startupId: startup.id,
        userId: user.uid,
        userName: userProfile.displayName,
        createdAt: Date.now(),
        ...announcement,
        expiresAt: announcement.expiresAt || null,
      });

      // Bonus XP for creating announcements
      const activityRef = push(ref(database, `activities/${startup.id}`));
      await set(activityRef, {
        id: activityRef.key,
        startupId: startup.id,
        userId: user.uid,
        userName: userProfile.displayName,
        content: `📢 Announcement: ${announcement.title}`,
        type: 'update',
        createdAt: Date.now(),
        isEditable: false,
      });

      toast({ title: 'Announcement created!' });
      setAnnouncementDialogOpen(false);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to create announcement', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };



  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (!startup) {
    return <Navigate to="/discover" replace />;
  }

  const isContributor = user && (startup.founderId === user.uid || startup.contributors?.[user.uid]);
  const momentumInfo = getMomentumInfo(startup.momentum);

  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="container">
        {/* Back link */}
        <Link
          to="/discover"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Discover
        </Link>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Left Column - Startup Info */}
            <div className="space-y-6">
              <Card className="p-6 border-border/50 bg-card/50 backdrop-blur-sm sticky top-24">
                <div className="flex items-center justify-between mb-6">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium bg-${startup.momentum === 'green' ? 'momentum-green' : startup.momentum === 'yellow' ? 'momentum-yellow' : 'momentum-red'}/10 text-${startup.momentum === 'green' ? 'momentum-green' : startup.momentum === 'yellow' ? 'momentum-yellow' : 'momentum-red'}`}>
                    {startup.momentum ? startup.momentum.charAt(0).toUpperCase() + startup.momentum.slice(1) : 'Active'}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    Founded {new Date(startup.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="mb-6">
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">About</h3>
                  <p className="text-sm leading-relaxed text-foreground/90">
                    {startup.description}
                  </p>
                </div>

                <div className="mb-6">
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Team</h3>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8 border border-border">
                      <AvatarImage src={startup.founderId ? `https://api.dicebear.com/7.x/avataaars/svg?seed=${startup.founderId}` : undefined} />
                      <AvatarFallback>FN</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="text-sm font-medium">{startup.founderName}</div>
                      <div className="text-xs text-muted-foreground">Founder</div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-border/50 flex gap-2">
                  <Button
                    className={`w-full ${isFollowing ? 'bg-secondary text-secondary-foreground hover:bg-secondary/80' : 'bg-primary/10 text-primary hover:bg-primary/20 border-primary/20'}`}
                    onClick={handleFollow}
                    variant={isFollowing ? "secondary" : "default"}
                  >
                    {isFollowing ? 'Following' : 'Follow Updates'}
                  </Button>
                  <Button variant="outline" size="icon">
                    <Globe className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon">
                    <Twitter className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            </div>
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="font-display text-3xl font-bold">{startup.name}</h1>
                  <MomentumIndicator status={startup.momentum} />
                </div>
                <p className="text-lg text-muted-foreground mb-4">{startup.tagline}</p>

                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-xs">{startup.founderName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span>by {startup.founderName}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4" />
                    <span>Started {formatRelativeTime(startup.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users className="h-4 w-4" />
                    <span>{startup.contributorCount} contributors</span>
                  </div>
                </div>

                {/* Announcements Banner */}
                {announcements.length > 0 && (
                  <div className="mt-6">
                    <AnnouncementBanner announcements={announcements} />
                  </div>
                )}
              </div>

              {isContributor && (
                <div className="flex gap-2 flex-wrap">
                  <Dialog open={updateDialogOpen} onOpenChange={setUpdateDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Post Update
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Post an Update</DialogTitle>
                        <DialogDescription>
                          Share your progress. Updates are timestamped and become permanent after 5 minutes.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 pt-4">
                        <Textarea
                          placeholder="What progress have you made?"
                          value={newUpdate}
                          onChange={(e) => setNewUpdate(e.target.value)}
                          rows={4}
                        />
                        <Button onClick={handlePostUpdate} className="w-full" disabled={submitting}>
                          {submitting ? (
                            <div className="scale-50 h-4 flex items-center justify-center">
                              <Loader />
                            </div>
                          ) : (
                            <>
                              <Send className="h-4 w-4 mr-2" />
                              Post Update
                            </>
                          )}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Dialog open={taskDialogOpen} onOpenChange={setTaskDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Task
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Create a Task</DialogTitle>
                        <DialogDescription>
                          Post real work that contributors can claim and complete.
                          Add gamification elements like XP rewards and deadlines.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 pt-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="col-span-2 space-y-2">
                            <Label>Title</Label>
                            <Input
                              placeholder="Task title"
                              value={newTask.title}
                              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                            />
                          </div>
                          <div className="col-span-2 space-y-2">
                            <Label>Description</Label>
                            <Textarea
                              placeholder="Describe the work needed..."
                              value={newTask.description}
                              onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                              rows={3}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>Priority</Label>
                            <select
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                              value={newTask.priority}
                              onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as any })}
                            >
                              <option value="low">Low Priority</option>
                              <option value="medium">Medium Priority</option>
                              <option value="high">High Priority</option>
                              <option value="urgent">Urgent</option>
                            </select>
                          </div>

                          <div className="space-y-2">
                            <Label>XP Reward</Label>
                            <div className="flex items-center gap-2">
                              <Trophy className="h-4 w-4 text-momentum-yellow" />
                              <Input
                                type="number"
                                min={10}
                                max={1000}
                                value={newTask.xpReward}
                                onChange={(e) => setNewTask({ ...newTask, xpReward: parseInt(e.target.value) || 50 })}
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label>Participation Mode</Label>
                            <select
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                              value={newTask.participationMode}
                              onChange={(e) => setNewTask({ ...newTask, participationMode: e.target.value as any })}
                            >
                              <option value="single">Single (One person claims)</option>
                              <option value="everyone">Open (Everyone can submit)</option>
                            </select>
                          </div>

                          <div className="space-y-2">
                            <Label>Deadline (Optional)</Label>
                            <Input
                              type="datetime-local"
                              value={newTask.deadline}
                              onChange={(e) => setNewTask({ ...newTask, deadline: e.target.value })}
                            />
                          </div>
                        </div>

                        <Button onClick={handleCreateTask} className="w-full" disabled={submitting}>
                          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create Task'}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>

                  {user && startup.founderId === user.uid && (
                    <Button
                      variant="outline"
                      onClick={() => setAnnouncementDialogOpen(true)}
                      className="border-primary/50 text-primary hover:bg-primary/10"
                    >
                      <Megaphone className="h-4 w-4 mr-2" />
                      Announcement
                    </Button>
                  )}

                  <CreateAnnouncementDialog
                    open={announcementDialogOpen}
                    onOpenChange={setAnnouncementDialogOpen}
                    onCreateAnnouncement={handleCreateAnnouncement}
                    submitting={submitting}
                  />

                  <Dialog open={galleryDialogOpen} onOpenChange={setGalleryDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="border-primary/50 text-primary hover:bg-primary/10">
                        <Camera className="h-4 w-4 mr-2" />
                        Post Visual Proof
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Visual Proof of Progress</DialogTitle>
                        <DialogDescription>
                          Upload a screenshot, design mockup, or photo to show what you're building.
                          Visual proof builds trust faster.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 pt-4">
                        <div className="space-y-2">
                          <Label>Upload Image</Label>
                          <div className="flex flex-col gap-4">
                            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted border-muted-foreground/25 hover:border-primary/50 transition-colors">
                              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <ImageIcon className="w-8 h-8 mb-2 text-muted-foreground" />
                                <p className="text-sm text-muted-foreground">
                                  <span className="font-semibold">Click to upload</span> or drag and drop
                                </p>
                                <p className="text-xs text-muted-foreground/70">PNG, JPG or GIF</p>
                              </div>
                              <Input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    const reader = new FileReader();
                                    reader.onloadend = () => {
                                      setNewGalleryPost({ ...newGalleryPost, imageUrl: reader.result as string });
                                    };
                                    reader.readAsDataURL(file);
                                  }
                                }}
                              />
                            </label>

                            {newGalleryPost.imageUrl && (
                              <div className="relative rounded-lg overflow-hidden aspect-video border border-border">
                                <img src={newGalleryPost.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                                <Button
                                  variant="destructive"
                                  size="icon"
                                  className="absolute top-2 right-2 h-6 w-6"
                                  onClick={() => setNewGalleryPost({ ...newGalleryPost, imageUrl: '' })}
                                >
                                  <span className="sr-only">Remove</span>
                                  ×
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label>Caption</Label>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 text-xs text-primary hover:text-primary/80 gap-1"
                              onClick={async () => {
                                const caption = await generateCaption(userProfile?.role || 'builder');
                                setNewGalleryPost({ ...newGalleryPost, caption });
                              }}
                            >
                              <Sparkles className="h-3 w-3" />
                              Magic Caption
                            </Button>
                          </div>
                          <Textarea
                            placeholder="Tell the story behind this..."
                            value={newGalleryPost.caption}
                            onChange={(e) => setNewGalleryPost({ ...newGalleryPost, caption: e.target.value })}
                          />
                        </div>
                        <Button onClick={handlePostGallery} className="w-full" disabled={submitting}>
                          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Post to Gallery'}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              )}
            </div>
          </div> {/* Close Grid */}


          {
            startup.description && (
              <Card className="p-5 mt-6 bg-card border-border/50">
                <p className="text-muted-foreground leading-relaxed">{startup.description}</p>
              </Card>
            )
          }

          {/* Stalling Warning */}
          {
            startup.momentum === 'yellow' && (
              <div className="flex items-center gap-2 mt-4 p-3 rounded-lg bg-momentum-yellow/10 border border-momentum-yellow/20">
                <AlertTriangle className="h-4 w-4 text-momentum-yellow" />
                <span className="text-sm text-momentum-yellow">
                  Activity has slowed down. This startup may need attention.
                </span>
              </div>
            )
          }

          {
            startup.momentum === 'red' && (
              <div className="flex items-center gap-2 mt-4 p-3 rounded-lg bg-momentum-red/10 border border-momentum-red/20">
                <AlertTriangle className="h-4 w-4 text-momentum-red" />
                <span className="text-sm text-momentum-red">
                  This startup has been inactive for over a week. Proceed with caution.
                </span>
              </div>
            )
          }
        </motion.div >

        {/* Tabs */}
        < Tabs defaultValue="activity" className="mt-8" >
          <TabsList className="mb-6">
            <TabsTrigger value="activity" className="gap-2">
              <MessageSquare className="h-4 w-4" />
              Activity
            </TabsTrigger>
            <TabsTrigger value="tasks" className="gap-2">
              Tasks
              <Badge variant="secondary" className="ml-1 uppercase text-[10px]">{tasks.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="gallery" className="gap-2">
              <Camera className="h-4 w-4" />
              Gallery
              <Badge variant="secondary" className="ml-1 uppercase text-[10px]">{galleryPosts.length}</Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="activity">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <Card className="p-6 bg-card border-border/50">
                <h3 className="font-display font-semibold mb-4">Activity Feed</h3>
                <ActivityFeed activities={activities.sort((a, b) => b.createdAt - a.createdAt)} />
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="tasks">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <TaskBoard
                tasks={tasks}
                onTaskClick={handleTaskClick}
                onClaimTask={isContributor ? handleClaimTask : undefined}
                currentUserId={user?.uid}
              />
            </motion.div>
          </TabsContent>

          <TabsContent value="gallery">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="text-xl font-bold font-display">Proof Board</h3>
                  <p className="text-sm text-muted-foreground italic">Visual history of building</p>
                </div>
              </div>

              {galleryPosts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {galleryPosts.map((post, i) => (
                    <GalleryCard key={post.id} post={post} index={i} />
                  ))}
                </div>
              ) : (
                <Card className="p-12 text-center bg-card border-dashed border-2 border-border/50">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                    <Camera className="h-8 w-8 text-muted-foreground/50" />
                  </div>
                  <h4 className="text-lg font-bold mb-1">No visual proof yet</h4>
                  <p className="text-muted-foreground max-w-sm mx-auto">
                    Founders should post designs, architecture diagrams, or product screenshots to build trust.
                  </p>
                </Card>
              )}
            </motion.div>
          </TabsContent>
        </Tabs >

        {/* Task Detail Dialog */}
        <TaskDetailDialog
          task={selectedTask}
          open={selectedTaskDialogOpen}
          onOpenChange={setSelectedTaskDialogOpen}
          startupId={startup.id}
          isFounder={startup.founderId === user?.uid}
        />
      </div >
    </div >
  );
}
