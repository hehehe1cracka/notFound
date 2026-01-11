import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Send, X, Bot, User, Zap, Sparkles } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Loader from './Loader';
import './AIAssistant.css';

const API_KEY = "AIzaSyBfNf50QScgjuvrLM62uJA-bNIKG2W2kBI";
const genAI = new GoogleGenerativeAI(API_KEY);

interface Message {
    role: 'user' | 'ai';
    content: string;
}

export const AIAssistant = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { role: 'ai', content: 'Hello! I am your Momentum Assistant. How can I help you build today?' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setIsLoading(true);

        try {
            const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
            const prompt = `
        You are the Momentum AI Assistant (v2.0 Flash), a helpful and technical companion for founders and talent on the Momentum platform.
        Momentum is a platform where startups prove their progress through real activity logs, tasks, and visual proof in a gallery.
        
        Recent Context: The user is currently browsing the ecosystem and building their project.
        
        Your goals:
        1. Answer questions about the platform (Trust through work, Pulse Score, Gallery).
        2. Give strategic advice to founders to build real momentum.
        3. Suggest specific tasks they can add periodically to their project. Format: [TASK: Title | Description].
        4. Use a futuristic, concise, and high-energy tone.
        
        User: ${userMessage}
      `;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            setMessages(prev => [...prev, { role: 'ai', content: text }]);
        } catch (error) {
            console.error("Gemini Error:", error);
            setMessages(prev => [...prev, { role: 'ai', content: "Sorry, I encountered a glitch in the matrix. Please try again." }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <motion.div
                className="ai-assistant-btn"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className="glow" />
                {isOpen ? <X className="text-primary h-6 w-6 z-10" /> : <Bot className="text-primary h-6 w-6 z-10" />}
            </motion.div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="ai-chat-window"
                    >
                        <div className="ai-chat-header">
                            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                                <Sparkles className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-white leading-none">Momentum AI</h3>
                                <span className="text-[10px] text-primary/80 uppercase tracking-widest font-bold">Gemini 2.0 Flash</span>
                            </div>
                        </div>

                        <div className="ai-chat-messages" ref={scrollRef}>
                            {messages.map((msg, i) => (
                                <div key={i} className={`message ${msg.role}`}>
                                    {msg.content}
                                </div>
                            ))}
                            {isLoading && (
                                <div className="message ai flex items-center gap-2">
                                    <div className="scale-50 -ml-8">
                                        <Loader />
                                    </div>
                                    Thinking...
                                </div>
                            )}
                        </div>

                        <div className="ai-chat-input">
                            <Input
                                placeholder="Ask anything..."
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                            />
                            <Button
                                size="icon"
                                onClick={handleSend}
                                disabled={isLoading}
                                className="bg-primary hover:bg-primary/80 text-black"
                            >
                                <Send className="h-4 w-4" />
                            </Button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};
