

import { SchoolInfo, Teacher, Staff, Student, Notice, GalleryItem, Facility, ExamResult, Event, User, ChatSession, ChatMessage, CallSignal, TypingState } from '../types';

const STORAGE_KEYS = {
  INFO: 'school_info',
  TEACHERS: 'school_teachers',
  STAFF: 'school_staff',
  STUDENTS: 'school_students',
  NOTICES: 'school_notices',
  GALLERY: 'school_gallery',
  FACILITIES: 'school_facilities',
  RESULTS: 'school_results',
  EVENTS: 'school_events',
  USERS: 'school_users', 
  CHATS: 'school_chats', 
  MESSAGES: 'school_messages_', 
  CURRENT_USER: 'school_current_user',
  CALL_SIGNAL: 'school_call_signal',
  TYPING: 'school_typing' // New key for typing status
};

// Helper to trigger toast from non-react files
const triggerToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('app-toast', { detail: { message, type } }));
    }
};

const safeSetItem = (key: string, value: string) => {
    try {
        localStorage.setItem(key, value);
    } catch (e: any) {
        if (e.name === 'QuotaExceededError' || e.code === 22) {
            triggerToast('Storage limit reached! Please delete old items.', 'error');
        } else {
            console.error('Storage Error:', e);
        }
    }
};

const initialInfo: SchoolInfo = {
  name: 'Amtali Govt. Technical School & College',
  address: '46WV+3XC, Amtali',
  phone: '01329-328125',
  email: 'agtsc.user@gmail.com',
  principalMessage: 'Welcome to our institution where we nurture future leaders through technical education and moral values.',
  history: 'Founded with a vision to provide technical excellence in the Amtali region. We have been serving the community for over two decades, delivering high-quality vocational training to thousands of students, equipping them with the skills needed for the modern workforce.',
  mission: 'To provide quality technical education accessible to all, fostering innovation and skill development. We aim to create a learning environment that encourages critical thinking, practical application, and ethical responsibility.',
  vision: 'To be a center of excellence in technical and vocational education, creating skilled professionals for the global market. We envision a future where our graduates lead the industry with their expertise and values.',
  mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3651.902973789566!2d90.38896231543163!3d23.75086098458914!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3755b8bcd148902d%3A0x6b44778103c8112d!2sAmtali!5e0!3m2!1sen!2sbd!4v1629823456789!5m2!1sen!2sbd',
  logoUrl: 'https://picsum.photos/100/100',
  heroTitle: 'Amtali Govt. Technical School & College',
  heroSubtitle: 'Empowering the next generation with technical skills and ethical values.',
  heroImage: 'https://picsum.photos/1920/1080?blur=2',
  newsTitle: 'Latest News',
  featuresSectionTitle: 'Why Choose Us?',
  featuresSectionSubtitle: 'We provide a comprehensive learning environment that fosters growth, innovation, and success.',
  features: [
      { id: '1', title: 'Quality Education', description: 'We provide world-class technical education with modern laboratories and experienced instructors.', icon: 'BookOpen' },
      { id: '2', title: 'Expert Teachers', description: 'Our faculty consists of highly qualified professionals dedicated to student success.', icon: 'Users' },
      { id: '3', title: 'Extracurriculars', description: 'A balanced approach to learning with sports, cultural activities, and science fairs.', icon: 'Trophy' }
  ],
  principalName: 'Dr. Rahim Uddin',
  principalPosition: 'Principal',
  principalImage: 'https://picsum.photos/600/600?random=principal',
  classStats: [
    { id: '1', className: 'Class 6', studentCount: '45', classTeacher: 'Mr. Abdul Karim' },
    { id: '2', className: 'Class 7', studentCount: '42', classTeacher: 'Mrs. Fatema Begum' },
    { id: '3', className: 'Class 8', studentCount: '48', classTeacher: 'Dr. Rahim Uddin' },
    { id: '4', className: 'Class 9', studentCount: '55', classTeacher: 'Mr. Jamal Hossain' },
    { id: '5', className: 'Class 10', studentCount: '50', classTeacher: 'Mrs. Salma Khatun' },
    { id: '6', className: 'Class 11', studentCount: '40', classTeacher: 'Mr. Arif Hasan' },
    { id: '7', className: 'Class 12', studentCount: '38', classTeacher: 'Mrs. Nusrat Jahan' },
  ]
};

export const db = {
  init: () => {
    if (!localStorage.getItem(STORAGE_KEYS.INFO)) safeSetItem(STORAGE_KEYS.INFO, JSON.stringify(initialInfo));
    [STORAGE_KEYS.TEACHERS, STORAGE_KEYS.NOTICES, STORAGE_KEYS.EVENTS, STORAGE_KEYS.GALLERY, STORAGE_KEYS.FACILITIES, STORAGE_KEYS.STAFF, STORAGE_KEYS.STUDENTS, STORAGE_KEYS.RESULTS].forEach(key => {
        if (!localStorage.getItem(key)) safeSetItem(key, '[]');
    });

    const users = db.getUsers();
    if (users.length === 0) {
        const adminUser = { username: 'admin', password: '123', role: 'admin', title: 'Administrator', blocked: [], muted: [] };
        safeSetItem(STORAGE_KEYS.USERS, JSON.stringify([adminUser]));
    }
  },

  _getList: <T>(key: string): T[] => {
      try { return JSON.parse(localStorage.getItem(key) || '[]'); } catch { return []; }
  },
  _saveItem: <T extends { id: string }>(key: string, item: T) => {
      const list = db._getList<T>(key);
      const index = list.findIndex(i => i.id === item.id);
      if (index >= 0) list[index] = item;
      else {
          const newItem = { ...item };
          if (!newItem.id) newItem.id = (Date.now() + Math.random().toString(36).substr(2, 9));
          list.push(newItem);
      }
      safeSetItem(key, JSON.stringify(list));
  },
  _deleteItem: <T extends { id: string }>(key: string, id: string) => {
      const list = db._getList<T>(key).filter(i => i.id !== id);
      safeSetItem(key, JSON.stringify(list));
  },

  getInfo: (): SchoolInfo => {
      try {
        const info = JSON.parse(localStorage.getItem(STORAGE_KEYS.INFO) || '{}');
        return { ...initialInfo, ...info, classStats: info.classStats || initialInfo.classStats, features: info.features || initialInfo.features };
      } catch { return initialInfo; }
  },
  updateInfo: (info: SchoolInfo) => safeSetItem(STORAGE_KEYS.INFO, JSON.stringify(info)),

  getTeachers: () => db._getList<Teacher>(STORAGE_KEYS.TEACHERS),
  saveTeacher: (t: Teacher) => db._saveItem(STORAGE_KEYS.TEACHERS, t),
  deleteTeacher: (id: string) => db._deleteItem(STORAGE_KEYS.TEACHERS, id),
  getStaff: () => db._getList<Staff>(STORAGE_KEYS.STAFF),
  saveStaff: (s: Staff) => db._saveItem(STORAGE_KEYS.STAFF, s),
  deleteStaff: (id: string) => db._deleteItem(STORAGE_KEYS.STAFF, id),
  getNotices: () => db._getList<Notice>(STORAGE_KEYS.NOTICES),
  saveNotice: (n: Notice) => db._saveItem(STORAGE_KEYS.NOTICES, n),
  deleteNotice: (id: string) => db._deleteItem(STORAGE_KEYS.NOTICES, id),
  getEvents: () => db._getList<Event>(STORAGE_KEYS.EVENTS),
  saveEvent: (e: Event) => db._saveItem(STORAGE_KEYS.EVENTS, e),
  deleteEvent: (id: string) => db._deleteItem(STORAGE_KEYS.EVENTS, id),
  getGallery: () => db._getList<GalleryItem>(STORAGE_KEYS.GALLERY),
  saveGalleryItem: (g: GalleryItem) => db._saveItem(STORAGE_KEYS.GALLERY, g),
  deleteGalleryItem: (id: string) => db._deleteItem(STORAGE_KEYS.GALLERY, id),
  getStudents: () => db._getList<Student>(STORAGE_KEYS.STUDENTS),
  saveStudent: (s: Student) => db._saveItem(STORAGE_KEYS.STUDENTS, s),
  deleteStudent: (id: string) => db._deleteItem(STORAGE_KEYS.STUDENTS, id),
  getResults: () => db._getList<ExamResult>(STORAGE_KEYS.RESULTS),
  saveResult: (r: ExamResult) => db._saveItem(STORAGE_KEYS.RESULTS, r),
  deleteResult: (id: string) => db._deleteItem(STORAGE_KEYS.RESULTS, id),

  getUsers: () => {
      try { return JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]'); } catch { return []; }
  },
  
  saveUser: (user: User) => {
      const users = db.getUsers();
      const idx = users.findIndex((u: any) => u.username === user.username);
      if (idx >= 0) {
          users[idx] = { ...users[idx], ...user }; 
      } else {
          users.push(user); 
      }
      safeSetItem(STORAGE_KEYS.USERS, JSON.stringify(users));
      
      // If updating current logged in user, update session
      const currentUser = db.getCurrentUser();
      if (currentUser && currentUser.username === user.username) {
          safeSetItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify({ ...currentUser, ...user }));
      }
  },

  deleteUser: (username: string) => {
      let users = db.getUsers();
      // Prevent deleting the main admin 'admin' just in case UI fails
      if (username === 'admin') return; 
      users = users.filter((u: any) => u.username !== username);
      safeSetItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  },

  updateHeartbeat: () => {
      const current = db.getCurrentUser();
      if (current) {
          current.lastActive = Date.now();
          db.saveUser(current);
      }
  },

  isUserOnline: (username: string): boolean => {
      const users = db.getUsers();
      const user = users.find((u: any) => u.username === username);
      if (!user || !user.lastActive) return false;
      // Consider online if active in last 2 minutes
      return (Date.now() - user.lastActive) < 2 * 60 * 1000;
  },

  // --- TYPING INDICATORS ---
  setTyping: (chatId: string, username: string, isTyping: boolean) => {
      const key = `${STORAGE_KEYS.TYPING}_${chatId}_${username}`;
      if (isTyping) {
          const state: TypingState = { chatId, username, timestamp: Date.now() };
          safeSetItem(key, JSON.stringify(state));
          // Dispatch storage event manually for same-tab
          window.dispatchEvent(new StorageEvent('storage', { key, newValue: JSON.stringify(state) }));
      } else {
          localStorage.removeItem(key);
           window.dispatchEvent(new StorageEvent('storage', { key, newValue: null }));
      }
  },

  getTypingUser: (chatId: string, excludeUsername: string): string | null => {
      // Iterate keys to find typing status
      for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith(`${STORAGE_KEYS.TYPING}_${chatId}_`)) {
               try {
                   const val = JSON.parse(localStorage.getItem(key) || '{}');
                   if (val.username !== excludeUsername && Date.now() - val.timestamp < 3000) {
                       return val.username;
                   }
               } catch {}
          }
      }
      return null;
  },

  // --- SIGNALING FOR CALLS ---
  sendCallSignal: (signal: Omit<CallSignal, 'timestamp'>) => {
      const fullSignal: CallSignal = { ...signal, timestamp: Date.now() };
      safeSetItem(STORAGE_KEYS.CALL_SIGNAL, JSON.stringify(fullSignal));
      window.dispatchEvent(new StorageEvent('storage', {
          key: STORAGE_KEYS.CALL_SIGNAL,
          newValue: JSON.stringify(fullSignal)
      }));
  },

  signup: (username: string, password: string): boolean => {
      const users = db.getUsers();
      if (users.find((u: any) => u.username === username)) return false; 
      
      const newUser = { username, password, role: 'user', title: 'Visitor', bio: 'Hey there! I am using AGTSC Chat.', avatar: '', lastActive: Date.now(), blocked: [], muted: [] };
      users.push(newUser);
      safeSetItem(STORAGE_KEYS.USERS, JSON.stringify(users));
      
      safeSetItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(newUser));
      triggerToast('Account created successfully!');
      return true;
  },

  login: (u: string, p: string): User | null => {
      const users = db.getUsers();
      const user = users.find((user: any) => user.username === u && user.password === p);
      if (user) {
          user.lastActive = Date.now();
          db.saveUser(user);
          safeSetItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
          triggerToast(`Welcome back, ${user.username}!`);
          return user;
      }
      return null;
  },

  logout: () => localStorage.removeItem(STORAGE_KEYS.CURRENT_USER),

  getCurrentUser: (): User | null => {
      try { 
          const u = JSON.parse(localStorage.getItem(STORAGE_KEYS.CURRENT_USER) || 'null'); 
          return u;
      } 
      catch { return null; }
  },

  isAuthenticated: () => !!localStorage.getItem(STORAGE_KEYS.CURRENT_USER),

  // --- CHAT SYSTEM ---
  
  getChatSession: (otherUsername: string): ChatSession => {
      const currentUser = db.getCurrentUser();
      if (!currentUser) throw new Error("Not logged in");

      const chats = db._getList<ChatSession>(STORAGE_KEYS.CHATS);
      let chat = chats.find(c => 
          c.participants.includes(currentUser.username) && 
          c.participants.includes(otherUsername)
      );

      if (!chat) {
          chat = {
              id: Date.now().toString() + Math.random().toString(36),
              participants: [currentUser.username, otherUsername],
              lastMessage: 'Start of conversation',
              lastTimestamp: Date.now()
          };
          chats.push(chat);
          safeSetItem(STORAGE_KEYS.CHATS, JSON.stringify(chats));
      }
      return chat;
  },

  getRecentChats: (): (ChatSession & { otherUser: User })[] => {
      const currentUser = db.getCurrentUser();
      if (!currentUser) return [];

      const chats = db._getList<ChatSession>(STORAGE_KEYS.CHATS);
      const myChats = chats.filter(c => c.participants.includes(currentUser.username));
      
      myChats.sort((a, b) => b.lastTimestamp - a.lastTimestamp);

      const users = db.getUsers();
      return myChats.map(c => {
          const otherUsername = c.participants.find(p => p !== currentUser.username) || currentUser.username;
          const otherUser = users.find((u: any) => u.username === otherUsername) || { username: otherUsername, role: 'user', title: 'Visitor' };
          return { ...c, otherUser: otherUser as User };
      });
  },

  getMessages: (chatId: string): ChatMessage[] => {
      try {
          return JSON.parse(localStorage.getItem(STORAGE_KEYS.MESSAGES + chatId) || '[]');
      } catch { return []; }
  },

  sendMessage: (chatId: string, text: string, image?: string, audio?: string, replyTo?: ChatMessage) => {
      const currentUser = db.getCurrentUser();
      if (!currentUser) return;

      const messages = db.getMessages(chatId);

      // determine reply text context
      let replyContextText = '';
      if (replyTo) {
          if (replyTo.text) replyContextText = replyTo.text;
          else if (replyTo.audio) replyContextText = '🎤 Voice Message';
          else if (replyTo.image) replyContextText = '📷 Photo';
          else replyContextText = 'Attachment';
      }

      const newMessage: ChatMessage = {
          id: Date.now().toString(),
          sender: currentUser.username,
          text,
          image,
          audio,
          timestamp: Date.now(),
          status: 'sent',
          replyTo: replyTo ? { id: replyTo.id, text: replyContextText, sender: replyTo.sender } : undefined
      };
      messages.push(newMessage);
      
      safeSetItem(STORAGE_KEYS.MESSAGES + chatId, JSON.stringify(messages));

      const chats = db._getList<ChatSession>(STORAGE_KEYS.CHATS);
      const chatIdx = chats.findIndex(c => c.id === chatId);
      if (chatIdx >= 0) {
          let lastMsg = 'Sent a message';
          if (image) lastMsg = '📷 Sent a photo';
          else if (audio) lastMsg = '🎤 Voice Message';
          else if (text) lastMsg = text;

          chats[chatIdx].lastMessage = lastMsg;
          chats[chatIdx].lastTimestamp = Date.now();
          safeSetItem(STORAGE_KEYS.CHATS, JSON.stringify(chats));
      }
      
      // Update User Last Active
      currentUser.lastActive = Date.now();
      db.saveUser(currentUser);
  },

  editMessage: (chatId: string, messageId: string, newText: string) => {
      const messages = db.getMessages(chatId);
      const idx = messages.findIndex(m => m.id === messageId);
      if (idx >= 0) {
          messages[idx].text = newText;
          messages[idx].isEdited = true;
          safeSetItem(STORAGE_KEYS.MESSAGES + chatId, JSON.stringify(messages));
      }
  },

  deleteMessage: (chatId: string, messageId: string) => {
      const messages = db.getMessages(chatId);
      const newMessages = messages.filter(m => m.id !== messageId);
      safeSetItem(STORAGE_KEYS.MESSAGES + chatId, JSON.stringify(newMessages));
      
      // Update last message if needed
      const chats = db._getList<ChatSession>(STORAGE_KEYS.CHATS);
      const chatIdx = chats.findIndex(c => c.id === chatId);
      if (chatIdx >= 0 && newMessages.length > 0) {
          const last = newMessages[newMessages.length - 1];
          let lastMsg = last.text || '';
          if (last.image) lastMsg = '📷 Photo';
          if (last.audio) lastMsg = '🎤 Voice Message';
          
          chats[chatIdx].lastMessage = lastMsg;
          chats[chatIdx].lastTimestamp = last.timestamp;
          safeSetItem(STORAGE_KEYS.CHATS, JSON.stringify(chats));
      }
  },

  clearChat: (chatId: string) => {
      safeSetItem(STORAGE_KEYS.MESSAGES + chatId, '[]');
      const chats = db._getList<ChatSession>(STORAGE_KEYS.CHATS);
      const chatIdx = chats.findIndex(c => c.id === chatId);
      if (chatIdx >= 0) {
          chats[chatIdx].lastMessage = 'Chat cleared';
          chats[chatIdx].lastTimestamp = Date.now();
          safeSetItem(STORAGE_KEYS.CHATS, JSON.stringify(chats));
      }
      triggerToast('Chat history cleared', 'info');
  },

  markMessagesAsRead: (chatId: string, username: string) => {
      const messages = db.getMessages(chatId);
      let changed = false;
      messages.forEach(m => {
          if (m.sender !== username && m.status !== 'read') {
              m.status = 'read';
              changed = true;
          }
      });
      if (changed) {
          safeSetItem(STORAGE_KEYS.MESSAGES + chatId, JSON.stringify(messages));
      }
  },

  searchUsers: (query: string): User[] => {
      const currentUser = db.getCurrentUser();
      const users = db.getUsers();
      return users.filter((u: any) => 
          u.username.toLowerCase().includes(query.toLowerCase()) && 
          u.username !== currentUser?.username
      );
  },

  // --- BLOCK / MUTE ---
  toggleBlock: (targetUsername: string) => {
      const currentUser = db.getCurrentUser();
      if (!currentUser) return;
      
      if (!currentUser.blocked) currentUser.blocked = [];
      const idx = currentUser.blocked.indexOf(targetUsername);
      if (idx >= 0) {
          currentUser.blocked.splice(idx, 1);
          triggerToast(`Unblocked ${targetUsername}`, 'info');
      } else {
          currentUser.blocked.push(targetUsername);
          triggerToast(`Blocked ${targetUsername}`, 'error');
      }
      db.saveUser(currentUser);
      safeSetItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(currentUser));
  },

  toggleMute: (targetUsername: string) => {
      const currentUser = db.getCurrentUser();
      if (!currentUser) return;
      
      if (!currentUser.muted) currentUser.muted = [];
      const idx = currentUser.muted.indexOf(targetUsername);
      if (idx >= 0) {
          currentUser.muted.splice(idx, 1);
          triggerToast(`Unmuted ${targetUsername}`, 'info');
      } else {
          currentUser.muted.push(targetUsername);
          triggerToast(`Muted ${targetUsername}`, 'info');
      }
      db.saveUser(currentUser);
      safeSetItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(currentUser));
  },

  getStats: () => ({
    teachers: db.getTeachers().length,
    students: db.getStudents().length,
    staff: db.getStaff().length,
    notices: db.getNotices().length,
    events: db.getEvents().length,
    results: db.getResults().length,
  }),

  reset: () => {
    localStorage.clear();
    db.init();
    triggerToast('System reset complete', 'info');
  }
};