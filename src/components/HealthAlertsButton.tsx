import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertTriangle, Bell, X, Mail, MessageCircle, Smartphone } from "lucide-react";
import { toast } from "sonner";

interface HealthAlertsButtonProps {
  user?: { name: string; phone: string; email?: string };
}

export const HealthAlertsButton = ({ user }: HealthAlertsButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    email: user?.email || "",
    state: "",
    district: "",
    preferences: {
      email: true,
      whatsapp: true,
      sms: false
    },
    categories: {
      OUTBREAK: true,
      VACCINATION: true,
      ADVISORY: true,
      EMERGENCY: true
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:8001/api/health-alerts/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
          email: formData.email,
          location: {
            state: formData.state,
            district: formData.district
          },
          preferences: formData.preferences,
          categories: Object.keys(formData.categories).filter(key => formData.categories[key as keyof typeof formData.categories])
        })
      });

      const result = await response.json();

      if (result.success) {
        toast.success("Successfully subscribed to health alerts!");
        setIsOpen(false);
      } else {
        toast.error(result.error || "Subscription failed");
      }
    } catch (error) {
      console.error('Subscription error:', error);
      toast.error("Failed to subscribe. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePreferenceChange = (pref: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [pref]: checked
      }
    }));
  };

  const handleCategoryChange = (category: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      categories: {
        ...prev.categories,
        [category]: checked
      }
    }));
  };

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="bg-red-600 hover:bg-red-700 text-white"
        size="sm"
      >
        <AlertTriangle className="w-4 h-4 mr-2" />
        Health Alerts
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <Card className="glass-card w-full max-w-md m-4 max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Bell className="w-5 h-5 text-red-500" />
                  <CardTitle className="text-lg medical-accent">Health Alert Subscription</CardTitle>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <CardDescription>
                Get real-time alerts for disease outbreaks, vaccination drives, and health advisories
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    required
                    className="glass-input"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    required
                    className="glass-input"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email (Optional)</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="glass-input"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      value={formData.state}
                      onChange={(e) => handleInputChange('state', e.target.value)}
                      placeholder="e.g., Delhi"
                      className="glass-input"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="district">District</Label>
                    <Input
                      id="district"
                      value={formData.district}
                      onChange={(e) => handleInputChange('district', e.target.value)}
                      placeholder="e.g., South Delhi"
                      className="glass-input"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Notification Methods</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="email-pref"
                        checked={formData.preferences.email}
                        onCheckedChange={(checked) => handlePreferenceChange('email', !!checked)}
                      />
                      <Mail className="w-4 h-4" />
                      <Label htmlFor="email-pref">Email</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="whatsapp-pref"
                        checked={formData.preferences.whatsapp}
                        onCheckedChange={(checked) => handlePreferenceChange('whatsapp', !!checked)}
                      />
                      <MessageCircle className="w-4 h-4" />
                      <Label htmlFor="whatsapp-pref">WhatsApp</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="sms-pref"
                        checked={formData.preferences.sms}
                        onCheckedChange={(checked) => handlePreferenceChange('sms', !!checked)}
                      />
                      <Smartphone className="w-4 h-4" />
                      <Label htmlFor="sms-pref">SMS</Label>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Alert Categories</Label>
                  <div className="space-y-2">
                    {Object.entries(formData.categories).map(([category, checked]) => (
                      <div key={category} className="flex items-center space-x-2">
                        <Checkbox
                          id={category}
                          checked={checked}
                          onCheckedChange={(checked) => handleCategoryChange(category, !!checked)}
                        />
                        <Label htmlFor={category} className="capitalize">
                          {category.toLowerCase().replace('_', ' ')}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full medical-gradient text-white"
                  disabled={isLoading}
                >
                  {isLoading ? "Subscribing..." : "Subscribe to Alerts"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
};