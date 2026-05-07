/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Written by Brian McCarthy
 */

import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, CheckCircle2, Circle, Clock, LayoutDashboard, ListTodo, BarChart3, Search, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [courses, setCourses] = useState([]);
  const [stats, setStats] = useState({ total: 0, notStarted: 0, inProgress: 0, completed: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    target_date: '',
    status: 'Not Started'
  });

  const fetchCourses = async () => {
    try {
      const response = await fetch('/api/courses');
      const data = await response.json();
      if (data.success) {
        setCourses(data.courses);
      }
    } catch (err) {
      setError('Failed to fetch courses');
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/courses/stats');
      const data = await response.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (err) {
      console.error('Failed to fetch stats');
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([fetchCourses(), fetchStats()]);
      setLoading(false);
    };
    init();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingCourse ? `/api/courses/${editingCourse.id}` : '/api/courses';
      const method = editingCourse ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      if (data.success) {
        await fetchCourses();
        await fetchStats();
        handleCloseForm();
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this course?')) return;
    try {
      const response = await fetch(`/api/courses/${id}`, { method: 'DELETE' });
      const data = await response.json();
      if (data.success) {
        await fetchCourses();
        await fetchStats();
      }
    } catch (err) {
      setError('Delete failed');
    }
  };

  const handleEdit = (course) => {
    setEditingCourse(course);
    setFormData({
      name: course.name,
      description: course.description,
      target_date: course.target_date,
      status: course.status
    });
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingCourse(null);
    setFormData({ name: '', description: '', target_date: '', status: 'Not Started' });
    setError(null);
  };

  const filteredCourses = courses.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Completed': return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'In Progress': return <Clock className="w-5 h-5 text-amber-500" />;
      default: return <Circle className="w-5 h-5 text-gray-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/80 text-slate-900 font-sans">
      {/* Navigation */}
      <nav className="bg-white/90 backdrop-blur-md border-b border-indigo-100 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <div className="bg-indigo-600 p-1.5 rounded-lg">
                <LayoutDashboard className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-800 bg-linear-to-r from-indigo-700 to-indigo-500 bg-clip-text text-transparent">CodeCraftHub Learning Platform JS</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative group hidden sm:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                <input 
                  type="text" 
                  placeholder="Search courses..." 
                  className="pl-10 pr-4 py-2 bg-slate-100/50 border border-slate-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all w-64"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <button 
                onClick={() => setIsFormOpen(true)}
                className="btn-primary text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all shadow-lg shadow-indigo-200 active:scale-95"
              >
                <Plus className="w-4 h-4" />
                Add Course
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          {[
            { label: 'Total Courses', value: stats.total, icon: BarChart3, from: 'from-blue-50 to-indigo-50', text: 'text-indigo-600', border: 'border-indigo-100' },
            { label: 'Completed', value: stats.completed, icon: CheckCircle2, from: 'from-emerald-50 to-teal-50', text: 'text-emerald-600', border: 'border-emerald-100' },
            { label: 'In Progress', value: stats.inProgress, icon: Clock, from: 'from-amber-50 to-orange-50', text: 'text-amber-600', border: 'border-amber-100' },
            { label: 'Not Started', value: stats.notStarted, icon: Circle, from: 'from-slate-50 to-blue-50', text: 'text-slate-600', border: 'border-slate-200' }
          ].map((stat, i) => (
            <motion.div 
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`bg-linear-to-br ${stat.from} p-6 rounded-2xl border ${stat.border} shadow-sm hover:shadow-md transition-shadow`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2 rounded-xl bg-white shadow-xs`}>
                  <stat.icon className={`w-5 h-5 ${stat.text}`} />
                </div>
              </div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500/80 mb-1">{stat.label}</p>
              <h3 className="text-3xl font-black text-slate-800">{stat.value}</h3>
            </motion.div>
          ))}
        </div>

        {/* Content Section */}
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-100 p-2 rounded-lg">
                <ListTodo className="w-5 h-5 text-indigo-600" />
              </div>
              <h2 className="text-xl font-black text-slate-800 tracking-tight">Your Curriculum</h2>
            </div>
            <div className="px-3 py-1 bg-white rounded-full border border-slate-200 text-xs text-slate-500 font-bold shadow-xs">
              {filteredCourses.length} ITEMS FOUND
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center flex-col items-center py-20 gap-4">
              <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
              <p className="text-slate-500 font-medium animate-pulse">Syncing your learning data...</p>
            </div>
          ) : filteredCourses.length === 0 ? (
            <div className="bg-white/50 backdrop-blur-sm border-2 border-dashed border-indigo-100 rounded-3xl py-24 flex flex-col items-center text-center px-4">
              <div className="bg-indigo-50 p-6 rounded-full mb-6">
                <Search className="w-10 h-10 text-indigo-300" />
              </div>
              <h3 className="text-xl font-bold text-slate-800">Nothing matched your search</h3>
              <p className="text-slate-500 max-w-sm mt-3 font-medium">
                {searchTerm ? `We couldn't find anything for "${searchTerm}". Try broadening your search or creating a new course.` : "Your learning path is currently clear. Time to start something new!"}
              </p>
              {!searchTerm && (
                <button 
                  onClick={() => setIsFormOpen(true)}
                  className="mt-8 bg-white border border-indigo-200 text-indigo-600 font-bold px-6 py-3 rounded-xl hover:bg-indigo-50 transition-all shadow-sm flex items-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Define First Goal
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <AnimatePresence mode="popLayout">
                {filteredCourses.map((course) => (
                  <motion.div
                    key={course.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    whileHover={{ y: -4 }}
                    className="bg-white border border-indigo-50 rounded-2xl p-6 hover:shadow-xl hover:shadow-indigo-500/5 transition-all group relative overflow-hidden"
                  >
                    {/* Status accent bar */}
                    <div className={`absolute top-0 left-0 w-1.5 h-full ${
                      course.status === 'Completed' ? 'bg-emerald-400' :
                      course.status === 'In Progress' ? 'bg-amber-400' :
                      'bg-slate-300'
                    }`} />
                    
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl ${
                          course.status === 'Completed' ? 'bg-emerald-50' :
                          course.status === 'In Progress' ? 'bg-amber-50' :
                          'bg-slate-50'
                        }`}>
                          {getStatusIcon(course.status)}
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-slate-800 leading-tight mb-1 group-hover:text-indigo-700 transition-colors">{course.name}</h3>
                          <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 rounded font-black text-slate-500">ID #{course.id}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleEdit(course)}
                          className="p-2 hover:bg-indigo-50 rounded-xl text-slate-400 hover:text-indigo-600 transition-colors shadow-xs"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(course.id)} className="btn-delete">Remove</button>
                      </div>
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed line-clamp-2 mb-6 h-10 font-medium">
                      {course.description}
                    </p>
                    <div className="flex items-center justify-between pt-5 border-t border-slate-100">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-400 bg-slate-50 px-3 py-1.5 rounded-lg">
                        <Clock className="w-3.5 h-3.5" />
                        {course.target_date}
                      </div>
                      <span className={`text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-widest ${
                        course.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' :
                        course.status === 'In Progress' ? 'bg-amber-100 text-amber-700' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {course.status}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </main>


      {/* Modal Form */}
      <AnimatePresence>
        {isFormOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseForm}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden relative z-10"
            >
              <div className="p-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-slate-800">
                    {editingCourse ? 'Update Course' : 'Add New Course'}
                  </h2>
                  <button onClick={handleCloseForm} className="text-slate-400 hover:text-slate-600 transition-colors p-2">✕</button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Course Name</label>
                    <input 
                      required
                      type="text" 
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                      placeholder="e.g. Advanced JavaScript Patterns"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Description</label>
                    <textarea 
                      required
                      rows={3}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all resize-none"
                      placeholder="What do you want to learn?"
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1">Target Date</label>
                      <input 
                        required
                        type="date" 
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                        value={formData.target_date}
                        onChange={(e) => setFormData({...formData, target_date: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1">Status</label>
                      <select 
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                        value={formData.status}
                        onChange={(e) => setFormData({...formData, status: e.target.value})}
                      >
                        <option value="Not Started">Not Started</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </div>
                  </div>

                  {error && (
                    <div className="p-4 bg-red-50 text-red-700 rounded-xl flex items-center gap-3 text-sm animate-shake">
                      <AlertCircle className="w-5 h-5 flex-shrink-0" />
                      {error}
                    </div>
                  )}

                  <div className="pt-4 flex gap-3">
                    <button 
                      type="button"
                      onClick={handleCloseForm}
                      className="flex-1 px-4 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      className="flex-1 btn-success text-white px-4 py-3 rounded-xl font-bold transition-all shadow-lg shadow-amber-200 active:scale-95"
                    >
                      {editingCourse ? 'Save Changes' : 'Create Course'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center text-slate-400 text-sm">
        <p>&copy; 2026 CodeCraftHub Learning Platform</p>
        <p className="mt-1">Built for excellence by Brian McCarthy</p>
      </footer>
    </div>
  );
}
