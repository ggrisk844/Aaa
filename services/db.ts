import { supabase } from './supabase';
import { SchoolInfo, Teacher, Staff, Student, Notice, GalleryItem, Facility, ExamResult, Event, User, ChatSession, ChatMessage, CallSignal, TypingState } from '../types';

const triggerToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('app-toast', { detail: { message, type } }));
    }
};

let globalChannel: any = null;

export const db = {
  init: async () => {
    if (!globalChannel) {
      globalChannel = supabase.channel('global_events');
      globalChannel
        .on('broadcast', { event: 'call_signal' }, (payload: any) => {
          window.dispatchEvent(new CustomEvent('supabase_call_signal', { detail: payload.payload }));
        })
        .on('broadcast', { event: 'typing' }, (payload: any) => {
          window.dispatchEvent(new CustomEvent('supabase_typing', { detail: payload.payload }));
        })
        .subscribe();
    }
  },

  getInfo: async (): Promise<SchoolInfo> => {
      const { data, error } = await supabase.from('school_info').select('*').single();
      if (error || !data) {
          return {
              name: 'Amtali Govt. Technical School & College',
              address: '', phone: '', email: '', principalMessage: '', history: '', mission: '', vision: '', mapEmbedUrl: '', logoUrl: ''
          };
      }
      return data as SchoolInfo;
  },
  updateInfo: async (info: SchoolInfo) => {
      const { error } = await supabase.from('school_info').upsert({ id: 1, ...info });
      if (error) triggerToast('Failed to update info', 'error');
      else triggerToast('Info updated successfully');
  },

  getTeachers: async (): Promise<Teacher[]> => {
      const { data } = await supabase.from('teachers').select('*');
      return data || [];
  },
  saveTeacher: async (t: Teacher) => {
      if (!t.id) t.id = Date.now().toString();
      await supabase.from('teachers').upsert(t);
  },
  deleteTeacher: async (id: string) => {
      await supabase.from('teachers').delete().eq('id', id);
  },

  getStaff: async (): Promise<Staff[]> => {
      const { data } = await supabase.from('staff').select('*');
      return data || [];
  },
  saveStaff: async (s: Staff) => {
      if (!s.id) s.id = Date.now().toString();
      await supabase.from('staff').upsert(s);
  },
  deleteStaff: async (id: string) => {
      await supabase.from('staff').delete().eq('id', id);
  },

  getNotices: async (): Promise<Notice[]> => {
      const { data } = await supabase.from('notices').select('*').order('date', { ascending: false });
      return data || [];
  },
  saveNotice: async (n: Notice) => {
      if (!n.id) n.id = Date.now().toString();
      await supabase.from('notices').upsert(n);
  },
  deleteNotice: async (id: string) => {
      await supabase.from('notices').delete().eq('id', id);
  },

  getEvents: async (): Promise<Event[]> => {
      const { data } = await supabase.from('events').select('*').order('date', { ascending: false });
      return data || [];
  },
  saveEvent: async (e: Event) => {
      if (!e.id) e.id = Date.now().toString();
      await supabase.from('events').upsert(e);
  },
  deleteEvent: async (id: string) => {
      await supabase.from('events').delete().eq('id', id);
  },

  getGallery: async (): Promise<GalleryItem[]> => {
      const { data } = await supabase.from('gallery').select('*');
      return data || [];
  },
  saveGalleryItem: async (g: GalleryItem) => {
      if (!g.id) g.id = Date.now().toString();
      await supabase.from('gallery').upsert(g);
  },
  deleteGalleryItem: async (id: string) => {
      await supabase.from('gallery').delete().eq('id', id);
  },

  getStudents: async (): Promise<Student[]> => {
      const { data } = await supabase.from('students').select('*');
      return data || [];
  },
  saveStudent: async (s: Student) => {
      if (!s.id) s.id = Date.now().toString();
      await supabase.from('students').upsert(s);
  },
  deleteStudent: async (id: string) => {
      await supabase.from('students').delete().eq('id', id);
  },

  getResults: async (): Promise<ExamResult[]> => {
      const { data } = await supabase.from('results').select('*');
      return data || [];
  },
  saveResult: async (r: ExamResult) => {
      if (!r.id) r.id = Date.now().toString();
      await supabase.from('results').upsert(r);
  },
  deleteResult: async (id: string) => {
      await supabase.from('results').delete().eq('id', id);
  },

  getUsers: async (): Promise<User[]> => {
      const { data } = await supabase.from('users').select('*');
      return data || [];
  },
  saveUser: async (user: User) => {
      await supabase.from('users').upsert(user);
  },
  deleteUser: async (username: string) => {
      if (username === 'admin') return;
      await supabase.from('users').delete().eq('username', username);
  },

  signup: async (username: string, password: string): Promise<boolean> => {
      const email = `${username}@agtsc.edu.bd`;
      const { data, error } = await supabase.auth.signUp({
          email,
          password,
      });
      if (error) {
          triggerToast(error.message, 'error');
          return false;
      }
      
      const newUser: User = { username, role: 'user', title: 'Visitor', bio: 'Hey there! I am using AGTSC Chat.', avatar: '', lastActive: Date.now(), blocked: [], muted: [] };
      await supabase.from('users').insert(newUser);
      triggerToast('Account created successfully!');
      return true;
  },

  login: async (username: string, password: string): Promise<User | null> => {
      const email = `${username}@agtsc.edu.bd`;
      const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
      });
      if (error) {
          triggerToast(error.message, 'error');
          return null;
      }
      const { data: userData } = await supabase.from('users').select('*').eq('username', username).single();
      if (userData) {
          userData.lastActive = Date.now();
          await db.saveUser(userData);
          triggerToast(`Welcome back, ${username}!`);
          return userData;
      }
      return null;
  },

  logout: async () => {
      await supabase.auth.signOut();
  },

  getCurrentUser: async (): Promise<User | null> => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return null;
      const email = session.user.email;
      if (!email) return null;
      const username = email.split('@')[0];
      const { data } = await supabase.from('users').select('*').eq('username', username).single();
      return data;
  },

  isAuthenticated: async (): Promise<boolean> => {
      const { data: { session } } = await supabase.auth.getSession();
      return !!session;
  },

  updateHeartbeat: async () => {
      const user = await db.getCurrentUser();
      if (user) {
          user.lastActive = Date.now();
          await db.saveUser(user);
      }
  },

  isUserOnline: async (username: string): Promise<boolean> => {
      const { data } = await supabase.from('users').select('lastActive').eq('username', username).single();
      if (!data || !data.lastActive) return false;
      return (Date.now() - data.lastActive) < 2 * 60 * 1000;
  },

  getStats: async () => {
      const [teachers, students, staff, notices, events, results] = await Promise.all([
          supabase.from('teachers').select('id', { count: 'exact' }),
          supabase.from('students').select('id', { count: 'exact' }),
          supabase.from('staff').select('id', { count: 'exact' }),
          supabase.from('notices').select('id', { count: 'exact' }),
          supabase.from('events').select('id', { count: 'exact' }),
          supabase.from('results').select('id', { count: 'exact' })
      ]);
      return {
          teachers: teachers.count || 0,
          students: students.count || 0,
          staff: staff.count || 0,
          notices: notices.count || 0,
          events: events.count || 0,
          results: results.count || 0,
      };
  },

  searchUsers: async (query: string): Promise<User[]> => {
      const currentUser = await db.getCurrentUser();
      const { data } = await supabase.from('users').select('*').ilike('username', `%${query}%`);
      if (!data) return [];
      return data.filter(u => u.username !== currentUser?.username);
  },

  toggleBlock: async (targetUsername: string) => {
      const currentUser = await db.getCurrentUser();
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
      await db.saveUser(currentUser);
  },

  toggleMute: async (targetUsername: string) => {
      const currentUser = await db.getCurrentUser();
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
      await db.saveUser(currentUser);
  },

  getChatSession: async (otherUsername: string): Promise<ChatSession> => {
      const currentUser = await db.getCurrentUser();
      if (!currentUser) throw new Error("Not logged in");

      const { data } = await supabase.from('chats').select('*').contains('participants', [currentUser.username, otherUsername]);
      let chat = data && data.length > 0 ? data[0] : null;

      if (!chat) {
          chat = {
              id: Date.now().toString() + Math.random().toString(36),
              participants: [currentUser.username, otherUsername],
              lastMessage: 'Start of conversation',
              lastTimestamp: Date.now()
          };
          await supabase.from('chats').insert(chat);
      }
      return chat;
  },

  getRecentChats: async (): Promise<(ChatSession & { otherUser: User })[]> => {
      const currentUser = await db.getCurrentUser();
      if (!currentUser) return [];

      const { data: chats } = await supabase.from('chats').select('*').contains('participants', [currentUser.username]).order('lastTimestamp', { ascending: false });
      if (!chats) return [];

      const { data: users } = await supabase.from('users').select('*');
      const usersList = users || [];

      return chats.map(c => {
          const otherUsername = c.participants.find((p: string) => p !== currentUser.username) || currentUser.username;
          const otherUser = usersList.find(u => u.username === otherUsername) || { username: otherUsername, role: 'user', title: 'Visitor' };
          return { ...c, otherUser: otherUser as User };
      });
  },

  getMessages: async (chatId: string): Promise<ChatMessage[]> => {
      const { data } = await supabase.from('messages').select('*').eq('chatId', chatId).order('timestamp', { ascending: true });
      return data || [];
  },

  sendMessage: async (chatId: string, text: string, image?: string, audio?: string, replyTo?: ChatMessage) => {
      const currentUser = await db.getCurrentUser();
      if (!currentUser) return;

      let replyContextText = '';
      if (replyTo) {
          if (replyTo.text) replyContextText = replyTo.text;
          else if (replyTo.audio) replyContextText = '🎤 Voice Message';
          else if (replyTo.image) replyContextText = '📷 Photo';
          else replyContextText = 'Attachment';
      }

      const newMessage = {
          id: Date.now().toString(),
          chatId,
          sender: currentUser.username,
          text,
          image,
          audio,
          timestamp: Date.now(),
          status: 'sent',
          replyTo: replyTo ? { id: replyTo.id, text: replyContextText, sender: replyTo.sender } : null
      };
      
      await supabase.from('messages').insert(newMessage);

      let lastMsg = 'Sent a message';
      if (image) lastMsg = '📷 Sent a photo';
      else if (audio) lastMsg = '🎤 Voice Message';
      else if (text) lastMsg = text;

      await supabase.from('chats').update({
          lastMessage: lastMsg,
          lastTimestamp: Date.now()
      }).eq('id', chatId);
      
      currentUser.lastActive = Date.now();
      await db.saveUser(currentUser);
  },

  editMessage: async (chatId: string, messageId: string, newText: string) => {
      await supabase.from('messages').update({ text: newText, isEdited: true }).eq('id', messageId);
  },

  deleteMessage: async (chatId: string, messageId: string) => {
      await supabase.from('messages').delete().eq('id', messageId);
      
      const { data: messages } = await supabase.from('messages').select('*').eq('chatId', chatId).order('timestamp', { ascending: true });
      if (messages && messages.length > 0) {
          const last = messages[messages.length - 1];
          let lastMsg = last.text || '';
          if (last.image) lastMsg = '📷 Photo';
          if (last.audio) lastMsg = '🎤 Voice Message';
          
          await supabase.from('chats').update({
              lastMessage: lastMsg,
              lastTimestamp: last.timestamp
          }).eq('id', chatId);
      } else {
          await supabase.from('chats').update({
              lastMessage: 'Chat cleared',
              lastTimestamp: Date.now()
          }).eq('id', chatId);
      }
  },

  clearChat: async (chatId: string) => {
      await supabase.from('messages').delete().eq('chatId', chatId);
      await supabase.from('chats').update({
          lastMessage: 'Chat cleared',
          lastTimestamp: Date.now()
      }).eq('id', chatId);
      triggerToast('Chat history cleared', 'info');
  },

  markMessagesAsRead: async (chatId: string, username: string) => {
      await supabase.from('messages').update({ status: 'read' }).eq('chatId', chatId).neq('sender', username).neq('status', 'read');
  },

  setTyping: (chatId: string, username: string, isTyping: boolean) => {
      if (globalChannel) {
          globalChannel.send({
              type: 'broadcast',
              event: 'typing',
              payload: { chatId, username, isTyping, timestamp: Date.now() }
          });
      }
  },

  getTypingUser: (chatId: string, excludeUsername: string): string | null => {
      // This is now handled via events in Chat.tsx
      return null;
  },

  sendCallSignal: (signal: Omit<CallSignal, 'timestamp'>) => {
      const fullSignal: CallSignal = { ...signal, timestamp: Date.now() };
      if (globalChannel) {
          globalChannel.send({
              type: 'broadcast',
              event: 'call_signal',
              payload: fullSignal
          });
      }
  },

  reset: async () => {
      triggerToast('Reset not supported with live database', 'info');
  }
};
