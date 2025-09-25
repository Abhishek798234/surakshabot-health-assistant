import { useState } from "react";
import { Mail, Phone, MapPin, MessageCircle, Send, Clock, Shield, Users } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export const ContactSection = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
    category: "general"
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Simulate form submission
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success("Message sent successfully! We'll get back to you within 24 hours.");
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
        category: "general"
      });
    } catch (error) {
      toast.error("Failed to send message. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <section id="contact" className="py-16 px-4 bg-gradient-to-b from-background to-background/50">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold medical-accent mb-4">Get In Touch</h2>
          <p className="text-xl text-foreground/70 max-w-3xl mx-auto">
            Have questions about Surakshabot? Need technical support? Want to collaborate? 
            We're here to help and would love to hear from you.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div className="space-y-8">
            <div>
              <h3 className="text-2xl font-bold medical-accent mb-6">Contact Information</h3>
              
              <div className="space-y-6">
                <Card className="glass-card">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <Mail className="w-6 h-6 text-medical-primary mt-1" />
                      <div>
                        <h4 className="font-semibold mb-1">Email Support</h4>
                        <p className="text-foreground/70 mb-2">Get help via email</p>
                        <a href="mailto:surakshabot8@gmail.com" className="text-medical-primary hover:underline">
                          surakshabot8@gmail.com
                        </a>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass-card">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <MessageCircle className="w-6 h-6 text-green-500 mt-1" />
                      <div>
                        <h4 className="font-semibold mb-1">WhatsApp Support</h4>
                        <p className="text-foreground/70 mb-2">Instant messaging support</p>
                        <a href="https://wa.me/14155238886" className="text-green-500 hover:underline">
                          +1 (415) 523-8886
                        </a>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass-card">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <MapPin className="w-6 h-6 text-blue-500 mt-1" />
                      <div>
                        <h4 className="font-semibold mb-1">Medical Advisory</h4>
                        <p className="text-foreground/70 mb-2">Clinical guidance and oversight</p>
                        <p className="text-blue-500">INDIRA GANDHI ESI HOSPITAL</p>
                        <p className="text-sm text-foreground/60">Dr. Ramesh Pal - Chief Medical Advisor</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass-card">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <Clock className="w-6 h-6 text-purple-500 mt-1" />
                      <div>
                        <h4 className="font-semibold mb-1">Response Time</h4>
                        <p className="text-foreground/70 mb-2">We typically respond within:</p>
                        <ul className="text-sm text-foreground/60 space-y-1">
                          <li>• Email: 24 hours</li>
                          <li>• WhatsApp: 2-4 hours</li>
                          <li>• Emergency: Immediate via chatbot</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-xl font-bold medical-accent mb-4">Quick Support</h3>
              <div className="grid grid-cols-2 gap-4">
                <Card className="glass-card cursor-pointer hover:bg-medical-primary/5 transition-colors">
                  <CardContent className="p-4 text-center">
                    <Shield className="w-8 h-8 text-medical-primary mx-auto mb-2" />
                    <h4 className="font-semibold text-sm">Privacy Policy</h4>
                  </CardContent>
                </Card>
                <Card className="glass-card cursor-pointer hover:bg-medical-primary/5 transition-colors">
                  <CardContent className="p-4 text-center">
                    <Users className="w-8 h-8 text-medical-primary mx-auto mb-2" />
                    <h4 className="font-semibold text-sm">User Guide</h4>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div>
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-2xl medical-accent">Send us a Message</CardTitle>
                <CardDescription>
                  Fill out the form below and we'll get back to you as soon as possible.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        required
                        className="glass-input"
                        placeholder="Your full name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className="glass-input"
                        placeholder="+1234567890"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      required
                      className="glass-input"
                      placeholder="your.email@example.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <select
                      id="category"
                      value={formData.category}
                      onChange={(e) => handleInputChange('category', e.target.value)}
                      className="w-full p-2 rounded-md border border-input bg-background text-foreground"
                    >
                      <option value="general">General Inquiry</option>
                      <option value="technical">Technical Support</option>
                      <option value="medical">Medical Question</option>
                      <option value="partnership">Partnership</option>
                      <option value="feedback">Feedback</option>
                      <option value="bug">Bug Report</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject *</Label>
                    <Input
                      id="subject"
                      value={formData.subject}
                      onChange={(e) => handleInputChange('subject', e.target.value)}
                      required
                      className="glass-input"
                      placeholder="Brief description of your inquiry"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message *</Label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => handleInputChange('message', e.target.value)}
                      required
                      className="glass-input min-h-[120px]"
                      placeholder="Please provide details about your inquiry..."
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full medical-gradient text-white"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      "Sending..."
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Send Message
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Emergency Notice */}
            <Card className="glass-card mt-6 border-red-200 bg-red-50/50">
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <Shield className="w-5 h-5 text-red-500 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-red-700 mb-1">Medical Emergency?</h4>
                    <p className="text-sm text-red-600">
                      For immediate medical assistance, please contact your local emergency services 
                      or use our AI chatbot for instant health guidance. This contact form is not 
                      monitored 24/7 for emergency situations.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Additional Information */}
        <div className="mt-16 text-center">
          <Card className="glass-card max-w-4xl mx-auto">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold medical-accent mb-4">Why Contact Us?</h3>
              <div className="grid md:grid-cols-3 gap-6 text-left">
                <div>
                  <h4 className="font-semibold mb-2">🤝 Partnership Opportunities</h4>
                  <p className="text-sm text-foreground/70">
                    Collaborate with us to expand healthcare accessibility and integrate 
                    Surakshabot into your healthcare ecosystem.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">🔧 Technical Support</h4>
                  <p className="text-sm text-foreground/70">
                    Get help with technical issues, API integration, or customization 
                    requests for your organization.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">💡 Feedback & Suggestions</h4>
                  <p className="text-sm text-foreground/70">
                    Help us improve Surakshabot by sharing your experience, suggestions, 
                    or reporting any issues you encounter.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};