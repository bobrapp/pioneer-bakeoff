import { Trophy, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

interface Props {
  agentName: string;
  score: number;
}

export function WinnerBanner({ agentName, score }: Props) {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    setShowConfetti(true);
    const timer = setTimeout(() => setShowConfetti(false), 4000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative overflow-hidden rounded-xl border-2 border-agent-margaret/50 bg-gradient-to-r from-agent-margaret/10 via-agent-anita/10 to-agent-ada/10 p-6">
      {/* Confetti particles */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {Array.from({ length: 30 }).map((_, i) => (
            <span
              key={i}
              className="absolute block rounded-sm opacity-80"
              style={{
                width: `${4 + Math.random() * 6}px`,
                height: `${4 + Math.random() * 6}px`,
                backgroundColor: ['hsl(270,70%,65%)', 'hsl(210,100%,60%)', 'hsl(0,80%,60%)', 'hsl(145,70%,50%)', 'hsl(30,95%,60%)', 'hsl(45,95%,55%)'][i % 6],
                left: `${Math.random() * 100}%`,
                top: `-10%`,
                animation: `confetti-fall ${2 + Math.random() * 2}s ease-in ${Math.random() * 1}s forwards`,
              }}
            />
          ))}
        </div>
      )}

      <div className="flex items-center gap-4 relative z-10">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-agent-margaret/20">
          <Trophy className="h-8 w-8 text-agent-margaret" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-agent-margaret" />
            <span className="text-xs font-semibold uppercase tracking-wider text-agent-margaret">Winner</span>
          </div>
          <h3 className="text-2xl font-bold text-foreground">{agentName}</h3>
          <p className="text-sm text-muted-foreground">
            Top overall weighted score: <span className="font-bold text-agent-margaret">{score}</span>
          </p>
        </div>
      </div>
    </div>
  );
}
