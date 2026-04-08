

export interface ClassStats {
  id: string;
  className: string;
  studentCount: string;
  classTeacher: string;
}

export interface Feature {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export interface SchoolInfo {
  name: string;
  address: string;
  phone: string;
  email: string;
  principalMessage: string;
  history: string;
  mission: string;
  vision: string;
  mapEmbedUrl: string;
  logoUrl: string;
  
  // Home Page Customization
  heroTitle?: string;
  heroSubtitle?: string;
  heroImage?: string;
  
  // News Section
  newsTitle?: string;

  // Features Section
  featuresSectionTitle?: string;
  featuresSectionSubtitle?: string;
  features?: Feature[];

  // Principal Section
  principalName?: string;
  principalPosition?: string;
  principalImage?: string; 

  // Class Information
  classStats?: ClassStats[];
}

export interface Teacher {
  id: string;
  name: string;
  position: string;
  subject: string;
  imageUrl: string;
  email?: string;
}

export interface Staff {
  id: string;
  name: string;
  position: string;
  imageUrl: string;
}

export interface Student {
  id: string;
  name: string;
  class: string;
  roll: string;
  section: string;
  imageUrl: string;
}

export interface Notice {
  id: string;
  title: string;
  date: string;
  content: string;
  isPdf: boolean;
  pdfUrl?: string;
}

export interface Event {
  id: string;
  title: string;
  date: string;
  location: string;
  description: string;
  imageUrl: string;
}

export interface GalleryItem {
  id: string;
  category: string;
  imageUrl: string;
  caption: string;
}

export interface Facility {
  id: string;
  title: string;
  description: string;
  icon: string; 
}

export interface ExamResult {
  id: string;
  studentName: string;
  class: string;
  roll: string;
  examName: string;
  gpa: string;
  grade: string;
}

export interface User {
  id: string; // Supabase Auth UID
  username: string;
  email: string;
  role: 'admin' | 'user';
  title: string; // e.g. "Student", "Teacher", "User"
  bio?: string; // New field for user bio/status
  avatar?: string;
  lastActive?: number; // Timestamp for online status
  blocked?: string[]; // List of blocked usernames
  muted?: string[]; // List of muted usernames
}

export type MessageStatus = 'sent' | 'delivered' | 'read';

export interface ChatMessage {
  id: string;
  sender: string;
  text?: string;
  image?: string;
  audio?: string; // New field for voice messages
  timestamp: number;
  status: MessageStatus;
  replyTo?: {
    id: string;
    text: string;
    sender: string;
  };
  isEdited?: boolean;
}

export interface ChatSession {
  id: string;
  participants: string[]; // [username1, username2]
  lastMessage: string;
  lastTimestamp: number;
}

export interface DashboardStats {
  teachers: number;
  students: number;
  staff: number;
  notices: number;
  results: number;
  events: number;
}

export interface CallSignal {
  id: string;
  from: string;
  to: string;
  type: 'audio' | 'video';
  action: 'offer' | 'answer' | 'reject' | 'end' | 'busy';
  timestamp: number;
}

export interface TypingState {
    chatId: string;
    username: string;
    timestamp: number;
}