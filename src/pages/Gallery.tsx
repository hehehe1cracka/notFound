import { useState, useEffect } from 'react';
import { ref, onValue, query, orderByChild } from 'firebase/database';
import { database } from '@/lib/firebase';
import { GalleryPost } from '@/types/momentum';
import { GalleryCard } from '@/components/GalleryCard';
import { motion, AnimatePresence } from 'framer-motion';
import { Image as ImageIcon, Sparkles, TrendingUp, Filter, Zap } from 'lucide-react';
import Loader from '@/components/Loader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const demoPosts: GalleryPost[] = [
    {
        id: 'post-1',
        startupId: 'demo-1',
        startupName: 'CodeFlow',
        userId: 'founder-1',
        userName: 'Sarah Chen',
        imageUrl: 'https://images.unsplash.com/photo-1542641728-6ca359b085f4?auto=format&fit=crop&q=80&w=800',
        caption: 'Implementing AI-powered suggestions for Java refactoring. Huge speed boost for legacy codebases.',
        type: 'tech',
        pulseScoreIncrease: 40,
        createdAt: Date.now() - 1000 * 60 * 60 * 2,
        views: 124,
        saves: 12
    },
    {
        id: 'post-2',
        startupId: 'demo-2',
        startupName: 'DevOps Hub',
        userId: 'founder-2',
        userName: 'Marcus Johnson',
        imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=800',
        caption: 'New infrastructure dashboard is live. Real-time monitoring across multiple clouds now active.',
        type: 'design',
        pulseScoreIncrease: 35,
        createdAt: Date.now() - 1000 * 60 * 60 * 5,
        views: 89,
        saves: 8
    },
    {
        id: 'post-3',
        startupId: 'demo-3',
        startupName: 'Metric Flow',
        userId: 'founder-3',
        userName: 'Emma Davis',
        imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800',
        caption: 'Privacy-first analytics engine passing 1k requests per second in stress tests.',
        type: 'tech',
        pulseScoreIncrease: 50,
        createdAt: Date.now() - 1000 * 60 * 60 * 24,
        views: 256,
        saves: 45
    }
];

export default function Gallery() {
    const [posts, setPosts] = useState<GalleryPost[]>(demoPosts);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filter, setFilter] = useState<'all' | 'design' | 'tech' | 'growth'>('all');

    // Generate a unique gradient based on text
    const generateGradient = (text: string) => {
        const colors = [
            ['#667eea', '#764ba2'], // Purple
            ['#f093fb', '#f5576c'], // Pink
            ['#4facfe', '#00f2fe'], // Blue
            ['#43e97b', '#38f9d7'], // Green
            ['#fa709a', '#fee140'], // Orange
            ['#30cfd0', '#330867'], // Teal
            ['#a8edea', '#fed6e3'], // Pastel
            ['#ff9a9e', '#fecfef'], // Rose
        ];
        const hash = text.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const colorPair = colors[hash % colors.length];
        return `linear-gradient(135deg, ${colorPair[0]} 0%, ${colorPair[1]} 100%)`;
    };

    useEffect(() => {
        // Fetch from 'projects' where we serve new uploads
        const projectsRef = ref(database, 'projects');
        const unsubscribe = onValue(projectsRef, (snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.val();
                const realPosts = Object.values(data).map((p: any) => ({
                    id: p.id,
                    startupId: p.id, // using project id as fallback
                    startupName: p.title,
                    userId: p.userId,
                    userName: p.authorName,
                    imageUrl: p.imageUrl || generateGradient(p.title || 'Project'),
                    caption: p.description,
                    type: 'tech', // Default to tech
                    pulseScoreIncrease: 10,
                    createdAt: p.timestamp || Date.now(),
                    views: 0,
                    saves: 0
                } as GalleryPost));
                setPosts([...realPosts.sort((a, b) => b.createdAt - a.createdAt), ...demoPosts]);
            } else {
                setPosts(demoPosts);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const filteredPosts = posts.filter(post => {
        const caption = post.caption || '';
        const startupName = post.startupName || 'Startup';
        const matchesSearch = caption.toLowerCase().includes(searchQuery.toLowerCase()) ||
            startupName.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = filter === 'all' || post.type === filter;
        return matchesSearch && matchesFilter;
    });

    return (
        <div className="min-h-screen pt-24 pb-16">
            <div className="container">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-12 relative overflow-hidden p-8 rounded-3xl bg-card border border-border/50"
                >
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                        <Sparkles className="h-24 w-24 text-primary" />
                    </div>
                    <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div className="space-y-4">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
                                <Zap className="h-4 w-4 text-primary" />
                                <span className="text-[10px] uppercase font-bold tracking-widest text-primary">Visual Progress Feed</span>
                            </div>
                            <h1 className="font-display text-4xl md:text-5xl font-bold">The Proof Board</h1>
                            <p className="text-muted-foreground max-w-xl">
                                Real visuals of real building. No filters, no hype—just progress.
                                Every image represents authentic momentum in the ecosystem.
                            </p>
                        </div>

                        <div className="flex items-center gap-4 bg-background/50 backdrop-blur-md p-2 rounded-2xl border border-border/50">
                            <div className="px-4 py-2 text-center">
                                <p className="text-2xl font-bold">{posts.length}</p>
                                <p className="text-[10px] text-muted-foreground uppercase">Updates</p>
                            </div>
                            <Separator orientation="vertical" className="h-8" />
                            <div className="px-4 py-2 text-center">
                                <p className="text-2xl font-bold text-primary">{posts.reduce((acc, p) => acc + p.pulseScoreIncrease, 0)}</p>
                                <p className="text-[10px] text-muted-foreground uppercase">Pulse Generated</p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Filters */}
                <div className="flex flex-col md:flex-row gap-4 mb-8">
                    <div className="relative flex-1">
                        <Input
                            placeholder="Search by startup or caption..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 h-11 bg-card/50 border-border/50 rounded-xl"
                        />
                        <ImageIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                        {(['all', 'design', 'tech', 'growth'] as const).map(f => (
                            <Button
                                key={f}
                                variant={filter === f ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setFilter(f)}
                                className={`rounded-full h-11 px-6 uppercase text-[10px] font-bold tracking-widest transition-all ${filter === f ? 'bg-primary text-background' : 'bg-card/50 border-border/50 text-muted-foreground hover:border-primary/50'
                                    }`}
                            >
                                {f}
                            </Button>
                        ))}
                    </div>
                </div>

                {/* Grid */}
                <AnimatePresence mode="popLayout">
                    {loading ? (
                        <div className="flex items-center justify-center py-24">
                            <Loader />
                        </div>
                    ) : filteredPosts.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredPosts.map((post, i) => (
                                <GalleryCard key={post.id} post={post} index={i} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-24 border-2 border-dashed border-border/50 rounded-3xl bg-card/20">
                            <ImageIcon className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                            <h3 className="text-xl font-bold mb-2">No visuals found</h3>
                            <p className="text-muted-foreground">Try adjusting your filters or search terms.</p>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

function Separator({ orientation = 'horizontal', className }: { orientation?: 'horizontal' | 'vertical', className?: string }) {
    return (
        <div className={`bg-border/50 ${orientation === 'horizontal' ? 'h-[1px] w-full' : 'w-[1px] h-full'} ${className}`} />
    )
}
