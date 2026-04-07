
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, GraduationCap, Award, Calendar } from 'lucide-react';
import { db } from '../services/db';
import { ExamResult } from '../types';
import { showToast } from '../components/Layout';

export const Results = () => {
    const [roll, setRoll] = useState('');
    const [className, setClassName] = useState('');
    const [result, setResult] = useState<ExamResult | null>(null);
    const [searched, setSearched] = useState(false);
    const allResults = db.getResults();

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        // Case insensitive search and robust whitespace handling
        const found = allResults.find(r => 
            r.roll.trim().toLowerCase() === roll.trim().toLowerCase() && 
            r.class === className
        );
        
        setResult(found || null);
        setSearched(true);
        
        if (found) {
            showToast('Result found!', 'success');
        } else {
            showToast('No result found for this roll number.', 'error');
        }
    };

    return (
        <div className="pt-32 pb-20 container mx-auto px-6">
            <div className="max-w-2xl mx-auto text-center mb-12">
                <h1 className="text-5xl font-display font-bold mb-4 dark:text-white">Exam Results</h1>
                <p className="text-gray-600 dark:text-gray-400 text-lg">Enter your Class and Roll Number to view your academic performance.</p>
            </div>

            <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-xl mx-auto card-3d bg-white dark:bg-gray-800 p-10 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 glow-indigo"
            >
                <form onSubmit={handleSearch} className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Class</label>
                        <select 
                            value={className}
                            onChange={(e) => setClassName(e.target.value)}
                            required
                            className="w-full p-4 rounded-xl border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white outline-none focus:ring-4 focus:ring-violet-500/20 focus:border-violet-500 transition shadow-inner"
                        >
                            <option value="">Select Class</option>
                            <option value="6">Class 6</option>
                            <option value="7">Class 7</option>
                            <option value="8">Class 8</option>
                            <option value="9">Class 9</option>
                            <option value="10">Class 10</option>
                            <option value="11">Class 11</option>
                            <option value="12">Class 12</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Roll Number</label>
                        <input 
                            type="text"
                            value={roll}
                            onChange={(e) => setRoll(e.target.value)}
                            required
                            placeholder="Ex: 101"
                            className="w-full p-4 rounded-xl border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white outline-none focus:ring-4 focus:ring-violet-500/20 focus:border-violet-500 transition shadow-inner"
                        />
                    </div>
                    {/* Violet Search Button */}
                    <button 
                        type="submit"
                        className="btn-3d w-full py-4 bg-violet-600 text-white rounded-xl font-bold text-lg hover:bg-violet-700 transition flex items-center justify-center gap-3 shadow-lg shadow-violet-500/30"
                    >
                        <Search size={22} /> Check Result
                    </button>
                </form>
            </motion.div>

            {searched && (
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-xl mx-auto mt-10 perspective-1000"
                >
                    {result ? (
                        <div className="card-3d bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border-t-8 border-violet-500 overflow-hidden glow-purple">
                            <div className="bg-violet-50 dark:bg-violet-900/20 p-8 text-center border-b border-gray-100 dark:border-gray-700">
                                <div className="w-20 h-20 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg text-violet-600 icon-3d">
                                    <GraduationCap size={40} />
                                </div>
                                <h3 className="text-3xl font-bold dark:text-white mb-1">{result.studentName}</h3>
                                <p className="text-gray-600 dark:text-gray-400 font-medium">Class {result.class} | Roll: {result.roll}</p>
                            </div>
                            <div className="p-8">
                                <div className="grid grid-cols-2 gap-6 text-center mb-8">
                                    <div className="p-5 bg-gray-50 dark:bg-gray-700/50 rounded-2xl shadow-inner border border-gray-100 dark:border-gray-700">
                                        <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">Exam</p>
                                        <p className="font-bold text-xl dark:text-white">{result.examName}</p>
                                    </div>
                                    <div className="p-5 bg-gray-50 dark:bg-gray-700/50 rounded-2xl shadow-inner border border-gray-100 dark:border-gray-700">
                                        <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">GPA</p>
                                        <p className="font-bold text-3xl text-violet-600">{result.gpa}</p>
                                    </div>
                                </div>
                                <div className="text-center">
                                    <div className="inline-flex items-center gap-3 px-8 py-3 rounded-full bg-green-100 text-green-700 font-bold text-xl shadow-lg border border-green-200 icon-3d">
                                        <Award size={24} /> Grade: {result.grade}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="card-3d bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 p-8 rounded-3xl text-center border border-red-100 dark:border-red-900/30">
                            <p className="font-bold text-xl mb-2">No result found.</p>
                            <p className="">Please check your Class and Roll number and try again.</p>
                        </div>
                    )}
                </motion.div>
            )}
        </div>
    );
};
