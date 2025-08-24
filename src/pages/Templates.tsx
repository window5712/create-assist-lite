import { useState, useEffect } from 'react';
import { Plus, Search, Filter, Edit2, Trash2, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface Template {
  id: string;
  name: string;
  template_type: string;
  content: string;
  platforms: string[];
  language: string;
  is_active: boolean;
  usage_count: number;
  topics: { name: string } | null;
  created_at: string;
}

interface Topic {
  id: string;
  name: string;
  description: string;
  keywords: string[];
}

export default function Templates() {
  const { user, organization } = useAuth();
  const { toast } = useToast();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterLanguage, setFilterLanguage] = useState('all');
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const [newTemplate, setNewTemplate] = useState({
    name: '',
    template_type: 'post',
    content: '',
    topic_id: '',
    platforms: [] as string[],
    language: 'en',
    variables: {} as Record<string, string>
  });

  useEffect(() => {
    if (user && organization) {
      fetchTemplates();
      fetchTopics();
    }
  }, [user, organization]);

  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('templates')
        .select(`
          *,
          topics (name)
        `)
        .eq('organization_id', organization.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error('Error fetching templates:', error);
      toast({
        title: "Error",
        description: "Failed to fetch templates",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchTopics = async () => {
    try {
      const { data, error } = await supabase
        .from('topics')
        .select('*')
        .eq('organization_id', organization.id);

      if (error) throw error;
      setTopics(data || []);
    } catch (error) {
      console.error('Error fetching topics:', error);
    }
  };

  const createTemplate = async () => {
    if (!newTemplate.name.trim() || !newTemplate.content.trim()) {
      toast({
        title: "Validation Error",
        description: "Name and content are required",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('templates')
        .insert({
          ...newTemplate,
          organization_id: organization.id,
          created_by: user.id
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Template created successfully"
      });

      setShowCreateDialog(false);
      setNewTemplate({
        name: '',
        template_type: 'post',
        content: '',
        topic_id: '',
        platforms: [],
        language: 'en',
        variables: {}
      });
      fetchTemplates();
    } catch (error) {
      console.error('Error creating template:', error);
      toast({
        title: "Error",
        description: "Failed to create template",
        variant: "destructive"
      });
    }
  };

  const deleteTemplate = async (templateId: string) => {
    try {
      const { error } = await supabase
        .from('templates')
        .delete()
        .eq('id', templateId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Template deleted successfully"
      });
      fetchTemplates();
    } catch (error) {
      console.error('Error deleting template:', error);
      toast({
        title: "Error",
        description: "Failed to delete template",
        variant: "destructive"
      });
    }
  };

  const duplicateTemplate = async (template: Template) => {
    try {
      const { error } = await supabase
        .from('templates')
        .insert({
          name: `${template.name} (Copy)`,
          template_type: template.template_type,
          content: template.content,
          platforms: template.platforms,
          language: template.language,
          organization_id: organization.id,
          created_by: user.id
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Template duplicated successfully"
      });
      fetchTemplates();
    } catch (error) {
      console.error('Error duplicating template:', error);
      toast({
        title: "Error",
        description: "Failed to duplicate template",
        variant: "destructive"
      });
    }
  };

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || template.template_type === filterType;
    const matchesLanguage = filterLanguage === 'all' || template.language === filterLanguage;
    
    return matchesSearch && matchesType && matchesLanguage;
  });

  const platforms = ['facebook', 'instagram', 'linkedin', 'twitter', 'youtube'];
  const templateTypes = [
    { value: 'post', label: 'Post Content' },
    { value: 'headline', label: 'Headlines' },
    { value: 'hashtag', label: 'Hashtags' },
    { value: 'cta', label: 'Call to Action' }
  ];

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading templates...</div>;
  }

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Templates & Topics</h1>
          <p className="text-muted-foreground mt-2">Manage your content templates and organize by topics</p>
        </div>
        
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Template
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Template</DialogTitle>
            </DialogHeader>
            <div className="grid gap-6">
              <div className="grid gap-2">
                <Label htmlFor="name">Template Name</Label>
                <Input
                  id="name"
                  value={newTemplate.name}
                  onChange={(e) => setNewTemplate(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Product Launch Announcement"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Template Type</Label>
                  <Select
                    value={newTemplate.template_type}
                    onValueChange={(value) => setNewTemplate(prev => ({ ...prev, template_type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {templateTypes.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label>Language</Label>
                  <Select
                    value={newTemplate.language}
                    onValueChange={(value) => setNewTemplate(prev => ({ ...prev, language: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="ur">Urdu</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-2">
                <Label>Topic</Label>
                <Select
                  value={newTemplate.topic_id}
                  onValueChange={(value) => setNewTemplate(prev => ({ ...prev, topic_id: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a topic (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {topics.map(topic => (
                      <SelectItem key={topic.id} value={topic.id}>
                        {topic.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label>Platforms</Label>
                <div className="flex flex-wrap gap-2">
                  {platforms.map(platform => (
                    <div key={platform} className="flex items-center space-x-2">
                      <Checkbox
                        id={platform}
                        checked={newTemplate.platforms.includes(platform)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setNewTemplate(prev => ({
                              ...prev,
                              platforms: [...prev.platforms, platform]
                            }));
                          } else {
                            setNewTemplate(prev => ({
                              ...prev,
                              platforms: prev.platforms.filter(p => p !== platform)
                            }));
                          }
                        }}
                      />
                      <Label htmlFor={platform} className="capitalize">{platform}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="content">Template Content</Label>
                <Textarea
                  id="content"
                  value={newTemplate.content}
                  onChange={(e) => setNewTemplate(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Enter your template content here..."
                  rows={6}
                />
                <p className="text-sm text-muted-foreground">
                  Use variables like {'{company_name}'} or {'{product_name}'} for dynamic content
                </p>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={createTemplate}>
                  Create Template
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex-1 min-w-64">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
        
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {templateTypes.map(type => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filterLanguage} onValueChange={setFilterLanguage}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by language" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Languages</SelectItem>
            <SelectItem value="en">English</SelectItem>
            <SelectItem value="ur">Urdu</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Templates Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredTemplates.map((template) => (
          <Card key={template.id} className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-2">{template.name}</h3>
                <div className="flex gap-2 mb-3">
                  <Badge variant="secondary" className="capitalize">
                    {template.template_type.replace('_', ' ')}
                  </Badge>
                  <Badge variant="outline" className="uppercase">
                    {template.language}
                  </Badge>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <Button size="sm" variant="ghost" onClick={() => duplicateTemplate(template)}>
                  <Copy className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="ghost">
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={() => deleteTemplate(template.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-sm text-muted-foreground line-clamp-3">
                {template.content}
              </p>
            </div>

            <div className="flex justify-between items-center text-sm text-muted-foreground">
              <div>
                Used {template.usage_count} times
              </div>
              {template.topics?.name && (
                <Badge variant="outline" className="text-xs">
                  {template.topics.name}
                </Badge>
              )}
            </div>

            {template.platforms.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1">
                {template.platforms.map(platform => (
                  <Badge key={platform} variant="secondary" className="text-xs capitalize">
                    {platform}
                  </Badge>
                ))}
              </div>
            )}
          </Card>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg">No templates found</p>
          <p className="text-muted-foreground mt-2">
            {searchTerm || filterType !== 'all' || filterLanguage !== 'all' 
              ? 'Try adjusting your filters or search terms' 
              : 'Create your first template to get started'}
          </p>
        </div>
      )}
    </div>
  );
}