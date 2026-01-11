import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ref, get, push, set, onValue } from 'firebase/database';
import { database } from '@/lib/firebase';
import { User, Project } from '@/types/momentum';
import { useAuth } from '@/hooks/useAuth';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { GamificationPanel } from '@/components/GamificationPanel';
import {
    User as UserIcon,
    MapPin,
    Link as LinkIcon,
    Github,
    Twitter,
    Linkedin,
    Star,
    Calendar,
    Code2,
    Sparkles,
    ArrowLeft,
    ShieldCheck,
    Briefcase
} from 'lucide-react';
import { motion } from 'framer-motion';
import { formatRelativeTime } from '@/lib/momentum';
import Loader from '@/components/Loader';
import ProjectCard from '@/components/ProjectCard';

export default function UserProfile() {
    const { userId } = useParams<{ userId: string }>();
    const { user: currentUser, userProfile: currentUserProfile } = useAuth();
    const [profileUser, setProfileUser] = useState<User | null>(null);
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!userId) return;

        const fetchUser = async () => {
            try {
                const userRef = ref(database, `users/${userId}`);
                const snapshot = await get(userRef);
                if (snapshot.exists()) {
                    setProfileUser(snapshot.val());

                    // Fetch projects
                    const projectsRef = ref(database, `users/${userId}/projects`);
                    const projectsSnapshot = await get(projectsRef);
                    if (projectsSnapshot.exists()) {
                        setProjects(Object.values(projectsSnapshot.val()));
                    } else {
                        setProjects([]);
                    }

                    // Log notification if current user is viewing someone else
                    if (currentUser && currentUser.uid !== userId) {
                        // Check if we haven't already logged a view recently (optional optimization, skipping for now to ensure reliability)
                        const notifRef = push(ref(database, `notifications/${userId}`));
                        await set(notifRef, {
                            id: notifRef.key,
                            type: 'profile_view',
                            fromUserId: currentUser.uid,
                            fromUserName: currentUserProfile?.displayName || 'Someone',
                            fromUserPhoto: currentUserProfile?.photoURL || '',
                            message: `${currentUserProfile?.displayName || 'Someone'} viewed your profile`,
                            createdAt: Date.now(),
                            read: false
                        });
                    }
                }
            } catch (error) {
                console.error("Error fetching user:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, [userId, currentUser, currentUserProfile]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader />
            </div>
        );
    }

    if (!profileUser) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4">
                <h2 className="text-2xl font-bold">User not found</h2>
                <Link to="/people">
                    <Button variant="outline">Back to People</Button>
                </Link>
            </div>
        );
    }

    const memberSince = profileUser.createdAt || Date.now();

    return (
        <div className="min-h-screen pt-24 pb-16 px-4">
            <div className="container max-w-4xl mx-auto space-y-8">
                <Link to="/people" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                    <ArrowLeft className="h-4 w-4" />
                    Back to People
                </Link>

                {/* Profile Header Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <Card className="p-8 relative overflow-hidden bg-card/50 backdrop-blur-sm border-border/50">
                        {/* Background Decoration */}
                        <div className="absolute top-0 right-0 p-16 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                        <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start">

                            {/* Avatar Section */}
                            <div className="flex-shrink-0 relative group">
                                <Avatar className="h-32 w-32 border-4 border-background relative">
                                    <AvatarImage src={profileUser.photoURL} className="object-cover" />
                                    <AvatarFallback className="text-4xl font-display font-bold bg-muted">
                                        {profileUser.displayName?.charAt(0) || 'U'}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="absolute bottom-2 right-2 bg-background rounded-full p-1.5 border border-border shadow-sm">
                                    <ShieldCheck className="h-5 w-5 text-green-500 fill-green-500/20" />
                                </div>
                            </div>

                            {/* Info Section */}
                            <div className="flex-1 space-y-4">
                                <div>
                                    <h1 className="text-3xl font-display font-bold mb-1">{profileUser.displayName}</h1>
                                    <div className="flex items-center gap-3 text-muted-foreground">
                                        <Badge variant="secondary" className="uppercase text-[10px] tracking-wider font-semibold">
                                            {profileUser.role || 'Talent'}
                                        </Badge>
                                        {profileUser.location && (
                                            <span className="flex items-center gap-1 text-sm">
                                                <MapPin className="h-3.5 w-3.5" />
                                                {profileUser.location}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground">
                                    <p>{profileUser.bio || "No bio added yet."}</p>
                                </div>

                                {/* Social Links */}
                                <div className="flex flex-wrap gap-3 pt-2">
                                    {profileUser.website && (
                                        <a href={profileUser.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors">
                                            <LinkIcon className="h-3.5 w-3.5" />
                                            <span>Website</span>
                                        </a>
                                    )}
                                    {profileUser.github && (
                                        <a href={`https://github.com/${profileUser.github}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors">
                                            <Github className="h-3.5 w-3.5" />
                                            <span>GitHub</span>
                                        </a>
                                    )}
                                    {profileUser.twitter && (
                                        <a href={`https://twitter.com/${profileUser.twitter.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors">
                                            <Twitter className="h-3.5 w-3.5" />
                                            <span>Twitter</span>
                                        </a>
                                    )}
                                    {profileUser.linkedin && (
                                        <a href={`https://linkedin.com/in/${profileUser.linkedin}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors">
                                            <Linkedin className="h-3.5 w-3.5" />
                                            <span>LinkedIn</span>
                                        </a>
                                    )}
                                </div>

                                <div className="flex flex-wrap gap-4 pt-2">
                                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50 border border-border">
                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm">Joined {formatRelativeTime(memberSince)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Detailed Info Column */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="md:col-span-2 space-y-8"
                    >
                        {/* Skills Card */}
                        <div className="space-y-4">
                            <h3 className="text-xl font-display font-semibold flex items-center gap-2">
                                <Code2 className="h-5 w-5 text-primary" />
                                Skills & Interests
                            </h3>
                            <Card className="p-6 bg-card/30 border-border/50">
                                {profileUser.skills && profileUser.skills.length > 0 ? (
                                    <div className="flex flex-wrap gap-2">
                                        {profileUser.skills.map(skill => (
                                            <div key={skill} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted border border-border text-sm">
                                                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                                                {skill}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-muted-foreground italic text-sm">No skills listed.</p>
                                )}
                            </Card>
                        </div>

                        {/* Motivation Card */}
                        <div className="space-y-4">
                            <h3 className="text-xl font-display font-semibold flex items-center gap-2">
                                <Sparkles className="h-5 w-5 text-purple-400" />
                                Motivation
                            </h3>
                            <Card className="p-6 bg-card/30 border-border/50 relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-12 bg-purple-500/5 rounded-full blur-2xl" />
                                <p className="relative z-10 italic text-muted-foreground leading-relaxed">
                                    "{profileUser.motivation || 'Building the future.'}"
                                </p>
                            </Card>
                        </div>

                        {/* Portfolio / Projects Folder UI */}
                        <div className="space-y-4">
                            <h3 className="text-xl font-display font-semibold flex items-center gap-2">
                                <Briefcase className="h-5 w-5 text-amber-500" />
                                Portfolio
                            </h3>

                            {projects.length === 0 ? (
                                <Card className="p-8 bg-card/30 border-border/50 flex flex-col items-center justify-center text-center gap-4 border-dashed">
                                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                                        <Briefcase className="h-8 w-8 text-muted-foreground/50" />
                                    </div>
                                    <div>
                                        <h4 className="font-medium">No projects yet</h4>
                                        <p className="text-sm text-muted-foreground max-w-xs mx-auto mt-1">
                                            This user hasn't added any projects yet.
                                        </p>
                                    </div>
                                </Card>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6 place-items-center">
                                    {projects.map((project) => (
                                        <div key={project.id} className="w-full h-[240px]">
                                            <ProjectCard project={project} />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>

                    {/* Sidebar Gamification Column */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="space-y-6"
                    >
                        <GamificationPanel user={profileUser} />
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
