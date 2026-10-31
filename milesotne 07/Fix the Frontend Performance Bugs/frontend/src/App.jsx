import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import ProductsPage from './pages/ProductsPage';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-50 flex flex-col">
        {/* Navigation */}
        <header className="sticky top-0 z-50 glass border-b border-slate-100 shadow-sm">
          <div className="container mx-auto px-6 py-4 flex justify-between items-center">
            <Link to="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-md">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <h1 className="text-xl font-bold tracking-tight text-slate-800">Perf<span className="text-indigo-600">Store</span></h1>
            </Link>
            
            <nav className="flex items-center space-x-2">
              <span className="px-4 py-2 text-sm font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 rounded-full">Inventory Dashboard</span>
            </nav>
          </div>
        </header>

        <main className="flex-1 container mx-auto px-6 py-12">
          <Routes>
            <Route path="/" element={<ProductsPage />} />
          </Routes>
        </main>

        <footer className="bg-white border-t border-slate-100 py-8 text-center text-slate-400 text-sm font-medium">
          <p>© 2026 PerfStore • Project Engineering Track Milestone 7</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;
