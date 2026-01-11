import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  Zap, 
  ArrowRight, 
  UserPlus, 
  Rocket, 
  Activity, 
  CheckCircle,
  Shield,
  Eye,
  Archive
} from 'lucide-react';

export default function HowItWorks() {
  const steps = [
    {
      icon: UserPlus,
      title: '1. Sign Up',
      description: 'Create your account with email, Google, or GitHub. Your profile starts with zero reputation—earned through work.',
    },
    {
      icon: Rocket,
      title: '2. Launch or Join',
      description: 'Create a startup and start logging progress, or browse the discovery page to find teams that need help.',
    },
    {
      icon: Activity,
      title: '3. Build Publicly',
      description: 'Post regular updates and create tasks for real work. Every action is timestamped and becomes permanent.',
    },
    {
      icon: CheckCircle,
      title: '4. Complete Tasks',
      description: 'Contributors claim tasks and submit actual outputs. Founders review and rate the work. Reputation grows.',
    },
  ];

  const principles = [
    {
      icon: Shield,
      title: 'No Fake Metrics',
      description: 'No followers, likes, or vanity stats. Your startup\'s credibility comes only from logged activity and completed work.',
    },
    {
      icon: Eye,
      title: 'Transparency First',
      description: 'All progress updates are public and immutable after 5 minutes. You can\'t rewrite history or hide failures.',
    },
    {
      icon: Archive,
      title: 'Automatic Accountability',
      description: 'Inactive startups get flagged with yellow/red status. After 30 days of silence, they\'re auto-archived—contributors are warned.',
    },
  ];

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
            How Momentum Works
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            A platform where startups earn credibility through activity, not marketing.
            Every update is logged. Every task is tracked. Trust is built through work.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="space-y-6 mb-20">
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="p-6 bg-card border-border/50 hover:border-primary/30 transition-colors">
                <div className="flex gap-5">
                  <div className="shrink-0">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <step.icon className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-display font-semibold text-lg mb-2">{step.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{step.description}</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Principles */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <h2 className="font-display text-2xl font-bold text-center mb-8">
            Core Principles
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {principles.map((principle, i) => (
              <Card key={principle.title} className="p-6 bg-card border-border/50 text-center">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <principle.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-display font-semibold mb-2">{principle.title}</h3>
                <p className="text-sm text-muted-foreground">{principle.description}</p>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <Card className="p-10 bg-card border-border/50">
            <Zap className="h-10 w-10 text-primary mx-auto mb-4" />
            <h2 className="font-display text-2xl font-bold mb-3">Ready to build?</h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Join Momentum and prove your startup through action, not promises.
            </p>
            <div className="flex gap-3 justify-center">
              <Link to="/auth?mode=signup">
                <Button className="glow-primary">
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/discover">
                <Button variant="outline">Explore Startups</Button>
              </Link>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
