
import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, BookOpen, Users, Trophy, Bell, ChevronRight, Star, Award, Zap, Lightbulb, Globe, Cpu } from 'lucide-react';
import { Link } from 'react-router-dom';
import { db } from '../services/db';

const Hero = () => {
  const info = db.getInfo();
  
  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden bg-gray-50 dark:bg-gray-900 perspective-1000">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <motion.img 
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 10, repeat: Infinity, repeatType: "reverse" }}
          src={info.heroImage || "https://picsum.photos/1920/1080?blur=2"} 
          alt="School Campus" 
          className="w-full h-full object-cover opacity-60 dark:opacity-40"
        />
        {/* Gradient: White fade in Light Mode, Dark fade in Dark Mode */}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-50 via-gray-50/60 to-transparent dark:from-gray-900 dark:via-gray-900/60 dark:to-transparent"></div>
      </div>

      <div className="container mx-auto px-6 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 50, rotateX: 20 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{ duration: 0.8, type: "spring" }}
          className="preserve-3d"
        >
          <span className="inline-block py-2 px-6 rounded-full bg-primary-500/10 dark:bg-primary-500/20 text-primary-700 dark:text-primary-300 border border-primary-500/20 dark:border-primary-500/30 text-sm font-bold mb-6 backdrop-blur-md shadow-lg animate-pulse">
            ✨ Welcome to Excellence
          </span>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-display font-extrabold text-gray-900 dark:text-white mb-8 leading-tight text-glow tracking-tight drop-shadow-2xl">
            {info.heroTitle || info.name}
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-200 max-w-3xl mx-auto mb-12 leading-relaxed font-light drop-shadow-lg">
            {info.heroSubtitle || info.mission}
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-6">
            {/* Green Primary Button */}
            <Link to="/contact" className="btn-3d px-10 py-4 bg-primary-600 text-white rounded-full font-bold text-lg flex items-center justify-center gap-3 group shadow-primary-500/40">
              Apply Now <ArrowRight size={20} className="group-hover:translate-x-1 transition" />
            </Link>
            {/* Indigo Secondary Button */}
            <Link to="/about" className="btn-3d px-10 py-4 bg-white dark:bg-white/10 text-indigo-600 dark:text-white border border-indigo-100 dark:border-white/20 rounded-full font-bold text-lg hover:bg-indigo-50 dark:hover:bg-white/20 flex items-center justify-center shadow-lg">
              Learn More
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Floating 3D Elements */}
      <motion.div 
        animate={{ y: [0, -30, 0], rotate: [0, 5, 0] }}
        transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
        className="absolute top-1/4 right-10 text-secondary-500 opacity-20 hidden lg:block filter drop-shadow-2xl"
      >
        <BookOpen size={140} />
      </motion.div>
      <motion.div 
        animate={{ y: [0, 30, 0], rotate: [0, -5, 0] }}
        transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1 }}
        className="absolute bottom-1/4 left-10 text-primary-500 opacity-20 hidden lg:block filter drop-shadow-2xl"
      >
        <Trophy size={140} />
      </motion.div>

      {/* New Animated Elements for Dynamics */}
      <motion.div 
        animate={{ y: [0, -40, 0], rotate: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 7, ease: "easeInOut", delay: 2 }}
        className="absolute top-32 left-32 text-amber-400 opacity-20 hidden lg:block filter drop-shadow-2xl"
      >
        <Lightbulb size={90} />
      </motion.div>
      
      <motion.div 
        animate={{ y: [0, 25, 0], rotate: [0, -15, 0] }}
        transition={{ repeat: Infinity, duration: 8, ease: "easeInOut", delay: 0.5 }}
        className="absolute bottom-20 right-32 text-sky-500 opacity-20 hidden lg:block filter drop-shadow-2xl"
      >
        <Globe size={110} />
      </motion.div>

      <motion.div 
        animate={{ y: [0, -20, 0], x: [0, 10, 0], rotate: [0, 5, 0] }}
        transition={{ repeat: Infinity, duration: 9, ease: "easeInOut", delay: 1.5 }}
        className="absolute top-40 right-1/3 text-violet-500 opacity-15 hidden lg:block filter drop-shadow-2xl"
      >
        <Cpu size={70} />
      </motion.div>

      {/* Floating particles/shapes for extra depth */}
       <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.3, 0.1] }}
        transition={{ repeat: Infinity, duration: 4 }}
        className="absolute top-1/2 left-1/4 w-4 h-4 rounded-full bg-primary-400 blur-sm hidden lg:block"
       />
       <motion.div
        animate={{ scale: [1, 1.5, 1], opacity: [0.1, 0.2, 0.1] }}
        transition={{ repeat: Infinity, duration: 5, delay: 1 }}
        className="absolute bottom-1/3 right-1/4 w-6 h-6 rounded-full bg-secondary-400 blur-sm hidden lg:block"
       />
    </section>
  );
};

// Map string icon names to components
const IconMap: Record<string, any> = {
    BookOpen, Users, Trophy, Bell, Star, Award, Zap, Lightbulb, Globe, Cpu
};

const FeatureCard = ({ iconName, title, desc, delay, color, glowClass }: any) => {
  const Icon = IconMap[iconName] || Star; // Default to Star if icon not found
  return (
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay, duration: 0.5 }}
        className={`card-3d bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 parent-hover ${glowClass}`}
      >
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 icon-3d shadow-inner ${color}`}>
          <Icon size={36} strokeWidth={1.5} />
        </div>
        <h3 className="text-2xl font-bold mb-4 dark:text-white tracking-tight">{title}</h3>
        <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-lg">{desc}</p>
        <div className="mt-6 flex items-center text-gray-900 dark:text-white font-semibold group cursor-pointer hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
            <span className="group-hover:mr-2 transition-all duration-300">Learn more</span> <ChevronRight size={18} />
        </div>
      </motion.div>
  );
}

const NoticeTicker = () => {
    const notices = db.getNotices().slice(0, 3);
    const info = db.getInfo();
    return (
        <div className="bg-primary-600 text-white py-3 overflow-hidden relative shadow-md z-20">
            <div className="container mx-auto px-6 flex items-center">
                <span className="font-bold bg-white text-primary-700 px-3 py-1 rounded-md text-xs mr-4 uppercase tracking-wider shadow-sm btn-3d whitespace-nowrap">
                    {info.newsTitle || "Latest News"}
                </span>
                <div className="flex-1 overflow-hidden">
                   <div className="animate-marquee whitespace-nowrap flex gap-10">
                       {notices.map(n => (
                           <span key={n.id} className="inline-flex items-center gap-2 font-medium">
                               <Bell size={14} className="animate-bounce" /> {n.title} - {n.date}
                           </span>
                       ))}
                       {notices.length === 0 && <span>Welcome to our official website!</span>}
                   </div>
                </div>
            </div>
        </div>
    );
};

export const Home = () => {
  const info = db.getInfo();
  const features = info.features || [];

  // Helper for alternating colors
  const getFeatureColor = (idx: number) => {
      const colors = [
          "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
          "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
          "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400"
      ];
      return colors[idx % colors.length];
  };

   const getGlowClass = (idx: number) => {
      const glows = ["glow-blue", "glow-green", "glow-amber"];
      return glows[idx % glows.length];
  };

  return (
    <>
      <Hero />
      <NoticeTicker />
      
      {/* Features Section */}
      <section className="py-24 bg-gray-50 dark:bg-gray-950 relative">
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-display font-bold mb-6 dark:text-white">{info.featuresSectionTitle || "Why Choose Us?"}</h2>
            <div className="w-24 h-1.5 bg-gradient-to-r from-primary-400 to-primary-600 mx-auto rounded-full"></div>
            <p className="mt-6 text-xl text-gray-500 max-w-2xl mx-auto">{info.featuresSectionSubtitle || "We provide a comprehensive learning environment."}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {features.map((feat, idx) => (
                <FeatureCard 
                  key={feat.id}
                  iconName={feat.icon}
                  title={feat.title}
                  desc={feat.description}
                  delay={0.1 * (idx + 1)}
                  color={getFeatureColor(idx)}
                  glowClass={getGlowClass(idx)}
                />
            ))}
          </div>
        </div>
      </section>

      {/* Principal Message Section */}
      <section className="py-24 bg-white dark:bg-gray-900 relative overflow-hidden">
         <div className="container mx-auto px-6 flex flex-col md:flex-row items-center gap-16 relative z-10">
             <div className="w-full md:w-1/2 perspective-1000">
                 <motion.div
                    initial={{ opacity: 0, rotateY: -20 }}
                    whileInView={{ opacity: 1, rotateY: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="card-3d relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white dark:border-gray-800 glow-purple"
                 >
                    <img 
                        src={info.principalImage || "https://picsum.photos/600/600?random=principal"} 
                        alt="Principal" 
                        className="w-full h-auto object-cover transform transition duration-700 hover:scale-105"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-8">
                        <div className="text-white font-bold text-2xl">{info.principalName || "Principal Name"}</div>
                        <div className="text-primary-300">{info.principalPosition || "Principal"}</div>
                    </div>
                 </motion.div>
             </div>
             <div className="w-full md:w-1/2">
                 <h2 className="text-4xl md:text-5xl font-display font-bold mb-8 dark:text-white">Principal's Message</h2>
                 <div className="relative">
                    <div className="absolute -left-6 -top-6 text-8xl text-primary-100 dark:text-primary-900 font-serif opacity-50">"</div>
                    <p className="text-gray-600 dark:text-gray-300 text-xl leading-relaxed mb-8 italic relative z-10">
                        {info.principalMessage}
                    </p>
                 </div>
                 {/* Dark/Gray Button for Principal Section */}
                 <Link to="/about" className="btn-3d inline-flex px-8 py-3 bg-gray-900 dark:bg-gray-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl hover:bg-black dark:hover:bg-gray-600">
                    Read More About Us
                 </Link>
             </div>
         </div>
      </section>
    </>
  );
};
