import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Brain,
  Download,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Search,
  HardDrive,
  Cpu,
  Zap,
  RefreshCw,
} from "lucide-react";

interface AIModel {
  id: string;
  name: string;
  description: string;
  type: "text-generation" | "feature-extraction" | "image-classification" | "speech-recognition";
  size: string;
  accuracy: number;
  speed: "fast" | "medium" | "slow";
  status: "available" | "downloading" | "installed" | "error";
  downloadProgress?: number;
  memoryUsage?: string;
  provider: "huggingface" | "openai" | "anthropic" | "local";
}

export function ModelDownloader() {
  const [models, setModels] = useState<AIModel[]>([
    {
      id: "mixedbread-ai/mxbai-embed-xsmall-v1",
      name: "MixedBread Embedding Model",
      description: "Lightweight text embedding model for semantic search",
      type: "feature-extraction",
      size: "22MB",
      accuracy: 92,
      speed: "fast",
      status: "installed",
      memoryUsage: "45MB",
      provider: "huggingface"
    },
    {
      id: "onnx-community/whisper-tiny.en",
      name: "Whisper Tiny English",
      description: "OpenAI's Whisper model for English speech recognition",
      type: "speech-recognition", 
      size: "39MB",
      accuracy: 89,
      speed: "fast",
      status: "available",
      provider: "huggingface"
    },
    {
      id: "mobilenetv4_conv_small",
      name: "MobileNetV4 Small",
      description: "Efficient image classification model",
      type: "image-classification",
      size: "15MB", 
      accuracy: 85,
      speed: "fast",
      status: "available",
      provider: "huggingface"
    },
    {
      id: "gpt2-medium",
      name: "GPT-2 Medium",
      description: "Text generation model for creative writing",
      type: "text-generation",
      size: "355MB",
      accuracy: 94,
      speed: "medium",
      status: "available",
      provider: "huggingface"
    }
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const { toast } = useToast();

  const filteredModels = models.filter(model => {
    const matchesSearch = model.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         model.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || model.type === filterType;
    const matchesStatus = filterStatus === "all" || model.status === filterStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const downloadModel = async (modelId: string) => {
    setModels(prevModels =>
      prevModels.map(model =>
        model.id === modelId
          ? { ...model, status: "downloading" as const, downloadProgress: 0 }
          : model
      )
    );

    // Simulate download progress
    const progressInterval = setInterval(() => {
      setModels(prevModels =>
        prevModels.map(model => {
          if (model.id === modelId && model.downloadProgress !== undefined) {
            const newProgress = model.downloadProgress + Math.random() * 15;
            if (newProgress >= 100) {
              clearInterval(progressInterval);
              return { ...model, status: "installed" as const, downloadProgress: 100, memoryUsage: "32MB" };
            }
            return { ...model, downloadProgress: newProgress };
          }
          return model;
        })
      );
    }, 500);

    // Simulate completion
    setTimeout(() => {
      clearInterval(progressInterval);
      setModels(prevModels =>
        prevModels.map(model =>
          model.id === modelId
            ? { ...model, status: "installed" as const, downloadProgress: 100 }
            : model
        )
      );
      toast({
        title: "Model Downloaded",
        description: "AI model is ready to use",
      });
    }, 8000);
  };

  const deleteModel = (modelId: string) => {
    setModels(prevModels =>
      prevModels.map(model =>
        model.id === modelId
          ? { ...model, status: "available" as const, memoryUsage: undefined }
          : model
      )
    );
    toast({
      title: "Model Removed",
      description: "AI model has been deleted from device",
    });
  };

  const getStatusIcon = (model: AIModel) => {
    switch (model.status) {
      case "installed":
        return <CheckCircle2 className="h-4 w-4 text-success" />;
      case "downloading":
        return <RefreshCw className="h-4 w-4 text-primary animate-spin" />;
      case "error":
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      default:
        return <Download className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getSpeedBadge = (speed: AIModel["speed"]) => {
    const variants = {
      fast: "bg-success/10 text-success",
      medium: "bg-warning/10 text-warning", 
      slow: "bg-destructive/10 text-destructive"
    };
    return <Badge className={variants[speed]}>{speed}</Badge>;
  };

  const getTypeIcon = (type: AIModel["type"]) => {
    const icons = {
      "text-generation": Brain,
      "feature-extraction": Search,
      "image-classification": Cpu,
      "speech-recognition": Zap
    };
    const Icon = icons[type];
    return <Icon className="h-4 w-4" />;
  };

  const totalSize = models
    .filter(m => m.status === "installed")
    .reduce((acc, m) => acc + parseInt(m.size), 0);

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
              <Brain className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <CardTitle>AI Model Library</CardTitle>
              <CardDescription>Download and manage AI models for offline use</CardDescription>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <HardDrive className="h-4 w-4" />
            <span>{totalSize}MB used</span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <Input
              placeholder="Search models..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="text-generation">Text Generation</SelectItem>
              <SelectItem value="feature-extraction">Embeddings</SelectItem>
              <SelectItem value="image-classification">Image Classification</SelectItem>
              <SelectItem value="speech-recognition">Speech Recognition</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-full sm:w-[140px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="available">Available</SelectItem>
              <SelectItem value="installed">Installed</SelectItem>
              <SelectItem value="downloading">Downloading</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-4">
          {filteredModels.map((model) => (
            <div key={model.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <div className="flex items-center justify-center w-10 h-10 bg-muted rounded-lg">
                    {getTypeIcon(model.type)}
                  </div>
                  
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-medium truncate">{model.name}</h3>
                      {getStatusIcon(model)}
                    </div>
                    <p className="text-sm text-muted-foreground">{model.description}</p>
                    
                    <div className="flex items-center space-x-4 text-sm">
                      <div className="flex items-center space-x-1">
                        <span className="text-muted-foreground">Size:</span>
                        <span>{model.size}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span className="text-muted-foreground">Accuracy:</span>
                        <span>{model.accuracy}%</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span className="text-muted-foreground">Speed:</span>
                        {getSpeedBadge(model.speed)}
                      </div>
                      {model.memoryUsage && (
                        <div className="flex items-center space-x-1">
                          <span className="text-muted-foreground">Memory:</span>
                          <span>{model.memoryUsage}</span>
                        </div>
                      )}
                    </div>

                    {model.status === "downloading" && model.downloadProgress !== undefined && (
                      <div className="space-y-2 mt-3">
                        <div className="flex justify-between text-sm">
                          <span>Downloading...</span>
                          <span>{Math.round(model.downloadProgress)}%</span>
                        </div>
                        <Progress value={model.downloadProgress} className="h-2" />
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2 ml-4">
                  {model.status === "available" && (
                    <Button
                      size="sm"
                      onClick={() => downloadModel(model.id)}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  )}
                  
                  {model.status === "installed" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteModel(model.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                  
                  {model.status === "downloading" && (
                    <Button variant="outline" size="sm" disabled>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredModels.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No models found matching your criteria</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}