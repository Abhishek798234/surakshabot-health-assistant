export const TypingIndicator = () => {
  return (
    <div className="flex justify-start w-full">
      <div className="chat-bubble-bot mr-auto">
        <div className="flex items-center space-x-1">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-medical-secondary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div className="w-2 h-2 bg-medical-secondary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div className="w-2 h-2 bg-medical-secondary rounded-full animate-bounce"></div>
          </div>
          <span className="text-xs text-muted-foreground ml-2">Surakshabot is typing...</span>
        </div>
      </div>
    </div>
  );
};