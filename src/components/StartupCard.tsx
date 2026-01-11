import { Startup } from '@/types/momentum';
import { formatRelativeTime } from '@/lib/momentum';
import { Users, CheckCircle, Clock, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import './SimpleCard.css';

interface StartupCardProps {
  startup: Startup;
  index?: number;
  onDelete?: (id: string) => void;
}

export function StartupCard({ startup, index = 0, onDelete }: StartupCardProps) {
  if (!startup) return null;
  const momentumValue = startup.momentum ?? 'gray';
  const momentum = String(momentumValue).toLowerCase();
  const momentumDisplay = momentum.toUpperCase();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="relative group/card"
    >
      <Link to={`/startup/${startup.id}`} className="block h-full">
        <div className="simple-card h-full">
          <div className="simple-card-header group relative overflow-hidden">
            {/* Background Image / Pattern */}
            <div
              className="absolute inset-0 z-0 transition-transform duration-700 group-hover:scale-110 opacity-40 group-hover:opacity-60"
              style={{
                backgroundImage: startup.imageUrl ? `url(${startup.imageUrl})` : 'linear-gradient(135deg, rgba(0, 255, 170, 0.05) 0%, transparent 100%)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            />
            {/* Overlay Gradient for text readability */}
            <div className="absolute inset-0 z-10 bg-gradient-to-t from-background via-background/80 to-transparent" />

            <div className="relative z-20 flex justify-between items-start mb-2">
              <Badge variant="outline" className="border-primary/50 text-primary text-[10px] bg-background/50 backdrop-blur-sm">
                {startup.category || 'STARTUP'}
              </Badge>
              <div className={`momentum-dot momentum-dot-${momentum}`} />
            </div>
            <h3 className="simple-card-title relative z-20">{startup.name}</h3>
            <p className="simple-card-subtitle relative z-20">{momentumDisplay} MOMENTUM</p>
          </div>

          <div className="simple-card-content">
            <p className="simple-card-tagline">{startup.tagline}</p>

            <div className="simple-card-info">
              <div className="info-item">
                <Users className="h-3 w-3" />
                <span>{startup.contributorCount || 0}</span>
              </div>
              <div className="info-item">
                <CheckCircle className="h-3 w-3" />
                <span>{startup.completedTaskCount || 0}/{startup.taskCount || 0}</span>
              </div>
              <div className="info-item ml-auto">
                <Clock className="h-3 w-3" />
                <span>{formatRelativeTime(startup.lastActivityAt || Date.now())}</span>
              </div>
            </div>
          </div>
        </div>
      </Link>

      {onDelete && (
        <button
          className="absolute top-2 right-2 z-50 p-2 bg-destructive/90 text-white rounded-full opacity-0 group-hover/card:opacity-100 transition-opacity hover:bg-destructive shadow-lg"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (window.confirm(`Are you sure you want to delete "${startup.name}"? This cannot be undone.`)) {
              onDelete(startup.id);
            }
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>
        </button>
      )}
    </motion.div>
  );
}
