import { useEffect, useState } from "react";

const doctorEmojis = ["💉", "🩺", "💊", "🏥", "⚕️", "🔬", "🧬", "🩹", "💉", "🔬"];

interface FloatingEmoji {
  id: number;
  emoji: string;
  x: number;
  y: number;
  delay: number;
  duration: number;
}

export const FloatingEmojis = () => {
  const [emojis, setEmojis] = useState<FloatingEmoji[]>([]);

  useEffect(() => {
    const generateEmojis = () => {
      const newEmojis: FloatingEmoji[] = [];
      for (let i = 0; i < 8; i++) {
        newEmojis.push({
          id: i,
          emoji: doctorEmojis[Math.floor(Math.random() * doctorEmojis.length)],
          x: Math.random() * 100,
          y: Math.random() * 100,
          delay: Math.random() * 5,
          duration: 3 + Math.random() * 4,
        });
      }
      setEmojis(newEmojis);
    };

    generateEmojis();
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {emojis.map((emoji) => (
        <div
          key={emoji.id}
          className="absolute text-2xl opacity-20 animate-pulse"
          style={{
            left: `${emoji.x}%`,
            top: `${emoji.y}%`,
            animationDelay: `${emoji.delay}s`,
            animationDuration: `${emoji.duration}s`,
            animation: `float ${emoji.duration}s ease-in-out infinite alternate`,
          }}
        >
          {emoji.emoji}
        </div>
      ))}
    </div>
  );
};