import { useRef, useState, useEffect } from 'react';
import { ref, update, push, set, onValue } from 'firebase/database';
import { database } from '@/lib/firebase';
import { User, Project } from '@/types/momentum';
import ProjectCard from '@/components/ProjectCard';
import ProjectFolderCard from '@/components/ProjectFolderCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
    User as UserIcon,
    Mail,
    Briefcase,
    Award,
    Star,
    ShieldCheck,
    Calendar,
    Edit,
    Code2,
    Palette,
    Megaphone,
    BarChart,
    Globe,
    Sparkles,
    Share2,
    MapPin,
    Link as LinkIcon,
    Github,
    Twitter,
    Linkedin
} from 'lucide-react';
import { motion } from 'framer-motion';
import { formatRelativeTime } from '@/lib/momentum';
import { EditProfileDialog } from '@/components/EditProfileDialog';
import { GamificationPanel } from '@/components/GamificationPanel';
import FolderUpload from '@/components/FolderUpload';

export default function Profile() {
    const { user, userProfile } = useAuth();
    const { toast } = useToast();

    const [projects, setProjects] = useState<Project[]>([]);
    const [projectDialogOpen, setProjectDialogOpen] = useState(false);
    const [newProject, setNewProject] = useState<Partial<Project>>({
        title: '',
        description: '',
        link: '',
        imageUrl: '',
    });

    useEffect(() => {
        if (!user) return;
        const projectsRef = ref(database, `users/${user.uid}/projects`);
        onValue(projectsRef, (snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.val();
                setProjects(Object.values(data));
            } else {
                setProjects([]);
            }
        });
    }, [user]);

    const handleCreateProject = async () => {
        if (!user || !userProfile || !newProject.title || !newProject.link) return;

        try {
            const projectRef = push(ref(database, `users/${user.uid}/projects`));
            const project: Project = {
                id: projectRef.key!,
                title: newProject.title!,
                description: newProject.description || '',
                link: newProject.link!,
                imageUrl: newProject.imageUrl || '',
                createdAt: Date.now(),
            };

            await set(projectRef, project);

            // Also save to global projects feed for gallery
            try {
                const globalRef = push(ref(database, 'projects'));
                await set(globalRef, {
                    ...project,
                    userId: user.uid,
                    authorName: userProfile.displayName || 'Anonymous',
                    userPhoto: userProfile.photoURL || '',
                    timestamp: Date.now()
                });
            } catch (globalError) {
                console.error("Failed to add to global feed:", globalError);
                // We don't block the user operation if global feed fails (likely permission issues)
            }

            toast({ title: "Project Added!", description: "Your project is now live in your portfolio." });
            setProjectDialogOpen(false);
            setNewProject({ title: '', description: '', link: '', imageUrl: '' });
        } catch (e: any) {
            console.error(e);
            toast({ title: "Upload Error", description: e.message || "Failed to upload project.", variant: "destructive" });
        }
    };

    const handleDeleteProject = async (projectId: string) => {
        if (!user) return;
        try {
            await set(ref(database, `users/${user.uid}/projects/${projectId}`), null);
            toast({ title: "Project deleted", description: "The project has been removed from your portfolio." });
        } catch (error) {
            console.error(error);
            toast({ title: "Error", description: "Failed to delete project.", variant: "destructive" });
        }
    };

    if (!user || !userProfile) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-2">Please Sign In</h2>
                    <p className="text-muted-foreground">You need to be logged in to view your profile.</p>
                </div>
            </div>
        );
    }

    // Calculate some dummy stats based on profile data
    const reputationScore = 98; // Placeholder
    const memberSince = user.metadata.creationTime ? new Date(user.metadata.creationTime).getTime() : Date.now();

    return (
        <div className="min-h-screen pt-24 pb-16 px-4">
            <div className="container max-w-4xl mx-auto space-y-8">

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
                                <div className="absolute -inset-1 bg-gradient-to-br from-primary to-purple-500 rounded-full blur opacity-25 group-hover:opacity-50 transition-opacity" />
                                <Avatar className="h-32 w-32 border-4 border-background relative">
                                    <AvatarImage src={userProfile.photoURL} className="object-cover" />
                                    <AvatarFallback className="text-4xl font-display font-bold bg-muted">
                                        {userProfile.displayName?.charAt(0) || 'U'}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="absolute bottom-2 right-2 bg-background rounded-full p-1.5 border border-border shadow-sm">
                                    <ShieldCheck className="h-5 w-5 text-green-500 fill-green-500/20" />
                                </div>
                            </div>

                            {/* Info Section */}
                            <div className="flex-1 space-y-4">
                                <div className="flex flex-wrap items-start justify-between gap-4">
                                    <div>
                                        <h1 className="text-3xl font-display font-bold mb-1">{userProfile.displayName}</h1>
                                        <div className="flex items-center gap-3 text-muted-foreground">
                                            <span className="flex items-center gap-1.5 text-sm">
                                                <UserIcon className="h-3.5 w-3.5" />
                                                @{userProfile.email?.split('@')[0]}
                                            </span>
                                            <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                                            <Badge variant="secondary" className="uppercase text-[10px] tracking-wider font-semibold">
                                                {userProfile.role}
                                            </Badge>
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        <EditProfileDialog />
                                        <Button variant="ghost" size="icon">
                                            <Share2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>

                                <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground">
                                    <p>{userProfile.bio || "No bio added yet. Tell the world what you're building!"}</p>
                                </div>

                                {/* Location and Social Links */}
                                <div className="flex flex-wrap gap-3 pt-2">
                                    {userProfile.location && (
                                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                            <MapPin className="h-3.5 w-3.5" />
                                            <span>{userProfile.location}</span>
                                        </div>
                                    )}
                                    {userProfile.website && (
                                        <a
                                            href={userProfile.website}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
                                        >
                                            <LinkIcon className="h-3.5 w-3.5" />
                                            <span>Website</span>
                                        </a>
                                    )}
                                    {userProfile.github && (
                                        <a
                                            href={`https://github.com/${userProfile.github}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
                                        >
                                            <Github className="h-3.5 w-3.5" />
                                            <span>GitHub</span>
                                        </a>
                                    )}
                                    {userProfile.twitter && (
                                        <a
                                            href={`https://twitter.com/${userProfile.twitter.replace('@', '')}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
                                        >
                                            <Twitter className="h-3.5 w-3.5" />
                                            <span>Twitter</span>
                                        </a>
                                    )}
                                    {userProfile.linkedin && (
                                        <a
                                            href={`https://linkedin.com/in/${userProfile.linkedin}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
                                        >
                                            <Linkedin className="h-3.5 w-3.5" />
                                            <span>LinkedIn</span>
                                        </a>
                                    )}
                                </div>

                                <div className="flex flex-wrap gap-4 pt-2">
                                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20 text-primary">
                                        <Star className="h-4 w-4 fill-primary/20" />
                                        <span className="font-bold">{reputationScore}</span>
                                        <span className="text-xs opacity-70 uppercase font-semibold tracking-wider">Reputation</span>
                                    </div>

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
                                {userProfile.skills && userProfile.skills.length > 0 ? (
                                    <div className="flex flex-wrap gap-2">
                                        {userProfile.skills.map(skill => (
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
                                    "{userProfile.motivation || 'I am here to build something great.'}"
                                </p>
                            </Card>
                        </div>

                        {/* Portfolio / Projects Folder UI */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-display font-semibold flex items-center gap-2">
                                    <Briefcase className="h-5 w-5 text-amber-500" />
                                    Projects
                                </h3>
                                <Dialog open={projectDialogOpen} onOpenChange={setProjectDialogOpen}>
                                    <DialogTrigger asChild>
                                        <Button variant="outline" size="sm" className="gap-2">
                                            <Edit className="h-4 w-4" />
                                            Add Project
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Add New Project</DialogTitle>
                                        </DialogHeader>
                                        <div className="space-y-4 py-4">
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">Project Name</label>
                                                <Input
                                                    value={newProject.title}
                                                    onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                                                    placeholder="e.g. Neural Link 2.0"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">Website Link</label>
                                                <Input
                                                    value={newProject.link}
                                                    onChange={(e) => setNewProject({ ...newProject, link: e.target.value })}
                                                    placeholder="https://..."
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">Project Image</label>
                                                <div className="flex flex-col gap-2">
                                                    <Input
                                                        value={newProject.imageUrl}
                                                        onChange={(e) => setNewProject({ ...newProject, imageUrl: e.target.value })}
                                                        placeholder="Image URL (or upload below)"
                                                    />
                                                    <FolderUpload
                                                        label="Upload Cover"
                                                        onFileSelect={(file) => {
                                                            // Convert to Base64 for persistence
                                                            const reader = new FileReader();
                                                            reader.onloadend = () => {
                                                                const base64String = reader.result as string;
                                                                setNewProject({ ...newProject, imageUrl: base64String });
                                                                toast({ title: "Image uploaded", description: "Visual ready for launch." });
                                                            };
                                                            reader.readAsDataURL(file);
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">Description</label>
                                                <Textarea
                                                    value={newProject.description}
                                                    onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                                                    placeholder="What are you building? Pitch it here..."
                                                />
                                            </div>
                                            <Button onClick={handleCreateProject} className="w-full">Add Project</Button>
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            </div>

                            {projects.length === 0 ? (
                                <Card className="p-8 bg-card/30 border-border/50 flex flex-col items-center justify-center text-center gap-4 border-dashed">
                                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                                        <Briefcase className="h-8 w-8 text-muted-foreground/50" />
                                    </div>
                                    <div>
                                        <h4 className="font-medium">No projects launched</h4>
                                        <p className="text-sm text-muted-foreground max-w-xs mx-auto mt-1">
                                            Showcase your best work to build momentum.
                                        </p>
                                    </div>
                                </Card>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-8 place-items-center mt-8">
                                    {projects.map((project) => (
                                        <div key={project.id} className="w-full h-[320px] flex items-center justify-center">
                                            <ProjectFolderCard
                                                project={project}
                                                onDelete={handleDeleteProject}
                                            />
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
                        <GamificationPanel user={userProfile} />
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
