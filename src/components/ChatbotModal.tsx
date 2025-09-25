import { useState, useRef, useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChatHeader } from "@/components/ChatHeader";
import { ChatBubble } from "@/components/ChatBubble";
import { ChatInput } from "@/components/ChatInput";
import { TypingIndicator } from "@/components/TypingIndicator";
import { LightPurpleChatBox } from "@/components/LightPurpleChatBox";
import { generateGeminiResponse, createOrGetUser } from "@/services/gemini";
import { LocationPermission } from "@/components/LocationPermission";
import { MedicalFacilityCard } from "@/components/MedicalFacilityCard";
import { LanguageSelector } from "@/components/LanguageSelector";
import { HealthAlertsButton } from "@/components/HealthAlertsButton";
import { getCurrentLocation, findNearbyMedicalFacilities } from "@/services/location";
import { translationService, Language } from "@/services/translation";
import { speechService } from "@/services/speech";

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: string;
  facilities?: any[];
}

interface User {
  name: string;
  phone: string;
  email?: string;
}

interface ChatbotModalProps {
  isOpen: boolean;
  onClose: () => void;
}



export const ChatbotModal = ({ isOpen, onClose }: ChatbotModalProps) => {
  const [messages, setMessages] = useState<Message[]>(() => {
    const savedUser = localStorage.getItem('user');
    const currentLang = translationService.getCurrentLanguage();
    const welcomeMessage = savedUser 
      ? translationService.getText('welcome').replace('Surakshabot', `Surakshabot, ${JSON.parse(savedUser).name}`)
      : translationService.getText('welcome');
    
    return [{
      id: "1",
      text: welcomeMessage,
      isUser: false,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }];
  });
  const [isTyping, setIsTyping] = useState(false);
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [showLocationPermission, setShowLocationPermission] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = async (messageText: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      text: messageText,
      isUser: true,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    try {
      // Check for user registration pattern
      const userPattern = /my name is ([\w\s]+) and my phone number is ([\+\d\s\-\(\)]+)/i;
      const userMatch = messageText.match(userPattern);
      
      if (userMatch && !user) {
        const [, name, phone] = userMatch;
        const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
        
        const userData = await createOrGetUser(name.trim(), cleanPhone);
        
        if (userData.success) {
          setUser({ name: name.trim(), phone: cleanPhone });
          const botMessage: Message = {
            id: (Date.now() + 1).toString(),
            text: `Welcome ${name.trim()}! 🎉 Your profile has been created successfully. I can now help you with health queries and vaccination reminders via WhatsApp at ${cleanPhone}. How can I assist you today?`,
            isUser: false,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };
          setMessages(prev => [...prev, botMessage]);
        } else {
          const botMessage: Message = {
            id: (Date.now() + 1).toString(),
            text: `There was an error creating your profile. Please try again or contact support.`,
            isUser: false,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };
          setMessages(prev => [...prev, botMessage]);
        }
      } else {
        const response = await generateGeminiResponse(messageText, user?.phone);
        
        // Check if response is medical facilities data or location request
        let botMessage: Message;
        try {
          const responseData = JSON.parse(response);
          if (responseData.type === 'medical_facilities') {
            botMessage = {
              id: (Date.now() + 1).toString(),
              text: responseData.message,
              isUser: false,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              facilities: responseData.facilities
            };
          } else if (responseData.type === 'location_request') {
            botMessage = {
              id: (Date.now() + 1).toString(),
              text: responseData.message,
              isUser: false,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            // Store the facility type for after location permission
            localStorage.setItem('pendingFacilitySearch', responseData.facilityType);
            setShowLocationPermission(true);
          } else {
            botMessage = {
              id: (Date.now() + 1).toString(),
              text: response,
              isUser: false,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
          }
        } catch {
          botMessage = {
            id: (Date.now() + 1).toString(),
            text: response,
            isUser: false,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };
        }
        
        setMessages(prev => [...prev, botMessage]);
      }
    } catch (error) {
      console.error('Error getting response:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'I apologize, but I encountered an error. Please try again.',
        isUser: false,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleLocationPermissionGranted = async () => {
    setShowLocationPermission(false);
    
    // Check if there's a pending facility search
    const pendingSearch = localStorage.getItem('pendingFacilitySearch');
    if (pendingSearch) {
      localStorage.removeItem('pendingFacilitySearch');
      
      try {
        console.log('Getting current location...');
        const location = await getCurrentLocation();
        console.log('Got location:', location);
        
        const searchType = pendingSearch.includes('medical store') ? 'pharmacy' : pendingSearch as 'hospital' | 'clinic' | 'pharmacy' | 'doctor';
        
        console.log('Searching for:', searchType);
        const facilities = await findNearbyMedicalFacilities(location, searchType);
        console.log('Found facilities:', facilities);
        
        const botMessage: Message = {
          id: Date.now().toString(),
          text: `Found ${facilities.length} nearby ${searchType}${facilities.length > 1 ? 's' : ''} based on your location`,
          isUser: false,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          facilities: facilities
        };
        
        setMessages(prev => [...prev, botMessage]);
      } catch (error) {
        console.error('Error searching facilities:', error);
        const errorMessage: Message = {
          id: Date.now().toString(),
          text: 'Sorry, I had trouble finding nearby facilities. Please try again.',
          isUser: false,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    }
  };

  const handleLocationPermissionDenied = () => {
    setShowLocationPermission(false);
    localStorage.removeItem('pendingFacilitySearch');
    
    const deniedMessage: Message = {
      id: Date.now().toString(),
      text: 'Location access denied. You can manually search for medical facilities on Google Maps or enable location access in your browser settings to use this feature.',
      isUser: false,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, deniedMessage]);
  };

  const handleLanguageChange = (language: Language) => {
    // Update speech service language
    speechService.updateLanguage();
    
    // Add language change message
    const changeMessage: Message = {
      id: Date.now().toString(),
      text: `Language changed to ${language.name} ${language.flag}`,
      isUser: false,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, changeMessage]);
  };

  const handleQuickAction = (action: string) => {
    const actionMessages = {
      nearby_hospitals: 'find hospital near me',
      appointment_alerts: 'show my appointments',
      vaccination_alerts: 'show my vaccination reminders',
      health_alerts: 'I want to subscribe to disease outbreak alerts and health notifications'
    };
    
    const message = actionMessages[action as keyof typeof actionMessages];
    if (message) {
      handleSendMessage(message);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative w-full h-full max-w-7xl max-h-[90vh] m-4">
        <div className="glass-card h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-glass-border/20">
            <h2 className="text-lg font-semibold medical-accent">Surakshabot Health Assistant</h2>
            <div className="flex items-center gap-2">
              <HealthAlertsButton user={user} />
              <LanguageSelector onLanguageChange={handleLanguageChange} />
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-foreground/60 hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Chat Interface */}
          <div className="flex-1 flex flex-col lg:flex-row gap-6 p-6 overflow-hidden">
            {/* Main Dark Chat */}
            <div className="flex-1 flex flex-col min-h-0">
              <ChatHeader />
              
              <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-4">
                {messages.map((message) => (
                  <div key={message.id}>
                    <ChatBubble
                      message={message.text}
                      isUser={message.isUser}
                      timestamp={message.timestamp}
                    />
                    {message.facilities && (
                      <div className="mt-3 space-y-2">
                        {message.facilities.map((facility, index) => (
                          <MedicalFacilityCard
                            key={facility.placeId}
                            facility={facility}
                            index={index}
                          />
                        ))}
                        <div className="text-xs text-foreground/60 mt-3 p-3 glass-card">
                          💡 Tip: Click "View on Maps" to get directions and more details.<br/>
                          ⚠️ In case of emergency, call your local emergency number immediately.
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                {isTyping && <TypingIndicator />}
                <div ref={messagesEndRef} />
              </div>

              <ChatInput onSendMessage={handleSendMessage} isLoading={isTyping} />
            </div>

            {/* Light Purple Chat Box */}
            <div className="w-full lg:w-96 flex-shrink-0">
              <LightPurpleChatBox onButtonClick={handleQuickAction} />
            </div>
          </div>
        </div>
      </div>
      
      {showLocationPermission && (
        <LocationPermission 
          isVisible={showLocationPermission}
          onPermissionGranted={handleLocationPermissionGranted}
          onPermissionDenied={handleLocationPermissionDenied}
        />
      )}
    </div>
  );
};