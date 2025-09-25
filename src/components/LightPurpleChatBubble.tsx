import { cn } from "@/lib/utils";

interface LightPurpleChatBubbleProps {
  message: string;
  isUser: boolean;
  timestamp?: string;
}

export const LightPurpleChatBubble = ({ message, isUser, timestamp }: LightPurpleChatBubbleProps) => {
  return (
    <div className={cn(
      "flex w-full",
      isUser ? "justify-end" : "justify-start"
    )}>
      <div className={cn(
        "max-w-[80%] md:max-w-md",
        isUser ? "chat-bubble-user-light ml-auto" : "chat-bubble-light mr-auto"
      )}>
        <p className="text-sm leading-relaxed">
          {message}
        </p>
        {timestamp && (
          <p className="text-xs opacity-60 mt-2">
            {timestamp}
          </p>
        )}
      </div>
    </div>
  );
};