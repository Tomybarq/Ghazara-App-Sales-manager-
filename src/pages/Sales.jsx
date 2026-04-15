import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card } from '@/components/ui/card';
import { Plus, Search, Pencil, Trash2 } from 'lucide-react';
import SalesForm from '../components/sales/SalesForm';
import { format } from 'date-fns';

export default function Sales() {
  const [showForm, setShowForm] = useState(false);
  const [editingSale, setEditingSale] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const queryClient = useQueryClient();

  const { data: sales = [], isLoading } = useQuery({
    queryKey: ['sales'],
    queryFn: () => base44.entities.SalesRecord.list('-date', 500),
  });

  const { data: employees = [] } = useQuery({
    queryKey: ['employees'],
    queryFn: () => base44.entities.Employee.list(),
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => base44.entities.RevenueCategory.list(),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.SalesRecord.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sales'] }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.SalesRecord.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sales'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.SalesRecord.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sales'] }),
  });

  const handleSave = (data) => {
    if (editingSale) {
      updateMutation.mutate({ id: editingSale.id, data });
    } else {
      createMutation.mutate(data);
    }
    setEditingSale(null);
  };

  const filtered = sales.filter(s => {
    const matchSearch = !search || s.employee_name?.includes(search) || s.client_name?.includes(search);
    const matchStatus = statusFilter === 'all' || s.status === statusFilter;
    const matchCategory = categoryFilter === 'all' || s.category === categoryFilter;
    return matchSearch && matchStatus && matchCategory;
  });

  const totalAmount = filtered.filter(s => s.status === 'مكتمل').reduce((sum, s) => sum + (s.amount || 0), 0);

  const statusColor = {
    'مكتمل': 'bg-green-100 text-green-700',
    'معلق': 'bg-yellow-100 text-yellow-700',
    'ملغي': 'bg-red-100 text-red-700',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">المبيعات</h1>
          <p className="text-muted-foreground text-sm mt-1">سجل جميع عمليات البيع</p>
        </div>
        <Button onClick={() => { setEditingSale(null); setShowForm(true); }} className="gap-2">
          <Plus className="w-4 h-4" /> إضافة عملية بيع
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="بحث..." value={search} onChange={e => setSearch(e.target.value)} className="pr-10" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-36"><SelectValue placeholder="الحالة" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">جميع الحالات</SelectItem>
            <SelectItem value="مكتمل">مكتمل</SelectItem>
            <SelectItem value="معلق">معلق</SelectItem>
            <SelectItem value="ملغي">ملغي</SelectItem>
          </SelectContent>
        </Select>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-36"><SelectValue placeholder="الفئة" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">جميع الفئات</SelectItem>
            {categories.map(c => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <div className="mr-auto bg-primary/10 text-primary px-4 py-2 rounded-xl font-bold text-sm">
          الإجمالي: {totalAmount.toLocaleString()} ر.س
        </div>
      </div>

      {/* Table */}
      <Card className="overflow-hidden border-border/50">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="text-right">الموظف</TableHead>
              <TableHead className="text-right">العميل</TableHead>
              <TableHead className="text-right">الفئة</TableHead>
              <TableHead className="text-right">المبلغ</TableHead>
              <TableHead className="text-right">العمولة</TableHead>
              <TableHead className="text-right">التاريخ</TableHead>
              <TableHead className="text-right">الحالة</TableHead>
              <TableHead className="text-right">إجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={8} className="text-center py-12">جاري التحميل...</TableCell></TableRow>
            ) : filtered.length === 0 ? (
              <TableRow><TableCell colSpan={8} className="text-center py-12 text-muted-foreground">لا توجد عمليات بيع</TableCell></TableRow>
            ) : filtered.map(sale => (
              <TableRow key={sale.id} className="hover:bg-muted/30">
                <TableCell className="font-medium">{sale.employee_name}</TableCell>
                <TableCell>{sale.client_name || '-'}</TableCell>
                <TableCell>{sale.category || '-'}</TableCell>
                <TableCell className="font-semibold">{sale.amount?.toLocaleString()} ر.س</TableCell>
                <TableCell>{sale.commission_amount?.toLocaleString()} ر.س</TableCell>
                <TableCell>{sale.date ? format(new Date(sale.date), 'yyyy/MM/dd') : '-'}</TableCell>
                <TableCell>
                  <Badge className={`text-xs ${statusColor[sale.status] || 'bg-muted'}`}>{sale.status}</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditingSale(sale); setShowForm(true); }}>
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteMutation.mutate(sale.id)}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <SalesForm
        open={showForm}
        onClose={() => { setShowForm(false); setEditingSale(null); }}
        onSave={handleSave}
        sale={editingSale}
        employees={employees}
        categories={categories}
      />
    </div>
  );
}