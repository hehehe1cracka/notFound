import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface TypewriterTextProps {
    phrases: string[];
    className?: string;
    cursorClassName?: string;
    typingSpeed?: number;
    deletingSpeed?: number;
    pauseDuration?: number;
}

export const TypewriterText = ({
    phrases,
    className = "",
    cursorClassName = "",
    typingSpeed = 100,
    deletingSpeed = 50,
    pauseDuration = 2000
}: TypewriterTextProps) => {
    const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
    const [displayText, setDisplayText] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        const currentPhrase = phrases[currentPhraseIndex];

        const timeout = setTimeout(() => {
            if (!isDeleting) {
                // Typing
                if (displayText.length < currentPhrase.length) {
                    setDisplayText(currentPhrase.slice(0, displayText.length + 1));
                } else {
                    // Finished typing, wait before deleting
                    setIsDeleting(true);
                }
            } else {
                // Deleting (unless it's the only phrase, then just stay)
                if (phrases.length === 1) return;

                if (displayText.length > 0) {
                    setDisplayText(currentPhrase.slice(0, displayText.length - 1));
                } else {
                    // Finished deleting, move to next phrase
                    setIsDeleting(false);
                    setCurrentPhraseIndex((prev) => (prev + 1) % phrases.length);
                }
            }
        }, isDeleting ? (displayText.length === currentPhrase.length ? pauseDuration : deletingSpeed) : typingSpeed);

        return () => clearTimeout(timeout);
    }, [displayText, isDeleting, phrases, currentPhraseIndex, typingSpeed, deletingSpeed, pauseDuration]);

    return (
        <span className={`inline-flex items-center ${className}`}>
            {displayText}
            <motion.span
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                className={`ml-1 inline-block w-[3px] h-[1em] bg-primary ${cursorClassName}`}
            />
        </span>
    );
};
