import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import {
  Zap,
  Activity,
  Shield,
  Users,
  Eye,
  Play,
  CheckCircle
} from 'lucide-react';
import { CyberGallery } from '@/components/CyberGallery';
import { FlowerLoader } from '@/components/FlowerLoader';
import UiverseButton from '@/components/UiverseButton';
import UiverseCard from '@/components/UiverseCard';
import PricingCard from '@/components/PricingCard';
import Loader from '@/components/Loader'; // The new liquid loader
import ProjectCard from '@/components/ProjectCard'; // The new card design
import { Project } from '@/types/momentum';
import { Header } from '@/components/Header';
import { useAuth } from '@/hooks/useAuth';

export default function Index() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const demoProjects: Project[] = [
    { id: '1', title: '750k', description: 'Views', link: '#', createdAt: Date.now() },
    { id: '2', title: 'Startups', description: 'Launched', link: '#', createdAt: Date.now() },
    { id: '3', title: 'Momentum', description: 'Builders', link: '#', createdAt: Date.now() }
  ];

  const handleGetStarted = () => {
    if (user) {
      navigate('/people');
    } else {
      navigate('/people');
    }
  };

  const features = [
    {
      icon: Activity,
      title: 'Activity = Trust',
      description: 'Startups earn credibility through logged work, not pitch decks or promises.',
    },
    {
      icon: Shield,
      title: 'Immutable History',
      description: 'Progress updates are timestamped and locked. No editing history to fake momentum.',
    },
    {
      icon: Users,
      title: 'Work-Based Reputation',
      description: 'Contributors earn scores from completed tasks and reviews—not followers or likes.',
    },
    {
      icon: Eye,
      title: 'Founder Detection',
      description: 'Silent founders get flagged. Contributors are warned when startups stall.',
    },
  ];

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <Header />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/10 rounded-full blur-3xl opacity-30" />

        <div className="container relative z-10 pt-12 pb-16 flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto w-full"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border/50 bg-card/50 backdrop-blur-sm mb-8">
              <span className="w-2 h-2 rounded-full bg-momentum-green animate-pulse" />
              <span className="text-sm text-muted-foreground font-medium">
                Where work speaks louder than hype
              </span>
            </div>

            <h1 className="font-display text-5xl md:text-7xl font-bold tracking-tight mb-6">
              Build with{' '}
              <span className="text-gradient">real momentum</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
              A startup platform where credibility is earned through activity, not followers.
              Every update is logged. Every task is tracked. Momentum can't be faked.
            </p>

            <div className="flex flex-col items-center justify-center gap-8 mb-16">
              {/* Replaced Button with Loader as requested */}
              <div className="relative group cursor-pointer" onClick={handleGetStarted}>
                <Loader />
                <span className="absolute -bottom-10 left-1/2 -translate-x-1/2 text-sm font-medium opacity-50 group-hover:opacity-100 transition-opacity whitespace-nowrap text-primary">
                  Enter the Cosmos
                </span>
              </div>
            </div>

            {/* Stats - Restored */}
            <div className="flex items-center justify-center gap-6 md:gap-12 mt-8 flex-wrap">
              {[
                { value: '100%', label: 'Transparent' },
                { value: '0', label: 'Fake metrics' },
                { value: '∞', label: 'Real work' },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + i * 0.1 }}
                >
                  <UiverseCard className="w-40 h-40 md:w-48 md:h-48 flex items-center justify-center text-center">
                    <div className="font-display text-2xl md:text-3xl font-bold text-white z-10">
                      {stat.value}
                    </div>
                    <div className="text-xs md:text-sm text-gray-300 mt-1 z-10">
                      {stat.label}
                    </div>
                  </UiverseCard>
                </motion.div>
              ))}
            </div>

          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <div className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex items-start justify-center p-2">
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-1.5 h-1.5 rounded-full bg-muted-foreground"
            />
          </div>
        </motion.div>
      </section>




      {/* Featured Projects Section - Future Updates */}
      <section className="py-24 border-t border-border/50 bg-card/10">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">Upcoming Updates</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">Discover the momentum being built right now.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl mx-auto">
            {demoProjects.map(proj => (
              <div key={proj.id} className="flex justify-center hover:scale-105 transition-transform duration-300">
                <ProjectCard project={proj} />
              </div>
            ))}
          </div>
        </div>
      </section>

      <CyberGallery />

      {/* Features Section */}
      <section className="py-24 border-t border-border/50">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              Activity equals trust
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Every action is tracked. Every commitment is public.
              Build your reputation through work, not marketing.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <UiverseCard className="h-full">
                  <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center mb-4 z-10 relative">
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-display font-semibold text-lg mb-2 relative z-10 uiverse-heading">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-gray-300 leading-relaxed relative z-10">
                    {feature.description}
                  </p>
                </UiverseCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How Momentum Works */}
      <section className="py-24 border-t border-border/50 bg-card/30">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              How momentum is calculated
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Your startup's status is determined automatically based on real activity data.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              {
                status: 'green',
                label: 'Active',
                criteria: ['Updates in last 3 days', '2+ updates per week', 'Tasks being completed'],
                dot: 'momentum-dot-green',
              },
              {
                status: 'yellow',
                label: 'Slowing',
                criteria: ['Activity decreased', 'Fewer updates', 'Task progress stalling'],
                dot: 'momentum-dot-yellow',
              },
              {
                status: 'red',
                label: 'Inactive',
                criteria: ['No updates in 7+ days', 'No task progress', 'Auto-archives at 30 days'],
                dot: 'momentum-dot-red',
              },
            ].map((item, i) => (
              <motion.div
                key={item.status}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <UiverseCard className="h-full flex flex-col items-center text-center">
                  <div className={`w-4 h-4 rounded-full ${item.dot} mx-auto mb-4 relative z-10`} />
                  <h3 className="font-display font-semibold text-lg mb-4 relative z-10 uiverse-heading">{item.label}</h3>
                  <ul className="space-y-2 relative z-10">
                    {item.criteria.map((c) => (
                      <li key={c} className="text-sm text-gray-300 flex items-center gap-2 justify-center">
                        <CheckCircle className="h-3.5 w-3.5 text-white" />
                        {c}
                      </li>
                    ))}
                  </ul>
                </UiverseCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 border-t border-border/50">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative max-w-3xl mx-auto text-center"
          >
            <div className="absolute inset-0 bg-primary/5 rounded-3xl blur-3xl" />
            <div className="absolute inset-0 bg-primary/5 rounded-3xl blur-3xl" />
            <PricingCard />
          </motion.div>
        </div>
      </section >

      {/* Footer */}
      < footer className="py-8 border-t border-border/50" >
        <div className="container flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            <span className="font-display font-semibold">momentum</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Built for builders. Activity equals trust.
          </p>
        </div>
      </footer >
    </div >
  );
}
