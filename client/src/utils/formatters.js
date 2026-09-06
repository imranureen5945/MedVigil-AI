export const formatters = {
  formatDate: (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return dateStr;
    }
  },

  formatScore: (score) => {
    const num = Math.round(Number(score) || 0);
    return Math.max(0, Math.min(100, num));
  },

  truncate: (text, max = 60) => {
    if (!text) return '';
    return text.length > max ? text.substring(0, max) + '...' : text;
  }
};
