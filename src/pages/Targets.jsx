import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Plus, Target as TargetIcon, Trash2 } from 'lucide-react';

export default function Targets() {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ employee_id: '', employee_name: '', month: '', target_amount: 0, period: 'شهري' });
  const queryClient = useQueryClient();

  const { data: targets = [] } = useQuery({
    queryKey: ['targets'],
    queryFn: () => base44.entities.Target.list('-month', 100),
  });

  const { data: employees = [] } = useQuery({
    queryKey: ['employees'],
    queryFn: () => base44.entities.Employee.list(),
  });

  const { data: sales = [] } = useQuery({
    queryKey: ['sales'],
    queryFn: () => base44.entities.SalesRecord.list('-date', 500),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Target.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['targets'] }); setShowForm(false); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Target.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['targets'] }),
  });

  const handleEmployeeChange = (empId) => {
    const emp = employees.find(e => e.id === empId);
    setForm({ ...form, employee_id: empId, employee_name: emp?.name || '' });
  };

  const handleCreate = () => {
    // Calculate achieved
    const empSales = sales.filter(s => s.employee_id === form.employee_id && s.status === 'مكتمل' && s.date?.startsWith(form.month));
    const achieved = empSales.reduce((sum, s) => sum + (s.amount || 0), 0);
    const rate = form.target_amount > 0 ? Math.round((achieved / form.target_amount) * 100) : 0;
    createMutation.mutate({ ...form, achieved_amount: achieved, achievement_rate: rate });
  };

  // Enrich targets with latest achieved data
  const enrichedTargets = targets.map(t => {
    const empSales = sales.filter(s => s.employee_id === t.employee_id && s.status === 'مكتمل' && s.date?.startsWith(t.month));
    const achieved = empSales.reduce((sum, s) => sum + (s.amount || 0), 0);
    const rate = t.target_amount > 0 ? Math.round((achieved / t.target_amount) * 100) : 0;
    return { ...t, achieved_amount: achieved, achievement_rate: rate };
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">الأهداف</h1>
          <p className="text-muted-foreground text-sm mt-1">تتبع الأهداف ونسب التحقيق</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="gap-2">
          <Plus className="w-4 h-4" /> إضافة هدف
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {enrichedTargets.map(t => (
          <Card key={t.id} className="border-border/50 hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <TargetIcon className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{t.employee_name}</CardTitle>
                    <p className="text-xs text-muted-foreground">{t.month} • {t.period}</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => deleteMutation.mutate(t.id)}>
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">المحقق: {t.achieved_amount?.toLocaleString()} ر.س</span>
                <span className="font-semibold">المستهدف: {t.target_amount?.toLocaleString()} ر.س</span>
              </div>
              <Progress value={Math.min(t.achievement_rate, 100)} className="h-2.5" />
              <div className="flex items-center justify-between mt-2">
                <Badge className={`text-xs ${t.achievement_rate >= 100 ? 'bg-green-100 text-green-700' : t.achievement_rate >= 70 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                  {t.achievement_rate}%
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {enrichedTargets.length === 0 && (
        <p className="text-center text-muted-foreground py-12">لا توجد أهداف. أضف أول هدف لفريق المبيعات!</p>
      )}

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-md" dir="rtl">
          <DialogHeader><DialogTitle>إضافة هدف جديد</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>الموظف</Label>
              <Select value={form.employee_id} onValueChange={handleEmployeeChange}>
                <SelectTrigger><SelectValue placeholder="اختر الموظف" /></SelectTrigger>
                <SelectContent>{employees.map(e => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>الشهر</Label>
              <Input type="month" value={form.month} onChange={e => setForm({...form, month: e.target.value})} />
            </div>
            <div>
              <Label>المبلغ المستهدف (ر.س)</Label>
              <Input type="number" value={form.target_amount} onChange={e => setForm({...form, target_amount: parseFloat(e.target.value) || 0})} dir="ltr" />
            </div>
            <div>
              <Label>الفترة</Label>
              <Select value={form.period} onValueChange={v => setForm({...form, period: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="شهري">شهري</SelectItem>
                  <SelectItem value="ربع سنوي">ربع سنوي</SelectItem>
                  <SelectItem value="سنوي">سنوي</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowForm(false)}>إلغاء</Button>
            <Button onClick={handleCreate} disabled={!form.employee_id || !form.target_amount}>حفظ</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}