import { useState, useEffect } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { ref, onValue, push, set, update } from 'firebase/database';
import { database } from '@/lib/firebase';
import { useAuth } from '@/hooks/useAuth';
import { Startup, Task, ActivityUpdate } from '@/types/momentum';
import { StartupCard } from '@/components/StartupCard';
import { ActivityFeed } from '@/components/ActivityFeed';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import {
  Plus,
  Rocket,
  Activity,
  CheckCircle,
  Star,
  TrendingUp,
  Loader2,
  AlertCircle
} from 'lucide-react';
import Loader from '@/components/Loader';
import FolderUpload from '@/components/FolderUpload';

export default function Dashboard() {
  const { user, userProfile, loading } = useAuth();
  const { toast } = useToast();
  const [myStartups, setMyStartups] = useState<Startup[]>([]);
  const [recentActivity, setRecentActivity] = useState<ActivityUpdate[]>([]);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newStartup, setNewStartup] = useState<{
    name: string;
    tagline: string;
    description: string;
    category: Startup['category'];
    imageUrl: string;
  }>({
    name: '',
    tagline: '',
    description: '',
    category: 'Other',
    imageUrl: ''
  });

  useEffect(() => {
    if (!user) return;

    // Listen for user's startups
    const startupsRef = ref(database, 'startups');
    const unsubscribe = onValue(startupsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const startups = Object.values(data) as Startup[];
        // Filter to show startups where user is founder or contributor
        const userStartups = startups.filter(
          s => s.founderId === user.uid || s.contributors?.[user.uid]
        );
        setMyStartups(userStartups);
      }
    });

    return () => unsubscribe();
  }, [user]);

  const handleCreateStartup = async () => {
    if (!user || !userProfile) return;
    if (!newStartup.name.trim() || !newStartup.tagline.trim()) {
      toast({ title: 'Error', description: 'Please fill in all required fields', variant: 'destructive' });
      return;
    }

    setCreating(true);
    console.log("Creating startup with user:", user.uid, userProfile.displayName);
    try {
      const startupsRef = ref(database, 'startups');
      const newRef = push(startupsRef);

      const startup: Startup = {
        id: newRef.key!,
        name: newStartup.name,
        tagline: newStartup.tagline,
        description: newStartup.description,
        founderId: user.uid,
        founderName: userProfile.displayName || 'Anonymous Founder',
        createdAt: Date.now(),
        momentum: 'green',
        lastActivityAt: Date.now(),
        contributorCount: 1,
        taskCount: 0,
        completedTaskCount: 0,
        isArchived: false,
        contributors: { [user.uid]: true },
        category: newStartup.category,
        imageUrl: newStartup.imageUrl || '', // Save image URL
      };

      console.log("Attempting to save startup:", startup);
      await set(newRef, startup);
      console.log("Startup saved successfully");

      // SYNC TO GLOBAL GALLERY FEED (projects node)
      // This ensures it appears in CyberGallery
      try {
        const globalRef = push(ref(database, 'projects'));
        await set(globalRef, {
          id: newRef.key!, // Link ID if possible, or new ID
          title: newStartup.name,
          description: newStartup.description || newStartup.tagline,
          link: '#', // TODO: Link to actual startup page
          imageUrl: newStartup.imageUrl || '',
          userId: user.uid,
          authorName: userProfile.displayName || 'Anonymous Founder',
          userPhoto: userProfile.photoURL || '',
          timestamp: Date.now()
        });
      } catch (galleryError) {
        console.error("Gallery sync failed:", galleryError);
      }

      // Create initial activity
      const activityRef = push(ref(database, `activities/${newRef.key}`));
      await set(activityRef, {
        id: activityRef.key,
        startupId: newRef.key,
        userId: user.uid,
        userName: userProfile.displayName || 'Anonymous Founder',
        content: `Launched ${newStartup.name} 🚀`,
        type: 'milestone',
        createdAt: Date.now(),
        isEditable: true,
      });

      // Update user's profile with the new startup
      const currentStartups = userProfile.startupsJoined || [];
      if (!currentStartups.includes(newRef.key!)) {
        await update(ref(database, `users/${user.uid}`), {
          startupsJoined: [...currentStartups, newRef.key!]
        });
      }

      toast({ title: 'Success!', description: 'Your startup has been created and listed in the Gallery.' });
      setCreateDialogOpen(false);
      setNewStartup({ name: '', tagline: '', description: '', category: 'Other', imageUrl: '' });
    } catch (error) {
      console.error("Startup Creation Error:", error);
      toast({ title: 'Error', description: `Failed to create startup: ${error instanceof Error ? error.message : 'Unknown error'}`, variant: 'destructive' });
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteStartup = async (startupId: string) => {
    if (!user) return;
    try {
      // 1. Remove from startups node
      await set(ref(database, `startups/${startupId}`), null);

      // 2. Remove from user's joined list (optional, but clean)
      if (userProfile && userProfile.startupsJoined) {
        const updatedList = userProfile.startupsJoined.filter(id => id !== startupId);
        await update(ref(database, `users/${user.uid}`), {
          startupsJoined: updatedList
        });
      }

      toast({ title: "Startup Removed", description: "The startup has been successfully deleted." });
    } catch (error: any) {
      console.error("Delete failed:", error);
      toast({ title: "Error", description: "Failed to delete startup.", variant: "destructive" });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="font-display text-3xl font-bold mb-1">
              Welcome back, {userProfile?.displayName?.split(' ')[0]}
            </h1>
            <p className="text-muted-foreground">
              Here's your momentum overview
            </p>
          </div>

          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="glow-primary">
                <Plus className="h-4 w-4 mr-2" />
                New Startup
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="font-display">Create a Startup</DialogTitle>
                <DialogDescription>
                  Launch your idea and start building momentum through real work.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    placeholder="Your startup name"
                    value={newStartup.name}
                    onChange={(e) => setNewStartup({ ...newStartup, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tagline">Tagline *</Label>
                  <Input
                    id="tagline"
                    placeholder="One line description"
                    value={newStartup.tagline}
                    onChange={(e) => setNewStartup({ ...newStartup, tagline: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={newStartup.category}
                    onValueChange={(value: any) => setNewStartup({ ...newStartup, category: value })}
                  >
                    <SelectTrigger className="w-full bg-background border-border/50">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {['AI', 'SaaS', 'Fintech', 'Healthtech', 'Edtech', 'E-commerce', 'Web3', 'Other'].map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Startup Visual</Label>
                  <FolderUpload
                    label="Upload Cover"
                    onFileSelect={(file) => {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setNewStartup({ ...newStartup, imageUrl: reader.result as string });
                        toast({ title: "Image uploaded", description: "Cover image ready." });
                      };
                      reader.readAsDataURL(file);
                    }}
                  />
                  {newStartup.imageUrl && <p className="text-xs text-green-500">Image loaded successfully</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Tell people what you're building..."
                    value={newStartup.description}
                    onChange={(e) => setNewStartup({ ...newStartup, description: e.target.value })}
                    rows={3}
                  />
                </div>
                <Button
                  onClick={handleCreateStartup}
                  className="w-full"
                  disabled={creating}
                >
                  {creating ? (
                    <div className="h-4 flex items-center justify-center scale-50">
                      <Loader />
                    </div>
                  ) : (
                    <>
                      <Rocket className="h-4 w-4 mr-2" />
                      Launch Startup
                    </>
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid gap-4 md:grid-cols-4 mb-8"
        >
          {[
            {
              label: 'Startups',
              value: myStartups.length,
              icon: Rocket,
              color: 'text-primary'
            },
            {
              label: 'Tasks Completed',
              value: userProfile?.tasksCompleted || 0,
              icon: CheckCircle,
              color: 'text-momentum-green'
            },
            {
              label: 'Reliability',
              value: `${userProfile?.reliabilityScore || 0}%`,
              icon: TrendingUp,
              color: 'text-momentum-yellow'
            },
            {
              label: 'Quality Score',
              value: userProfile?.qualityScore?.toFixed(1) || '0.0',
              icon: Star,
              color: 'text-primary'
            },
          ].map((stat, i) => (
            <Card key={stat.label} className="p-5 bg-card border-border/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="font-display text-2xl font-bold mt-1">{stat.value}</p>
                </div>
                <stat.icon className={`h-8 w-8 ${stat.color} opacity-50`} />
              </div>
            </Card>
          ))}
        </motion.div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* My Startups */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2"
          >
            <div className="flex items-center gap-2 mb-4">
              <Rocket className="h-5 w-5 text-primary" />
              <h2 className="font-display font-semibold text-lg">My Startups</h2>
            </div>

            {myStartups.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {myStartups.map((startup, i) => (
                  <StartupCard
                    key={startup.id}
                    startup={startup}
                    index={i}
                    onDelete={handleDeleteStartup}
                  />
                ))}
              </div>
            ) : (
              <Card className="p-8 text-center bg-card border-border/50">
                <Rocket className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                <h3 className="font-display font-medium mb-2">No startups yet</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Create your first startup or join an existing one
                </p>
                <div className="flex gap-2 justify-center">
                  <Button onClick={() => setCreateDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create
                  </Button>
                  <Link to="/discover">
                    <Button variant="outline">Explore</Button>
                  </Link>
                </div>
              </Card>
            )}
          </motion.div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center gap-2 mb-4">
              <Activity className="h-5 w-5 text-primary" />
              <h2 className="font-display font-semibold text-lg">Recent Activity</h2>
            </div>

            <Card className="p-5 bg-card border-border/50">
              {recentActivity.length > 0 ? (
                <ActivityFeed activities={recentActivity} />
              ) : (
                <div className="text-center py-8">
                  <Activity className="h-10 w-10 text-muted-foreground/50 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">
                    Activity from your startups will appear here
                  </p>
                </div>
              )}
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
