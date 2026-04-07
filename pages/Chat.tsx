
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../services/db';
import { User, ChatSession, ChatMessage } from '../types';
import { 
    Send, Image as ImageIcon, Search, MessageSquare, ArrowLeft, MoreVertical, 
    Phone, Video, Smile, Reply, Edit2, Trash2, X, Check, CheckCheck, Clock, Camera, Settings, LogOut, User as UserIcon, Mic, Square, Bell, BellOff, ShieldAlert, Shield, Play, Pause, Download, Copy, Forward, MoreHorizontal, ChevronDown, PhoneOff
} from 'lucide-react';
import { ImageUpload } from '../components/ImageUpload';
import { showToast } from '../components/Layout';

// --- Components Helpers ---

const EmojiPicker = ({ onSelect }: { onSelect: (emoji: string) => void }) => {
    const emojis = ["👍", "❤️", "😂", "😮", "😢", "😡", "🎉", "🔥", "👀", "🤝", "✅", "❌", "👋", "🙏", "💯", "✨", "😊", "😎", "🤔", "🙌"];
    return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-2xl shadow-2xl grid grid-cols-5 gap-2 border border-gray-100 dark:border-gray-700 w-72 animate-in zoom-in-95 duration-200">
            {emojis.map(e => (
                <button 
                    key={e} 
                    onClick={() => onSelect(e)} 
                    className="text-2xl hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded-xl transition transform hover:scale-110 active:scale-95"
                >
                    {e}
                </button>
            ))}
        </div>
    );
};

const MessageStatusIcon = ({ status }: { status: string }) => {
    if (status === 'sent') return <Check size={14} className="opacity-70" />;
    if (status === 'delivered') return <CheckCheck size={14} className="opacity-70" />;
    if (status === 'read') return <CheckCheck size={14} className="text-blue-300 font-bold" />;
    return <Clock size={14} className="opacity-70" />;
};

const Avatar = ({ user, size = 'md', onClick }: { user?: User, size?: 'sm' | 'md' | 'lg' | 'xl', onClick?: () => void }) => {
    const sizeClasses = { sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-12 h-12 text-base', xl: 'w-16 h-16 text-xl' };
    return (
        <div onClick={onClick} className={`${sizeClasses[size]} rounded-full flex-shrink-0 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center font-bold text-gray-600 dark:text-gray-300 shadow-sm overflow-hidden border border-white dark:border-gray-700 relative cursor-pointer hover:opacity-90 transition`}>
            {user?.avatar ? <img src={user.avatar?.trim() || undefined} alt={user.username} className="w-full h-full object-cover" /> : <span>{user?.username?.[0]?.toUpperCase() || '?'}</span>}
            {user?.lastActive && (Date.now() - user.lastActive < 120000) && (
                    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></div>
            )}
        </div>
    );
};

const AudioPlayer = ({ src, isMe }: { src: string, isMe: boolean }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [playbackRate, setPlaybackRate] = useState(1);
    const audioRef = useRef<HTMLAudioElement>(null);

    const togglePlay = () => {
        if (!audioRef.current) return;
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            document.querySelectorAll('audio').forEach(el => {
                if(el !== audioRef.current) el.pause();
            }); 
            audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    const toggleSpeed = (e: React.MouseEvent) => {
        e.stopPropagation();
        const rates = [1, 1.5, 2];
        const next = rates[(rates.indexOf(playbackRate) + 1) % rates.length];
        setPlaybackRate(next);
        if(audioRef.current) audioRef.current.playbackRate = next;
    };

    const handleDownload = (e: React.MouseEvent) => {
        e.stopPropagation();
        const link = document.createElement('a');
        link.href = src;
        link.download = `audio_${Date.now()}.webm`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleTimeUpdate = () => {
        if (audioRef.current) {
            const current = audioRef.current.currentTime;
            const dur = audioRef.current.duration;
            setCurrentTime(current);
            if(dur > 0) setProgress((current / dur) * 100);
        }
    };

    const handleEnded = () => {
        setIsPlaying(false);
        setProgress(0);
        setCurrentTime(0);
        if(audioRef.current) audioRef.current.currentTime = 0;
    };

    const handleLoadedMetadata = () => {
        if (audioRef.current) {
            const dur = audioRef.current.duration;
            if (isFinite(dur)) setDuration(dur);
        }
    };

    useEffect(() => {
        if(audioRef.current) {
             audioRef.current.load();
        }
    }, []);

    const formatTime = (t: number) => {
        if (!isFinite(t) || isNaN(t)) return "0:00";
        const m = Math.floor(t / 60);
        const s = Math.floor(t % 60);
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    return (
        <div className="flex flex-col gap-2 py-1 min-w-[220px]">
            <div className="flex items-center gap-3">
                <button 
                    onClick={togglePlay}
                    className={`p-2.5 rounded-full transition-colors flex-shrink-0 shadow-sm ${isMe ? 'bg-white/20 hover:bg-white/30 text-white' : 'bg-violet-100 hover:bg-violet-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-violet-600 dark:text-violet-400'}`}
                >
                    {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-0.5" />}
                </button>
                
                <div className="flex-1 flex flex-col justify-center gap-1.5">
                    <div className={`h-1.5 rounded-full overflow-hidden w-full cursor-pointer relative ${isMe ? 'bg-white/30' : 'bg-gray-200 dark:bg-gray-700'}`} onClick={(e) => {
                        if(audioRef.current) {
                            const rect = e.currentTarget.getBoundingClientRect();
                            const pos = (e.clientX - rect.left) / rect.width;
                            audioRef.current.currentTime = pos * audioRef.current.duration;
                        }
                    }}>
                        <div 
                            className={`h-full transition-all duration-100 rounded-full ${isMe ? 'bg-white' : 'bg-violet-500'}`} 
                            style={{ width: `${progress}%` }} 
                        />
                    </div>
                    <div className={`flex justify-between text-[10px] font-bold tracking-wide ${isMe ? 'text-violet-100' : 'text-gray-400'}`}>
                        <span>{formatTime(currentTime)}</span>
                        <span>{formatTime(duration)}</span>
                    </div>
                </div>
            </div>

            <div className={`flex justify-between items-center px-1 border-t ${isMe ? 'border-white/20' : 'border-gray-100 dark:border-gray-700'} pt-2 mt-1`}>
                <button 
                    onClick={toggleSpeed}
                    className={`text-[10px] font-bold px-2 py-1 rounded-md transition ${isMe ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300'}`}
                >
                    {playbackRate}x
                </button>
                <button 
                    onClick={handleDownload}
                    className={`text-[10px] flex items-center gap-1 font-bold px-2 py-1 rounded-md transition ${isMe ? 'hover:bg-white/20 text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400'}`}
                >
                    <Download size={12} /> Save
                </button>
            </div>

            <audio 
                ref={audioRef}
                src={src?.trim() || undefined}
                onTimeUpdate={handleTimeUpdate}
                onEnded={handleEnded}
                onLoadedMetadata={handleLoadedMetadata}
                onPause={() => setIsPlaying(false)}
                onPlay={() => setIsPlaying(true)}
                className="hidden" 
            />
        </div>
    );
};

const ContextMenu = ({ x, y, isMe, onClose, onReply, onEdit, onDelete, onCopy, hasText, hasImage, onDownloadImage }: any) => {
    const menuWidth = 192; 
    const menuHeight = 280; 
    
    let adjustedX = x;
    let adjustedY = y;

    if (x + menuWidth > window.innerWidth) {
        adjustedX = window.innerWidth - menuWidth - 20;
    }
    if (y + menuHeight > window.innerHeight) {
        adjustedY = window.innerHeight - menuHeight - 20;
    }

    return (
        <div 
            className="fixed z-[60] bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-100 dark:border-gray-700 py-1.5 w-48 flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200"
            style={{ top: adjustedY, left: adjustedX }}
            onClick={(e) => e.stopPropagation()}
        >
            <button onClick={() => { onReply(); onClose(); }} className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm font-medium dark:text-white text-left transition">
                <Reply size={16} className="text-blue-500"/> Reply
            </button>
            {hasText && (
                <button onClick={() => { onCopy(); onClose(); }} className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm font-medium dark:text-white text-left transition">
                    <Copy size={16} className="text-green-500"/> Copy
                </button>
            )}
             <button onClick={() => { onCopy(); onClose(); showToast('Forwarding feature coming soon!', 'info'); }} className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm font-medium dark:text-white text-left transition">
                <Forward size={16} className="text-gray-500"/> Forward
            </button>
            {hasImage && (
                <button onClick={() => { onDownloadImage(); onClose(); }} className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm font-medium dark:text-white text-left transition">
                    <Download size={16} className="text-violet-500"/> Download Photo
                </button>
            )}

            {isMe && (
                <>
                    <div className="h-px bg-gray-100 dark:bg-gray-700 my-1 mx-2"></div>
                    {hasText && (
                        <button onClick={() => { onEdit(); onClose(); }} className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm font-medium dark:text-white text-left transition">
                            <Edit2 size={16} className="text-amber-500"/> Edit
                        </button>
                    )}
                    <button onClick={() => { onDelete(); onClose(); }} className="flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 dark:hover:bg-red-900/20 text-sm font-medium text-red-600 text-left transition">
                        <Trash2 size={16} /> Delete
                    </button>
                </>
            )}
        </div>
    );
};

const ProfileModal = ({ user, onClose }: { user: User, onClose: () => void }) => {
    const [bio, setBio] = useState(user.bio || '');
    const [avatar, setAvatar] = useState(user.avatar || '');

    const handleSave = async () => {
        await db.saveUser({ ...user, bio, avatar });
        showToast('Profile updated successfully!');
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-md shadow-2xl p-6 md:p-8 border border-gray-100 dark:border-gray-700 relative max-h-[90vh] overflow-y-auto custom-scrollbar">
                <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-red-50 hover:text-red-500 transition"><X size={20}/></button>
                
                <h2 className="text-2xl font-bold mb-6 dark:text-white flex items-center gap-2"><Settings size={24} className="text-violet-600"/> Edit Profile</h2>
                
                <div className="space-y-6">
                    <div className="flex flex-col items-center">
                        <div className="relative group">
                            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-violet-100 dark:border-violet-900 shadow-xl">
                                {avatar ? (
                                    <img src={avatar?.trim() || undefined} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-violet-100 dark:bg-gray-700 flex items-center justify-center">
                                        <UserIcon size={48} className="text-violet-300" />
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="mt-4 w-full">
                            <ImageUpload value={avatar} onChange={setAvatar} label="Update Profile Picture" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Display Name / Title</label>
                        <div className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-300 text-gray-500 cursor-not-allowed">
                            {user.title || 'Visitor'}
                        </div>
                        <p className="text-xs text-gray-400 mt-1 pl-1">Titles (e.g., Student, Teacher) are assigned by Admins.</p>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Bio</label>
                        <textarea 
                            value={bio} onChange={(e) => setBio(e.target.value)} 
                            className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white h-24 focus:ring-2 focus:ring-violet-500 outline-none" 
                            placeholder="Tell us about yourself..."
                        />
                    </div>

                    <button onClick={handleSave} className="btn-3d w-full py-3 bg-violet-600 text-white font-bold rounded-xl shadow-lg shadow-violet-500/30">Save Profile</button>
                </div>
            </div>
        </div>
    );
};

const DateSeparator = ({ date }: { date: string }) => (
    <div className="flex justify-center my-6 sticky top-2 z-0 opacity-90 pointer-events-none">
        <span className="bg-gray-200/90 dark:bg-gray-700/90 backdrop-blur-md text-gray-600 dark:text-gray-300 text-[11px] font-bold px-4 py-1.5 rounded-full shadow-sm border border-white/20 uppercase tracking-wide">
            {date}
        </span>
    </div>
);


// --- Main Component ---

export const Chat = () => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [recentChats, setRecentChats] = useState<(ChatSession & { otherUser: User })[]>([]);
    const [activeChat, setActiveChat] = useState<ChatSession | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    
    // Input State
    const [inputText, setInputText] = useState('');
    const [showUpload, setShowUpload] = useState(false);
    const [uploadImage, setUploadImage] = useState('');
    const [showEmoji, setShowEmoji] = useState(false);
    
    // Audio State
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    
    // Search State
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<User[]>([]);
    
    // Advanced Chat State
    const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [contextMenu, setContextMenu] = useState<{x: number, y: number, msg: ChatMessage} | null>(null);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [highlightedId, setHighlightedId] = useState<string | null>(null);
    const [showScrollBottom, setShowScrollBottom] = useState(false);
    
    // Typing State
    const [typingUser, setTypingUser] = useState<string | null>(null);
    const typingTimeoutRef = useRef<any>(null);

    // Data Caches
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    // Helpers
    const getUser = (username: string) => allUsers.find(u => u.username === username);

    const refreshData = async () => {
        const user = await db.getCurrentUser();
        setCurrentUser(user);
        setAllUsers(await db.getUsers());
        setRecentChats(await db.getRecentChats());
        if (activeChat && user) {
            const msgs = await db.getMessages(activeChat.id);
            setMessages(msgs);
            await db.markMessagesAsRead(activeChat.id, user.username);
        }
    };

    useEffect(() => {
        refreshData();
        
        // Listen to typing events
        const handleTyping = (e: any) => {
            const data = e.detail;
            if (activeChat && data.chatId === activeChat.id && currentUser && data.username !== currentUser.username) {
                if (data.isTyping) {
                    setTypingUser(data.username);
                    // Clear typing user after 3 seconds if no new events
                    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
                    typingTimeoutRef.current = setTimeout(() => setTypingUser(null), 3000);
                } else {
                    setTypingUser(null);
                }
            }
        };
        window.addEventListener('supabase_typing', handleTyping);

        // Supabase Realtime for messages and chats
        let channel: any;
        let chatsChannel: any;
        
        import('../services/supabase').then(({ supabase }) => {
            if (activeChat) {
                channel = supabase.channel(`chat_${activeChat.id}`)
                    .on('postgres_changes', { event: '*', schema: 'public', table: 'messages', filter: `chatId=eq.${activeChat.id}` }, () => {
                        refreshData();
                    })
                    .subscribe();
            }
            
            chatsChannel = supabase.channel('public_chats')
                .on('postgres_changes', { event: '*', schema: 'public', table: 'chats' }, () => {
                    refreshData();
                })
                .subscribe();
        });

        const closeMenu = () => {
            setContextMenu(null);
        };
        const handleOutsideClick = (event: MouseEvent) => {
             if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                 setIsMenuOpen(false);
             }
        };

        window.addEventListener('click', closeMenu);
        document.addEventListener('mousedown', handleOutsideClick);

        return () => {
            if (channel) channel.unsubscribe();
            if (chatsChannel) chatsChannel.unsubscribe();
            window.removeEventListener('supabase_typing', handleTyping);
            window.removeEventListener('click', closeMenu);
            document.removeEventListener('mousedown', handleOutsideClick);
        };
    }, [activeChat?.id, currentUser?.username]);

    // Initial Scroll
    useEffect(() => {
        if(!editingId && !contextMenu && !highlightedId) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
        }
    }, [activeChat?.id]);

    // Auto scroll on new message if near bottom
    useEffect(() => {
        if(!editingId && !contextMenu && !highlightedId) {
             const container = chatContainerRef.current;
             if (container) {
                 const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 300;
                 if (isNearBottom) {
                    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
                 }
             }
        }
    }, [messages.length, typingUser]);

    const handleScroll = () => {
        if (chatContainerRef.current) {
            const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
            setShowScrollBottom(scrollHeight - scrollTop - clientHeight > 300);
        }
    };

    useEffect(() => {
        if (searchQuery.trim()) {
            db.searchUsers(searchQuery).then(setSearchResults);
        } else {
            setSearchResults([]);
        }
    }, [searchQuery]);

    // Recording Timer
    useEffect(() => {
        let interval: any;
        if (isRecording) {
            interval = setInterval(() => setRecordingTime(prev => prev + 1), 1000);
        } else {
            setRecordingTime(0);
        }
        return () => clearInterval(interval);
    }, [isRecording]);

    const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputText(e.target.value);
        if (activeChat && currentUser) {
             db.setTyping(activeChat.id, currentUser.username, true);
             if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
             typingTimeoutRef.current = setTimeout(async () => {
                 db.setTyping(activeChat.id, currentUser.username, false);
             }, 2000);
        }
    };

    const handleStartChat = async (username: string) => {
        const session = await db.getChatSession(username);
        setActiveChat({ ...session });
        setSearchQuery('');
        setSearchResults([]);
        setIsMenuOpen(false);
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.start();
            setIsRecording(true);
        } catch (err) {
            showToast("Microphone access denied", "error");
        }
    };

    const stopRecording = (shouldSend: boolean) => {
        if (!mediaRecorderRef.current) return;
        
        mediaRecorderRef.current.onstop = async () => {
             if (shouldSend) {
                 const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                 const reader = new FileReader();
                 reader.readAsDataURL(audioBlob);
                 reader.onloadend = async () => {
                     const base64Audio = reader.result as string;
                     // @ts-ignore
                     await db.sendMessage(activeChat?.id, '', undefined, base64Audio, replyingTo);
                     refreshData();
                     setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
                 };
             }
        };
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop()); // Stop mic
        setIsRecording(false);
    };

    const handleSend = async () => {
        if ((!inputText.trim() && !uploadImage) || !activeChat || !currentUser) return;
        db.setTyping(activeChat.id, currentUser.username, false);

        if (editingId) {
            await db.editMessage(activeChat.id, editingId, inputText);
            setEditingId(null);
        } else {
            // @ts-ignore
            await db.sendMessage(activeChat.id, inputText, uploadImage, undefined, replyingTo);
        }

        setInputText('');
        setUploadImage('');
        setShowUpload(false);
        setReplyingTo(null);
        setShowEmoji(false);
        refreshData();
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    };

    const handleDeleteMessage = async (id: string) => {
        if(activeChat) {
            await db.deleteMessage(activeChat.id, id);
            refreshData();
            showToast('Message deleted');
        }
    };

    const handleCopyText = (text: string) => {
        navigator.clipboard.writeText(text);
        showToast('Copied to clipboard', 'info');
    };
    
    const handleDownloadImage = (e: React.MouseEvent, src: string) => {
        e.stopPropagation();
        const link = document.createElement('a');
        link.href = src;
        link.download = `photo_${Date.now()}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast('Photo downloaded', 'success');
    };

    const handleClearChat = async () => {
        if (activeChat && window.confirm("Are you sure you want to clear the chat history?")) {
            await db.clearChat(activeChat.id);
            refreshData();
            setIsMenuOpen(false);
        }
    };

    const handleBlockUser = async () => {
        if (!activeChat || !currentUser) return;
        const otherUsername = activeChat.participants.find(p => p !== currentUser.username);
        if (otherUsername) {
            await db.toggleBlock(otherUsername);
            refreshData();
            setIsMenuOpen(false);
        }
    };

    const handleMuteUser = async () => {
        if (!activeChat || !currentUser) return;
        const otherUsername = activeChat.participants.find(p => p !== currentUser.username);
        if (otherUsername) {
            await db.toggleMute(otherUsername);
            refreshData();
            setIsMenuOpen(false);
        }
    };

    const handleEndActiveCall = () => {
        window.dispatchEvent(new CustomEvent('end-call'));
        setIsMenuOpen(false);
        showToast('Call ended', 'info');
    };

    const scrollToMessage = (messageId: string) => {
        const element = document.getElementById(`msg-${messageId}`);
        if (element) {
            // Smooth scroll
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            
            // Trigger highlight animation via state
            setHighlightedId(messageId);
            
            // Remove highlight after animation duration
            setTimeout(() => {
                setHighlightedId(null);
            }, 2000);
        } else {
            showToast('Message not found (it may have been deleted)', 'info');
        }
    };

    const handleRightClick = (e: React.MouseEvent, msg: ChatMessage) => {
        e.preventDefault();
        setContextMenu({ x: e.clientX, y: e.clientY, msg });
    };

    const triggerCall = (type: 'audio' | 'video') => {
        if (!activeChat || !currentUser) return;
        const otherUser = activeChat.participants.find(p => p !== currentUser.username);
        if (otherUser) {
            window.dispatchEvent(new CustomEvent('start-call', { 
                detail: { to: otherUser, type } 
            }));
        }
    };

    const groupedMessages: { [key: string]: ChatMessage[] } = {};
    messages.forEach(msg => {
        const date = new Date(msg.timestamp);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        let dateStr = date.toLocaleDateString();
        if (date.toDateString() === today.toDateString()) dateStr = "Today";
        else if (date.toDateString() === yesterday.toDateString()) dateStr = "Yesterday";

        if (!groupedMessages[dateStr]) groupedMessages[dateStr] = [];
        groupedMessages[dateStr].push(msg);
    });

    if (!currentUser) return <div className="pt-32 text-center">Please login to chat.</div>;

    const activeOtherUsername = activeChat ? activeChat.participants.find(p => p !== currentUser.username) : null;
    const activeOtherUser = activeOtherUsername ? getUser(activeOtherUsername) : null;
    const isOnline = activeOtherUser?.lastActive && (Date.now() - activeOtherUser.lastActive < 120000);
    const isBlocked = activeOtherUsername && currentUser.blocked?.includes(activeOtherUsername);
    const isMuted = activeOtherUsername && currentUser.muted?.includes(activeOtherUsername);

    return (
        <div className="pt-20 md:pt-24 pb-0 md:pb-10 container mx-auto px-0 md:px-4 h-[100dvh] md:h-[calc(100vh-2rem)] flex flex-col">
            {showProfileModal && <ProfileModal user={currentUser} onClose={() => setShowProfileModal(false)} />}
            
            <div className="flex-1 bg-white dark:bg-gray-800 md:rounded-3xl shadow-2xl border-t md:border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col md:flex-row glow-blue relative">
                
                {contextMenu && (
                    <ContextMenu 
                        x={contextMenu.x} y={contextMenu.y} 
                        isMe={contextMenu.msg.sender === currentUser.username}
                        hasText={!!contextMenu.msg.text}
                        hasImage={!!contextMenu.msg.image}
                        onClose={() => setContextMenu(null)}
                        onReply={() => setReplyingTo(contextMenu.msg)}
                        onEdit={() => { setEditingId(contextMenu.msg.id); setInputText(contextMenu.msg.text || ''); }}
                        onDelete={() => handleDeleteMessage(contextMenu.msg.id)}
                        onCopy={() => handleCopyText(contextMenu.msg.text || '')}
                        onDownloadImage={() => handleDownloadImage({ stopPropagation: () => {} } as any, contextMenu.msg.image || '')}
                    />
                )}

                <div className={`w-full md:w-80 border-r border-gray-200 dark:border-gray-700 flex flex-col bg-gray-50/80 dark:bg-gray-900/50 backdrop-blur-xl ${activeChat ? 'hidden md:flex' : 'flex'} h-full`}>
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold dark:text-white">Chats</h2>
                            <div title="Edit Profile">
                                <Avatar user={currentUser} size="sm" onClick={() => setShowProfileModal(true)} />
                            </div>
                        </div>
                        <div className="relative group">
                            <Search className="absolute left-3 top-3 text-gray-400 group-focus-within:text-violet-500 transition" size={18} />
                            <input 
                                type="text" 
                                placeholder="Search people..." 
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-gray-800 dark:text-white border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-violet-500 outline-none transition shadow-sm"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
                        {searchQuery ? (
                            <div className="mb-2">
                                <p className="text-xs font-bold text-gray-400 px-3 mb-2 uppercase tracking-wider">Search Results</p>
                                {searchResults.map(u => (
                                    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} key={u.username} onClick={() => handleStartChat(u.username)} className="flex items-center gap-3 p-3 hover:bg-white dark:hover:bg-gray-700 rounded-xl cursor-pointer transition border border-transparent hover:border-gray-100 dark:hover:border-gray-600 hover:shadow-sm">
                                        <Avatar user={u} size="md" />
                                        <div><p className="font-bold text-sm dark:text-white">{u.username}</p><p className="text-xs text-gray-500">{u.title}</p></div>
                                    </motion.div>
                                ))}
                                {searchResults.length === 0 && <p className="text-center text-sm text-gray-500 py-4">No users found.</p>}
                            </div>
                        ) : (
                            <div className="space-y-1">
                                {recentChats.map(chat => (
                                    <motion.div layout key={chat.id} onClick={() => setActiveChat(chat)} className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition border ${activeChat?.id === chat.id ? 'bg-white dark:bg-gray-800 border-violet-200 dark:border-violet-900 shadow-md transform scale-[1.02]' : 'border-transparent hover:bg-white dark:hover:bg-gray-800/60'}`}>
                                        <Avatar user={chat.otherUser} size="md" />
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-baseline mb-1">
                                                <p className={`font-bold text-sm truncate ${activeChat?.id === chat.id ? 'text-violet-600 dark:text-violet-400' : 'dark:text-white'}`}>{chat.otherUser.username}</p>
                                                <span className="text-[10px] text-gray-400">{new Date(chat.lastTimestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                            </div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate flex items-center gap-1">
                                                {db.getTypingUser(chat.id, currentUser.username) ? <span className="text-violet-500 font-bold animate-pulse">Typing...</span> : chat.lastMessage}
                                            </p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className={`flex-1 flex flex-col bg-white dark:bg-gray-900 relative ${!activeChat ? 'hidden md:flex' : 'flex'} h-full bg-cover bg-center`} style={{backgroundImage: 'url("https://transparenttextures.com/patterns/cubes.png")'}}>
                {activeChat ? (
                    <>
                        <div className="px-4 md:px-6 py-3 md:py-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border-b border-gray-100 dark:border-gray-700 flex items-center justify-between z-10 sticky top-0 shadow-sm">
                            <div className="flex items-center gap-3 md:gap-4">
                                <button onClick={() => setActiveChat(null)} className="md:hidden p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition"><ArrowLeft size={20} /></button>
                                <Avatar user={activeOtherUser} size="md" />
                                <div>
                                    <h3 className="font-bold dark:text-white text-base md:text-lg leading-tight flex items-center gap-2">
                                        {activeOtherUser?.username || 'Unknown'}
                                        {isMuted && <BellOff size={14} className="text-gray-400" />}
                                    </h3>
                                    <p className={`text-xs font-bold transition-colors ${typingUser ? 'text-violet-500 animate-pulse' : isOnline ? 'text-green-500' : 'text-gray-400'}`}>
                                        {isBlocked ? <span className="text-red-500">Blocked</span> : (typingUser ? 'Typing...' : isOnline ? (activeOtherUser?.bio || 'Online') : `Last active ${activeOtherUser?.lastActive ? new Date(activeOtherUser.lastActive).toLocaleTimeString() : 'Recently'}`)}
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-1 md:gap-2 text-gray-400">
                                <button onClick={() => triggerCall('audio')} disabled={isBlocked || false} className={`p-2.5 rounded-full transition ${isBlocked ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-violet-600 dark:text-violet-400 hover:scale-110 active:scale-95'}`} title="Voice Call"><Phone size={20} /></button>
                                <button onClick={() => triggerCall('video')} disabled={isBlocked || false} className={`p-2.5 rounded-full transition ${isBlocked ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-violet-600 dark:text-violet-400 hover:scale-110 active:scale-95'}`} title="Video Call"><Video size={20} /></button>
                                
                                <div className="relative" ref={menuRef}>
                                    <button 
                                        onClick={() => setIsMenuOpen(!isMenuOpen)} 
                                        className={`p-2.5 rounded-full transition ${isMenuOpen ? 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                                    >
                                        <MoreVertical size={20} />
                                    </button>
                                    
                                    <AnimatePresence>
                                        {isMenuOpen && (
                                            <motion.div 
                                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden z-50 origin-top-right"
                                            >
                                                <button onClick={handleMuteUser} className="flex items-center gap-3 w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 text-sm font-medium border-b border-gray-100 dark:border-gray-700">
                                                    {isMuted ? <Bell size={18} /> : <BellOff size={18} />} {isMuted ? 'Unmute Notifications' : 'Mute Notifications'}
                                                </button>
                                                <button onClick={handleBlockUser} className="flex items-center gap-3 w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 text-sm font-medium border-b border-gray-100 dark:border-gray-700">
                                                    {isBlocked ? <Shield size={18} /> : <ShieldAlert size={18} />} {isBlocked ? 'Unblock User' : 'Block User'}
                                                </button>
                                                <button onClick={handleClearChat} className="flex items-center gap-3 w-full text-left px-4 py-3 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 text-sm font-bold border-b border-gray-100 dark:border-gray-700">
                                                    <Trash2 size={18} /> Clear Chat
                                                </button>
                                                <button onClick={handleEndActiveCall} className="flex items-center gap-3 w-full text-left px-4 py-3 hover:bg-rose-50 dark:hover:bg-rose-900/20 text-rose-600 text-sm font-bold">
                                                    <PhoneOff size={18} /> End Call
                                                </button>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                        </div>

                        <div 
                            className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar bg-[#f0f2f5] dark:bg-[#0b141a] scroll-smooth" 
                            ref={chatContainerRef}
                            onScroll={handleScroll}
                        >
                            {Object.entries(groupedMessages).map(([date, msgs]) => (
                                <div key={date}>
                                    <DateSeparator date={date} />
                                    {msgs.map((msg) => {
                                        const isMe = msg.sender === currentUser.username;
                                        const sender = getUser(msg.sender);
                                        const isHighlighted = highlightedId === msg.id;
                                        
                                        return (
                                            <motion.div 
                                                id={`msg-${msg.id}`}
                                                layout
                                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                animate={{ 
                                                    opacity: 1, 
                                                    y: 0, 
                                                    scale: isHighlighted ? 1.05 : 1,
                                                    zIndex: isHighlighted ? 10 : 0
                                                }}
                                                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                                key={msg.id} 
                                                className={`flex mb-4 group ${isMe ? 'flex-row-reverse' : 'flex-row'} ${isHighlighted ? 'relative' : ''}`}
                                                onContextMenu={(e) => handleRightClick(e, msg)}
                                            >
                                                <div className={`mt-auto ${isMe ? 'ml-2' : 'mr-2'}`}>
                                                    <Avatar user={sender} size="sm" />
                                                </div>
                                                
                                                <div className={`flex flex-col max-w-[85%] md:max-w-[70%] ${isMe ? 'items-end' : 'items-start'}`}>
                                                    {msg.replyTo && (
                                                        <div 
                                                            onClick={() => scrollToMessage(msg.replyTo!.id)}
                                                            className={`mb-1 px-3 py-1.5 rounded-xl text-xs bg-gray-200/50 dark:bg-gray-700/50 border-l-4 border-violet-500 opacity-80 backdrop-blur-sm cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-600 transition ${isMe ? 'mr-1' : 'ml-1'}`}
                                                        >
                                                             <span className="font-bold block text-violet-600 dark:text-violet-400">{msg.replyTo.sender}</span>
                                                             <span className="truncate block max-w-[200px] text-gray-600 dark:text-gray-300">{msg.replyTo.text || 'Attachment'}</span>
                                                        </div>
                                                    )}
                                                    
                                                    <div 
                                                        className={`px-5 py-3 shadow-sm relative text-[15px] leading-relaxed transition-all duration-300 group/bubble
                                                            ${isHighlighted ? 'ring-4 ring-yellow-400/50 dark:ring-yellow-500/50 z-10' : ''}
                                                            ${
                                                            isMe 
                                                            ? `bg-gradient-to-tr from-indigo-600 to-violet-600 text-white rounded-[20px] rounded-tr-none shadow-md shadow-indigo-500/20` 
                                                            : `bg-white dark:bg-gray-800 dark:text-gray-100 rounded-[20px] rounded-tl-none border border-gray-100 dark:border-gray-700 shadow-sm`
                                                        }`}
                                                    >
                                                        {msg.image && (
                                                            <div className="mb-3 -mx-3 -mt-3 overflow-hidden rounded-t-[18px] relative group/image">
                                                                <img src={msg.image?.trim() || undefined} alt="Attachment" className="w-full h-auto object-cover max-h-72 cursor-pointer hover:opacity-95 transition" onClick={() => window.open(msg.image, '_blank')} />
                                                                <button 
                                                                    onClick={(e) => handleDownloadImage(e, msg.image!)}
                                                                    className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-black/70 text-white rounded-full opacity-0 group-hover/image:opacity-100 transition backdrop-blur-sm shadow-md"
                                                                    title="Download Photo"
                                                                >
                                                                    <Download size={16} />
                                                                </button>
                                                            </div>
                                                        )}

                                                        {msg.audio && <AudioPlayer src={msg.audio} isMe={isMe} />}
                                                        
                                                        {msg.text && <p className={`whitespace-pre-wrap break-words ${!isMe ? 'text-gray-800 dark:text-gray-100' : 'text-white'}`}>{msg.text}</p>}
                                                        
                                                        <div className={`flex items-center gap-1 mt-1 text-[10px] select-none ${isMe ? 'text-violet-100 justify-end' : 'text-gray-400 justify-start'}`}>
                                                            {msg.isEdited && <span>(edited)</span>}
                                                            <span className="opacity-80 font-medium">{new Date(msg.timestamp).toLocaleTimeString([], {hour: 'numeric', minute:'2-digit'})}</span>
                                                            {isMe && <div className="ml-1"><MessageStatusIcon status={msg.status} /></div>}
                                                        </div>
                                                        
                                                        {/* Hover Actions for Quick Access */}
                                                        <div className={`absolute top-0 bottom-0 flex items-center opacity-0 group-hover/bubble:opacity-100 transition duration-200 px-2 ${isMe ? '-left-10' : '-right-10'}`}>
                                                            <button onClick={(e) => handleRightClick(e, msg)} className="p-1 rounded-full bg-gray-200/50 hover:bg-gray-300/50 text-gray-600 dark:text-gray-300">
                                                                <MoreHorizontal size={16} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            ))}
                            {typingUser && (
                                <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} className="flex items-center gap-2 mb-2 ml-10">
                                     <div className="bg-white dark:bg-gray-800 px-4 py-3 rounded-2xl rounded-tl-sm border border-gray-100 dark:border-gray-700 flex gap-1.5 items-center shadow-sm">
                                         <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                                         <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></span>
                                         <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></span>
                                     </div>
                                </motion.div>
                            )}
                            <div ref={messagesEndRef} className="h-4" />
                        </div>
                        
                        {/* Scroll To Bottom Button */}
                        <AnimatePresence>
                            {showScrollBottom && (
                                <motion.button
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    onClick={() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })}
                                    className="absolute bottom-24 right-6 z-20 p-2 bg-white dark:bg-gray-700 rounded-full shadow-lg border border-gray-100 dark:border-gray-600 text-gray-500 dark:text-gray-300 hover:text-violet-600"
                                >
                                    <ChevronDown size={20} />
                                </motion.button>
                            )}
                        </AnimatePresence>

                        <div className="p-3 md:p-4 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 relative pb-safe">
                             {isBlocked && (
                                <div className="absolute inset-0 z-10 bg-gray-50/95 dark:bg-gray-800/95 backdrop-blur-sm flex items-center justify-center border-t border-gray-200 dark:border-gray-700">
                                    <p className="text-gray-500 font-bold flex items-center gap-2">
                                        <ShieldAlert size={18} /> You have blocked this user.
                                    </p>
                                    <button onClick={handleBlockUser} className="ml-4 text-violet-600 text-sm font-bold hover:underline">Unblock</button>
                                </div>
                             )}

                            <AnimatePresence>
                                {replyingTo && (
                                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-xl border-l-4 border-violet-500 flex justify-between items-center mb-3">
                                        <div className="text-sm">
                                            <p className="font-bold text-violet-600 dark:text-violet-400 text-xs mb-0.5">Replying to {replyingTo.sender === currentUser.username ? 'yourself' : replyingTo.sender}</p>
                                            <p className="text-gray-600 dark:text-gray-300 truncate text-sm">{replyingTo.text || (replyingTo.audio ? '🎤 Voice Message' : (replyingTo.image ? '📷 Photo' : 'Attachment'))}</p>
                                        </div>
                                        <button onClick={() => setReplyingTo(null)} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full transition"><X size={16} className="text-gray-500" /></button>
                                    </motion.div>
                                )}
                                {editingId && (
                                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="bg-amber-50 dark:bg-amber-900/20 p-2 text-center text-xs font-bold text-amber-600 dark:text-amber-400 mb-2 rounded-lg flex items-center justify-center gap-2">
                                        <Edit2 size={12}/> Editing message... <button onClick={() => { setEditingId(null); setInputText(''); }} className="underline hover:text-amber-700">Cancel</button>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <AnimatePresence>
                                {showEmoji && (
                                    <motion.div initial={{ opacity: 0, scale: 0.9, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 10 }} className="absolute bottom-24 left-4 z-20 origin-bottom-left">
                                        <EmojiPicker onSelect={(e) => { setInputText(p => p + e); }} />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                            
                            <AnimatePresence>
                                {showUpload && (
                                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 relative p-4">
                                        <button onClick={() => setShowUpload(false)} className="absolute top-2 right-2 p-1 bg-gray-200 rounded-full z-10"><X size={14}/></button>
                                        <ImageUpload label="Select Photo" value={uploadImage} onChange={setUploadImage} className="max-w-xs mx-auto" />
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {isRecording ? (
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4 p-3 bg-red-50 dark:bg-red-900/10 rounded-full border border-red-100 dark:border-red-900/30 shadow-inner">
                                    <div className="flex items-center gap-2 text-red-600 font-bold px-4">
                                        <span className="w-3 h-3 bg-red-600 rounded-full animate-pulse"></span>
                                        <span className="tabular-nums">{Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, '0')}</span>
                                    </div>
                                    <div className="flex-1 text-xs text-red-400 font-medium">Recording audio...</div>
                                    <button onClick={() => stopRecording(false)} className="p-2 rounded-full hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 transition"><Trash2 size={20} /></button>
                                    <button onClick={() => stopRecording(true)} className="p-2 rounded-full bg-red-600 text-white hover:bg-red-700 transition shadow-lg transform hover:scale-110"><Send size={20} /></button>
                                </motion.div>
                            ) : (
                                <div className="flex gap-3 items-end">
                                    <button onClick={() => setShowUpload(!showUpload)} disabled={!!isBlocked} className={`p-3 rounded-full transition ${showUpload ? 'bg-violet-100 text-violet-600' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
                                        <ImageIcon size={24} />
                                    </button>
                                    <button onClick={() => setShowEmoji(!showEmoji)} disabled={!!isBlocked} className={`hidden md:block p-3 rounded-full transition ${showEmoji ? 'bg-violet-100 text-violet-600' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
                                        <Smile size={24} />
                                    </button>
                                    <div className="flex-1 relative">
                                        <input 
                                            type="text" 
                                            className="w-full py-3.5 pl-5 pr-4 rounded-full bg-gray-100 dark:bg-gray-700/50 dark:text-white border-transparent focus:bg-white dark:focus:bg-gray-800 focus:ring-2 focus:ring-violet-500/50 outline-none transition shadow-inner"
                                            placeholder="Type a message..."
                                            value={inputText}
                                            onChange={handleInputChange}
                                            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                            disabled={!!isBlocked}
                                        />
                                    </div>
                                    {inputText.trim() || uploadImage ? (
                                        <button 
                                            onClick={handleSend}
                                            disabled={!!isBlocked}
                                            className="p-3.5 rounded-full bg-violet-600 text-white hover:bg-violet-700 transition shadow-lg shadow-violet-500/30 flex-shrink-0 transform hover:scale-105 active:scale-95"
                                        >
                                            {editingId ? <Check size={20} /> : <Send size={20} className="ml-0.5" />}
                                        </button>
                                    ) : (
                                        <button 
                                            onClick={startRecording}
                                            disabled={!!isBlocked}
                                            className="p-3.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition flex-shrink-0 transform hover:scale-105 active:scale-95"
                                        >
                                            <Mic size={22} />
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="flex flex-1 flex-col items-center justify-center text-gray-400 p-10 bg-gray-50/50 dark:bg-gray-900/20">
                        <motion.div 
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.5 }}
                            className="w-40 h-40 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center mb-8 shadow-2xl border border-gray-100 dark:border-gray-700"
                        >
                            <MessageSquare size={70} className="text-violet-300 dark:text-violet-900/50" />
                        </motion.div>
                        <h3 className="text-3xl font-bold text-gray-700 dark:text-gray-200 mb-3">Your Messages</h3>
                        <p className="max-w-xs text-center text-gray-500 text-lg">Send private photos and messages to a friend or group.</p>
                        <div className="mt-8 md:hidden">
                            <p className="text-sm font-bold text-violet-500 animate-bounce">Select a chat from the menu to start</p>
                        </div>
                    </div>
                )}
                </div>
            </div>
        </div>
    );
};
