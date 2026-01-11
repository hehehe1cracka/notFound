import { User, XP_LEVELS, ACHIEVEMENTS, Achievement } from '@/types/momentum';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { motion } from 'framer-motion';
import { Trophy, Star, Flame, TrendingUp, Award, Lock } from 'lucide-react';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';

interface GamificationPanelProps {
    user: User;
}

export function GamificationPanel({ user }: GamificationPanelProps) {
    // Calculate current level and progress
    const currentLevel = XP_LEVELS.find(
        (level, index) =>
            user.xp >= level.xpRequired &&
            (index === XP_LEVELS.length - 1 || user.xp < XP_LEVELS[index + 1].xpRequired)
    ) || XP_LEVELS[0];

    const nextLevel = XP_LEVELS.find(level => level.xpRequired > user.xp);
    const progressToNextLevel = nextLevel
        ? ((user.xp - currentLevel.xpRequired) / (nextLevel.xpRequired - currentLevel.xpRequired)) * 100
        : 100;

    // Check which achievements are unlocked
    const unlockedAchievements = ACHIEVEMENTS.filter(achievement =>
        user.achievements?.includes(achievement.id)
    );

    const lockedAchievements = ACHIEVEMENTS.filter(
        achievement => !user.achievements?.includes(achievement.id)
    );

    return (
        <div className="space-y-6">
            {/* Level & XP Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <Card className="p-6 bg-gradient-to-br from-primary/10 via-purple-500/5 to-transparent border-primary/20">
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <Trophy className="h-5 w-5 text-primary" />
                                <h3 className="font-display font-bold text-xl">Level {currentLevel.level}</h3>
                            </div>
                            <p className="text-sm text-muted-foreground">{currentLevel.title}</p>
                        </div>
                        <Badge variant="secondary" className="text-lg font-mono">
                            {user.xp.toLocaleString()} XP
                        </Badge>
                    </div>

                    {nextLevel && (
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Progress to Level {nextLevel.level}</span>
                                <span className="font-semibold">
                                    {user.xp - currentLevel.xpRequired} / {nextLevel.xpRequired - currentLevel.xpRequired} XP
                                </span>
                            </div>
                            <Progress value={progressToNextLevel} className="h-2" />
                        </div>
                    )}
                </Card>
            </motion.div>

            {/* Streak Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
            >
                <Card className="p-6 bg-gradient-to-br from-orange-500/10 to-transparent border-orange-500/20">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-orange-500/20 rounded-full">
                                <Flame className="h-6 w-6 text-orange-500" />
                            </div>
                            <div>
                                <h4 className="font-bold text-lg">{user.streak || 0} Day Streak</h4>
                                <p className="text-sm text-muted-foreground">Keep building daily!</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-2xl font-bold text-orange-500">{user.streak || 0}🔥</p>
                        </div>
                    </div>
                </Card>
            </motion.div>

            {/* Stats Grid */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="grid grid-cols-2 gap-4"
            >
                <Card className="p-4 text-center">
                    <Star className="h-5 w-5 text-yellow-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold">{user.pulseScore || 0}</p>
                    <p className="text-xs text-muted-foreground">Pulse Score</p>
                </Card>

                <Card className="p-4 text-center">
                    <TrendingUp className="h-5 w-5 text-green-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold">{user.reliabilityScore || 0}%</p>
                    <p className="text-xs text-muted-foreground">Reliability</p>
                </Card>

                <Card className="p-4 text-center">
                    <Award className="h-5 w-5 text-blue-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold">{user.tasksCompleted || 0}</p>
                    <p className="text-xs text-muted-foreground">Tasks Done</p>
                </Card>

                <Card className="p-4 text-center">
                    <Trophy className="h-5 w-5 text-purple-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold">{unlockedAchievements.length}</p>
                    <p className="text-xs text-muted-foreground">Achievements</p>
                </Card>
            </motion.div>

            {/* Achievements */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
            >
                <h3 className="font-display font-semibold text-lg mb-4 flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-primary" />
                    Achievements
                </h3>

                <div className="space-y-4">
                    {/* Unlocked Achievements */}
                    {unlockedAchievements.length > 0 && (
                        <div>
                            <p className="text-sm text-muted-foreground mb-3">Unlocked</p>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {unlockedAchievements.map((achievement) => (
                                    <TooltipProvider key={achievement.id}>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Card className="p-4 text-center cursor-pointer hover:border-primary/50 transition-colors bg-gradient-to-br from-primary/5 to-transparent">
                                                    <div className="text-3xl mb-2">{achievement.icon}</div>
                                                    <p className="font-semibold text-sm">{achievement.name}</p>
                                                    <Badge variant="secondary" className="mt-2 text-xs">
                                                        +{achievement.xpReward} XP
                                                    </Badge>
                                                </Card>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p className="font-semibold">{achievement.name}</p>
                                                <p className="text-sm text-muted-foreground">{achievement.description}</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Locked Achievements */}
                    {lockedAchievements.length > 0 && (
                        <div>
                            <p className="text-sm text-muted-foreground mb-3">Locked</p>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {lockedAchievements.slice(0, 6).map((achievement) => (
                                    <TooltipProvider key={achievement.id}>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Card className="p-4 text-center cursor-pointer opacity-50 hover:opacity-70 transition-opacity">
                                                    <div className="relative">
                                                        <div className="text-3xl mb-2 filter grayscale">{achievement.icon}</div>
                                                        <Lock className="h-4 w-4 absolute top-0 right-0 text-muted-foreground" />
                                                    </div>
                                                    <p className="font-semibold text-sm text-muted-foreground">{achievement.name}</p>
                                                    <Badge variant="outline" className="mt-2 text-xs">
                                                        +{achievement.xpReward} XP
                                                    </Badge>
                                                </Card>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p className="font-semibold">{achievement.name}</p>
                                                <p className="text-sm text-muted-foreground">{achievement.description}</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
