import React, { useState } from 'react';
import ProductCard from './ProductCard';

const ProductList = ({ products, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');

  // BUG 2: Expensive computation directly in render
  const getFilteredProducts = () => {
    console.log('Running expensive logic...');
    
    // Simulating heavy processing (expensive nested loop)
    let tempResults = [...products];
    for (let i = 0; i < 600; i++) {
        tempResults = tempResults.map(p => ({...p}));
    }
    
    return tempResults
      .filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => {
        if (sortBy === 'price') return a.price - b.price;
        return a.name.localeCompare(b.name);
      });
  };

  const filtered = getFilteredProducts();

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 p-5 bg-white border border-slate-200 rounded-3xl shadow-sm items-end w-full">
        <div className="flex-grow space-y-1 relative z-10 w-full">
          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1 italic leading-none inline-block">Search Filter</label>
          <input
            type="text"
            className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-50 outline-none transition-all text-slate-700 font-semibold"
            placeholder="Search by name... (Slow Search)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="w-full md:w-64 space-y-1 relative z-10">
          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1 italic leading-none inline-block">Sort Order</label>
          <select 
            className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-50 outline-none transition-all text-slate-700 font-bold cursor-pointer"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="name">Name (A to Z)</option>
            <option value="price">Price (Low to High)</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filtered.map(product => (
          <ProductCard 
            key={product.id} 
            product={product} 
            onDelete={onDelete} 
            style={{ marginBottom: '0px' }} 
          />
        ))}
      </div>
    </div>
  );
};

export default ProductList;
