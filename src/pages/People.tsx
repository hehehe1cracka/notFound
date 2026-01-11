import { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { database } from '@/lib/firebase';
import { User, UserFilter } from '@/types/momentum';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { motion } from 'framer-motion';
import {
    Search,
    Filter,
    Users,
    MapPin,
    Star,
    TrendingUp,
    Trophy,
    Flame,
    Github,
    Twitter,
    Linkedin,
    Globe,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Loader from '@/components/Loader';
import CosmicSearch from '@/components/CosmicSearch';

export default function People() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState<UserFilter>({});
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        const usersRef = ref(database, 'users');
        const unsubscribe = onValue(usersRef, (snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.val();
                const usersList = Object.values(data) as User[];
                setUsers(usersList);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    // Filter users based on search and filters
    const filteredUsers = users.filter((user) => {
        // Search filter
        const matchesSearch =
            searchQuery === '' ||
            user.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.bio?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.skills?.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()));

        // Role filter
        const matchesRole = !filters.role || user.role === filters.role;

        // Skills filter
        const matchesSkills =
            !filters.skills ||
            filters.skills.length === 0 ||
            filters.skills.some(skill =>
                user.skills?.some(userSkill => userSkill.toLowerCase().includes(skill.toLowerCase()))
            );

        // Level filter
        const matchesLevel = !filters.minLevel || (user.level || 0) >= filters.minLevel;

        // Pulse score filter
        const matchesPulseScore =
            !filters.minPulseScore || (user.pulseScore || 0) >= filters.minPulseScore;

        // Location filter
        const matchesLocation =
            !filters.location ||
            user.location?.toLowerCase().includes(filters.location.toLowerCase());

        return (
            matchesSearch &&
            matchesRole &&
            matchesSkills &&
            matchesLevel &&
            matchesPulseScore &&
            matchesLocation
        );
    });

    // Sort by pulse score
    const sortedUsers = [...filteredUsers].sort((a, b) => (b.pulseScore || 0) - (a.pulseScore || 0));

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader />
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-24 pb-16">
            <div className="container">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-12"
                >
                    <div className="flex items-center gap-3 mb-2">
                        <Users className="h-6 w-6 text-primary" />
                        <h1 className="font-display text-3xl font-bold">Discover Talent</h1>
                    </div>
                    <p className="text-muted-foreground">
                        Find skilled builders, designers, and innovators to join your startup
                    </p>
                </motion.div>

                {/* Search and Filters */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="mb-8 space-y-4"
                >
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1">
                            {/* <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" /> */}
                            <div className="scale-75 origin-left -ml-10">
                                <CosmicSearch
                                    placeholder="Search by name, skills, or bio..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>
                        <Button
                            variant={showFilters ? 'default' : 'outline'}
                            onClick={() => setShowFilters(!showFilters)}
                        >
                            <Filter className="h-4 w-4 mr-2" />
                            Filters
                        </Button>
                    </div>

                    {/* Advanced Filters */}
                    {showFilters && (
                        <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Role</label>
                                    <Select
                                        value={filters.role || 'all'}
                                        onValueChange={(value) =>
                                            setFilters({ ...filters, role: value === 'all' ? undefined : (value as any) })
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="All Roles" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Roles</SelectItem>
                                            <SelectItem value="founder">Founders</SelectItem>
                                            <SelectItem value="talent">Talent</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Min Level</label>
                                    <Select
                                        value={filters.minLevel?.toString() || '0'}
                                        onValueChange={(value) =>
                                            setFilters({ ...filters, minLevel: parseInt(value) || undefined })
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Any Level" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="0">Any Level</SelectItem>
                                            <SelectItem value="3">Level 3+</SelectItem>
                                            <SelectItem value="5">Level 5+</SelectItem>
                                            <SelectItem value="7">Level 7+</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Min Pulse Score</label>
                                    <Select
                                        value={filters.minPulseScore?.toString() || '0'}
                                        onValueChange={(value) =>
                                            setFilters({ ...filters, minPulseScore: parseInt(value) || undefined })
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Any Score" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="0">Any Score</SelectItem>
                                            <SelectItem value="50">50+</SelectItem>
                                            <SelectItem value="100">100+</SelectItem>
                                            <SelectItem value="200">200+</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Location</label>
                                    <Input
                                        placeholder="City, Country"
                                        value={filters.location || ''}
                                        onChange={(e) =>
                                            setFilters({ ...filters, location: e.target.value || undefined })
                                        }
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 mt-4">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setFilters({})}
                                >
                                    Clear Filters
                                </Button>
                            </div>
                        </Card>
                    )}
                </motion.div>

                {/* Results Count */}
                <div className="mb-4 text-sm text-muted-foreground">
                    Found {sortedUsers.length} {sortedUsers.length === 1 ? 'person' : 'people'}
                </div>

                {/* User Grid */}
                {sortedUsers.length > 0 ? (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {sortedUsers.map((user, index) => (
                            <motion.div
                                key={user.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <Link to={`/profile/${user.id}`}>
                                    <Card className="p-6 hover:border-primary/50 transition-all duration-300 bg-card/50 backdrop-blur-sm h-full group">
                                        {/* User Header */}
                                        <div className="flex items-start gap-4 mb-4">
                                            <div className="relative">
                                                <Avatar className="h-16 w-16 border-2 border-primary/20 group-hover:border-primary transition-colors">
                                                    <AvatarImage src={user.photoURL} />
                                                    <AvatarFallback className="text-lg font-bold bg-muted">
                                                        {user.displayName?.charAt(0) || 'U'}
                                                    </AvatarFallback>
                                                </Avatar>
                                                {user.role === 'founder' && (
                                                    <Badge className="absolute -bottom-2 -right-2 px-1.5 py-0.5 text-[10px]" variant="secondary">FOUNDER</Badge>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-display font-bold text-lg truncate group-hover:text-primary transition-colors">
                                                    {user.displayName}
                                                </h3>
                                                <Badge variant="outline" className="text-xs uppercase mt-1 bg-background/50">
                                                    {user.role || 'talent'}
                                                </Badge>
                                            </div>
                                        </div>

                                        {/* Bio */}
                                        {user.bio && (
                                            <p className="text-sm text-muted-foreground mb-4 line-clamp-2 h-10">
                                                {user.bio}
                                            </p>
                                        )}

                                        {/* Stats */}
                                        <div className="grid grid-cols-2 gap-3 mb-4">
                                            <div className="flex items-center gap-2 text-sm">
                                                <Trophy className="h-4 w-4 text-primary" />
                                                <span className="font-semibold">Lvl {user.level || 1}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm">
                                                <Star className="h-4 w-4 text-yellow-500" />
                                                <span className="font-semibold">{user.pulseScore || 0}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm">
                                                <Flame className="h-4 w-4 text-orange-500" />
                                                <span className="font-semibold">{user.streak || 0} days</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm">
                                                <TrendingUp className="h-4 w-4 text-green-500" />
                                                <span className="font-semibold">{user.reliabilityScore || 0}%</span>
                                            </div>
                                        </div>

                                        {/* Location */}
                                        {user.location && (
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                                                <MapPin className="h-4 w-4" />
                                                <span>{user.location}</span>
                                            </div>
                                        )}

                                        {/* Skills */}
                                        {user.skills && user.skills.length > 0 && (
                                            <div className="flex flex-wrap gap-2 mb-4">
                                                {user.skills.slice(0, 3).map((skill) => (
                                                    <Badge key={skill} variant="secondary" className="text-xs bg-muted/50">
                                                        {skill}
                                                    </Badge>
                                                ))}
                                                {user.skills.length > 3 && (
                                                    <Badge variant="outline" className="text-xs">
                                                        +{user.skills.length - 3}
                                                    </Badge>
                                                )}
                                            </div>
                                        )}

                                        <div className="mt-auto pt-4 border-t border-border/50 text-center text-sm text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                                            View Profile
                                        </div>
                                    </Card>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-16"
                    >
                        <Users className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                        <h3 className="font-display text-lg font-medium mb-2">No people found</h3>
                        <p className="text-muted-foreground text-sm">
                            Try adjusting your search or filters
                        </p>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
