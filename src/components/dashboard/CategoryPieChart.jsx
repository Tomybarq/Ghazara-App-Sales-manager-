import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const COLORS = ['hsl(267,42%,44%)', 'hsl(30,90%,56%)', 'hsl(267,42%,60%)', 'hsl(30,90%,70%)', 'hsl(200,60%,50%)', 'hsl(150,50%,45%)'];

export default function CategoryPieChart({ sales }) {
  const categoryData = sales
    .filter(s => s.status === 'مكتمل')
    .reduce((acc, s) => {
      const cat = s.category || 'أخرى';
      acc[cat] = (acc[cat] || 0) + (s.amount || 0);
      return acc;
    }, {});

  const data = Object.entries(categoryData).map(([name, value]) => ({ name, value }));

  if (data.length === 0) {
    return (
      <Card className="shadow-sm border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-bold">توزيع الإيرادات حسب الفئة</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-12 text-sm">لا توجد بيانات</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm border-border/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-bold">توزيع الإيرادات حسب الفئة</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3} dataKey="value">
                {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip 
                formatter={(value) => `${value.toLocaleString()} ر.س`}
                contentStyle={{ borderRadius: '12px', border: '1px solid hsl(var(--border))', direction: 'rtl', fontFamily: 'var(--font-arabic)' }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}