import { User, XP_LEVELS, ACHIEVEMENTS, XP_REWARDS } from '@/types/momentum';
import { ref, update } from 'firebase/database';
import { database } from './firebase';

/**
 * Calculate user level based on XP
 */
export function calculateLevel(xp: number): number {
    for (let i = XP_LEVELS.length - 1; i >= 0; i--) {
        if (xp >= XP_LEVELS[i].xpRequired) {
            return XP_LEVELS[i].level;
        }
    }
    return 1;
}

/**
 * Get level title based on XP
 */
export function getLevelTitle(xp: number): string {
    const level = calculateLevel(xp);
    const levelData = XP_LEVELS.find(l => l.level === level);
    return levelData?.title || 'Newcomer';
}

/**
 * Award XP to a user and update their level
 */
export async function awardXP(userId: string, xpAmount: number, currentUser: User): Promise<void> {
    const newXP = (currentUser.xp || 0) + xpAmount;
    const newLevel = calculateLevel(newXP);
    const oldLevel = currentUser.level || 1;

    const updates: Partial<User> = {
        xp: newXP,
        level: newLevel,
    };

    // Check if user leveled up
    if (newLevel > oldLevel) {
        console.log(`User ${userId} leveled up to ${newLevel}!`);
    }

    await update(ref(database, `users/${userId}`), updates);
}

/**
 * Check and award achievements
 */
export async function checkAchievements(userId: string, user: User): Promise<string[]> {
    const newAchievements: string[] = [];
    const currentAchievements = user.achievements || [];

    for (const achievement of ACHIEVEMENTS) {
        // Skip if already unlocked
        if (currentAchievements.includes(achievement.id)) {
            continue;
        }

        // Check if condition is met
        if (achievement.condition(user)) {
            newAchievements.push(achievement.id);

            // Award XP for achievement
            await awardXP(userId, achievement.xpReward, user);
        }
    }

    if (newAchievements.length > 0) {
        await update(ref(database, `users/${userId}`), {
            achievements: [...currentAchievements, ...newAchievements],
        });
    }

    return newAchievements;
}

/**
 * Update user streak
 */
export async function updateStreak(userId: string, user: User): Promise<void> {
    const now = Date.now();
    const lastActive = user.lastActiveDate || 0;
    const oneDayMs = 24 * 60 * 60 * 1000;
    const timeSinceLastActive = now - lastActive;

    let newStreak = user.streak || 0;

    if (timeSinceLastActive < oneDayMs) {
        // Same day, no change
        return;
    } else if (timeSinceLastActive < 2 * oneDayMs) {
        // Next day, increment streak
        newStreak += 1;

        // Award streak bonus XP
        await awardXP(userId, XP_REWARDS.STREAK_BONUS, user);
    } else {
        // Streak broken
        newStreak = 1;
    }

    await update(ref(database, `users/${userId}`), {
        streak: newStreak,
        lastActiveDate: now,
    });

    // Award daily login XP
    await awardXP(userId, XP_REWARDS.DAILY_LOGIN, user);
}

/**
 * Award XP for task completion
 */
export async function awardTaskCompletionXP(userId: string, user: User, xpAmount?: number): Promise<void> {
    const amount = xpAmount || XP_REWARDS.TASK_COMPLETED;
    await awardXP(userId, amount, user);

    // Update tasks completed count
    await update(ref(database, `users/${userId}`), {
        tasksCompleted: (user.tasksCompleted || 0) + 1,
    });

    // Check for achievements
    await checkAchievements(userId, {
        ...user,
        tasksCompleted: (user.tasksCompleted || 0) + 1,
    });
}

/**
 * Award XP for task submission
 */
export async function awardTaskSubmissionXP(userId: string, user: User): Promise<void> {
    await awardXP(userId, XP_REWARDS.TASK_SUBMITTED, user);
}

/**
 * Award XP for creating a startup
 */
export async function awardStartupCreationXP(userId: string, user: User): Promise<void> {
    await awardXP(userId, XP_REWARDS.STARTUP_CREATED, user);

    // Check for achievements
    await checkAchievements(userId, user);
}

/**
 * Award XP for gallery post
 */
export async function awardGalleryPostXP(userId: string, user: User): Promise<void> {
    await awardXP(userId, XP_REWARDS.GALLERY_POST, user);
}

/**
 * Award XP for milestone
 */
export async function awardMilestoneXP(userId: string, user: User): Promise<void> {
    await awardXP(userId, XP_REWARDS.MILESTONE_ACHIEVED, user);
}
