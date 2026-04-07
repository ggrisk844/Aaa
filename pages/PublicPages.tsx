

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../services/db';
import { Calendar, MapPin, Mail, Phone, Search, Download, RefreshCw, Clock, Users, X, Check, Send, Award, BookOpen } from 'lucide-react';
import { showToast } from '../components/Layout';

// About Page
export const About = () => {
  const info = db.getInfo();
  const classStats = info.classStats || [];

  return (
    <div className="pt-32 pb-20 container mx-auto px-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto space-y-16">
        <div className="text-center">
            <span className="text-primary-600 font-bold uppercase tracking-widest text-sm mb-2 block">Who We Are</span>
            <h1 className="text-5xl font-display font-bold mb-6 dark:text-white">About Our School</h1>
            <p className="text-gray-600 dark:text-gray-400 text-xl leading-relaxed whitespace-pre-line">{info.history}</p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8">
            <div className="card-3d bg-white dark:bg-gray-800 p-10 rounded-3xl shadow-xl border-t-8 border-primary-500 glow-green">
                <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center text-primary-600 mb-6">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                </div>
                <h3 className="text-3xl font-bold mb-4 dark:text-white">Our Mission</h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-lg whitespace-pre-line">{info.mission}</p>
            </div>
            <div className="card-3d bg-white dark:bg-gray-800 p-10 rounded-3xl shadow-xl border-t-8 border-secondary-500 glow-indigo">
                <div className="w-12 h-12 bg-secondary-100 dark:bg-secondary-900/30 rounded-xl flex items-center justify-center text-secondary-600 mb-6">
                     <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                </div>
                <h3 className="text-3xl font-bold mb-4 dark:text-white">Our Vision</h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-lg whitespace-pre-line">{info.vision}</p>
            </div>
        </div>

        {/* Class Information Section */}
        <div className="mt-16">
            <h2 className="text-4xl font-display font-bold text-center mb-10 dark:text-white">Class Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {classStats.map((cls, idx) => (
                    <motion.div 
                        key={cls.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.1 }}
                        className="card-3d bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 glow-blue group"
                    >
                        <div className="flex items-center gap-4 mb-4">
                            <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full text-blue-600 group-hover:scale-110 transition">
                                <Users size={24} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold dark:text-white group-hover:text-blue-600 transition">{cls.className}</h3>
                                <p className="text-sm text-gray-500">{cls.studentCount} Students</p>
                            </div>
                        </div>
                        <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Class Teacher</p>
                            <p className="font-semibold text-gray-700 dark:text-gray-300">{cls.classTeacher}</p>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
      </motion.div>
    </div>
  );
};

// Teachers Page
export const Teachers = () => {
  const teachers = db.getTeachers();
  return (
    <div className="pt-32 pb-20 container mx-auto px-6">
      <div className="text-center mb-16">
          <h1 className="text-5xl font-display font-bold mb-4 dark:text-white">Our Faculty</h1>
          <p className="text-gray-500 text-xl">Meet the dedicated mentors shaping the future.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {teachers.map((t, idx) => (
          <motion.div 
            key={t.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="card-3d bg-white dark:bg-gray-800 rounded-3xl overflow-hidden shadow-xl group border-2 border-transparent hover:border-primary-500/30 dark:hover:border-primary-500/30 glow-green"
          >
            <div className="h-80 overflow-hidden relative">
                <img src={t.imageUrl} alt={t.name} className="w-full h-full object-cover transition duration-700 group-hover:scale-110 group-hover:rotate-1" 
                     onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300?text=No+Image' }} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition duration-300"></div>
                
                <div className="absolute bottom-4 left-4 right-4 text-white transform translate-y-4 group-hover:translate-y-0 transition duration-300">
                     <p className="font-bold text-lg">{t.name}</p>
                     <p className="text-primary-300 text-sm font-medium uppercase tracking-wider">{t.position}</p>
                </div>
            </div>
            <div className="p-6 relative bg-white dark:bg-gray-800 z-10">
              <div className="absolute -top-14 right-4 bg-white dark:bg-gray-700 p-1.5 rounded-full shadow-lg">
                  <div className="bg-primary-500 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg">
                    {t.name ? t.name.charAt(0) : '?'}
                  </div>
              </div>
              <div className="flex items-center gap-2 mb-2">
                 <BookOpen size={16} className="text-primary-500" />
                 <span className="text-gray-500 dark:text-gray-400 font-medium text-sm">Subject</span>
              </div>
              <p className="text-lg font-bold text-gray-800 dark:text-gray-200">{t.subject}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// Staff Page
export const Staff = () => {
  const staff = db.getStaff();
  return (
    <div className="pt-32 pb-20 container mx-auto px-6">
      <div className="text-center mb-16">
          <h1 className="text-5xl font-display font-bold mb-4 dark:text-white">Our Staff</h1>
          <p className="text-gray-500 text-xl">The dedicated team supporting our institution.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {staff.map((s, idx) => (
          <motion.div 
            key={s.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="card-3d bg-white dark:bg-gray-800 rounded-3xl overflow-hidden shadow-xl group border border-gray-100 dark:border-gray-700 glow-indigo"
          >
            <div className="h-72 overflow-hidden relative">
                <img src={s.imageUrl} alt={s.name} className="w-full h-full object-cover transition duration-700 group-hover:scale-110 group-hover:rotate-1" 
                     onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300?text=No+Image' }} />
                <div className="absolute inset-0 bg-indigo-600/20 group-hover:bg-indigo-600/0 transition duration-300"></div>
            </div>
            <div className="p-6 relative text-center border-t-4 border-indigo-500">
              <h3 className="text-xl font-bold dark:text-white mb-1 group-hover:text-indigo-600 transition">{s.name}</h3>
              <p className="text-indigo-500 font-bold uppercase text-xs tracking-widest">{s.position}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// Students Component
export const Students = () => {
  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState('All');
  const [students, setStudents] = useState(db.getStudents());
  const [trigger, setTrigger] = useState(0);

  // Get dynamic classes from DB info
  const info = db.getInfo();
  // Extract class numbers/names from classStats, removing "Class " prefix if present for cleaner matching
  // But since student data usually stores just the number (e.g. "6"), we might need to handle both.
  // We'll create a list of available class options based on the configured Class Stats.
  const classOptions = info.classStats?.map(c => {
      // Attempt to extract the number if format is "Class X"
      const match = c.className.match(/Class\s+(.+)/i);
      return match ? match[1] : c.className;
  }) || ['6','7','8','9','10','11','12'];

  // Remove duplicates and sort numerically/alphabetically if possible
  const uniqueClassOptions = Array.from(new Set(classOptions)).sort((a,b) => {
      const numA = parseInt(a);
      const numB = parseInt(b);
      if(!isNaN(numA) && !isNaN(numB)) return numA - numB;
      return a.localeCompare(b);
  });


  // Ensure we get fresh data on mount and updates
  useEffect(() => {
    setStudents(db.getStudents());
  }, [trigger]);

  const handleRefresh = () => {
    setTrigger(prev => prev + 1);
    showToast('Student list refreshed', 'info');
  };
  
  const filtered = students.filter(s => {
      const name = s.name || '';
      const roll = s.roll || '';
      const cls = s.class || '';

      const matchesSearch = name.toLowerCase().includes(search.toLowerCase()) || roll.includes(search);
      const matchesClass = classFilter === 'All' || cls === classFilter;
      return matchesSearch && matchesClass;
  });

  return (
    <div className="pt-32 pb-20 container mx-auto px-6">
        <div className="text-center mb-16">
            <h1 className="text-5xl font-display font-bold mb-4 dark:text-white">Student Directory</h1>
            <p className="text-gray-500 text-xl">Find and view student profiles.</p>
        </div>

        {/* Search & Filter */}
        <div className="max-w-4xl mx-auto mb-16 flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
                <Search className="absolute left-4 top-4 text-gray-400" size={20} />
                <input 
                    type="text" 
                    placeholder="Search by Name or Roll No..." 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-primary-500 transition shadow-sm"
                />
            </div>
            <div className="md:w-48">
                <select 
                    value={classFilter} 
                    onChange={(e) => setClassFilter(e.target.value)}
                    className="w-full p-4 rounded-xl border border-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-primary-500 transition shadow-sm cursor-pointer"
                >
                    <option value="All">All Classes</option>
                    {uniqueClassOptions.map(c => <option key={c} value={c}>Class {c}</option>)}
                </select>
            </div>
            <button onClick={handleRefresh} className="btn-3d px-4 py-4 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition" title="Refresh List">
                <RefreshCw size={20} />
            </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {filtered.map((s, idx) => (
                <motion.div 
                    key={s.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    className="card-3d bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-xl border border-gray-100 dark:border-gray-700 text-center glow-green relative overflow-hidden group"
                >
                    <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-br from-emerald-400 to-green-600 opacity-20 group-hover:opacity-30 transition"></div>
                    <div className="w-24 h-24 mx-auto rounded-full overflow-hidden border-4 border-white dark:border-gray-700 shadow-lg mb-4 bg-gray-200 relative z-10 group-hover:scale-105 transition duration-500">
                        <img src={s.imageUrl} alt={s.name} className="w-full h-full object-cover" 
                             onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=Student' }} />
                    </div>
                    <div className="relative z-10">
                        <h3 className="text-xl font-bold dark:text-white mb-1 group-hover:text-emerald-600 transition">{s.name || 'Unknown Name'}</h3>
                        <div className="flex justify-center gap-2 mb-4 mt-3">
                            <span className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-xs font-bold px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">Class {s.class || 'N/A'}</span>
                            <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs font-bold px-3 py-1 rounded-full border border-gray-200 dark:border-gray-600">Roll: {s.roll || 'N/A'}</span>
                        </div>
                        <div className="text-sm text-gray-500 font-medium">Section: {s.section || 'N/A'}</div>
                    </div>
                </motion.div>
            ))}
            {filtered.length === 0 && (
                <div className="col-span-full text-center py-20 text-gray-400">
                    <p className="text-xl font-bold mb-2">No students found.</p>
                    <p>Try adjusting your search or filters.</p>
                </div>
            )}
        </div>
    </div>
  );
};

// Events Page
export const Events = () => {
    const events = db.getEvents();
    return (
        <div className="pt-32 pb-20 container mx-auto px-6">
            <h1 className="text-5xl font-display font-bold text-center mb-16 dark:text-white">Upcoming Events</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {events.map((ev, idx) => (
                    <motion.div 
                        key={ev.id}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="card-3d bg-white dark:bg-gray-800 rounded-3xl overflow-hidden shadow-xl border border-gray-100 dark:border-gray-700 flex flex-col glow-blue group"
                    >
                        <div className="h-60 overflow-hidden relative">
                             <img src={ev.imageUrl} alt={ev.title} className="w-full h-full object-cover transition duration-700 group-hover:scale-110 group-hover:rotate-1" 
                                  onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/800x400?text=Event' }} />
                             <div className="absolute top-4 left-4 bg-white/90 dark:bg-black/80 backdrop-blur-md px-4 py-2 rounded-xl text-center shadow-lg group-hover:scale-110 transition">
                                 <span className="block text-xl font-bold text-primary-600">{new Date(ev.date).getDate()}</span>
                                 <span className="block text-xs uppercase font-bold text-gray-500">{new Date(ev.date).toLocaleString('default', { month: 'short' })}</span>
                             </div>
                             <div className="absolute inset-0 bg-blue-600/20 group-hover:bg-transparent transition duration-500"></div>
                        </div>
                        <div className="p-8 flex-grow">
                            <h3 className="text-2xl font-bold mb-3 dark:text-white leading-tight group-hover:text-blue-600 transition">{ev.title}</h3>
                            <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                                <span className="flex items-center gap-1"><Clock size={16} className="text-blue-400" /> {new Date(ev.date).getFullYear()}</span>
                                <span className="flex items-center gap-1"><MapPin size={16} className="text-blue-400" /> {ev.location}</span>
                            </div>
                            <p className="text-gray-600 dark:text-gray-300 leading-relaxed line-clamp-3">{ev.description}</p>
                        </div>
                        <div className="p-8 pt-0 mt-auto">
                            <button className="btn-3d w-full py-3 bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30 rounded-xl font-bold transition flex items-center justify-center gap-2">View Details <Calendar size={16}/></button>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

// Notices Page
export const Notices = () => {
    const notices = db.getNotices();
    return (
        <div className="pt-32 pb-20 container mx-auto px-6">
            <h1 className="text-5xl font-display font-bold text-center mb-16 dark:text-white">Notice Board</h1>
            <div className="max-w-4xl mx-auto space-y-8">
                {notices.map(n => (
                    <motion.div 
                        key={n.id} 
                        initial={{x: -30, opacity: 0}} 
                        animate={{x: 0, opacity: 1}}
                        className="card-3d bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border-l-8 border-primary-500 flex flex-col md:flex-row gap-6 justify-between items-center glow-amber hover:bg-gray-50 dark:hover:bg-gray-750 transition"
                    >
                        <div className="flex-1">
                            <div className="flex items-center gap-3 text-gray-400 mb-3 text-sm font-medium uppercase tracking-wider">
                                <Calendar size={16} className="text-primary-500" /> {n.date}
                            </div>
                            <h3 className="text-2xl font-bold mb-3 dark:text-white hover:text-primary-600 transition cursor-pointer">{n.title}</h3>
                            <p className="text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-line">{n.content}</p>
                        </div>
                        {n.isPdf && (
                            // Amber/Orange Download Button
                            <button className="btn-3d flex items-center gap-2 px-6 py-3 bg-amber-500 text-white rounded-xl font-bold hover:bg-amber-600 transition shadow-md">
                                <Download size={20} /> Download
                            </button>
                        )}
                    </motion.div>
                ))}
                {notices.length === 0 && (
                     <div className="text-center text-gray-500 py-10">No notices found.</div>
                )}
            </div>
        </div>
    );
};

// Gallery Page
export const Gallery = () => {
    const images = db.getGallery();
    const categories = ['All', ...Array.from(new Set(images.map(i => i.category)))];
    const [filter, setFilter] = useState('All');
    const [selectedImage, setSelectedImage] = useState<any>(null);

    const filtered = filter === 'All' ? images : images.filter(i => i.category === filter);

    return (
        <div className="pt-32 pb-20 container mx-auto px-6">
            <h1 className="text-5xl font-display font-bold text-center mb-10 dark:text-white">Photo Gallery</h1>
            
            {/* Filter */}
            <div className="flex justify-center gap-4 mb-16 flex-wrap">
                {categories.map(c => (
                    <button 
                        key={c}
                        onClick={() => setFilter(c)}
                        className={`btn-3d px-8 py-3 rounded-full font-bold transition ${filter === c ? 'bg-primary-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                    >
                        {c}
                    </button>
                ))}
            </div>

            <motion.div layout className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8">
                {filtered.map(img => (
                    <motion.div 
                        key={img.id} 
                        layout 
                        initial={{ opacity: 0, scale: 0.8 }} 
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.5 }}
                        onClick={() => setSelectedImage(img)}
                        className="card-3d break-inside-avoid relative group rounded-3xl overflow-hidden shadow-xl glow-rose cursor-pointer"
                    >
                        <img src={img.imageUrl} alt={img.caption} className="w-full h-auto transition duration-700 group-hover:scale-110 group-hover:rotate-1" 
                             onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/600x400?text=Image' }} />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition duration-300 flex flex-col justify-end p-8">
                            <span className="text-primary-400 text-sm font-bold uppercase tracking-wider mb-2">{img.category}</span>
                            <p className="text-white font-bold text-xl">{img.caption}</p>
                        </div>
                    </motion.div>
                ))}
            </motion.div>

            {/* Lightbox Modal */}
            <AnimatePresence>
                {selectedImage && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSelectedImage(null)}
                        className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-6"
                    >
                         <button className="absolute top-6 right-6 text-white hover:text-red-500 transition p-2 bg-white/10 rounded-full">
                             <X size={32} />
                         </button>
                         <motion.div 
                            initial={{ scale: 0.8, y: 50 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.8, y: 50 }}
                            onClick={(e) => e.stopPropagation()}
                            className="max-w-5xl w-full max-h-[90vh] flex flex-col bg-transparent rounded-3xl overflow-hidden shadow-2xl"
                         >
                             <img src={selectedImage.imageUrl} alt={selectedImage.caption} className="w-full h-auto max-h-[80vh] object-contain bg-black/50" />
                             <div className="bg-white dark:bg-gray-900 p-6 flex justify-between items-center">
                                 <div>
                                     <h3 className="text-2xl font-bold dark:text-white">{selectedImage.caption}</h3>
                                     <span className="text-primary-600 font-bold uppercase tracking-wider text-sm">{selectedImage.category}</span>
                                 </div>
                                 <button onClick={() => setSelectedImage(null)} className="btn-3d px-6 py-2 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-lg font-bold">Close</button>
                             </div>
                         </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// Contact Page
export const Contact = () => {
    const info = db.getInfo();
    const [sent, setSent] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSent(true);
        showToast('Message sent successfully!', 'success');
        setTimeout(() => setSent(false), 3000);
    };

    return (
        <div className="pt-32 pb-20 container mx-auto px-6">
            <div className="grid md:grid-cols-2 gap-16 items-start">
                <div>
                    <h1 className="text-5xl font-display font-bold mb-6 dark:text-white">Get In Touch</h1>
                    <p className="text-gray-600 dark:text-gray-400 mb-10 text-lg">Have questions? We'd love to hear from you. Visit us or send a message.</p>
                    
                    <div className="space-y-6">
                        <div className="card-3d flex items-center gap-5 p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 glow-blue">
                            <div className="bg-blue-100 dark:bg-blue-900/30 p-4 rounded-full text-blue-600"><MapPin size={24} /></div>
                            <div>
                                <h4 className="font-bold text-lg dark:text-white">Address</h4>
                                <p className="text-gray-600 dark:text-gray-400">{info.address}</p>
                            </div>
                        </div>
                        <div className="card-3d flex items-center gap-5 p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 glow-green">
                            <div className="bg-green-100 dark:bg-green-900/30 p-4 rounded-full text-green-600"><Phone size={24} /></div>
                            <div>
                                <h4 className="font-bold text-lg dark:text-white">Phone</h4>
                                <p className="text-gray-600 dark:text-gray-400">{info.phone}</p>
                            </div>
                        </div>
                        <div className="card-3d flex items-center gap-5 p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 glow-purple">
                            <div className="bg-purple-100 dark:bg-purple-900/30 p-4 rounded-full text-purple-600"><Mail size={24} /></div>
                            <div>
                                <h4 className="font-bold text-lg dark:text-white">Email</h4>
                                <p className="text-gray-600 dark:text-gray-400">{info.email}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="card-3d bg-white dark:bg-gray-800 p-10 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-700 glow-indigo">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">First Name</label>
                                <input required type="text" className="w-full p-4 rounded-xl border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">Last Name</label>
                                <input required type="text" className="w-full p-4 rounded-xl border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">Email Address</label>
                            <input required type="email" className="w-full p-4 rounded-xl border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition" />
                        </div>
                        <div className="space-y-2">
                             <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">Message</label>
                            <textarea required rows={5} className="w-full p-4 rounded-xl border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition" />
                        </div>
                        {/* Blue Send Button */}
                        <button 
                            disabled={sent}
                            className={`btn-3d w-full py-4 font-bold text-lg rounded-xl transition shadow-lg flex items-center justify-center gap-2 ${
                                sent ? 'bg-green-500 text-white cursor-default' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-500/30'
                            }`}
                        >
                            {sent ? <><Check size={24} /> Message Sent!</> : 'Send Message'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};
