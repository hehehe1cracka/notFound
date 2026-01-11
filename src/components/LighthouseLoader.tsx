import React from 'react';
import './LighthouseLoader.css';

export const LighthouseLoader = () => {
    const Lamp = ({ className }: { className: string }) => (
        <div className={`lamp ${className}`}>
            <div className="head">
                <div className="head-top" />
                <div className="light-source" />
                <div className="head-body">
                    <div className="head-body-rod" />
                    <div className="head-body-glass" />
                    <div className="head-body-rod" />
                    <div className="head-body-glass" />
                    <div className="head-body-rod" />
                </div>
                <div className="head-bottom" />
            </div>
            <div className="rod" />
            <div className="bottom">
                <div className="bottom-top" />
                <div className="bottom-body" />
                <div className="bottom-bottom" />
            </div>
            <div className="lamp-shadow" />
        </div>
    );

    return (
        <div className="flex items-center justify-center min-h-[450px]">
            <div className="lighthouse-view">
                <Lamp className="lamp-left" />
                <Lamp className="lamp-right" />

                <div className="masonry-perspective">
                    <div className="masonry-container">
                        {[...Array(10)].map((_, i) => (
                            <div key={i} className="masonry">
                                {[...Array(5)].map((__, j) => (
                                    <div key={j} className="masonry-item" />
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
