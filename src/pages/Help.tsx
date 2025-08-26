import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { useState } from 'react';
import { Search, Mail, MessageSquare, Book, HelpCircle, ChevronDown, ChevronRight, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
}

const faqs: FAQ[] = [
  {
    id: '1',
    question: 'How do I connect my social media accounts?',
    answer: 'Go to Social Accounts in the sidebar, click "Connect Account" and follow the OAuth flow to securely connect your Facebook, Instagram, or LinkedIn accounts. You can manage permissions and reconnect anytime.',
    category: 'Getting Started'
  },
  {
    id: '2',
    question: 'How does AI content generation work?',
    answer: 'Our AI uses Ollama (Llama 3.1 8B) to generate brand-safe, platform-specific content in English and Urdu. Simply describe what you want to create, and the AI will generate optimized variants for each platform with appropriate hashtags and CTAs.',
    category: 'AI Features'
  },
  {
    id: '3',
    question: 'What is the approval workflow?',
    answer: 'Posts can be set to require admin approval before publishing. Editors can create drafts, add comments, and submit for review. Admins receive notifications and can approve, reject, or request changes. Auto-publish can be enabled to skip approvals.',
    category: 'Workflow'
  },
  {
    id: '4',
    question: 'How do I schedule posts?',
    answer: 'In the Composer, set your desired date and time, then click Schedule. You can also use the Calendar view to drag and drop posts to different time slots. The system handles time zones and platform-specific optimal posting times.',
    category: 'Scheduling'
  },
  {
    id: '5',
    question: 'What analytics are available?',
    answer: 'Track post performance, engagement metrics, account health, and publishing success rates. View detailed charts showing impressions, reach, clicks, and engagement over time. Export data to CSV or Excel for further analysis.',
    category: 'Analytics'
  },
  {
    id: '6',
    question: 'How do user roles work?',
    answer: 'Admins can manage all content and settings, approve posts, and manage team members. Editors can create, edit, and schedule content but may need approval. Viewers can only view content and analytics. Roles are set per organization.',
    category: 'Team Management'
  },
  {
    id: '7',
    question: 'What happens if a social media token expires?',
    answer: 'You\'ll receive a notification when tokens are about to expire. The system will attempt to refresh tokens automatically, but you may need to reconnect the account if refresh fails. Check the Social Accounts page for connection status.',
    category: 'Troubleshooting'
  },
  {
    id: '8',
    question: 'Can I create custom templates?',
    answer: 'Yes! Go to Templates to create reusable content templates. You can include variables like {company_name} for dynamic content, set platform targeting, and organize by topics. Templates track usage and can be shared across your team.',
    category: 'Templates'
  }
];

export default function Help() {
  const { user, organization } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [openFAQs, setOpenFAQs] = useState<string[]>([]);
  const [contactForm, setContactForm] = useState({
    subject: '',
    message: '',
    priority: 'medium'
  });
  const [submitting, setSubmitting] = useState(false);

  const categories = ['All', ...Array.from(new Set(faqs.map(faq => faq.category)))];

  const filteredFAQs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleFAQ = (faqId: string) => {
    setOpenFAQs(prev => 
      prev.includes(faqId) 
        ? prev.filter(id => id !== faqId)
        : [...prev, faqId]
    );
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!contactForm.subject.trim() || !contactForm.message.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setSubmitting(true);
    try {
      // Log the contact form submission
      if (user && organization) {
        await supabase
          .from('audit_logs')
          .insert({
            organization_id: organization.id,
            user_id: user.id,
            resource_type: 'support_request',
            action: 'submit_contact_form',
            new_values: contactForm
          });
      }

      // In a real app, you'd send this to your support system
      toast({
        title: "Message Sent",
        description: "We'll get back to you within 24 hours"
      });

      setContactForm({
        subject: '',
        message: '',
        priority: 'medium'
      });
    } catch (error) {
      console.error('Error submitting contact form:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout 
      title="Help Center"
      description="Find answers to common questions or get in touch with our support team"
    >
      <div className="space-y-6">
        {/* Search */}
        <div className="max-w-2xl mx-auto">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search for help topics..." 
              className="pl-10 h-12"
            />
          </div>
        </div>

        {/* Quick Access Cards */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          <Card className="p-6 text-center hover:shadow-lg transition-shadow cursor-pointer">
            <Book className="h-12 w-12 text-primary mx-auto mb-4" />
            <h3 className="font-semibold mb-2">Documentation</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Comprehensive guides and tutorials
            </p>
            <Button variant="outline" size="sm" className="w-full sm:w-auto">
              <ExternalLink className="h-4 w-4 mr-2" />
              View Docs
            </Button>
          </Card>

          <Card className="p-6 text-center hover:shadow-lg transition-shadow cursor-pointer">
            <MessageSquare className="h-12 w-12 text-primary mx-auto mb-4" />
            <h3 className="font-semibold mb-2">Live Chat</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Get instant help from our support team
            </p>
            <Button variant="outline" size="sm" className="w-full sm:w-auto">
              <MessageSquare className="h-4 w-4 mr-2" />
              Start Chat
            </Button>
          </Card>

          <Card className="p-6 text-center hover:shadow-lg transition-shadow cursor-pointer">
            <Mail className="h-12 w-12 text-primary mx-auto mb-4" />
            <h3 className="font-semibold mb-2">Email Support</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Send us a detailed message
            </p>
            <Button variant="outline" size="sm" className="w-full sm:w-auto">
              <Mail className="h-4 w-4 mr-2" />
              Contact Us
            </Button>
          </Card>
        </div>

        <div className="grid gap-8 grid-cols-1 lg:grid-cols-2">
          {/* FAQ Section */}
          <div>
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            
            {/* Search and Filter */}
            <div className="space-y-4 mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search FAQs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              
              <div className="flex flex-wrap gap-2">
                {categories.map(category => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </div>

            {/* FAQ List */}
            <div className="space-y-4">
              {filteredFAQs.map((faq) => (
                <Card key={faq.id}>
                  <Collapsible 
                    open={openFAQs.includes(faq.id)} 
                    onOpenChange={() => toggleFAQ(faq.id)}
                  >
                    <CollapsibleTrigger asChild>
                      <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base text-left">{faq.question}</CardTitle>
                          {openFAQs.includes(faq.id) ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </div>
                      </CardHeader>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <CardContent>
                        <p className="text-muted-foreground">{faq.answer}</p>
                      </CardContent>
                    </CollapsibleContent>
                  </Collapsible>
                </Card>
              ))}

              {filteredFAQs.length === 0 && (
                <div className="text-center py-8">
                  <HelpCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No FAQs match your search</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Try different keywords or contact support
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Contact Form */}
          <div>
            <h2 className="text-2xl font-bold mb-6">Contact Support</h2>
            
            <Card>
              <CardHeader>
                <CardTitle>Send us a message</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleContactSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="subject">Subject *</Label>
                    <Input
                      id="subject"
                      value={contactForm.subject}
                      onChange={(e) => setContactForm(prev => ({ ...prev, subject: e.target.value }))}
                      placeholder="Brief description of your issue"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="priority">Priority</Label>
                    <select 
                      id="priority"
                      value={contactForm.priority}
                      onChange={(e) => setContactForm(prev => ({ ...prev, priority: e.target.value }))}
                      className="w-full px-3 py-2 border border-input rounded-md bg-background"
                    >
                      <option value="low">Low - General question</option>
                      <option value="medium">Medium - Need assistance</option>
                      <option value="high">High - Blocking issue</option>
                      <option value="urgent">Urgent - Service down</option>
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="message">Message *</Label>
                    <Textarea
                      id="message"
                      value={contactForm.message}
                      onChange={(e) => setContactForm(prev => ({ ...prev, message: e.target.value }))}
                      placeholder="Provide detailed information about your issue, including steps to reproduce if applicable"
                      rows={6}
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={submitting}>
                    {submitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Sending...
                      </>
                    ) : (
                      <>
                        <Mail className="h-4 w-4 mr-2" />
                        Send Message
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Response Time Info */}
            <Card className="mt-6">
              <CardContent className="pt-6">
                <h4 className="font-semibold mb-2">Expected Response Times</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Low Priority:</span>
                    <span className="text-muted-foreground">2-3 business days</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Medium Priority:</span>
                    <span className="text-muted-foreground">24-48 hours</span>
                  </div>
                  <div className="flex justify-between">
                    <span>High Priority:</span>
                    <span className="text-muted-foreground">4-8 hours</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Urgent:</span>
                    <span className="text-orange-600 font-medium">1-2 hours</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}