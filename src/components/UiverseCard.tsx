import React from 'react';
import './UiverseCard.css';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface UiverseCardProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
}

const UiverseCard = React.forwardRef<HTMLDivElement, UiverseCardProps>(
    ({ className, children, ...props }, ref) => {
        return (
            <div className={cn("uiverse-card", className)} ref={ref} {...props}>
                {children}
            </div>
        );
    }
);

UiverseCard.displayName = "UiverseCard";

export default UiverseCard;
