import React from 'react';
import './PricingCard.css';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';

export default function PricingCard() {
    return (
        <div className="pricing-card">
            <div className="card__border" />
            <div className="card_title__container">
                <span className="card_title">Full Access</span>
                <p className="card_paragraph">
                    Join Momentum and prove your startup through action. No vanity metrics. Just real work.
                </p>
            </div>
            <hr className="line" />
            <ul className="card__list">
                {[
                    "Real-time Work Tracking",
                    "Immutable Progress History",
                    "Verified Builder Identity",
                    "Collaborator Discovery",
                    "AI-Powered Insights"
                ].map((feature, index) => (
                    <li key={index} className="card__list_item">
                        <span className="check">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="check_svg">
                                <path fillRule="evenodd" d="M12.416 3.376a.75.75 0 0 1 .208 1.04l-5 7.5a.75.75 0 0 1-1.154.114l-3-3a.75.75 0 0 1 1.06-1.06l2.353 2.353 4.493-6.74a.75.75 0 0 1 1.04-.207Z" clipRule="evenodd" />
                            </svg>
                        </span>
                        <span className="list_text">{feature}</span>
                    </li>
                ))}
            </ul>
            <Link to="/auth?mode=signup" className="w-full mt-6">
                <button className="button">Get Started Free</button>
            </Link>
        </div>
    );
}
