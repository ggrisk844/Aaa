-- Run this script in your Supabase SQL Editor to create the necessary tables

CREATE TABLE IF NOT EXISTS school_info (
  id INTEGER PRIMARY KEY,
  name TEXT,
  address TEXT,
  phone TEXT,
  email TEXT,
  "principalMessage" TEXT,
  history TEXT,
  mission TEXT,
  vision TEXT,
  "mapEmbedUrl" TEXT,
  "logoUrl" TEXT,
  "heroTitle" TEXT,
  "heroSubtitle" TEXT,
  "heroImage" TEXT,
  "newsTitle" TEXT,
  "featuresSectionTitle" TEXT,
  "featuresSectionSubtitle" TEXT,
  features JSONB,
  "principalName" TEXT,
  "principalPosition" TEXT,
  "principalImage" TEXT,
  "classStats" JSONB
);

CREATE TABLE IF NOT EXISTS teachers (
  id TEXT PRIMARY KEY,
  name TEXT,
  position TEXT,
  subject TEXT,
  "imageUrl" TEXT,
  email TEXT
);

CREATE TABLE IF NOT EXISTS staff (
  id TEXT PRIMARY KEY,
  name TEXT,
  position TEXT,
  "imageUrl" TEXT
);

CREATE TABLE IF NOT EXISTS students (
  id TEXT PRIMARY KEY,
  name TEXT,
  class TEXT,
  roll TEXT,
  section TEXT,
  "imageUrl" TEXT
);

CREATE TABLE IF NOT EXISTS notices (
  id TEXT PRIMARY KEY,
  title TEXT,
  date TEXT,
  content TEXT,
  "isPdf" BOOLEAN,
  "pdfUrl" TEXT
);

CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY,
  title TEXT,
  date TEXT,
  location TEXT,
  description TEXT,
  "imageUrl" TEXT
);

CREATE TABLE IF NOT EXISTS gallery (
  id TEXT PRIMARY KEY,
  category TEXT,
  "imageUrl" TEXT,
  caption TEXT
);

CREATE TABLE IF NOT EXISTS results (
  id TEXT PRIMARY KEY,
  "studentName" TEXT,
  class TEXT,
  roll TEXT,
  "examName" TEXT,
  gpa TEXT,
  grade TEXT
);

CREATE TABLE IF NOT EXISTS users (
  username TEXT PRIMARY KEY,
  role TEXT,
  title TEXT,
  bio TEXT,
  avatar TEXT,
  "lastActive" BIGINT,
  blocked JSONB,
  muted JSONB
);

CREATE TABLE IF NOT EXISTS chats (
  id TEXT PRIMARY KEY,
  participants JSONB,
  "lastMessage" TEXT,
  "lastTimestamp" BIGINT
);

CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY,
  "chatId" TEXT,
  sender TEXT,
  text TEXT,
  image TEXT,
  audio TEXT,
  timestamp BIGINT,
  status TEXT,
  "replyTo" JSONB,
  "isEdited" BOOLEAN
);

-- Insert default school info if it doesn't exist
INSERT INTO school_info (id, name) VALUES (1, 'Amtali Govt. Technical School & College') ON CONFLICT (id) DO NOTHING;

-- Since this is a client-side app using the anon key, we need to allow public access to these tables.
-- In a production environment, you should implement proper Row Level Security (RLS) policies.

-- Enable RLS on all tables
ALTER TABLE school_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE notices ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE results ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Create public policies for all tables (Allow all operations for anon)
DO $$ 
DECLARE
  t text;
BEGIN
  FOR t IN 
    SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'
  LOOP
    EXECUTE format('CREATE POLICY "Allow public access" ON %I FOR ALL USING (true) WITH CHECK (true);', t);
  END LOOP;
END $$;
