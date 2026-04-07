
import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Users, BookOpen, Image as ImageIcon, 
  Settings, LogOut, FileText, Plus, Edit2, Trash2, Save,
  Award, GraduationCap, Calendar, Briefcase, UserCog, Search, Menu, X, MessageCircle,
  Home, Info
} from 'lucide-react';
import { db } from '../../services/db';
import { SchoolInfo, User } from '../../types';
import { ImageUpload } from '../../components/ImageUpload';
import { showToast } from '../../components/Layout';

// Components for Admin Content
const StatsCard = ({ title, count, icon: Icon, color, glowClass }: any) => (
  <div className={`card-3d bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center space-x-5 ${glowClass}`}>
    <div className={`p-4 rounded-2xl ${color} bg-opacity-20 text-opacity-100 icon-3d`}>
      <Icon size={28} className={color.replace('bg-', 'text-')} />
    </div>
    <div>
      <h4 className="text-gray-500 dark:text-gray-400 text-sm font-bold uppercase tracking-wider">{title}</h4>
      <span className="text-3xl font-bold text-gray-800 dark:text-white mt-1 block">{count}</span>
    </div>
  </div>
);

// Better Data Table
type ColumnType = 'text' | 'image' | 'date' | 'longtext';

interface Column<T> {
    key: keyof T;
    label: string;
    type?: ColumnType;
}

const DataTable = <T extends { id?: string; username?: string }>({ 
  data, 
  columns, 
  onEdit, 
  onDelete,
  glowClass
}: { 
  data: T[], 
  columns: Column<T>[],
  onEdit?: (item: T) => void,
  onDelete?: (id: string) => void,
  glowClass?: string
}) => (
  <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden ${glowClass}`}>
    <div className="overflow-x-auto">
      <table className="w-full text-left whitespace-nowrap md:whitespace-normal">
        <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 text-xs uppercase font-bold tracking-wider">
          <tr>
            {columns.map(col => <th key={String(col.key)} className="px-6 py-5">{col.label}</th>)}
            <th className="px-6 py-5 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
          {data.map((item, idx) => (
            <tr key={item.id || item.username || idx} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition duration-200">
              {columns.map(col => (
                <td key={String(col.key)} className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300 align-middle font-medium">
                  {col.type === 'image' ? (
                     <div className="w-14 h-14 rounded-xl bg-gray-100 dark:bg-gray-700 overflow-hidden shadow-sm border dark:border-gray-600">
                        <img src={String(item[col.key])} alt="thumbnail" className="w-full h-full object-cover" 
                             onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/50?text=IMG' }} />
                     </div>
                  ) : col.type === 'longtext' ? (
                      <div className="max-w-xs truncate" title={String(item[col.key])}>
                          {String(item[col.key])}
                      </div>
                  ) : (
                    String(item[col.key])
                  )}
                </td>
              ))}
              <td className="px-6 py-4 text-right space-x-3 align-middle relative z-10">
                {onEdit && (
                    <button 
                        type="button"
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); onEdit(item); }} 
                        className="btn-3d inline-flex p-2 text-blue-600 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 rounded-lg transition cursor-pointer relative z-20" 
                        title="Edit"
                    >
                        <Edit2 size={18}/>
                    </button>
                )}
                {onDelete && item.username !== 'admin' && ( // Prevent deleting admin
                    <button 
                        type="button"
                        onClick={(e) => { 
                            e.preventDefault();
                            e.stopPropagation(); 
                            // Use id for resources, username for users
                            const idToDelete = item.id || item.username;
                            if (idToDelete) onDelete(idToDelete);
                        }} 
                        className="btn-3d inline-flex p-2 text-red-600 bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 rounded-lg transition cursor-pointer relative z-20" 
                        title="Delete"
                    >
                        <Trash2 size={18}/>
                    </button>
                )}
              </td>
            </tr>
          ))}
          {data.length === 0 && (
            <tr><td colSpan={columns.length + 1} className="px-6 py-16 text-center text-gray-500">No records found.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
);

// Improved Resource Manager
const ResourceManager = ({ 
  title, 
  getData, 
  saveData, 
  deleteData, 
  fields,
  glowClass
}: { 
  title: string, 
  getData: () => any[], 
  saveData: (data: any) => void, 
  deleteData: (id: string) => void,
  fields: { name: string, label: string, type: 'text' | 'textarea' | 'date' | 'url' | 'image' | 'number' | 'select', options?: string[] }[],
  glowClass?: string
}) => {
  const [items, setItems] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<any>({});
  const [searchTerm, setSearchTerm] = useState('');

  const refresh = () => setItems([...getData()]); 
  useEffect(() => refresh(), []);

  const handleAddNew = () => {
    // Reset the form properly
    const emptyItem: any = {};
    fields.forEach(f => emptyItem[f.name] = '');
    setCurrentItem(emptyItem); 
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const id = currentItem.id || (Date.now() + Math.random().toString(36).substr(2, 9));
    saveData({ ...currentItem, id });
    setIsModalOpen(false);
    refresh(); 
    showToast(`${title} saved successfully!`);
  };

  const handleDelete = (id: string) => {
    if(window.confirm('Are you sure you want to delete this item?')) {
      deleteData(id);
      refresh(); 
      showToast(`${title} deleted successfully.`, 'info');
    }
  };

  const filteredItems = items.filter(item => {
      if (!searchTerm) return true;
      const lowerTerm = searchTerm.toLowerCase();
      return fields.some(field => {
          const val = item[field.name];
          if (val === null || val === undefined) return false;
          return String(val).toLowerCase().includes(lowerTerm);
      });
  });

  const columns = fields.map(f => ({
      key: f.name, 
      label: f.label,
      type: (f.type === 'url' || f.type === 'image') ? 'image' : f.type === 'textarea' ? 'longtext' : 'text'
  })) as Column<any>[];

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h2 className="text-2xl md:text-3xl font-bold dark:text-white">Manage {title}</h2>
            <p className="text-gray-500 mt-1 text-sm md:text-base">Add, edit, or remove {title.toLowerCase()} records.</p>
        </div>
        
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                    type="text" 
                    placeholder={`Search ${title}...`}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-primary-500 transition shadow-sm"
                />
            </div>
            <button 
              onClick={handleAddNew}
              className="btn-3d flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition shadow-lg shadow-emerald-500/30 font-bold whitespace-nowrap"
            >
              <Plus size={20} /> Add New
            </button>
        </div>
      </div>

      <DataTable 
        data={filteredItems} 
        columns={columns}
        onEdit={(item) => { setCurrentItem({...item}); setIsModalOpen(true); }} 
        onDelete={handleDelete}
        glowClass={glowClass}
      />

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh] border border-gray-200 dark:border-gray-700 glow-blue animate-in zoom-in-95 duration-200">
            <div className="p-6 md:p-8 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 rounded-t-3xl shrink-0">
                <h3 className="text-2xl font-bold dark:text-white">{currentItem.id ? 'Edit' : 'Add'} {title}</h3>
            </div>
            <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-5 overflow-y-auto custom-scrollbar grow">
              {fields.map(f => (
                <div key={f.name}>
                  {f.type !== 'image' && <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">{f.label}</label>}
                  {f.type === 'textarea' ? (
                    <textarea 
                      required 
                      className="w-full rounded-xl border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white p-3 border focus:ring-2 focus:ring-primary-500 outline-none transition"
                      rows={4}
                      value={currentItem[f.name] || ''}
                      onChange={e => setCurrentItem({...currentItem, [f.name]: e.target.value})}
                    />
                  ) : f.type === 'select' && f.options ? (
                    <select
                        required
                        className="w-full rounded-xl border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white p-3 border focus:ring-2 focus:ring-primary-500 outline-none transition"
                        value={currentItem[f.name] || ''}
                        onChange={e => setCurrentItem({...currentItem, [f.name]: e.target.value})}
                    >
                        <option value="">Select {f.label}</option>
                        {f.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  ) : f.type === 'image' ? (
                     <ImageUpload 
                        label={f.label}
                        value={currentItem[f.name]} 
                        onChange={(val) => setCurrentItem({...currentItem, [f.name]: val})} 
                     />
                  ) : (
                    <input 
                      type={f.type === 'url' ? 'text' : f.type}
                      required={f.type !== 'url'}
                      placeholder={f.type === 'url' ? 'https://...' : ''}
                      className="w-full rounded-xl border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white p-3 border focus:ring-2 focus:ring-primary-500 outline-none transition"
                      value={currentItem[f.name] || ''}
                      onChange={e => setCurrentItem({...currentItem, [f.name]: e.target.value})}
                    />
                  )}
                </div>
              ))}
            </form>
            <div className="p-6 md:p-8 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-4 bg-gray-50 dark:bg-gray-800/50 rounded-b-3xl shrink-0">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl font-bold transition">Cancel</button>
                <button onClick={handleSubmit} type="button" className="btn-3d px-8 py-3 bg-teal-600 text-white rounded-xl hover:bg-teal-700 font-bold transition shadow-md">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// User Manager
const UserManager = () => {
    const [users, setUsers] = useState<User[]>(db.getUsers());
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => { setUsers(db.getUsers()); }, []);

    const handleSave = () => {
        if (editingUser) {
            db.saveUser(editingUser);
            setEditingUser(null);
            setUsers(db.getUsers());
            showToast('User updated successfully');
        }
    };

    const handleDelete = (username: string) => {
        if (username === 'admin') {
            showToast("Cannot delete system admin", "error");
            return;
        }
        if(window.confirm(`Are you sure you want to delete user @${username}? This cannot be undone.`)) {
            db.deleteUser(username);
            setUsers(db.getUsers());
            showToast(`User @${username} deleted successfully`);
        }
    };

    const filteredUsers = users.filter(user => 
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (user.title && user.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (user.role && user.role.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="space-y-8 animate-fade-in">
             <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl md:text-3xl font-bold dark:text-white">Manage Users</h2>
                    <p className="text-gray-500 mt-1 text-sm md:text-base">Edit titles, roles, or remove registered users.</p>
                </div>
                <div className="relative w-full md:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                        type="text" 
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-primary-500 transition shadow-sm"
                    />
                </div>
            </div>

            <DataTable 
                data={filteredUsers}
                columns={[
                    { key: 'username', label: 'Username' },
                    { key: 'role', label: 'Role' },
                    { key: 'title', label: 'Display Title' }
                ]}
                onEdit={(u) => setEditingUser(u)}
                onDelete={handleDelete}
                glowClass="glow-purple"
            />

            {editingUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-md shadow-2xl p-8 border border-gray-200 dark:border-gray-700 glow-blue animate-in zoom-in-95">
                         <h3 className="text-2xl font-bold dark:text-white mb-6">Edit User: {editingUser.username}</h3>
                         <div className="space-y-4">
                             <div>
                                 <label className="block text-sm font-bold mb-2 dark:text-gray-300">Title (e.g. Student, Teacher)</label>
                                 <input 
                                    type="text" 
                                    className="w-full p-3 rounded-xl border dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    value={editingUser.title}
                                    onChange={(e) => setEditingUser({...editingUser, title: e.target.value})}
                                 />
                             </div>
                             <div>
                                 <label className="block text-sm font-bold mb-2 dark:text-gray-300">Role</label>
                                 <select 
                                    className="w-full p-3 rounded-xl border dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    value={editingUser.role}
                                    onChange={(e) => setEditingUser({...editingUser, role: e.target.value as 'user' | 'admin'})}
                                 >
                                     <option value="user">User</option>
                                     <option value="admin">Admin</option>
                                 </select>
                             </div>
                             <div className="flex justify-end gap-3 mt-6">
                                 <button onClick={() => setEditingUser(null)} className="px-4 py-2 text-gray-500 font-bold hover:bg-gray-100 rounded-lg">Cancel</button>
                                 <button onClick={handleSave} className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700">Save</button>
                             </div>
                         </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// Settings Page
const SettingsPage = () => {
    const [info, setInfo] = useState<SchoolInfo>(db.getInfo());
    const [activeTab, setActiveTab] = useState<'general' | 'home' | 'about' | 'classInfo'>('general');
    
    useEffect(() => { setInfo(db.getInfo()); }, []);

    const handleSave = () => {
        db.updateInfo(info);
        showToast('Settings saved successfully!');
    };

    // --- Helper to remove a class card ---
    const deleteClassInfo = (index: number) => {
        if(window.confirm('Are you sure you want to remove this class info card?')) {
            const newStats = [...(info.classStats || [])];
            newStats.splice(index, 1);
            setInfo({ ...info, classStats: newStats });
        }
    };

    // --- Helper to add a class card ---
    const addClassInfo = () => {
        const newStats = [...(info.classStats || [])];
        newStats.push({ 
            id: Date.now().toString() + Math.random().toString(36).substring(2, 9), 
            className: `Class ${newStats.length + 6}`, 
            studentCount: '0', 
            classTeacher: '' 
        });
        setInfo({ ...info, classStats: newStats });
    };

    // --- Helper to update specific field in class info ---
    const updateClassInfo = (index: number, field: string, value: string) => {
        const newStats = [...(info.classStats || [])];
        newStats[index] = { ...newStats[index], [field]: value };
        setInfo({ ...info, classStats: newStats });
    };

    const tabs = [
        { id: 'general', label: 'General Info', icon: Settings },
        { id: 'home', label: 'Home Page', icon: Home },
        { id: 'about', label: 'About Us', icon: Info },
        { id: 'classInfo', label: 'Class Info', icon: Users },
    ];

    return (
        <div className="max-w-5xl space-y-10">
            <div>
                <h2 className="text-3xl font-bold dark:text-white mb-6">Website Settings</h2>
                <div className="flex space-x-2 mb-8 border-b border-gray-200 dark:border-gray-700 overflow-x-auto pb-1">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex items-center gap-2 px-6 py-3 rounded-t-xl font-bold transition-all whitespace-nowrap ${
                                activeTab === tab.id 
                                ? 'bg-white dark:bg-gray-800 text-primary-600 border-b-2 border-primary-600 shadow-sm' 
                                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                            }`}
                        >
                            <tab.icon size={18} /> {tab.label}
                        </button>
                    ))}
                </div>

                <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-sm border border-gray-200 dark:border-gray-700 glow-blue">
                    {activeTab === 'general' && (
                        <div className="space-y-6 animate-fade-in">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="block text-sm font-bold text-gray-500 dark:text-gray-400">School Name</label>
                                    <input type="text" className="w-full p-3 border rounded-xl dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none" value={info.name || ''} onChange={e => setInfo({...info, name: e.target.value})} />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-bold text-gray-500 dark:text-gray-400">Phone</label>
                                    <input type="text" className="w-full p-3 border rounded-xl dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none" value={info.phone || ''} onChange={e => setInfo({...info, phone: e.target.value})} />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-bold text-gray-500 dark:text-gray-400">Email</label>
                                    <input type="text" className="w-full p-3 border rounded-xl dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none" value={info.email || ''} onChange={e => setInfo({...info, email: e.target.value})} />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-bold text-gray-500 dark:text-gray-400">Address</label>
                                    <input type="text" className="w-full p-3 border rounded-xl dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none" value={info.address || ''} onChange={e => setInfo({...info, address: e.target.value})} />
                                </div>
                            </div>
                            <ImageUpload label="School Logo" value={info.logoUrl} onChange={(val) => setInfo({...info, logoUrl: val})} />
                        </div>
                    )}
                     {activeTab === 'home' && (
                         <div className="space-y-6 animate-fade-in">
                             <div className="space-y-2">
                                <label className="block text-sm font-bold text-gray-500 dark:text-gray-400">Hero Title</label>
                                <input type="text" className="w-full p-3 border rounded-xl dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none" value={info.heroTitle} onChange={e => setInfo({...info, heroTitle: e.target.value})} />
                             </div>
                             <div className="space-y-2">
                                <label className="block text-sm font-bold text-gray-500 dark:text-gray-400">Hero Subtitle</label>
                                <input type="text" className="w-full p-3 border rounded-xl dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none" value={info.heroSubtitle} onChange={e => setInfo({...info, heroSubtitle: e.target.value})} />
                             </div>
                             <ImageUpload label="Hero Background" value={info.heroImage} onChange={val => setInfo({...info, heroImage: val})} />
                         </div>
                    )}
                     {activeTab === 'about' && (
                         <div className="space-y-6 animate-fade-in">
                             <div className="space-y-2">
                                <label className="block text-sm font-bold text-gray-500 dark:text-gray-400">History</label>
                                <textarea className="w-full p-3 border rounded-xl dark:bg-gray-700 dark:text-white h-32 focus:ring-2 focus:ring-primary-500 outline-none" value={info.history} onChange={e => setInfo({...info, history: e.target.value})} />
                             </div>
                             <div className="space-y-2">
                                <label className="block text-sm font-bold text-gray-500 dark:text-gray-400">Mission</label>
                                <textarea className="w-full p-3 border rounded-xl dark:bg-gray-700 dark:text-white h-32 focus:ring-2 focus:ring-primary-500 outline-none" value={info.mission} onChange={e => setInfo({...info, mission: e.target.value})} />
                             </div>
                             <div className="space-y-2">
                                <label className="block text-sm font-bold text-gray-500 dark:text-gray-400">Vision</label>
                                <textarea className="w-full p-3 border rounded-xl dark:bg-gray-700 dark:text-white h-32 focus:ring-2 focus:ring-primary-500 outline-none" value={info.vision} onChange={e => setInfo({...info, vision: e.target.value})} />
                             </div>
                             <div className="border-t border-gray-100 dark:border-gray-700 pt-6">
                                <h3 className="font-bold text-lg mb-4 dark:text-white">Principal Info</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="block text-sm font-bold text-gray-500 dark:text-gray-400">Name</label>
                                        <input type="text" className="w-full p-3 border rounded-xl dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none" value={info.principalName} onChange={e => setInfo({...info, principalName: e.target.value})} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-sm font-bold text-gray-500 dark:text-gray-400">Message</label>
                                        <textarea className="w-full p-3 border rounded-xl dark:bg-gray-700 dark:text-white h-32 focus:ring-2 focus:ring-primary-500 outline-none" value={info.principalMessage} onChange={e => setInfo({...info, principalMessage: e.target.value})} />
                                    </div>
                                    <div className="md:col-span-2">
                                        <ImageUpload label="Principal Image" value={info.principalImage} onChange={val => setInfo({...info, principalImage: val})} />
                                    </div>
                                </div>
                             </div>
                         </div>
                    )}
                    {activeTab === 'classInfo' && (
                        <div className="space-y-6 animate-fade-in">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h3 className="text-xl font-bold dark:text-white">Class Information</h3>
                                    <p className="text-sm text-gray-500">Manage available classes, student counts, and class teachers.</p>
                                </div>
                                <button onClick={addClassInfo} className="btn-3d flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-bold shadow-md hover:bg-emerald-700 transition">
                                    <Plus size={16} /> Add Class
                                </button>
                            </div>
                            <div className="grid grid-cols-1 gap-4">
                                {info.classStats?.map((stat, index) => (
                                    <div key={stat.id || index} className="p-5 bg-gray-50 dark:bg-gray-700/50 rounded-2xl border border-gray-200 dark:border-gray-600 hover:shadow-md transition">
                                        
                                        {/* Header Row with Delete Button - NO Absolute positioning to fix click issues */}
                                        <div className="flex justify-between items-center mb-4 border-b border-gray-200 dark:border-gray-600 pb-3">
                                            <div className="flex items-center gap-2">
                                                <div className="bg-primary-100 dark:bg-primary-900/30 text-primary-600 p-1.5 rounded-lg">
                                                    <BookOpen size={16} />
                                                </div>
                                                <span className="font-bold text-gray-700 dark:text-gray-200 text-sm">Class Entry #{index + 1}</span>
                                            </div>
                                            <button 
                                                type="button"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    deleteClassInfo(index);
                                                }}
                                                className="flex items-center gap-2 text-red-500 hover:text-red-700 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 px-3 py-1.5 rounded-lg transition font-bold text-xs cursor-pointer border border-red-100 dark:border-red-900/30"
                                                title="Remove Class Info"
                                            >
                                                <Trash2 size={14} /> Remove
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            <div>
                                                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">Class Name</label>
                                                <input 
                                                    type="text" 
                                                    value={stat.className}
                                                    onChange={(e) => updateClassInfo(index, 'className', e.target.value)}
                                                    className="w-full p-2.5 rounded-lg border dark:bg-gray-800 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none font-bold text-gray-700"
                                                    placeholder="e.g. Class 6"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">Student Count</label>
                                                <input 
                                                    type="text" 
                                                    value={stat.studentCount}
                                                    onChange={(e) => updateClassInfo(index, 'studentCount', e.target.value)}
                                                    className="w-full p-2.5 rounded-lg border dark:bg-gray-800 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none font-medium"
                                                    placeholder="e.g. 45"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">Class Teacher</label>
                                                <input 
                                                    type="text" 
                                                    value={stat.classTeacher}
                                                    onChange={(e) => updateClassInfo(index, 'classTeacher', e.target.value)}
                                                    className="w-full p-2.5 rounded-lg border dark:bg-gray-800 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none font-medium"
                                                    placeholder="Teacher Name"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {(info.classStats?.length === 0 || !info.classStats) && (
                                    <div className="text-center py-12 text-gray-400 italic border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl bg-gray-50/50 dark:bg-gray-800/50">
                                        <p className="mb-2">No class information added yet.</p>
                                        <button onClick={addClassInfo} className="text-primary-600 font-bold hover:underline">Add your first class</button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    <div className="pt-6 mt-6 border-t border-gray-100 dark:border-gray-700 sticky bottom-0 bg-white dark:bg-gray-800 z-10 p-2">
                        <button onClick={handleSave} className="btn-3d w-full md:w-auto flex items-center justify-center gap-2 px-8 py-3 bg-teal-600 text-white rounded-xl hover:bg-teal-700 font-bold shadow-lg shadow-teal-500/30 transition">
                            <Save size={20} /> Save Changes
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const DashboardHome = () => {
  const stats = db.getStats();
  
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-end">
          <div>
            <h2 className="text-4xl font-bold dark:text-white">Dashboard Overview</h2>
            <p className="text-gray-500 mt-2">Welcome back, Admin.</p>
          </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <StatsCard title="Total Teachers" count={stats.teachers} icon={Users} color="bg-blue-500 text-blue-600" glowClass="glow-blue" />
        <StatsCard title="Total Students" count={stats.students} icon={GraduationCap} color="bg-emerald-500 text-emerald-600" glowClass="glow-green" />
        <StatsCard title="Notices" count={stats.notices} icon={FileText} color="bg-purple-500 text-purple-600" glowClass="glow-purple" />
        <StatsCard title="Events" count={stats.events} icon={Calendar} color="bg-cyan-500 text-cyan-600" glowClass="glow-blue" />
      </div>
    </div>
  );
};

export const AdminDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = () => {
    db.logout();
    navigate('/');
    showToast('Logged out successfully');
  };

  const navItems = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Users', path: '/admin/users', icon: UserCog },
    { label: 'Teachers', path: '/admin/teachers', icon: Users },
    { label: 'Staff', path: '/admin/staff', icon: Briefcase },
    { label: 'Students', path: '/admin/students', icon: GraduationCap },
    { label: 'Events', path: '/admin/events', icon: Calendar },
    { label: 'Results', path: '/admin/results', icon: Award },
    { label: 'Notices', path: '/admin/notices', icon: FileText },
    { label: 'Gallery', path: '/admin/gallery', icon: ImageIcon },
    { label: 'Settings', path: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 font-sans">
      {/* Mobile Toggle */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-30 bg-white dark:bg-gray-800 p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center shadow-sm">
           <div className="flex items-center gap-2">
               <div className="p-1.5 bg-primary-600 rounded text-white"><LayoutDashboard size={18}/></div>
               <span className="font-bold dark:text-white">Admin Panel</span>
           </div>
           <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-gray-700 dark:text-gray-200">
               <Menu size={24} />
           </button>
      </div>

      {/* Sidebar - Desktop & Mobile Overlay */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-72 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col shadow-xl transition-transform duration-300 md:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-8 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-primary-500 to-emerald-600 rounded-lg text-white shadow-lg">
                <Settings className="w-6 h-6 animate-spin-slow" />
            </div>
            <h1 className="text-xl font-bold text-gray-800 dark:text-white tracking-tight">Admin Panel</h1>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-gray-500 hover:text-red-500"><X size={24} /></button>
        </div>
        <nav className="flex-1 p-6 space-y-2 overflow-y-auto custom-scrollbar">
          {navItems.map(item => {
            const isActive = location.pathname === item.path;
            return (
              <Link 
                key={item.path} 
                to={item.path}
                onClick={() => setIsSidebarOpen(false)}
                className={`flex items-center gap-4 px-5 py-4 rounded-xl transition-all duration-300 group ${
                    isActive 
                    ? 'bg-gradient-to-r from-primary-600 to-emerald-600 text-white shadow-lg shadow-emerald-500/30 font-bold translate-x-2' 
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:translate-x-1'
                }`}
              >
                <item.icon size={22} className={isActive ? 'text-white' : 'group-hover:text-primary-600 transition'} /> 
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-6 border-t border-gray-100 dark:border-gray-700 flex flex-col gap-3">
          <Link to="/chat" className="btn-3d flex items-center gap-3 w-full px-5 py-4 text-violet-600 bg-violet-50 hover:bg-violet-100 dark:bg-violet-900/20 dark:hover:bg-violet-900/30 rounded-xl transition font-bold">
            <MessageCircle size={22} /> Chat Room
          </Link>
          <button onClick={handleLogout} className="btn-3d flex items-center gap-3 w-full px-5 py-4 text-rose-600 bg-rose-50 hover:bg-rose-100 dark:bg-rose-900/20 dark:hover:bg-rose-900/30 rounded-xl transition font-bold">
            <LogOut size={22} /> Logout
          </button>
        </div>
      </aside>

      {/* Backdrop for Mobile Sidebar */}
      {isSidebarOpen && <div onClick={() => setIsSidebarOpen(false)} className="fixed inset-0 bg-black/50 z-30 md:hidden backdrop-blur-sm" />}

      <main className="flex-1 md:ml-72 p-6 md:p-10 pt-20 md:pt-10 overflow-y-auto">
        <Routes>
          <Route path="dashboard" element={<DashboardHome />} />
          <Route path="users" element={<UserManager />} />
          <Route path="teachers" element={
            <ResourceManager 
                title="Teachers" 
                getData={db.getTeachers} 
                saveData={db.saveTeacher} 
                deleteData={db.deleteTeacher}
                glowClass="glow-green"
                fields={[
                    { name: 'name', label: 'Name', type: 'text' },
                    { name: 'position', label: 'Position', type: 'text' },
                    { name: 'subject', label: 'Subject', type: 'text' },
                    { name: 'imageUrl', label: 'Photo', type: 'image' }
                ]}
            />
          } />
          <Route path="staff" element={<ResourceManager title="Staff" getData={db.getStaff} saveData={db.saveStaff} deleteData={db.deleteStaff} glowClass="glow-indigo" fields={[{ name: 'name', label: 'Name', type: 'text' }, { name: 'position', label: 'Position', type: 'text' }, { name: 'imageUrl', label: 'Photo', type: 'image' }]} />} />
          <Route path="students" element={<ResourceManager title="Students" getData={db.getStudents} saveData={db.saveStudent} deleteData={db.deleteStudent} glowClass="glow-green" fields={[{ name: 'name', label: 'Name', type: 'text' }, { name: 'class', label: 'Class', type: 'select', options: ['6', '7', '8', '9', '10', '11', '12'] }, { name: 'roll', label: 'Roll', type: 'text' }, { name: 'section', label: 'Section', type: 'text' }, { name: 'imageUrl', label: 'Photo', type: 'image' }]} />} />
          <Route path="events" element={<ResourceManager title="Events" getData={db.getEvents} saveData={db.saveEvent} deleteData={db.deleteEvent} glowClass="glow-blue" fields={[{ name: 'title', label: 'Event Title', type: 'text' }, { name: 'date', label: 'Date', type: 'date' }, { name: 'location', label: 'Location', type: 'text' }, { name: 'description', label: 'Description', type: 'textarea' }, { name: 'imageUrl', label: 'Photo', type: 'image' }]} />} />
          <Route path="results" element={<ResourceManager title="Results" getData={db.getResults} saveData={db.saveResult} deleteData={db.deleteResult} glowClass="glow-amber" fields={[{ name: 'studentName', label: 'Name', type: 'text' }, { name: 'class', label: 'Class', type: 'select', options: ['6','7','8','9','10'] }, { name: 'roll', label: 'Roll', type: 'text' }, { name: 'examName', label: 'Exam', type: 'text' }, { name: 'gpa', label: 'GPA', type: 'text' }, { name: 'grade', label: 'Grade', type: 'text' }]} />} />
          <Route path="notices" element={<ResourceManager title="Notices" getData={db.getNotices} saveData={db.saveNotice} deleteData={db.deleteNotice} glowClass="glow-purple" fields={[{ name: 'title', label: 'Title', type: 'text' }, { name: 'date', label: 'Date', type: 'date' }, { name: 'content', label: 'Content', type: 'textarea' }]} />} />
          <Route path="gallery" element={<ResourceManager title="Gallery" getData={db.getGallery} saveData={db.saveGalleryItem} deleteData={db.deleteGalleryItem} glowClass="glow-rose" fields={[{ name: 'category', label: 'Category', type: 'text' }, { name: 'caption', label: 'Caption', type: 'text' }, { name: 'imageUrl', label: 'Photo', type: 'image' }]} />} />
          <Route path="settings" element={<SettingsPage />} />
        </Routes>
      </main>
    </div>
  );
};
