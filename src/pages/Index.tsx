import { useState } from "react";
import { HealthWebsiteHeader } from "@/components/HealthWebsiteHeader";
import { HealthHeroSection } from "@/components/HealthHeroSection";
import { AboutSection } from "@/components/AboutSection";
import { ContactSection } from "@/components/ContactSection";
import { ChatbotModal } from "@/components/ChatbotModal";
import { FloatingEmojis } from "@/components/FloatingEmojis";

const services = [
  { title: "Symptom Analysis", desc: "Get insights about your symptoms" },
  { title: "Health Monitoring", desc: "Track your wellness journey" },
  { title: "Medication Reminders", desc: "Never miss your medications" },
  { title: "Emergency Support", desc: "24/7 health assistance" }
];

const Index = () => {
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);

  return (
    <div className="min-h-screen relative">
      <FloatingEmojis />
      
      {/* Main Website Layout */}
      <div className="relative z-10">
        <HealthWebsiteHeader onOpenChatbot={() => setIsChatbotOpen(true)} />
        <HealthHeroSection onOpenChatbot={() => setIsChatbotOpen(true)} />
        <AboutSection />
        
        {/* Additional Sections */}
        <section id="services" className="px-4 py-16">
          <div className="max-w-6xl mx-auto">
            <div className="glass-card p-8 text-center">
              <h2 className="text-3xl font-bold mb-4 medical-accent">Our Health Services</h2>
              <p className="text-foreground/70 mb-8">Comprehensive AI-powered health assistance at your fingertips</p>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {services.map((service) => (
                  <div key={service.title} className="glass-card p-6">
                    <h3 className="font-semibold mb-2 medical-accent">{service.title}</h3>
                    <p className="text-sm text-foreground/60">{service.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
        
        <ContactSection />
      </div>

      {/* Chatbot Modal */}
      <ChatbotModal 
        isOpen={isChatbotOpen} 
        onClose={() => setIsChatbotOpen(false)} 
      />
    </div>
  );
};

export default Index;