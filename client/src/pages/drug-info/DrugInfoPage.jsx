import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Pill, ShieldCheck, AlertOctagon, Filter, Sparkles, RefreshCw } from 'lucide-react';
import MedicineCard from './components/MedicineCard';
import { medicineService } from '../../services/medicineService';
import EmptyState from '../../components/shared/EmptyState';
import LoadingState from '../../components/shared/LoadingState';
import ErrorState from '../../components/shared/ErrorState';

export default function DrugInfoPage() {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const categories = ['All', 'Analgesic', 'Antibiotic', 'Antacid', 'NSAID', 'Cardiovascular', 'Diabetes', 'Respiratory'];

  const performSearch = async (searchQuery) => {
    setLoading(true);
    setError(null);
    try {
      if (searchQuery.trim().length > 0) {
        const data = await medicineService.searchMedicines(searchQuery);
        setResults(data || []);
      } else {
        const all = await medicineService.getAllMedicines();
        setResults(all || []);
      }
    } catch (err) {
      setError('Unable to fetch medicine records from DRAP service right now.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch(query);
    }, 250);
    return () => clearTimeout(timer);
  }, [query]);

  const filteredResults = results.filter(med => {
    if (selectedCategory === 'All') return true;
    return med.category?.toLowerCase() === selectedCategory.toLowerCase();
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-teal-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-lg border border-teal-500/20">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-teal-500/20 text-teal-300 border border-teal-400/30">
              <ShieldCheck className="w-4 h-4" />
              <span>Official DRAP National Registry</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Pakistan Medicine Safety & Drug Directory
            </h1>
            <p className="text-sm text-slate-300">
              Search all 265 registered pharmaceutical therapeutic goods. Cross-check official active ingredients, recall statuses, dosages, and contraindications.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/15 text-xs text-teal-100 flex items-center gap-3">
            <RefreshCw className="w-4 h-4 text-teal-300 animate-spin-slow" />
            <div>
              <span className="font-bold block">Live DRAP Sync</span>
              <span>Updated August 2026</span>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Category Filter Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl shadow-sm border border-slate-100 space-y-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input 
            type="text" 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by brand name (e.g. Panadol, Risek, Augmentin) or generic (e.g. Paracetamol, Omeprazole)..."
            className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-sm sm:text-base focus:bg-white focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition"
          />
          {query && (
            <button 
              onClick={() => setQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-700 bg-slate-200 px-2 py-0.5 rounded-full"
            >
              Clear
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs no-scrollbar">
          <span className="text-slate-400 font-semibold flex items-center gap-1 pl-1 pr-2 flex-shrink-0">
            <Filter className="w-3.5 h-3.5" /> Category:
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl font-bold transition whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-teal-700 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Results View */}
      {loading ? (
        <LoadingState count={6} />
      ) : error ? (
        <ErrorState message={error} onRetry={() => performSearch(query)} />
      ) : filteredResults.length > 0 ? (
        <div>
          <div className="flex items-center justify-between mb-4 px-1">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Showing {filteredResults.length} DRAP Registered Products
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredResults.map(med => (
              <MedicineCard key={med.id} medicine={med} />
            ))}
          </div>
        </div>
      ) : (
        <EmptyState
          icon={Pill}
          title="No Medicines Found"
          description={`No registered medicine matches "${query}" in category "${selectedCategory}". Try searching by generic name like Paracetamol or Ibuprofen.`}
          actionLabel="Reset Search"
          onAction={() => { setQuery(''); setSelectedCategory('All'); }}
        />
      )}
    </div>
  );
}
