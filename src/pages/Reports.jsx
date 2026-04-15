import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { FileText, Download, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';

export default function Reports() {
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [employeeFilter, setEmployeeFilter] = useState('all');

  const { data: sales = [] } = useQuery({ queryKey: ['sales'], queryFn: () => base44.entities.SalesRecord.list('-date', 1000) });
  const { data: employees = [] } = useQuery({ queryKey: ['employees'], queryFn: () => base44.entities.Employee.list() });
  const { data: targets = [] } = useQuery({ queryKey: ['targets'], queryFn: () => base44.entities.Target.list() });

  const filteredSales = useMemo(() => {
    return sales.filter(s => {
      const matchDate = (!dateFrom || s.date >= dateFrom) && (!dateTo || s.date <= dateTo);
      const matchEmp = employeeFilter === 'all' || s.employee_id === employeeFilter;
      return matchDate && matchEmp && s.status === 'مكتمل';
    });
  }, [sales, dateFrom, dateTo, employeeFilter]);

  const totalRevenue = filteredSales.reduce((sum, s) => sum + (s.amount || 0), 0);
  const totalCommission = filteredSales.reduce((sum, s) => sum + (s.commission_amount || 0), 0);

  // Employee performance summary
  const empSummary = useMemo(() => {
    return employees.map(emp => {
      const empSales = filteredSales.filter(s => s.employee_id === emp.id);
      const total = empSales.reduce((sum, s) => sum + (s.amount || 0), 0);
      const commission = empSales.reduce((sum, s) => sum + (s.commission_amount || 0), 0);
      const empTargets = targets.filter(t => t.employee_id === emp.id);
      const targetTotal = empTargets.reduce((sum, t) => sum + (t.target_amount || 0), 0);
      const achievementRate = targetTotal > 0 ? Math.round((total / targetTotal) * 100) : 0;
      return { name: emp.name, position: emp.position, sales: total, count: empSales.length, commission, achievementRate };
    }).filter(e => e.count > 0).sort((a, b) => b.sales - a.sales);
  }, [employees, filteredSales, targets]);

  // Monthly trend
  const monthlyTrend = useMemo(() => {
    const grouped = {};
    filteredSales.forEach(s => {
      const month = s.date?.slice(0, 7);
      if (month) grouped[month] = (grouped[month] || 0) + (s.amount || 0);
    });
    return Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b)).map(([name, amount]) => ({ name, amount }));
  }, [filteredSales]);

  const handleExportCSV = () => {
    const headers = 'الموظف,العميل,الفئة,المبلغ,العمولة,التاريخ,الحالة\n';
    const rows = filteredSales.map(s => `${s.employee_name},${s.client_name || ''},${s.category || ''},${s.amount},${s.commission_amount || 0},${s.date},${s.status}`).join('\n');
    const bom = '\uFEFF';
    const blob = new Blob([bom + headers + rows], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `تقرير_المبيعات_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">التقارير</h1>
          <p className="text-muted-foreground text-sm mt-1">تقارير الأداء والإيرادات</p>
        </div>
        <Button onClick={handleExportCSV} variant="outline" className="gap-2">
          <Download className="w-4 h-4" /> تصدير CSV
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4 border-border/50">
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <Label className="text-xs">من تاريخ</Label>
            <Input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="w-40" />
          </div>
          <div>
            <Label className="text-xs">إلى تاريخ</Label>
            <Input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="w-40" />
          </div>
          <div>
            <Label className="text-xs">الموظف</Label>
            <Select value={employeeFilter} onValueChange={setEmployeeFilter}>
              <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الموظفين</SelectItem>
                {employees.map(e => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-5 border-border/50">
          <p className="text-sm text-muted-foreground">إجمالي الإيرادات</p>
          <h3 className="text-2xl font-bold mt-1">{totalRevenue.toLocaleString()} ر.س</h3>
        </Card>
        <Card className="p-5 border-border/50">
          <p className="text-sm text-muted-foreground">إجمالي العمولات</p>
          <h3 className="text-2xl font-bold mt-1">{totalCommission.toLocaleString()} ر.س</h3>
        </Card>
        <Card className="p-5 border-border/50">
          <p className="text-sm text-muted-foreground">عدد العمليات</p>
          <h3 className="text-2xl font-bold mt-1">{filteredSales.length}</h3>
        </Card>
      </div>

      {/* Monthly Trend */}
      {monthlyTrend.length > 0 && (
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" /> اتجاه الإيرادات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid hsl(var(--border))', direction: 'rtl', fontFamily: 'var(--font-arabic)' }} />
                  <Line type="monotone" dataKey="amount" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={{ fill: 'hsl(var(--primary))', r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Employee Performance Table */}
      <Card className="overflow-hidden border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="w-5 h-5 text-secondary" /> أداء الموظفين
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="text-right">الموظف</TableHead>
                <TableHead className="text-right">المسمى</TableHead>
                <TableHead className="text-right">عدد المبيعات</TableHead>
                <TableHead className="text-right">إجمالي المبيعات</TableHead>
                <TableHead className="text-right">العمولة</TableHead>
                <TableHead className="text-right">نسبة التحقيق</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {empSummary.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">لا توجد بيانات في الفترة المحددة</TableCell></TableRow>
              ) : empSummary.map((e, i) => (
                <TableRow key={i}>
                  <TableCell className="font-semibold">{e.name}</TableCell>
                  <TableCell className="text-muted-foreground">{e.position}</TableCell>
                  <TableCell>{e.count}</TableCell>
                  <TableCell className="font-semibold">{e.sales.toLocaleString()} ر.س</TableCell>
                  <TableCell>{e.commission.toLocaleString()} ر.س</TableCell>
                  <TableCell>
                    <span className={`font-bold ${e.achievementRate >= 100 ? 'text-green-600' : e.achievementRate >= 70 ? 'text-yellow-600' : 'text-red-500'}`}>
                      {e.achievementRate}%
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}