import { Shield, Users, Globe, Heart, Award, Zap, MessageCircle, MapPin, Bell, Calendar } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const AboutSection = () => {
  return (
    <section id="about" className="py-16 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-4">
            <Shield className="w-12 h-12 text-medical-primary mr-3" />
            <h2 className="text-4xl font-bold medical-accent">About Surakshabot</h2>
          </div>
          <p className="text-xl text-foreground/70 max-w-3xl mx-auto">
            Revolutionizing healthcare accessibility through AI-powered multilingual health assistance, 
            connecting communities to vital medical resources and real-time health information.
          </p>
        </div>

        {/* Mission & Vision */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center medical-accent">
                <Heart className="w-6 h-6 mr-2 text-red-500" />
                Our Mission
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground/80">
                To democratize healthcare access by breaking down language barriers and providing 
                intelligent, culturally-sensitive health guidance to communities worldwide. We believe 
                everyone deserves timely, accurate health information in their native language.
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center medical-accent">
                <Globe className="w-6 h-6 mr-2 text-blue-500" />
                Our Vision
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground/80">
                A world where language is never a barrier to healthcare. We envision a future where 
                AI-powered health assistants provide instant, reliable medical guidance, connect users 
                to local healthcare resources, and help prevent disease outbreaks through early alerts.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Key Features */}
        <div className="mb-16">
          <h3 className="text-3xl font-bold text-center medical-accent mb-8">Comprehensive Health Features</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="glass-card text-center">
              <CardContent className="pt-6">
                <MessageCircle className="w-12 h-12 text-medical-primary mx-auto mb-4" />
                <h4 className="font-semibold mb-2">AI Health Chat</h4>
                <p className="text-sm text-foreground/70">Intelligent conversations with voice support in 11 languages</p>
              </CardContent>
            </Card>

            <Card className="glass-card text-center">
              <CardContent className="pt-6">
                <MapPin className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <h4 className="font-semibold mb-2">Location Services</h4>
                <p className="text-sm text-foreground/70">Find nearby hospitals, clinics, and pharmacies instantly</p>
              </CardContent>
            </Card>

            <Card className="glass-card text-center">
              <CardContent className="pt-6">
                <Bell className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h4 className="font-semibold mb-2">Health Alerts</h4>
                <p className="text-sm text-foreground/70">Real-time disease outbreak notifications via WhatsApp & Email</p>
              </CardContent>
            </Card>

            <Card className="glass-card text-center">
              <CardContent className="pt-6">
                <Calendar className="w-12 h-12 text-purple-500 mx-auto mb-4" />
                <h4 className="font-semibold mb-2">Smart Reminders</h4>
                <p className="text-sm text-foreground/70">Vaccination & appointment reminders with automated scheduling</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Impact Statistics */}
        <div className="mb-16">
          <h3 className="text-3xl font-bold text-center medical-accent mb-8">Our Impact</h3>
          <div className="grid md:grid-cols-4 gap-6">
            <Card className="glass-card text-center">
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-medical-primary mb-2">11</div>
                <p className="text-sm text-foreground/70">Languages Supported</p>
              </CardContent>
            </Card>
            <Card className="glass-card text-center">
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-green-500 mb-2">24/7</div>
                <p className="text-sm text-foreground/70">Health Assistance</p>
              </CardContent>
            </Card>
            <Card className="glass-card text-center">
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-blue-500 mb-2">100%</div>
                <p className="text-sm text-foreground/70">Privacy Protected</p>
              </CardContent>
            </Card>
            <Card className="glass-card text-center">
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-purple-500 mb-2">∞</div>
                <p className="text-sm text-foreground/70">Conversations</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Development Team */}
        <div className="mb-16">
          <h3 className="text-3xl font-bold text-center medical-accent mb-8">Development Team</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-lg">Abhishek Kumar Pal</CardTitle>
                <CardDescription>Lead Developer - B.Tech</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-foreground/70">Full-stack development, AI integration, system architecture</p>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-lg">Aditi Sinha</CardTitle>
                <CardDescription>Frontend Developer - B.Tech (Pursuing)</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-foreground/70">UI/UX design, React development, user experience optimization</p>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-lg">Aasta Tiwari</CardTitle>
                <CardDescription>Backend Developer - B.Tech (Pursuing)</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-foreground/70">Database design, API development, server management</p>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-lg">Abhinav Tomar</CardTitle>
                <CardDescription>AI Specialist - B.Tech (Pursuing)</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-foreground/70">Machine learning, natural language processing, AI optimization</p>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-lg">Aditya Koundal</CardTitle>
                <CardDescription>DevOps Engineer - B.Tech (Pursuing)</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-foreground/70">Cloud deployment, system monitoring, security implementation</p>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-lg">Arya Gupta</CardTitle>
                <CardDescription>QA Engineer - B.Tech (Pursuing)</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-foreground/70">Quality assurance, testing automation, performance optimization</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Medical Advisor */}
        <div className="mb-16">
          <h3 className="text-3xl font-bold text-center medical-accent mb-8">Medical Advisory</h3>
          <Card className="glass-card max-w-2xl mx-auto">
            <CardHeader className="text-center">
              <div className="w-20 h-20 rounded-full bg-medical-primary/20 flex items-center justify-center mx-auto mb-4">
                <Users className="w-10 h-10 text-medical-primary" />
              </div>
              <CardTitle className="text-2xl">Dr. Ramesh Pal</CardTitle>
              <CardDescription className="text-lg">Chief Medical Advisor</CardDescription>
              <CardDescription>INDIRA GANDHI ESI HOSPITAL</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-foreground/80">
                Providing medical expertise and guidance to ensure accurate health information delivery. 
                Dr. Pal oversees the clinical accuracy of our AI responses and helps maintain the highest 
                standards of medical care in our digital health platform.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Technology Stack */}
        <div className="mb-16">
          <h3 className="text-3xl font-bold text-center medical-accent mb-8">Technology Excellence</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Zap className="w-6 h-6 mr-2 text-yellow-500" />
                  AI & Machine Learning
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-foreground/70 space-y-1">
                  <li>• Google Gemini 2.0 Flash AI</li>
                  <li>• Natural Language Processing</li>
                  <li>• Speech Recognition & Synthesis</li>
                  <li>• Multilingual Translation</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Globe className="w-6 h-6 mr-2 text-blue-500" />
                  Web Technologies
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-foreground/70 space-y-1">
                  <li>• React 18 & TypeScript</li>
                  <li>• Node.js & Express</li>
                  <li>• MongoDB Atlas</li>
                  <li>• Real-time Communication</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="w-6 h-6 mr-2 text-green-500" />
                  Security & Privacy
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-foreground/70 space-y-1">
                  <li>• End-to-end Encryption</li>
                  <li>• HIPAA Compliance Ready</li>
                  <li>• Secure Data Handling</li>
                  <li>• Privacy by Design</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Certifications */}
        <div className="text-center">
          <h3 className="text-3xl font-bold medical-accent mb-8">Compliance & Standards</h3>
          <div className="grid md:grid-cols-4 gap-6">
            <Card className="glass-card">
              <CardContent className="pt-6 text-center">
                <Award className="w-12 h-12 text-gold-500 mx-auto mb-4" />
                <h4 className="font-semibold mb-2">Medical Standards</h4>
                <p className="text-sm text-foreground/70">WHO Guidelines Compliant</p>
              </CardContent>
            </Card>
            <Card className="glass-card">
              <CardContent className="pt-6 text-center">
                <Shield className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <h4 className="font-semibold mb-2">Data Protection</h4>
                <p className="text-sm text-foreground/70">GDPR & Privacy Compliant</p>
              </CardContent>
            </Card>
            <Card className="glass-card">
              <CardContent className="pt-6 text-center">
                <Globe className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                <h4 className="font-semibold mb-2">Accessibility</h4>
                <p className="text-sm text-foreground/70">WCAG 2.1 AA Standard</p>
              </CardContent>
            </Card>
            <Card className="glass-card">
              <CardContent className="pt-6 text-center">
                <Heart className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h4 className="font-semibold mb-2">Healthcare Ready</h4>
                <p className="text-sm text-foreground/70">HIPAA Compliance Ready</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-16 p-6 glass-card">
          <p className="text-center text-sm text-foreground/60">
            <strong>Medical Disclaimer:</strong> Surakshabot provides health information for educational purposes only. 
            Always consult with qualified healthcare professionals for medical advice, diagnosis, or treatment. 
            This AI assistant is not a substitute for professional medical care.
          </p>
        </div>
      </div>
    </section>
  );
};