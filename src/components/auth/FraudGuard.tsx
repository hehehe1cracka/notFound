import { AlertTriangle, CheckCircle2, ShieldAlert, ShieldCheck } from 'lucide-react';

interface FraudScoreProps {
    score: number; // 0-100, where 100 is safest
    signals: string[];
}

export function FraudGuard({ score, signals }: FraudScoreProps) {
    const getRiskLevel = (s: number) => {
        if (s >= 90) return { label: 'LOW RISK', color: 'text-green-500', bg: 'bg-green-500/10', icon: ShieldCheck };
        if (s >= 70) return { label: 'MODERATE', color: 'text-yellow-500', bg: 'bg-yellow-500/10', icon: AlertTriangle };
        return { label: 'HIGH RISK', color: 'text-red-500', bg: 'bg-red-500/10', icon: ShieldAlert };
    };

    const risk = getRiskLevel(score);
    const Icon = risk.icon;

    return (
        <div className="rounded-lg border border-border/50 bg-card/30 p-4">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <Icon className={`h-5 w-5 ${risk.color}`} />
                    <span className="font-display font-bold text-sm">FraudGuard™ Analysis</span>
                </div>
                <div className={`px-2 py-1 rounded text-[10px] font-bold tracking-wider ${risk.bg} ${risk.color}`}>
                    {risk.label}
                </div>
            </div>

            <div className="space-y-3">
                <div className="flex items-end gap-2">
                    <span className="text-3xl font-bold font-display">{score}</span>
                    <span className="text-xs text-muted-foreground mb-1">/ 100 Trust Score</span>
                </div>

                {/* Progress Bar */}
                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                    <div
                        className={`h-full rounded-full transition-all duration-1000 ${score >= 90 ? 'bg-green-500' : score >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                        style={{ width: `${score}%` }}
                    />
                </div>

                <div className="space-y-1 mt-2">
                    {signals.map((signal, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                            <CheckCircle2 className="h-3 w-3 text-primary/70" />
                            {signal}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
