
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../services/db';
import { User, CallSignal } from '../types';
import { Phone, Video, Mic, MicOff, VideoOff, PhoneOff, PhoneIncoming, X } from 'lucide-react';
import { showToast } from './Layout';

// Format time helper
const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const CallSystem = () => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [callState, setCallState] = useState<'idle' | 'incoming' | 'outgoing' | 'connected'>('idle');
    const [callType, setCallType] = useState<'audio' | 'video'>('audio');
    const [otherUser, setOtherUser] = useState<string>('');
    const [duration, setDuration] = useState(0);
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    
    // Media Refs
    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);

    // Initial Load & Auth Check
    useEffect(() => {
        const checkUser = () => setCurrentUser(db.getCurrentUser());
        checkUser();
        window.addEventListener('storage', checkUser);
        
        // Listen for internal "Start Call" events from Chat page
        const handleStartCall = (e: any) => {
            const { to, type } = e.detail;
            initiateCall(to, type);
        };
        window.addEventListener('start-call', handleStartCall);

        return () => {
            window.removeEventListener('storage', checkUser);
            window.removeEventListener('start-call', handleStartCall);
        };
    }, []);

    const endCall = (sendSignal = true) => {
        if (sendSignal && currentUser && otherUser) {
            db.sendCallSignal({
                id: Date.now().toString(),
                from: currentUser.username,
                to: otherUser,
                type: callType,
                action: 'end'
            });
        }
        setCallState('idle');
        setOtherUser('');
        setIsMuted(false);
        setIsVideoOff(false);
        setDuration(0);
    };

    // Listen for external End Call events
    useEffect(() => {
        const handleEndCallEvent = () => {
            if (callState !== 'idle') {
                endCall(true);
            }
        };
        window.addEventListener('end-call', handleEndCallEvent);
        return () => window.removeEventListener('end-call', handleEndCallEvent);
    }, [callState, currentUser, otherUser, callType]);

    // Call Signaling Listener
    useEffect(() => {
        if (!currentUser) return;

        const handleCallSignal = (e: any) => {
            const signal: CallSignal = e.detail;
            // Ignore old signals (> 30 seconds)
            if (Date.now() - signal.timestamp > 30000) return;

            if (signal.to === currentUser.username) {
                // Signal For Me
                if (signal.action === 'offer') {
                    if (callState === 'idle') {
                        setOtherUser(signal.from);
                        setCallType(signal.type);
                        setCallState('incoming');
                        setIsVideoOff(signal.type === 'audio');
                    } else {
                        // Busy
                        db.sendCallSignal({ id: signal.id, from: currentUser.username, to: signal.from, type: signal.type, action: 'busy' });
                    }
                } else if (signal.action === 'end') {
                    endCall(false); // Remote ended
                } else if (signal.action === 'answer' && callState === 'outgoing') {
                     // They accepted my call!
                     setCallState('connected');
                } else if (signal.action === 'reject' && callState === 'outgoing') {
                     showToast(`${otherUser} declined the call.`, 'info');
                     endCall(false);
                } else if (signal.action === 'busy' && callState === 'outgoing') {
                     showToast(`${otherUser} is busy.`, 'info');
                     endCall(false);
                }
            }
        };
        window.addEventListener('supabase_call_signal', handleCallSignal);
        return () => window.removeEventListener('supabase_call_signal', handleCallSignal);
    }, [currentUser, callState, otherUser]);

    // Timer for connected state
    useEffect(() => {
        let interval: any;
        if (callState === 'connected') {
            interval = setInterval(() => setDuration(d => d + 1), 1000);
        } else {
            setDuration(0);
        }
        return () => clearInterval(interval);
    }, [callState]);

    // Camera/Audio Handling
    useEffect(() => {
        if (callState === 'connected' || (callState === 'outgoing' && callType === 'video')) {
            // Start Media
            if (!streamRef.current && !isVideoOff) {
                navigator.mediaDevices.getUserMedia({ video: callType === 'video', audio: true })
                    .then(stream => {
                        streamRef.current = stream;
                        if (videoRef.current) videoRef.current.srcObject = stream;
                    })
                    .catch(err => {
                        console.error("Media Error", err);
                        showToast("Could not access media devices.", "error");
                        setIsVideoOff(true);
                    });
            }
        }
        
        // Toggle Tracks
        if (streamRef.current) {
            streamRef.current.getAudioTracks().forEach(t => t.enabled = !isMuted);
            streamRef.current.getVideoTracks().forEach(t => t.enabled = !isVideoOff);
        }

        // Cleanup on End
        if (callState === 'idle' && streamRef.current) {
            streamRef.current.getTracks().forEach(t => t.stop());
            streamRef.current = null;
        }
    }, [callState, isMuted, isVideoOff, callType]);


    const initiateCall = (to: string, type: 'audio' | 'video') => {
        if (!currentUser) return;
        
        if (!db.isUserOnline(to)) {
            showToast(`${to} is offline.`, 'error');
            // We can return here, but for "simulation" enabling it anyway might be what user wants? 
            // The prompt says "it is not checking user is logged in". So checking is good.
            return; 
        }

        setOtherUser(to);
        setCallType(type);
        setCallState('outgoing');
        setIsVideoOff(type === 'audio');
        
        db.sendCallSignal({
            id: Date.now().toString(),
            from: currentUser.username,
            to: to,
            type,
            action: 'offer'
        });
    };

    const acceptCall = () => {
        if (!currentUser) return;
        setCallState('connected');
        db.sendCallSignal({
            id: Date.now().toString(),
            from: currentUser.username,
            to: otherUser,
            type: callType,
            action: 'answer'
        });
    };

    const rejectCall = () => {
        if (!currentUser) return;
        db.sendCallSignal({
            id: Date.now().toString(),
            from: currentUser.username,
            to: otherUser,
            type: callType,
            action: 'reject'
        });
        setCallState('idle');
        setOtherUser('');
    };

    if (callState === 'idle') return null;

    // Incoming Call Modal
    if (callState === 'incoming') {
        return (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
                <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 max-w-sm w-full shadow-2xl border border-white/20 text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500 animate-pulse"></div>
                    <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mb-6 flex items-center justify-center animate-bounce">
                        <PhoneIncoming size={40} className="text-blue-500" />
                    </div>
                    <h3 className="text-2xl font-bold dark:text-white mb-1">{otherUser}</h3>
                    <p className="text-gray-500 mb-8">Incoming {callType} call...</p>
                    
                    <div className="flex justify-center gap-6">
                        <button onClick={rejectCall} className="flex flex-col items-center gap-2 group">
                            <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 flex items-center justify-center group-hover:scale-110 transition shadow-lg">
                                <PhoneOff size={28} />
                            </div>
                            <span className="text-sm font-bold text-gray-500">Decline</span>
                        </button>
                        <button onClick={acceptCall} className="flex flex-col items-center gap-2 group">
                            <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 flex items-center justify-center group-hover:scale-110 transition shadow-lg">
                                <Phone size={28} className="animate-pulse"/>
                            </div>
                            <span className="text-sm font-bold text-gray-500">Accept</span>
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Active Call Overlay (Outgoing or Connected)
    return (
        <motion.div 
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            className="fixed inset-0 z-[100] bg-gray-900 flex flex-col items-center justify-between py-12"
        >
             {/* Background Effects */}
            <div className="absolute inset-0 overflow-hidden">
                {callType === 'video' && !isVideoOff && (
                     <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover opacity-50 blur-3xl scale-110" />
                )}
                {/* Fallback Background */}
                <div className={`w-full h-full bg-gradient-to-br from-violet-900 to-gray-900 ${callType === 'video' && !isVideoOff ? 'hidden' : 'block'}`}></div>
                <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>
            </div>

            {/* Main Content */}
            <div className="relative z-10 flex flex-col items-center text-center mt-10 space-y-6">
                 <div className="relative">
                    {/* Ripple Effect if Calling */}
                    {callState === 'outgoing' && (
                        <>
                            <span className="absolute inset-0 rounded-full border border-white/30 animate-ping" style={{ animationDuration: '2s' }}></span>
                            <span className="absolute inset-0 rounded-full border border-white/20 animate-ping" style={{ animationDuration: '2s', animationDelay: '0.5s' }}></span>
                        </>
                    )}
                    <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white/20 shadow-2xl relative bg-gray-800 flex items-center justify-center">
                         <span className="text-4xl font-bold text-white">{otherUser[0]?.toUpperCase()}</span>
                    </div>
                </div>
                
                <div>
                    <h2 className="text-3xl font-bold text-white mb-2">{otherUser}</h2>
                    <p className="text-gray-300 font-medium text-lg animate-pulse">
                        {callState === 'outgoing' ? 'Calling...' : formatTime(duration)}
                    </p>
                </div>
            </div>

             {/* Video Preview (Self) */}
            {callType === 'video' && !isVideoOff && (
                 <motion.div 
                    initial={{ scale: 0 }} animate={{ scale: 1 }}
                    className="relative z-10 w-32 h-48 bg-black rounded-xl overflow-hidden shadow-2xl border border-white/20 ml-auto mr-6"
                 >
                     <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
                 </motion.div>
            )}

             {/* Controls */}
            <div className="relative z-10 w-full max-w-sm px-8">
                 <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 flex items-center justify-between shadow-2xl border border-white/10">
                     <button 
                        onClick={() => setIsMuted(!isMuted)}
                        className={`p-4 rounded-full transition ${isMuted ? 'bg-white text-gray-900' : 'bg-white/20 text-white hover:bg-white/30'}`}
                     >
                         {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
                     </button>
                     
                     <button 
                        onClick={() => endCall(true)}
                        className="p-5 rounded-full bg-red-500 text-white hover:bg-red-600 transition shadow-lg hover:scale-105"
                     >
                         <PhoneOff size={32} fill="currentColor" />
                     </button>

                     <button 
                        onClick={() => setIsVideoOff(!isVideoOff)}
                        className={`p-4 rounded-full transition ${isVideoOff ? 'bg-white text-gray-900' : 'bg-white/20 text-white hover:bg-white/30'}`}
                     >
                         {isVideoOff ? <VideoOff size={24} /> : <Video size={24} />}
                     </button>
                 </div>
            </div>

        </motion.div>
    );
};
