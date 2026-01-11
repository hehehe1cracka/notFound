import React from 'react';
import './UiverseButton.css';
import { cn } from '@/lib/utils';

interface UiverseButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    label?: string;
}

const UiverseButton = React.forwardRef<HTMLButtonElement, UiverseButtonProps>(
    ({ className, label = "GET STARTED", ...props }, ref) => {
        return (
            <button className={cn("uiverse-container", className)} ref={ref} {...props}>
                <div className="wrapper">
                    <span>{label}</span>
                    <div className="circle circle-12" />
                    <div className="circle circle-11" />
                    <div className="circle circle-10" />
                    <div className="circle circle-9" />
                    <div className="circle circle-8" />
                    <div className="circle circle-7" />
                    <div className="circle circle-6" />
                    <div className="circle circle-5" />
                    <div className="circle circle-4" />
                    <div className="circle circle-3" />
                    <div className="circle circle-2" />
                    <div className="circle circle-1" />
                </div>
            </button>
        );
    }
);

UiverseButton.displayName = "UiverseButton";

export default UiverseButton;
