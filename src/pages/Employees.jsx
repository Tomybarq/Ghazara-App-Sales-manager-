import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Plus, Search, Pencil, Trash2, Phone, Mail } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import EmployeeForm from '../components/employees/EmployeeForm';
import { motion, AnimatePresence } from 'framer-motion';

export default function Employees() {
  const [showForm, setShowForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [search, setSearch] = useState('');
  const queryClient = useQueryClient();

  const { data: employees = [], isLoading } = useQuery({
    queryKey: ['employees'],
    queryFn: () => base44.entities.Employee.list(),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Employee.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['employees'] }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Employee.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['employees'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Employee.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['employees'] }),
  });

  const handleSave = (data) => {
    if (editingEmployee) {
      updateMutation.mutate({ id: editingEmployee.id, data });
    } else {
      createMutation.mutate(data);
    }
    setEditingEmployee(null);
  };

  const filtered = employees.filter(e => 
    e.name?.includes(search) || e.position?.includes(search) || e.department?.includes(search)
  );

  const statusColor = {
    'نشط': 'bg-green-100 text-green-700 border-green-200',
    'غير نشط': 'bg-red-100 text-red-700 border-red-200',
    'إجازة': 'bg-yellow-100 text-yellow-700 border-yellow-200',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">الموظفون</h1>
          <p className="text-muted-foreground text-sm mt-1">إدارة فريق المبيعات</p>
        </div>
        <Button onClick={() => { setEditingEmployee(null); setShowForm(true); }} className="gap-2">
          <Plus className="w-4 h-4" /> إضافة موظف
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="بحث بالاسم أو المسمى..." value={search} onChange={e => setSearch(e.target.value)} className="pr-10" />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <AnimatePresence>
            {filtered.map(emp => (
              <motion.div key={emp.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}>
                <Card className="p-5 hover:shadow-md transition-shadow border-border/50">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-bold text-lg">{emp.name}</h3>
                      <p className="text-sm text-muted-foreground">{emp.position}</p>
                    </div>
                    <Badge className={`text-xs border ${statusColor[emp.status] || 'bg-muted text-muted-foreground'}`}>
                      {emp.status}
                    </Badge>
                  </div>
                  
                  {emp.department && <p className="text-xs text-muted-foreground mb-2">القسم: {emp.department}</p>}
                  
                  <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                    {emp.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{emp.phone}</span>}
                    {emp.email && <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{emp.email}</span>}
                  </div>
                  
                  <div className="text-xs text-muted-foreground mb-4">
                    العمولة: <span className="font-semibold text-foreground">{emp.commission_rate || 0}%</span>
                  </div>

                  <div className="flex gap-2 border-t pt-3">
                    <Button variant="outline" size="sm" className="flex-1 gap-1" onClick={() => { setEditingEmployee(emp); setShowForm(true); }}>
                      <Pencil className="w-3 h-3" /> تعديل
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm" className="text-destructive hover:text-destructive gap-1">
                          <Trash2 className="w-3 h-3" /> حذف
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent dir="rtl">
                        <AlertDialogHeader>
                          <AlertDialogTitle>حذف الموظف</AlertDialogTitle>
                          <AlertDialogDescription>هل أنت متأكد من حذف "{emp.name}"؟ لا يمكن التراجع عن هذا الإجراء.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter className="gap-2">
                          <AlertDialogCancel>إلغاء</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deleteMutation.mutate(emp.id)} className="bg-destructive text-destructive-foreground">حذف</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {filtered.length === 0 && !isLoading && (
        <p className="text-center text-muted-foreground py-12">لا يوجد موظفون حالياً. أضف أول موظف!</p>
      )}

      <EmployeeForm
        open={showForm}
        onClose={() => { setShowForm(false); setEditingEmployee(null); }}
        onSave={handleSave}
        employee={editingEmployee}
      />
    </div>
  );
}