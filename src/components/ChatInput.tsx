import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Mic, MicOff } from "lucide-react";
import { speechService } from "@/services/speech";
import { toast } from "sonner";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
}

export const ChatInput = ({ onSendMessage, isLoading }: ChatInputProps) => {
  const [message, setMessage] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);

  useEffect(() => {
    setSpeechSupported(speechService.isSpeechRecognitionSupported());
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isLoading) {
      onSendMessage(message.trim());
      setMessage("");
    }
  };

  const handleMicClick = async () => {
    if (!speechSupported) {
      toast.error("Speech recognition is not supported in your browser");
      return;
    }

    if (isListening) {
      speechService.stopListening();
      setIsListening(false);
      return;
    }

    try {
      setIsListening(true);
      toast.info("Listening... Speak now");
      
      const transcript = await speechService.startListening();
      setMessage(transcript);
      toast.success("Speech recognized successfully!");
    } catch (error) {
      console.error('Speech recognition error:', error);
      toast.error("Could not recognize speech. Please try again.");
    } finally {
      setIsListening(false);
    }
  };

  return (
    <div className="glass-card p-4 m-4">
      <form onSubmit={handleSubmit} className="flex gap-3 items-end">
        <div className="flex-1">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ask me about your health concerns..."
            disabled={isLoading}
            className="bg-glass border-glass-border focus:border-medical-primary transition-colors resize-none min-h-[50px] text-foreground placeholder:text-muted-foreground"
          />
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className={`glass border-glass-border hover:border-medical-secondary transition-colors ${
              isListening ? 'bg-red-500/20 border-red-500/50' : ''
            }`}
            disabled={isLoading || !speechSupported}
            onClick={handleMicClick}
            title={speechSupported ? (isListening ? 'Stop listening' : 'Start voice input') : 'Speech not supported'}
          >
            {isListening ? <MicOff className="h-4 w-4 text-red-500" /> : <Mic className="h-4 w-4" />}
          </Button>
          <Button
            type="submit"
            disabled={!message.trim() || isLoading}
            className="bg-medical-primary hover:bg-medical-secondary text-primary-foreground transition-colors"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  );
};