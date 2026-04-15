import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Users, ShoppingCart, Target, DollarSign } from 'lucide-react';
import StatCard from '../components/dashboard/StatCard';
import RevenueChart from '../components/dashboard/RevenueChart';
import TopPerformers from '../components/dashboard/TopPerformers';
import CategoryPieChart from '../components/dashboard/CategoryPieChart';

export default function Dashboard() {
  const { data: employees = [] } = useQuery({
    queryKey: ['employees'],
    queryFn: () => base44.entities.Employee.list(),
  });

  const { data: sales = [] } = useQuery({
    queryKey: ['sales'],
    queryFn: () => base44.entities.SalesRecord.list('-date', 500),
  });

  const { data: targets = [] } = useQuery({
    queryKey: ['targets'],
    queryFn: () => base44.entities.Target.list(),
  });

  const completedSales = sales.filter(s => s.status === 'مكتمل');
  const totalRevenue = completedSales.reduce((sum, s) => sum + (s.amount || 0), 0);
  const totalCommission = completedSales.reduce((sum, s) => sum + (s.commission_amount || 0), 0);
  const activeEmployees = employees.filter(e => e.status === 'نشط').length;
  
  const avgAchievement = targets.length > 0
    ? Math.round(targets.reduce((sum, t) => sum + (t.achievement_rate || 0), 0) / targets.length)
    : 0;

  // Monthly chart data
  const monthlyData = completedSales.reduce((acc, s) => {
    const month = s.date?.slice(0, 7) || 'غير محدد';
    acc[month] = (acc[month] || 0) + (s.amount || 0);
    return acc;
  }, {});

  const chartData = Object.entries(monthlyData)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6)
    .map(([name, amount]) => ({ name, amount }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">لوحة التحكم</h1>
        <p className="text-muted-foreground text-sm mt-1">مرحباً بك في نظام إدارة المبيعات — غزارة للتجارة والتسويق</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="إجمالي الإيرادات" value={`${totalRevenue.toLocaleString()} ر.س`} icon={DollarSign} color="primary" trend="up" trendValue="هذا الشهر" />
        <StatCard title="عدد المبيعات" value={completedSales.length} icon={ShoppingCart} color="secondary" />
        <StatCard title="الموظفون النشطون" value={activeEmployees} icon={Users} color="green" />
        <StatCard title="نسبة تحقيق الأهداف" value={`${avgAchievement}%`} icon={Target} color={avgAchievement >= 80 ? 'green' : 'red'} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RevenueChart data={chartData} />
        <CategoryPieChart sales={sales} />
      </div>

      {/* Top Performers */}
      <TopPerformers employees={employees} sales={sales} />
    </div>
  );
}