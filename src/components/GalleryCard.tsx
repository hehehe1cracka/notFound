import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Eye, Bookmark, Clock, Zap } from 'lucide-react';
import { GalleryPost } from '@/types/momentum';
import { formatRelativeTime } from '@/lib/momentum';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface GalleryCardProps {
    post: GalleryPost;
    onView?: () => void;
    onSave?: () => void;
    index?: number;
}

export function GalleryCard({ post, onView, onSave, index = 0 }: GalleryCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="group"
        >
            <Card className="overflow-hidden bg-card border-border/50 hover:border-primary/30 transition-all duration-300 shadow-lg hover:shadow-primary/5">
                {/* Image Container */}
                <div className="relative aspect-video overflow-hidden">
                    <img
                        src={post.imageUrl}
                        alt={post.caption}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

                    <div className="absolute top-3 left-3 flex gap-2">
                        <Badge variant="secondary" className="bg-black/60 backdrop-blur-md border-white/10 uppercase text-[10px] tracking-widest font-bold">
                            {post.type}
                        </Badge>
                        {post.pulseScoreIncrease > 0 && (
                            <Badge className="bg-primary/90 text-background border-none flex items-center gap-1 text-[10px] font-bold">
                                <Zap className="h-3 w-3 fill-current" />
                                +{post.pulseScoreIncrease} PULSE
                            </Badge>
                        )}
                    </div>
                </div>

                {/* Content */}
                <div className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-display text-xs text-primary border border-primary/20">
                                {(post.startupName || 'S').charAt(0)}
                            </div>
                            <span className="font-bold text-sm truncate max-w-[120px]">{post.startupName || 'Startup'}</span>
                        </div>
                        <span className="text-[10px] text-muted-foreground flex items-center gap-1 uppercase tracking-tighter">
                            <Clock className="h-3 w-3" />
                            {formatRelativeTime(post.createdAt || Date.now())}
                        </span>
                    </div>

                    <p className="text-sm text-muted-foreground line-clamp-2 min-h-[2.5rem]">
                        {post.caption}
                    </p>

                    <div className="pt-2 flex items-center justify-between border-t border-border/50">
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1.5 transition-colors hover:text-primary cursor-default">
                                <Eye className="h-3.5 w-3.5" />
                                {post.views}
                            </span>
                            <span className="flex items-center gap-1.5 transition-colors hover:text-primary cursor-default">
                                <Bookmark className="h-3.5 w-3.5" />
                                {post.saves}
                            </span>
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={onView}
                                className="p-1.5 rounded-md hover:bg-primary/10 hover:text-primary transition-colors"
                                title="Mark as Viewed"
                            >
                                <Eye className="h-4 w-4" />
                            </button>
                            <button
                                onClick={onSave}
                                className="p-1.5 rounded-md hover:bg-primary/10 hover:text-primary transition-colors"
                                title="Save for Review"
                            >
                                <Bookmark className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </Card>
        </motion.div>
    );
}
