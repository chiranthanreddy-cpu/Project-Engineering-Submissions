import React from 'react';

const ProductCard = ({ product, onDelete, style }) => {
  // BUG 1: Log child render
  console.log(`Rendering ProductCard: ${product.name}`);

  return (
    <div 
      className="bg-white border border-slate-200 shadow-sm rounded-3xl overflow-hidden hover:shadow-md transition-all group"
      style={style}
    >
      <div className="relative aspect-square">
        <img 
          src={product.imageUrl} 
          alt={product.name} 
          className="w-full h-full object-cover" 
        />
        <button 
          onClick={() => onDelete(product.id)}
          className="absolute top-3 right-3 p-2 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-bold text-slate-800 line-clamp-1 truncate mr-2">{product.name}</h3>
          <span className="font-black text-indigo-600">${product.price}</span>
        </div>
        <p className="text-slate-400 text-xs line-clamp-2 leading-relaxed">
          {product.description}
        </p>
      </div>
    </div>
  );
};

export default ProductCard;
