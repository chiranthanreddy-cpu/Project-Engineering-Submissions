import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ProductList from '../components/ProductList';

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // BUG 3: Double fetch on mount
  useEffect(() => {
    const fetchProducts = async () => {
      console.log('Fetching products from API...');
      setLoading(true);
      try {
        const response = await axios.get('http://localhost:5000/api/products');
        // BUG 4: Large object in state
        setProducts(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Fetch error:', err);
        setError('Failed to fetch products');
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleDelete = (id) => {
    // BUG 5: Unstable callback reference
    setProducts(products.filter(p => p.id !== id));
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Products Inventory</h2>
        <p className="text-slate-500 mt-1 font-medium">Manage and monitor your catalog performance (Total: {products.length} items)</p>
      </div>

      {loading && !products.length ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-600 rounded-full animate-spin"></div>
          <p className="text-slate-400 font-bold animate-pulse text-sm">LOADING CATALOG...</p>
        </div>
      ) : (
        <ProductList 
          products={products} 
          onDelete={handleDelete} 
        />
      )}

      {error && (
        <div className="bg-red-50 border-2 border-red-100 rounded-2xl p-6 text-center">
          <p className="text-red-700 font-bold mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-red-600 text-white font-bold rounded-lg"
          >
            Retry Request
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductsPage;
