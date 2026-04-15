import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy } from 'lucide-react';

export default function TopPerformers({ employees, sales }) {
  const performerData = employees.map(emp => {
    const empSales = sales.filter(s => s.employee_id === emp.id && s.status === 'مكتمل');
    const total = empSales.reduce((sum, s) => sum + (s.amount || 0), 0);
    return { ...emp, totalSales: total, count: empSales.length };
  }).sort((a, b) => b.totalSales - a.totalSales).slice(0, 5);

  const medals = ['🥇', '🥈', '🥉'];

  return (
    <Card className="shadow-sm border-border/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-bold flex items-center gap-2">
          <Trophy className="w-5 h-5 text-secondary" />
          أفضل الموظفين أداءً
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {performerData.map((p, i) => (
            <div key={p.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
              <div className="flex items-center gap-3">
                <span className="text-lg">{medals[i] || `${i + 1}`}</span>
                <div>
                  <p className="font-semibold text-sm">{p.name}</p>
                  <p className="text-xs text-muted-foreground">{p.position}</p>
                </div>
              </div>
              <div className="text-left">
                <p className="font-bold text-sm">{p.totalSales.toLocaleString()} ر.س</p>
                <Badge variant="secondary" className="text-xs">{p.count} عملية</Badge>
              </div>
            </div>
          ))}
          {performerData.length === 0 && (
            <p className="text-center text-muted-foreground py-8 text-sm">لا توجد بيانات بعد</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}