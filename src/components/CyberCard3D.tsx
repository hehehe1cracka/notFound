import React from 'react';
import './CyberCard3D.css';

interface CyberCard3DProps {
    title: string;
    subtitle?: string;
    tagline?: string;
    description?: string;
    className?: string;
    children?: React.ReactNode;
}

export const CyberCard3D = ({ title, subtitle, tagline, description, className = "", children }: CyberCard3DProps) => {
    return (
        <div className={`cyber-card-container ${className}`}>
            <div className="cyber-canvas">
                {[...Array(25)].map((_, i) => (
                    <div key={i} className={`cyber-tracker tr-${i + 1}`} />
                ))}
                <div className="cyber-card-inner">
                    <div className="cyber-card-content">
                        <div className="cyber-glare" />
                        <div className="cyber-lines">
                            <span /><span /><span /><span />
                        </div>

                        <p className="cyber-card-prompt">SECURE_LINK_ACTIVE</p>

                        <div className="cyber-card-title">
                            {title.split(' ').map((word, i) => (
                                <React.Fragment key={i}>
                                    {word}<br />
                                </React.Fragment>
                            ))}
                        </div>

                        <div className="cyber-glowing-elements">
                            <div className="cyber-glow-1" />
                            <div className="cyber-glow-2" />
                            <div className="cyber-glow-3" />
                        </div>

                        <div className="cyber-card-subtitle">
                            <span>{subtitle || 'MOMENTUM'}</span>
                            <span className="cyber-card-highlight"> {tagline || 'ESTABLISHED'}</span>
                        </div>

                        <div className="cyber-card-description">
                            {description}
                        </div>

                        <div className="cyber-card-particles">
                            <span /><span /><span /> <span /><span /><span />
                        </div>

                        <div className="cyber-corner-elements">
                            <span /><span /><span /><span />
                        </div>

                        <div className="cyber-scan-line" />

                        <div className="mt-auto relative z-10 w-full">
                            {children}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
