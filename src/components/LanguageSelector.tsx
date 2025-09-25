import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Languages, ChevronDown } from "lucide-react";
import { SUPPORTED_LANGUAGES, Language, translationService } from "@/services/translation";

interface LanguageSelectorProps {
  onLanguageChange: (language: Language) => void;
}

export const LanguageSelector = ({ onLanguageChange }: LanguageSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState(translationService.getCurrentLanguage());

  const handleLanguageSelect = (language: Language) => {
    setCurrentLanguage(language);
    translationService.setLanguage(language);
    onLanguageChange(language);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        className="glass border-glass-border hover:border-medical-primary transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Languages className="w-4 h-4 mr-2" />
        <span className="mr-1">{currentLanguage.flag}</span>
        <span className="hidden sm:inline">{currentLanguage.name}</span>
        <ChevronDown className="w-3 h-3 ml-1" />
      </Button>

      {isOpen && (
        <Card className="absolute top-full mt-2 right-0 z-50 glass-card min-w-[200px]">
          <CardContent className="p-2">
            <div className="space-y-1">
              {SUPPORTED_LANGUAGES.map((language) => (
                <Button
                  key={language.code}
                  variant="ghost"
                  size="sm"
                  className={`w-full justify-start hover:bg-medical-primary/10 ${
                    currentLanguage.code === language.code ? 'bg-medical-primary/20' : ''
                  }`}
                  onClick={() => handleLanguageSelect(language)}
                >
                  <span className="mr-3">{language.flag}</span>
                  <span>{language.name}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};