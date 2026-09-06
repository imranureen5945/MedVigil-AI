import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ErrorState({ message, onRetry }) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center p-8 text-center bg-red-50 rounded-card border border-red-100"
    >
      <AlertCircle size={40} className="text-red-500 mb-3" />
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Oops! Something went wrong</h3>
      <p className="text-sm text-gray-600 mb-6">{message || "We couldn't load the data. Please try again."}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-btn hover:bg-gray-50 text-sm font-medium transition-colors shadow-subtle"
        >
          <RefreshCw size={16} />
          Retry
        </button>
      )}
    </motion.div>
  );
}
