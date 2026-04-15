import React from 'react';
import { motion } from 'framer-motion';

export default function StatCard({ title, value, icon: Icon, trend, trendValue, color = 'primary' }) {
  const colorMap = {
    primary: 'from-primary/10 to-primary/5 text-primary',
    secondary: 'from-secondary/10 to-secondary/5 text-secondary',
    green: 'from-green-500/10 to-green-500/5 text-green-600',
    red: 'from-red-500/10 to-red-500/5 text-red-600',
  };

  const iconBgMap = {
    primary: 'bg-primary/15 text-primary',
    secondary: 'bg-secondary/15 text-secondary',
    green: 'bg-green-500/15 text-green-600',
    red: 'bg-red-500/15 text-red-600',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-gradient-to-bl ${colorMap[color]} rounded-2xl p-5 border border-border/50 shadow-sm hover:shadow-md transition-shadow`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground font-medium">{title}</p>
          <h3 className="text-2xl font-bold mt-1 text-foreground">{value}</h3>
          {trendValue && (
            <p className={`text-xs mt-2 font-medium ${trend === 'up' ? 'text-green-600' : 'text-red-500'}`}>
              {trend === 'up' ? '▲' : '▼'} {trendValue}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-xl ${iconBgMap[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </motion.div>
  );
}