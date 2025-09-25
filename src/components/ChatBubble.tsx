import { cn } from "@/lib/utils";
import { Volume2, VolumeX } from "lucide-react";
import { useState } from "react";
import { speechService } from "@/services/speech";
import { Button } from "@/components/ui/button";

interface ChatBubbleProps {
  message: string;
  isUser: boolean;
  timestamp?: string;
}

export const ChatBubble = ({ message, isUser, timestamp }: ChatBubbleProps) => {
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleSpeak = async () => {
    if (isSpeaking) {
      speechService.stopSpeaking();
      setIsSpeaking(false);
      return;
    }

    try {
      setIsSpeaking(true);
      await speechService.speak(message);
    } catch (error) {
      console.error('Speech synthesis error:', error);
    } finally {
      setIsSpeaking(false);
    }
  };
  return (
    <div className={cn(
      "flex w-full",
      isUser ? "justify-end" : "justify-start"
    )}>
      <div className={cn(
        "max-w-[80%] md:max-w-md relative group",
        isUser ? "chat-bubble-user ml-auto" : "chat-bubble-bot mr-auto"
      )}>
        <p className="text-sm leading-relaxed text-glass">
          {message}
        </p>
        {timestamp && (
          <p className="text-xs text-muted-foreground mt-2 opacity-70">
            {timestamp}
          </p>
        )}
        {!isUser && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute -top-2 -right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity bg-glass hover:bg-medical-primary/20"
            onClick={handleSpeak}
            title={isSpeaking ? 'Stop speaking' : 'Read aloud'}
          >
            {isSpeaking ? 
              <VolumeX className="w-3 h-3 text-red-500" /> : 
              <Volume2 className="w-3 h-3 text-foreground/60" />
            }
          </Button>
        )}
      </div>
    </div>
  );
};