// Core types for Momentum platform

export type MomentumStatus = 'green' | 'yellow' | 'red';
export type UserRole = 'founder' | 'talent';

export interface User {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  phoneNumber?: string;
  createdAt: number;
  reliabilityScore: number;
  qualityScore: number;
  tasksCompleted: number;
  startupsJoined: string[];
  role?: UserRole;
  bio?: string;
  skills?: string[];
  interests?: string[];
  motivation?: string;
  pulseScore: number;
  badges: string[];
  level: number;
  xp: number;
  achievements: string[];
  streak: number;
  lastActiveDate?: number;
  location?: string;
  website?: string;
  twitter?: string;
  github?: string;
  linkedin?: string;
  projects?: Project[];
}

export interface Project {
  id: string;
  title: string;
  description: string;
  link: string;
  imageUrl?: string;
  createdAt: number;
}

export interface Startup {
  id: string;
  name: string;
  tagline: string;
  description: string;
  founderId: string;
  founderName: string;
  createdAt: number;
  momentum: MomentumStatus;
  lastActivityAt: number;
  contributorCount: number;
  taskCount: number;
  completedTaskCount: number;
  isArchived: boolean;
  contributors: Record<string, boolean>;
  category?: 'AI' | 'SaaS' | 'Fintech' | 'Healthtech' | 'Edtech' | 'E-commerce' | 'Web3' | 'Other';
  imageUrl?: string;
}

export interface GalleryPost {
  id: string;
  startupId: string;
  startupName: string;
  userId: string;
  userName: string;
  imageUrl: string;
  caption: string;
  type: 'design' | 'tech' | 'growth' | 'other';
  createdAt: number;
  pulseScoreIncrease: number;
  linkedUpdateId?: string;
  views: number;
  saves: number;
}

export interface ActivityUpdate {
  id: string;
  startupId: string;
  userId: string;
  userName: string;
  content: string;
  type: 'update' | 'milestone' | 'task_completed' | 'member_joined' | 'gallery_post';
  createdAt: number;
  isEditable: boolean; // Only editable within 5 minutes
  galleryPostId?: string;
}

export interface Task {
  id: string;
  startupId: string;
  title: string;
  description: string;
  createdBy: string;
  createdByName: string;
  assignedTo?: string;
  assignedToName?: string;
  status: 'open' | 'in_progress' | 'submitted' | 'completed' | 'overdue';
  createdAt: number;
  completedAt?: number;
  deadline?: number;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  submissions: TaskSubmission[];
  tags?: string[];
  xpReward?: number;
  participationMode?: 'everyone' | 'single'; // everyone = multiple people can submit, single = only one person can claim
  maxParticipants?: number; // For 'everyone' mode, limit number of participants
  participants?: string[]; // User IDs of people participating
}

export interface TaskSubmission {
  id: string;
  taskId: string;
  userId: string;
  userName: string;
  content: string;
  createdAt: number;
  reviewScore?: number;
  reviewComment?: string;
  attachments?: string[];
  status: 'pending' | 'approved' | 'rejected' | 'revision_requested';
}

export interface ChatMessage {
  id: string;
  contextType: 'startup' | 'task';
  contextId: string;
  userId: string;
  userName: string;
  content: string;
  createdAt: number;
}

export interface Announcement {
  id: string;
  startupId: string;
  userId: string;
  userName: string;
  title: string;
  content: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: number;
  isPinned: boolean;
  expiresAt?: number; // Optional expiration timestamp
}

// Momentum calculation thresholds
export const MOMENTUM_THRESHOLDS = {
  GREEN_DAYS: 3, // Active within last 3 days
  YELLOW_DAYS: 7, // Active within last 7 days
  MIN_WEEKLY_UPDATES: 2, // Minimum updates per week for green
  ARCHIVE_DAYS: 30, // Auto-archive after 30 days of inactivity
};

// Edit window for activity updates (5 minutes)
export const EDIT_WINDOW_MS = 5 * 60 * 1000;

// Gamification System
export const XP_LEVELS = [
  { level: 1, xpRequired: 0, title: 'Newcomer' },
  { level: 2, xpRequired: 100, title: 'Explorer' },
  { level: 3, xpRequired: 250, title: 'Builder' },
  { level: 4, xpRequired: 500, title: 'Contributor' },
  { level: 5, xpRequired: 1000, title: 'Innovator' },
  { level: 6, xpRequired: 2000, title: 'Leader' },
  { level: 7, xpRequired: 4000, title: 'Visionary' },
  { level: 8, xpRequired: 8000, title: 'Legend' },
  { level: 9, xpRequired: 15000, title: 'Master' },
  { level: 10, xpRequired: 30000, title: 'Titan' },
];

export const XP_REWARDS = {
  TASK_COMPLETED: 50,
  TASK_SUBMITTED: 25,
  STARTUP_CREATED: 100,
  GALLERY_POST: 30,
  MILESTONE_ACHIEVED: 75,
  DAILY_LOGIN: 10,
  STREAK_BONUS: 20, // Per day of streak
  PROBLEM_SOLVED: 75, // For solving a complex problem
  QUALITY_BONUS: 50, // Bonus for high-quality submissions
  SPEED_BONUS: 30, // Bonus for completing tasks quickly
  COLLABORATION_BONUS: 40, // Bonus for helping others
  ANNOUNCEMENT_CREATED: 20, // For creating important announcements
};

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  xpReward: number;
  condition: (user: User, startups?: Startup[]) => boolean;
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_startup',
    name: 'First Launch',
    description: 'Created your first startup',
    icon: '🚀',
    xpReward: 100,
    condition: (user) => user.startupsJoined.length >= 1,
  },
  {
    id: 'task_master',
    name: 'Task Master',
    description: 'Completed 10 tasks',
    icon: '✅',
    xpReward: 200,
    condition: (user) => user.tasksCompleted >= 10,
  },
  {
    id: 'week_warrior',
    name: 'Week Warrior',
    description: 'Maintained a 7-day streak',
    icon: '🔥',
    xpReward: 150,
    condition: (user) => user.streak >= 7,
  },
  {
    id: 'social_butterfly',
    name: 'Social Butterfly',
    description: 'Joined 3 different startups',
    icon: '🦋',
    xpReward: 150,
    condition: (user) => user.startupsJoined.length >= 3,
  },
  {
    id: 'quality_champion',
    name: 'Quality Champion',
    description: 'Achieved 90+ quality score',
    icon: '⭐',
    xpReward: 250,
    condition: (user) => user.qualityScore >= 90,
  },
  {
    id: 'reliable_builder',
    name: 'Reliable Builder',
    description: 'Achieved 95+ reliability score',
    icon: '🛡️',
    xpReward: 250,
    condition: (user) => user.reliabilityScore >= 95,
  },
  {
    id: 'momentum_keeper',
    name: 'Momentum Keeper',
    description: 'Maintained green momentum for 30 days',
    icon: '💚',
    xpReward: 300,
    condition: (user) => user.streak >= 30,
  },
];

export interface UserFilter {
  skills?: string[];
  role?: UserRole;
  minPulseScore?: number;
  minLevel?: number;
  location?: string;
  availability?: boolean;
}
