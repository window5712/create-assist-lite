import { ArrowRight, CheckCircle, Zap, Shield, Users, BarChart3, Github, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

const Landing = () => {
  const features = [
    {
      icon: Zap,
      title: "Lightning Fast Scheduling",
      description: "Schedule posts across all platforms with our intuitive composer and bulk scheduling tools."
    },
    {
      icon: BarChart3,
      title: "Advanced Analytics", 
      description: "Track performance, audience engagement, and ROI with comprehensive analytics dashboards."
    },
    {
      icon: Users,
      title: "GitHub Integration",
      description: "Seamlessly sync your code with GitHub repositories and collaborate with your team in real-time."
    },
    {
      icon: Shield,
      title: "AI Model Library",
      description: "Download and run AI models offline for content generation, embeddings, and advanced features."
    }
  ];

  const pricingFeatures = [
    "Connect up to 3 social accounts",
    "Schedule up to 30 posts per month",
    "Basic analytics and reporting",
    "Email support",
    "Mobile app access"
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">SocialStream</span>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
              Features
            </a>
            <a href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors">
              Pricing
            </a>
            <Link to="/login">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link to="/signup">
              <Button variant="default">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4 gradient-hero">
        <div className="container mx-auto text-center">
          <div className="max-w-4xl mx-auto animate-fade-in">
            <Badge variant="secondary" className="mb-6">
              🚀 Now with GitHub integration and offline AI models
            </Badge>
            
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Streamline Your Social Media Presence
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              The modern, user-friendly platform that helps you schedule posts, analyze performance, 
              and manage all your social accounts from one beautiful dashboard.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/signup">
                <Button size="lg" className="text-lg px-8 py-6">
                  Start Free Trial
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="text-lg px-8 py-6">
                Watch Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything you need to succeed
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Powerful features designed for modern social media management, 
              with an interface that anyone can master.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-glow transition-all duration-300 animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
                <CardHeader className="text-center">
                  <div className="w-12 h-12 gradient-primary rounded-lg flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Start free, scale as you grow
            </h2>
            <p className="text-xl text-muted-foreground">
              Begin with our generous free tier. No credit card required.
            </p>
          </div>
          
          <Card className="max-w-md mx-auto shadow-glow">
            <CardHeader className="text-center">
              <div className="flex items-center justify-center mb-4">
                <Badge variant="secondary" className="text-sm font-medium">
                  Most Popular
                </Badge>
              </div>
              <CardTitle className="text-2xl">Free Forever</CardTitle>
              <div className="text-4xl font-bold text-primary">$0</div>
              <CardDescription>Perfect for getting started</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {pricingFeatures.map((feature, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-success" />
                  <span className="text-sm">{feature}</span>
                </div>
              ))}
              
              <Link to="/signup" className="block w-full">
                <Button className="w-full mt-6" size="lg">
                  Get Started Free
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 px-4">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-6 h-6 gradient-primary rounded-md flex items-center justify-center">
              <Zap className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-semibold">SocialStream</span>
          </div>
          <p className="text-muted-foreground">
            © 2024 SocialStream. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;