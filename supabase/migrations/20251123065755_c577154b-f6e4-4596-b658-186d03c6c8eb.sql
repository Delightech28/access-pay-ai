-- Create chat_messages table to persist conversations
CREATE TABLE public.chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  wallet_address TEXT NOT NULL,
  service_id INTEGER NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  image TEXT,
  file TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Create policies for public access
CREATE POLICY "Allow public insert to chat_messages" 
ON public.chat_messages 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow public read access to chat_messages" 
ON public.chat_messages 
FOR SELECT 
USING (true);

CREATE POLICY "Allow public update to chat_messages" 
ON public.chat_messages 
FOR UPDATE 
USING (true);

CREATE POLICY "Allow public delete from chat_messages" 
ON public.chat_messages 
FOR DELETE 
USING (true);

-- Create index for faster queries
CREATE INDEX idx_chat_messages_wallet_service ON public.chat_messages(wallet_address, service_id, created_at);