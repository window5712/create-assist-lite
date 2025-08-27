import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Sparkles } from "lucide-react";

interface AIAssistantSimpleProps {
  onContentGenerated?: (content: string, hashtags?: string[]) => void;
}

export function AIAssistantSimple({
  onContentGenerated,
}: AIAssistantSimpleProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleGenerateContent = () => {
    const sampleContent =
      "🚀 Exciting news! We're launching amazing new features that will revolutionize your social media experience. Stay tuned for updates! #Innovation #SocialMedia #Tech";
    const sampleHashtags = ["Innovation", "SocialMedia", "Tech"];

    if (onContentGenerated) {
      onContentGenerated(sampleContent, sampleHashtags);
    }
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Sparkles className="h-4 w-4" />
          AI Assistant
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>AI Content Assistant</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Generate engaging social media content with AI assistance.
          </p>
          <Button onClick={handleGenerateContent} className="w-full">
            Generate Sample Content
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
