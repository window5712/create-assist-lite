import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { 
  Clock, 
  Globe, 
  Twitter, 
  Facebook, 
  Instagram, 
  Linkedin, 
  Youtube,
  ArrowRight,
  ArrowLeft,
  Zap,
  CheckCircle,
  Users
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Onboarding = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [onboardingData, setOnboardingData] = useState({
    timezone: "",
    language: "en",
    socialAccounts: [] as string[],
    goals: [] as string[],
  });
  const navigate = useNavigate();
  const { toast } = useToast();

  const totalSteps = 4;
  const progress = (currentStep / totalSteps) * 100;

  const timezones = [
    { value: "UTC-8", label: "Pacific Time (UTC-8)" },
    { value: "UTC-7", label: "Mountain Time (UTC-7)" },
    { value: "UTC-6", label: "Central Time (UTC-6)" },
    { value: "UTC-5", label: "Eastern Time (UTC-5)" },
    { value: "UTC+0", label: "GMT (UTC+0)" },
    { value: "UTC+1", label: "Central European Time (UTC+1)" },
    { value: "UTC+5:30", label: "India Standard Time (UTC+5:30)" },
  ];

  const languages = [
    { value: "en", label: "English", flag: "🇺🇸" },
    { value: "ur", label: "اردو (Urdu)", flag: "🇵🇰" },
  ];

  const socialPlatforms = [
    { id: "twitter", name: "Twitter", icon: Twitter, color: "bg-blue-500" },
    { id: "facebook", name: "Facebook", icon: Facebook, color: "bg-blue-600" },
    { id: "instagram", name: "Instagram", icon: Instagram, color: "bg-pink-500" },
    { id: "linkedin", name: "LinkedIn", icon: Linkedin, color: "bg-blue-700" },
    { id: "youtube", name: "YouTube", icon: Youtube, color: "bg-red-600" },
  ];

  const goals = [
    { id: "grow-audience", label: "Grow my audience", description: "Increase followers and engagement" },
    { id: "save-time", label: "Save time on posting", description: "Automate and schedule content" },
    { id: "analyze-performance", label: "Analyze performance", description: "Track metrics and insights" },
    { id: "team-collaboration", label: "Team collaboration", description: "Work with team members" },
  ];

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      // Complete onboarding
      toast({
        title: "Welcome to SocialStream! 🎉",
        description: "Your account is set up and ready to go.",
      });
      navigate("/dashboard");
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const updateData = (field: string, value: any) => {
    setOnboardingData(prev => ({ ...prev, [field]: value }));
  };

  const toggleSocialAccount = (accountId: string) => {
    const updated = onboardingData.socialAccounts.includes(accountId)
      ? onboardingData.socialAccounts.filter(id => id !== accountId)
      : [...onboardingData.socialAccounts, accountId];
    updateData("socialAccounts", updated);
  };

  const toggleGoal = (goalId: string) => {
    const updated = onboardingData.goals.includes(goalId)
      ? onboardingData.goals.filter(id => id !== goalId)
      : [...onboardingData.goals, goalId];
    updateData("goals", updated);
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return onboardingData.timezone !== "";
      case 2:
        return onboardingData.language !== "";
      case 3:
        return true; // Social accounts are optional
      case 4:
        return onboardingData.goals.length > 0;
      default:
        return true;
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-primary-foreground" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Choose your timezone</h2>
              <p className="text-muted-foreground">
                This helps us schedule your posts at the perfect time for your audience.
              </p>
            </div>

            <div className="space-y-3">
              <Label htmlFor="timezone">Select your timezone</Label>
              <Select value={onboardingData.timezone} onValueChange={(value) => updateData("timezone", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose your timezone" />
                </SelectTrigger>
                <SelectContent>
                  {timezones.map((tz) => (
                    <SelectItem key={tz.value} value={tz.value}>
                      {tz.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <Globe className="w-8 h-8 text-primary-foreground" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Select your language</h2>
              <p className="text-muted-foreground">
                Choose your preferred language for the interface and notifications.
              </p>
            </div>

            <div className="grid gap-3">
              {languages.map((lang) => (
                <div
                  key={lang.value}
                  className={`p-4 border rounded-lg cursor-pointer transition-all hover:border-primary ${
                    onboardingData.language === lang.value ? "border-primary bg-primary-light" : "border-border"
                  }`}
                  onClick={() => updateData("language", lang.value)}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{lang.flag}</span>
                    <span className="font-medium">{lang.label}</span>
                    {onboardingData.language === lang.value && (
                      <CheckCircle className="w-5 h-5 text-primary ml-auto" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-primary-foreground" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Connect your accounts</h2>
              <p className="text-muted-foreground">
                Connect your social media accounts to start managing them all in one place.
              </p>
              <Badge variant="secondary" className="mt-2">
                You can skip this step and connect accounts later
              </Badge>
            </div>

            <div className="grid gap-3">
              {socialPlatforms.map((platform) => {
                const Icon = platform.icon;
                const isSelected = onboardingData.socialAccounts.includes(platform.id);
                
                return (
                  <div
                    key={platform.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-all hover:border-primary ${
                      isSelected ? "border-primary bg-primary-light" : "border-border"
                    }`}
                    onClick={() => toggleSocialAccount(platform.id)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 ${platform.color} rounded-lg flex items-center justify-center`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <span className="font-medium">{platform.name}</span>
                        <p className="text-sm text-muted-foreground">
                          Connect your {platform.name} account
                        </p>
                      </div>
                      {isSelected && <CheckCircle className="w-5 h-5 text-primary" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-primary-foreground" />
              </div>
              <h2 className="text-2xl font-bold mb-2">What are your goals?</h2>
              <p className="text-muted-foreground">
                Help us customize your experience by selecting your main objectives.
              </p>
            </div>

            <div className="space-y-3">
              {goals.map((goal) => (
                <div key={goal.id} className="flex items-start space-x-3 p-4 border rounded-lg">
                  <Checkbox
                    id={goal.id}
                    checked={onboardingData.goals.includes(goal.id)}
                    onCheckedChange={() => toggleGoal(goal.id)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <Label htmlFor={goal.id} className="font-medium cursor-pointer">
                      {goal.label}
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      {goal.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-6">
            <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">SocialStream</span>
          </div>
          
          <div className="mb-6">
            <Progress value={progress} className="h-2" />
            <p className="text-sm text-muted-foreground mt-2">
              Step {currentStep} of {totalSteps}
            </p>
          </div>
        </div>

        <Card className="shadow-lg">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Getting Started</CardTitle>
                <CardDescription>
                  Let's set up your account in just a few steps
                </CardDescription>
              </div>
              <Badge variant="outline">{Math.round(progress)}% Complete</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {renderStep()}

            <div className="flex justify-between pt-6">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 1}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              
              <Button
                onClick={handleNext}
                disabled={!canProceed()}
              >
                {currentStep === totalSteps ? "Complete Setup" : "Continue"}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Onboarding;