import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Film, Activity, Award, ChevronLeft, ChevronRight, Heart, Loader2, Play } from 'lucide-react';
import axios from 'axios';

const App = () => {
  const [view, setView] = useState('paginated'); // 'paginated', 'unpaginated', or 'favorites'
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ total: 0, time: 0 });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [favoriting, setFavoriting] = useState(null);

  const fetchQuotes = async (method = view, p = page) => {
    setLoading(true);
    const start = performance.now();
    try {
      const url = method === 'paginated' 
        ? `/api/quotes?page=${p}&limit=12` 
        : method === 'favorites' 
        ? `/api/favorites`
        : `/api/quotes/unpaginated`;

      const res = await axios.get(url);
      const end = performance.now();

      if (method === 'paginated') {
        setQuotes(res.data.data);
        setTotalPages(res.data.totalPages);
        setStats({ total: res.data.total, time: Math.round(end - start) });
      } else if (method === 'favorites') {
        setQuotes(res.data.map(f => ({ ...f.quote, id: f.quoteId, date: f.timestamp })));
        setStats({ total: res.data.length, time: Math.round(end - start) });
      } else {
        setQuotes(res.data);
        setStats({ total: res.data.length, time: Math.round(end - start) });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotes();
  }, [view, page]);

  const toggleView = (newView) => {
    setView(newView);
    setPage(1);
  };

  const addFavorite = async (id) => {
    setFavoriting(id);
    const start = performance.now();
    try {
      await axios.post('/api/favorites', { quoteId: id });
      const end = performance.now();
      setStats(prev => ({ ...prev, time: Math.round(end - start) }));
    } catch (err) {
      console.error(err);
    } finally {
      setFavoriting(null);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-glow-gradient">
      {/* Header */}
      <nav className="sticky top-0 z-50 py-4 border-b border-white/10 backdrop-blur-md">
        <div className="container mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Film className="w-8 h-8 text-accent" />
            <h1 className="text-2xl font-extrabold tracking-tighter">
              QUOTE<span className="text-accent underline decoration-accent/30">VAULT</span>
            </h1>
          </div>
          <div className="flex bg-white/5 p-1 rounded-xl gap-1">
            <button
              onClick={() => toggleView('paginated')}
              className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${view === 'paginated' ? 'bg-accent text-dark shadow-lg' : 'text-gray-400 hover:text-white'}`}
            >
              Paginated Mode
            </button>
            <button 
              onClick={() => toggleView('unpaginated')} 
              className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${view === 'unpaginated' ? 'bg-danger text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
            >
              Bulk Load (Slow)
            </button>
            <button 
              onClick={() => toggleView('favorites')} 
              className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${view === 'favorites' ? 'bg-blue-500 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
            >
              My Favorites
            </button>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-6 py-8">
        {/* Stats Section */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="glass-card flex items-center justify-between"
          >
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-widest font-bold">Total Assets</p>
              <h3 className="text-3xl font-extrabold">{stats.total.toLocaleString()}</h3>
            </div>
            <Award className="w-10 h-10 text-accent opacity-20" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="glass-card flex items-center justify-between"
          >
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-widest font-bold">Server Latency</p>
              <h3 className={`text-3xl font-extrabold transition-colors ${stats.time > 100 ? 'text-danger' : 'text-green-400'}`}>
                {stats.time}ms
              </h3>
            </div>
            <Activity className="w-10 h-10 text-accent opacity-20" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="glass-card flex items-center justify-between"
          >
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-widest font-bold">API Status</p>
              <h3 className="text-3xl font-extrabold flex items-center gap-2">
                Operational <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
              </h3>
            </div>
            <Play className="w-10 h-10 text-accent opacity-20" />
          </motion.div>
        </section>

        {/* Content Section */}
        <div className="relative min-h-[400px]">
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                key="loader"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center flex-col gap-4 text-gray-400"
              >
                <Loader2 className="w-12 h-12 animate-spin text-accent" />
                <p className="text-sm font-bold animate-pulse">Scanning the archives... This might take a while.</p>
              </motion.div>
            ) : (
              <motion.div
                key="grid"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              >
                {quotes.map((q, idx) => (
                  <motion.div
                    key={q.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: Math.min(idx * 0.01, 1.) }}
                    className="quote-card"
                  >
                    <p className="text-lg font-medium italic mb-6 leading-relaxed">"{q.quote}"</p>
                    <div className="pt-4 border-t border-white/10">
                      <h4 className="font-bold text-accent">{q.movie}</h4>
                      <p className="text-sm text-gray-400">{q.character} · {q.year}</p>
                      <button
                        onClick={() => addFavorite(q.id)}
                        disabled={favoriting === q.id}
                        className="mt-4 w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-white/5 hover:bg-accent/10 hover:border-accent border border-transparent transition-all active:scale-95"
                      >
                        {favoriting === q.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Heart className="w-4 h-4" />
                        )}
                        Favorite
                      </button>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Pagination Section */}
        {view === 'paginated' && !loading && (
          <div className="flex justify-center items-center gap-6 mt-12 mb-12">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-3 rounded-full bg-white/5 disabled:opacity-20 hover:bg-accent hover:text-dark transition-all"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <span className="font-bold text-lg">Page {page} of {totalPages}</span>
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={page >= totalPages}
              className="p-3 rounded-full bg-white/5 disabled:opacity-20 hover:bg-accent hover:text-dark transition-all"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        )}
      </main>

      {/* Background Decor */}
      <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[100px] -z-10 translate-x-1/2 -translate-y-1/2" />
      <div className="fixed bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[100px] -z-10 -translate-x-1/2 translate-y-1/2" />
    </div>
  );
};

export default App;
