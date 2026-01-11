import { useState, useEffect } from 'react';
import { ref, onValue, query, orderByChild } from 'firebase/database';
import { database } from '@/lib/firebase';
import { Startup } from '@/types/momentum';
import { StartupCard } from '@/components/StartupCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Search, Filter, TrendingUp, Zap } from 'lucide-react';
import Loader from '@/components/Loader';

// Demo data for showcasing the platform
const demoStartups: Startup[] = [
  {
    id: 'demo-1',
    name: 'CodeFlow',
    tagline: 'AI-powered code review for faster shipping',
    description: 'Automating the code review process with intelligent suggestions',
    founderId: 'founder-1',
    founderName: 'Sarah Chen',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 2,
    momentum: 'green',
    lastActivityAt: Date.now() - 1000 * 60 * 30,
    contributorCount: 5,
    taskCount: 12,
    completedTaskCount: 8,
    isArchived: false,
    contributors: {},
    category: 'AI',
  },
  {
    id: 'demo-2',
    name: 'DevOps Hub',
    tagline: 'Unified dashboard for all your infrastructure',
    description: 'Monitor, deploy, and manage your entire stack in one place',
    founderId: 'founder-2',
    founderName: 'Marcus Johnson',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 5,
    momentum: 'green',
    lastActivityAt: Date.now() - 1000 * 60 * 60 * 2,
    contributorCount: 8,
    taskCount: 24,
    completedTaskCount: 19,
    isArchived: false,
    contributors: {},
    category: 'SaaS',
  },
  {
    id: 'demo-3',
    name: 'Metric Flow',
    tagline: 'Real-time analytics for indie hackers',
    description: 'Simple, privacy-focused analytics that just works',
    founderId: 'founder-3',
    founderName: 'Emma Davis',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 8,
    momentum: 'yellow',
    lastActivityAt: Date.now() - 1000 * 60 * 60 * 24 * 4,
    contributorCount: 3,
    taskCount: 8,
    completedTaskCount: 4,
    isArchived: false,
    contributors: {},
    category: 'SaaS',
  },
  {
    id: 'demo-4',
    name: 'TaskPilot',
    tagline: 'AI task management for remote teams',
    description: 'Intelligent task prioritization and team coordination',
    founderId: 'founder-4',
    founderName: 'Alex Rivera',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 15,
    momentum: 'yellow',
    lastActivityAt: Date.now() - 1000 * 60 * 60 * 24 * 5,
    contributorCount: 2,
    taskCount: 6,
    completedTaskCount: 2,
    isArchived: false,
    contributors: {},
    category: 'AI',
  },
  {
    id: 'demo-5',
    name: 'CloudSync Pro',
    tagline: 'Seamless file sync across all devices',
    description: 'Enterprise-grade file synchronization made simple',
    founderId: 'founder-5',
    founderName: 'Jordan Lee',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 30,
    momentum: 'red',
    lastActivityAt: Date.now() - 1000 * 60 * 60 * 24 * 12,
    contributorCount: 1,
    taskCount: 4,
    completedTaskCount: 1,
    isArchived: false,
    contributors: {},
    category: 'SaaS',
  },
];

export default function Discover() {
  const [startups, setStartups] = useState<Startup[]>(demoStartups);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'green' | 'yellow' | 'red'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');

  useEffect(() => {
    // Listen for real startups from Firebase
    const startupsRef = ref(database, 'startups');
    const unsubscribe = onValue(startupsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const realStartups = Object.values(data) as Startup[];
        // Combine with demo data, prioritizing real startups
        setStartups([...realStartups.filter(s => !s.isArchived), ...demoStartups]);
      }
    });

    return () => unsubscribe();
  }, []);

  // Sort by momentum (green first, then yellow, then red)
  const sortedStartups = [...startups].sort((a, b) => {
    const order: Record<string, number> = { green: 0, yellow: 1, red: 2 };
    const aMomentum = a.momentum || 'red';
    const bMomentum = b.momentum || 'red';
    const aOrder = order[aMomentum] ?? 3;
    const bOrder = order[bMomentum] ?? 3;
    return aOrder - bOrder;
  });

  // Filter startups
  const filteredStartups = sortedStartups.filter((startup) => {
    const matchesSearch =
      startup.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      startup.tagline.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filter === 'all' || startup.momentum === filter;
    const matchesCategory = categoryFilter === 'All' || startup.category === categoryFilter;
    return matchesSearch && matchesFilter && matchesCategory;
  });

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="h-6 w-6 text-primary" />
            <h1 className="font-display text-3xl font-bold">Discover</h1>
          </div>
          <p className="text-muted-foreground">
            Find startups building with real momentum. Sorted by activity, not hype.
          </p>
        </motion.div>

        {/* Search and Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col sm:flex-row gap-4 mb-8"
        >
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search startups..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
            <div className="flex gap-1">
              {(['all', 'green', 'yellow', 'red'] as const).map((f) => (
                <Button
                  key={f}
                  variant={filter === f ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setFilter(f)}
                  className={filter === f ? '' : 'text-muted-foreground'}
                >
                  {f === 'all' ? 'All Momentum' : f.charAt(0).toUpperCase() + f.slice(1)}
                  {f !== 'all' && (
                    <span className={`ml-1.5 w-2 h-2 rounded-full momentum-dot-${f}`} />
                  )}
                </Button>
              ))}
            </div>
            <div className="h-4 w-[1px] bg-border mx-2 shrink-0" />
            <div className="flex gap-1">
              {['All', 'AI', 'SaaS', 'Fintech', 'Healthtech', 'Edtech', 'E-commerce', 'Web3', 'Other'].map((cat) => (
                <Button
                  key={cat}
                  variant={categoryFilter === cat ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCategoryFilter(cat)}
                  className={categoryFilter === cat ? 'bg-primary/20 text-primary border-primary/50' : 'text-muted-foreground border-border/50'}
                >
                  {cat}
                </Button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Startup Grid */}
        {filteredStartups.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredStartups.map((startup, index) => (
              <StartupCard key={startup.id} startup={startup} index={index} />
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <Zap className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
            <h3 className="font-display text-lg font-medium mb-2">No startups found</h3>
            <p className="text-muted-foreground text-sm">
              Try adjusting your search or filters
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
