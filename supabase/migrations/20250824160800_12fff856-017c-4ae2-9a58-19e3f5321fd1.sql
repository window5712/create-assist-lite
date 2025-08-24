-- Add AI templates and topics
CREATE TABLE public.topics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  keywords TEXT[],
  industry TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL,
  topic_id UUID REFERENCES public.topics(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  template_type TEXT NOT NULL CHECK (template_type IN ('post', 'headline', 'hashtag', 'cta')),
  content TEXT NOT NULL,
  variables JSONB DEFAULT '{}',
  platforms TEXT[] DEFAULT ARRAY[]::TEXT[],
  language TEXT DEFAULT 'en' CHECK (language IN ('en', 'ur')),
  is_active BOOLEAN DEFAULT true,
  usage_count INTEGER DEFAULT 0,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Update profiles table with roles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('admin', 'editor', 'viewer'));

-- Update posts table for approval workflow
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS approval_status TEXT NOT NULL DEFAULT 'draft' CHECK (approval_status IN ('draft', 'pending_approval', 'approved', 'rejected'));
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES public.profiles(user_id);
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS rejection_reason TEXT;
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS ai_generated BOOLEAN DEFAULT false;
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS template_id UUID REFERENCES public.templates(id);

-- Add comments table for collaboration
CREATE TABLE public.post_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  organization_id UUID NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add notifications table
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  organization_id UUID NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('approval_request', 'approval_granted', 'approval_rejected', 'publish_success', 'publish_failed', 'token_expired', 'comment_added')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add analytics tables
CREATE TABLE public.post_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  platform_post_id TEXT,
  organization_id UUID NOT NULL,
  impressions INTEGER DEFAULT 0,
  reach INTEGER DEFAULT 0,
  engagements INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  saves INTEGER DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add organization settings for auto-publish
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS auto_publish_enabled BOOLEAN DEFAULT false;
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS ai_settings JSONB DEFAULT '{"model": "llama3.1:8b", "creativity": 0.7, "brand_voice": "professional"}';

-- Enable RLS on new tables
ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_analytics ENABLE ROW LEVEL SECURITY;

-- RLS policies for topics
CREATE POLICY "Users can manage topics in their organization" ON public.topics
  FOR ALL TO authenticated
  USING (organization_id IN (
    SELECT organization_id FROM profiles WHERE user_id = auth.uid()
  ));

-- RLS policies for templates
CREATE POLICY "Users can manage templates in their organization" ON public.templates
  FOR ALL TO authenticated
  USING (organization_id IN (
    SELECT organization_id FROM profiles WHERE user_id = auth.uid()
  ));

-- RLS policies for post comments
CREATE POLICY "Users can manage comments in their organization" ON public.post_comments
  FOR ALL TO authenticated
  USING (organization_id IN (
    SELECT organization_id FROM profiles WHERE user_id = auth.uid()
  ));

-- RLS policies for notifications
CREATE POLICY "Users can view their own notifications" ON public.notifications
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "System can create notifications" ON public.notifications
  FOR INSERT TO authenticated
  WITH CHECK (organization_id IN (
    SELECT organization_id FROM profiles WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can update their own notifications" ON public.notifications
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid());

-- RLS policies for post analytics
CREATE POLICY "Users can view analytics in their organization" ON public.post_analytics
  FOR SELECT TO authenticated
  USING (organization_id IN (
    SELECT organization_id FROM profiles WHERE user_id = auth.uid()
  ));

CREATE POLICY "System can manage analytics" ON public.post_analytics
  FOR ALL TO authenticated
  USING (organization_id IN (
    SELECT organization_id FROM profiles WHERE user_id = auth.uid()
  ));

-- Add triggers for updated_at
CREATE TRIGGER update_topics_updated_at
  BEFORE UPDATE ON public.topics
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_templates_updated_at
  BEFORE UPDATE ON public.templates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_post_comments_updated_at
  BEFORE UPDATE ON public.post_comments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to check if user has specific role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role TEXT)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles 
    WHERE user_id = _user_id 
    AND (role = _role OR role = 'admin')
  );
$$;

-- Function to create notification
CREATE OR REPLACE FUNCTION public.create_notification(
  _user_id UUID,
  _organization_id UUID,
  _type TEXT,
  _title TEXT,
  _message TEXT,
  _data JSONB DEFAULT '{}'
)
RETURNS UUID
LANGUAGE PLPGSQL
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  notification_id UUID;
BEGIN
  INSERT INTO notifications (user_id, organization_id, type, title, message, data)
  VALUES (_user_id, _organization_id, _type, _title, _message, _data)
  RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$;