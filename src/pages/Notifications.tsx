import { useEffect, useState } from 'react';
import { ref, onValue, update } from 'firebase/database';
import { database } from '@/lib/firebase';
import { useAuth } from '@/hooks/useAuth';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { motion } from 'framer-motion';
import { Bell, User, Clock } from 'lucide-react';
import { formatRelativeTime } from '@/lib/momentum';
import { Link } from 'react-router-dom';
import Loader from '@/components/Loader';

interface Notification {
    id: string;
    type: 'profile_view' | 'update' | 'other';
    fromUserId?: string;
    fromUserName?: string;
    fromUserPhoto?: string;
    message: string;
    createdAt: number;
    read: boolean;
}

export default function Notifications() {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
        const notifRef = ref(database, `notifications/${user.uid}`);

        const unsubscribe = onValue(notifRef, (snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.val();
                const list = Object.values(data) as Notification[];
                setNotifications(list.sort((a, b) => b.createdAt - a.createdAt));
            } else {
                setNotifications([]);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    // Mark all as read on mount (simplified logic)
    useEffect(() => {
        if (user && notifications.length > 0) {
            // In a real app we might want to mark individual ones or have a "mark all read" button
            // For now we just display them. 
        }
    }, [user, notifications]);

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center"><Loader /></div>;
    }

    return (
        <div className="min-h-screen pt-24 pb-16 px-4">
            <div className="container max-w-2xl mx-auto space-y-6">
                <div className="flex items-center gap-3 mb-8">
                    <Bell className="h-6 w-6 text-primary" />
                    <h1 className="font-display text-2xl font-bold">Notifications</h1>
                </div>

                {notifications.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                        <Bell className="h-12 w-12 mx-auto mb-4 opacity-20" />
                        <p>No notifications yet.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {notifications.map((notif, i) => (
                            <motion.div
                                key={notif.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                            >
                                <Card className="p-4 flex items-center gap-4 hover:border-primary/50 transition-colors bg-card/50 backdrop-blur-sm">
                                    <Avatar>
                                        <AvatarImage src={notif.fromUserPhoto} />
                                        <AvatarFallback><User className="h-4 w-4" /></AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                        <p className="text-sm">{notif.message}</p>
                                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                                            <Clock className="h-3 w-3" />
                                            {formatRelativeTime(notif.createdAt)}
                                        </div>
                                    </div>
                                    {notif.fromUserId && (
                                        <Link to={`/profile/${notif.fromUserId}`} className="text-xs text-primary hover:underline">
                                            View Profile
                                        </Link>
                                    )}
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
