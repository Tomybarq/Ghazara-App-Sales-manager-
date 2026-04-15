import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

const SALE_STATUSES = ['مكتمل', 'معلق', 'ملغي'];

export default function SalesForm({ open, onClose, onSave, sale, employees, categories }) {
  const [form, setForm] = useState(sale || {
    employee_id: '', employee_name: '', category: '', client_name: '',
    amount: 0, date: new Date().toISOString().split('T')[0], status: 'مكتمل',
    commission_amount: 0, notes: '',
  });

  const handleEmployeeChange = (empId) => {
    const emp = employees.find(e => e.id === empId);
    const commissionAmount = emp ? (form.amount * (emp.commission_rate || 0)) / 100 : 0;
    setForm({ ...form, employee_id: empId, employee_name: emp?.name || '', commission_amount: commissionAmount });
  };

  const handleAmountChange = (amount) => {
    const emp = employees.find(e => e.id === form.employee_id);
    const commissionAmount = emp ? (amount * (emp.commission_rate || 0)) / 100 : 0;
    setForm({ ...form, amount, commission_amount: commissionAmount });
  };

  const handleSave = () => {
    onSave(form);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg" dir="rtl">
        <DialogHeader>
          <DialogTitle>{sale ? 'تعديل عملية البيع' : 'إضافة عملية بيع'}</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 py-4">
          <div className="col-span-2">
            <Label>الموظف *</Label>
            <Select value={form.employee_id} onValueChange={handleEmployeeChange}>
              <SelectTrigger><SelectValue placeholder="اختر الموظف" /></SelectTrigger>
              <SelectContent>
                {employees.map(e => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>العميل</Label>
            <Input value={form.client_name} onChange={e => setForm({...form, client_name: e.target.value})} placeholder="اسم العميل" />
          </div>
          <div>
            <Label>الفئة</Label>
            <Select value={form.category} onValueChange={v => setForm({...form, category: v})}>
              <SelectTrigger><SelectValue placeholder="اختر الفئة" /></SelectTrigger>
              <SelectContent>
                {categories.map(c => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>المبلغ (ر.س) *</Label>
            <Input type="number" value={form.amount} onChange={e => handleAmountChange(parseFloat(e.target.value) || 0)} dir="ltr" />
          </div>
          <div>
            <Label>التاريخ *</Label>
            <Input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} />
          </div>
          <div>
            <Label>الحالة</Label>
            <Select value={form.status} onValueChange={v => setForm({...form, status: v})}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{SALE_STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <Label>العمولة (محسوبة تلقائياً)</Label>
            <Input type="number" value={form.commission_amount} readOnly className="bg-muted" dir="ltr" />
          </div>
          <div className="col-span-2">
            <Label>ملاحظات</Label>
            <Textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} placeholder="أي ملاحظات إضافية..." rows={2} />
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>إلغاء</Button>
          <Button onClick={handleSave} disabled={!form.employee_id || !form.amount}>حفظ</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}