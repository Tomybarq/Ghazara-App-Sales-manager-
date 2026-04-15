import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

const POSITIONS = ['مندوب مبيعات', 'مشرف مبيعات', 'مدير فريق', 'مدير منطقة'];
const STATUSES = ['نشط', 'غير نشط', 'إجازة'];

export default function EmployeeForm({ open, onClose, onSave, employee }) {
  const [form, setForm] = useState(employee || {
    name: '', phone: '', email: '', position: 'مندوب مبيعات',
    department: '', hire_date: '', status: 'نشط', commission_rate: 5,
  });

  const handleSave = () => {
    onSave(form);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg" dir="rtl">
        <DialogHeader>
          <DialogTitle>{employee ? 'تعديل الموظف' : 'إضافة موظف جديد'}</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 py-4">
          <div className="col-span-2">
            <Label>الاسم الكامل *</Label>
            <Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="أدخل اسم الموظف" />
          </div>
          <div>
            <Label>الجوال</Label>
            <Input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="05xxxxxxxx" dir="ltr" />
          </div>
          <div>
            <Label>البريد الإلكتروني</Label>
            <Input value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="email@example.com" dir="ltr" />
          </div>
          <div>
            <Label>المسمى الوظيفي *</Label>
            <Select value={form.position} onValueChange={v => setForm({...form, position: v})}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{POSITIONS.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <Label>القسم</Label>
            <Input value={form.department} onChange={e => setForm({...form, department: e.target.value})} placeholder="القسم" />
          </div>
          <div>
            <Label>تاريخ التعيين</Label>
            <Input type="date" value={form.hire_date} onChange={e => setForm({...form, hire_date: e.target.value})} />
          </div>
          <div>
            <Label>الحالة</Label>
            <Select value={form.status} onValueChange={v => setForm({...form, status: v})}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="col-span-2">
            <Label>نسبة العمولة (%)</Label>
            <Input type="number" value={form.commission_rate} onChange={e => setForm({...form, commission_rate: parseFloat(e.target.value) || 0})} />
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>إلغاء</Button>
          <Button onClick={handleSave} disabled={!form.name}>حفظ</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}