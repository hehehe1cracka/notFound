import React, { useState, useEffect } from 'react';
import CyberCard from './CyberCard';
import './CyberGallery.css';
import { motion } from 'framer-motion';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Calendar, User, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { database } from '@/lib/firebase';
import { ref, onValue, query, limitToLast } from 'firebase/database';
import { formatRelativeTime } from '@/lib/momentum';
import { Link } from 'react-router-dom';

const MOCK_DATA = [
    {
        id: '1',
        image: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&q=80&w=800',
        title: 'NEURAL DASH',
        subtitle: 'AI INFRASTRUCTURE',
        author: 'Alex Riv',
        date: '2h ago',
        pulse: '+45',
        description: 'Building the next generation of neural interface dashboards for real-time cognitive monitoring. Seamlessly integrate brain-computer interfaces with everyday productivity workflows.',
        link: 'https://example.com/neural-dash'
    },
    {
        id: '2',
        image: 'https://images.unsplash.com/photo-1639322537228-ad7117a3a63b?auto=format&fit=crop&q=80&w=800',
        title: 'VOID SCRIPT',
        subtitle: 'DEFI PROTOCOL',
        author: 'Sarah K.',
        date: '4h ago',
        pulse: '+128',
        description: 'A decentralized finance protocol for the void era. Automating liquidity provision with zero-knowledge proofs and quantum-resistant security layers.',
        link: 'https://example.com/void-script'
    },
    {
        id: '3',
        image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=800',
        title: 'CYBER MESH',
        subtitle: 'IOT NETWORK',
        author: 'Marcus Chen',
        date: '1d ago',
        pulse: '+82',
        description: 'Creating a self-healing mesh network for IoT devices in smart cities. Reducing latency and increasing redundancy through decentralized edge computing nodes.',
        link: 'https://example.com/cyber-mesh'
    },
    {
        id: '4',
        image: 'https://images.unsplash.com/photo-1614728853913-1e32005e30b7?auto=format&fit=crop&q=80&w=800',
        title: 'HYPER GRID',
        subtitle: 'QUANTUM COMP',
        author: 'Dr. V. Rao',
        date: '3d ago',
        pulse: '+210',
        description: 'Scaling quantum computing accessibility through cloud-based hyper grids. Simulating molecular structures for pharmaceutical breakthroughs in record time.',
        link: 'https://example.com/hyper-grid'
    },
    {
        id: '5',
        image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&q=80&w=800',
        title: 'SYNTH WAVE',
        subtitle: 'AUDIO AI',
        author: 'J. Coleman',
        date: '5h ago',
        pulse: '+95',
        description: 'Generative audio AI for creating adaptive soundscapes. Transforming text and mood into fully immersive, royalty-free audio environments for creators.',
        link: 'https://example.com/synth-wave'
    },
    {
        id: '6',
        image: 'https://images.unsplash.com/photo-1605792657660-596af9009e82?auto=format&fit=crop&q=80&w=800',
        title: 'DATA CORE',
        subtitle: 'CLOUD STORAGE',
        author: 'Lisa Wong',
        date: '1w ago',
        pulse: '+67',
        description: 'Next-gen decentralized cloud storage solutions. Sharding data across a global network of encrypted nodes for unbreachable security and ultra-fast retrieval.',
        link: 'https://example.com/data-core'
    }
];

export const CyberGallery = () => {
    const [selectedItem, setSelectedItem] = useState<any>(null);
    const [galleryItems, setGalleryItems] = useState<any[]>(MOCK_DATA); // Init with mock data

    // Generate a unique gradient based on text
    const generateGradient = (text: string) => {
        const colors = [
            ['#667eea', '#764ba2'], // Purple
            ['#f093fb', '#f5576c'], // Pink
            ['#4facfe', '#00f2fe'], // Blue
            ['#43e97b', '#38f9d7'], // Green
            ['#fa709a', '#fee140'], // Orange
            ['#30cfd0', '#330867'], // Teal
            ['#a8edea', '#fed6e3'], // Pastel
            ['#ff9a9e', '#fecfef'], // Rose
        ];
        const hash = text.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const colorPair = colors[hash % colors.length];
        return `linear-gradient(135deg, ${colorPair[0]} 0%, ${colorPair[1]} 100%)`;
    };

    useEffect(() => {
        const projectsRef = query(ref(database, 'projects'), limitToLast(50));

        const unsubscribe = onValue(projectsRef, (snapshot) => {
            let combinedItems = [...MOCK_DATA];

            if (snapshot.exists()) {
                const data = snapshot.val();
                const userItems = Object.values(data).reverse().map((item: any) => ({
                    id: item.id,
                    image: item.imageUrl || generateGradient(item.title || 'Startup'),
                    title: item.title,
                    subtitle: 'NEW STARTUP', // Label for user projects
                    author: item.authorName || 'Anonymous',
                    date: formatRelativeTime(item.timestamp || Date.now()),
                    pulse: '+' + (Math.floor(Math.random() * 50) + 10),
                    description: item.description || "A new startup building momentum.",
                    link: item.link,
                    isUser: true // Flag to potentially highlight
                }));
                // Prepend user items to mock data so they show first
                combinedItems = [...userItems, ...MOCK_DATA];
            }

            // Ensure we have enough items for 3 dense rows
            // We want at least ~18 items total (6 per row) to ensure wide screens are filled
            // Duplicate the combined list until we reach safety
            while (combinedItems.length < 18) {
                combinedItems = [...combinedItems, ...combinedItems];
            }

            // Limit to avoid excessive DOM nodes if it grows too huge, but 18-36 is safe
            if (combinedItems.length > 40) combinedItems = combinedItems.slice(0, 40);

            setGalleryItems(combinedItems);
        });

        return () => unsubscribe();
    }, []);

    const renderCards = (items: any[]) => (
        <div className="marquee-content">
            {items.map((item, i) => (
                <CyberCard
                    key={`${item.id}-${i}`}
                    image={item.image}
                    title={item.title}
                    subtitle={item.subtitle}
                    index={i}
                    onClick={() => setSelectedItem(item)}
                />
            ))}
        </div>
    );

    // Split items for rows evenly
    const chunkSize = Math.ceil(galleryItems.length / 3);
    const row1 = galleryItems.slice(0, chunkSize);
    const row2 = galleryItems.slice(chunkSize, chunkSize * 2);
    const row3 = galleryItems.slice(chunkSize * 2);

    // No need for fallback arrays now as we forced min length
    const safeRow1 = row1;
    const safeRow2 = row2;
    const safeRow3 = row3;

    if (galleryItems.length === 0) return null;

    return (
        <section className="py-24 overflow-hidden bg-background relative border-t border-border/50">
            <div className="container mb-12 flex flex-col md:flex-row justify-between items-end gap-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="max-w-2xl"
                >
                    <div className="flex items-center gap-4 mb-2">
                        <Badge variant="outline" className="border-primary/50 text-primary">LIVE PROOF FEED</Badge>
                        <div className="h-[1px] flex-1 bg-gradient-to-r from-primary/30 to-transparent" />
                    </div>
                    <h2 className="text-4xl md:text-5xl font-display font-bold text-white tracking-widest uppercase mb-4">
                        Momentum <span className="text-primary italic">Gallery</span>
                    </h2>
                    <p className="text-muted-foreground">
                        Real-time visual proof of progress. No pitch decks, just building.
                    </p>
                </motion.div>


            </div>

            {/* Horizontal Scrolling Marquee - 3 Rows Alternating */}
            <div className="space-y-6">
                <div className="marquee-row">
                    <div className="marquee-container marquee-left">
                        {renderCards(safeRow1)}
                        {renderCards(safeRow1)}
                    </div>
                </div>
                <div className="marquee-row">
                    <div className="marquee-container marquee-right">
                        {renderCards(safeRow2)}
                        {renderCards(safeRow2)}
                    </div>
                </div>
                <div className="marquee-row">
                    <div className="marquee-container marquee-left">
                        {renderCards(safeRow3)}
                        {renderCards(safeRow3)}
                    </div>
                </div>
            </div>

            <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
                <DialogContent className="max-w-2xl bg-[#0a0a0a] border-primary/20 p-0 overflow-hidden rounded-2xl shadow-2xl shadow-primary/10">
                    {selectedItem && (
                        <div className="flex flex-col md:flex-row h-full md:min-h-[450px]">
                            <div className="w-full md:w-1/2 relative h-[250px] md:h-auto">
                                <img
                                    src={selectedItem.image}
                                    alt={selectedItem.title}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a] via-transparent to-transparent hidden md:block" />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent md:hidden" />
                                <Badge className="absolute top-4 left-4 bg-primary text-black font-bold">
                                    {selectedItem.pulse} PULSE
                                </Badge>
                            </div>

                            <div className="w-full md:w-1/2 p-8 flex flex-col justify-center">
                                <div className="mb-6">
                                    <p className="text-primary text-[10px] uppercase font-bold tracking-[0.3em] mb-1">
                                        {selectedItem.subtitle}
                                    </p>
                                    <DialogTitle className="text-3xl font-display font-black text-white leading-none">
                                        {selectedItem.title}
                                    </DialogTitle>
                                </div>

                                <DialogDescription className="text-gray-400 text-sm leading-relaxed mb-6">
                                    {selectedItem.description}
                                </DialogDescription>

                                <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/5 mb-8">
                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                        <User className="h-3.5 w-3.5 text-primary/60" />
                                        <span>{selectedItem.author}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                        <Calendar className="h-3.5 w-3.5 text-primary/60" />
                                        <span>{selectedItem.date}</span>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    {selectedItem.link && (
                                        <a href={selectedItem.link} target="_blank" rel="noopener noreferrer" className="flex-1">
                                            <Button className="w-full glow-primary bg-primary text-black font-bold h-12">
                                                View Startup
                                                <ExternalLink className="ml-2 h-4 w-4" />
                                            </Button>
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </section>
    );
};
