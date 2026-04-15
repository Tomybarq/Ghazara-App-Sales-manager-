import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Plus, Trash2, Tag, Palette } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const COLOR_OPTIONS = ['#6B3FA0', '#F5922A', '#22C55E', '#3B82F6', '#EF4444', '#8B5CF6', '#F59E0B', '#06B6D4'];

export default function Settings() {
  const [newCatName, setNewCatName] = useState('');
  const [newCatColor, setNewCatColor] = useState(COLOR_OPTIONS[0]);
  const queryClient = useQueryClient();

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => base44.entities.RevenueCategory.list(),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.RevenueCategory.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['categories'] }); setNewCatName(''); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.RevenueCategory.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['categories'] }),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, is_active }) => base44.entities.RevenueCategory.update(id, { is_active }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['categories'] }),
  });

  const handleAddCategory = () => {
    if (!newCatName.trim()) return;
    createMutation.mutate({ name: newCatName, color: newCatColor, is_active: true });
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold">الإعدادات</h1>
        <p className="text-muted-foreground text-sm mt-1">إدارة فئات الإيرادات والتخصيصات</p>
      </div>

      {/* Revenue Categories */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Tag className="w-5 h-5 text-primary" /> فئات الإيرادات
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add New */}
          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <Label className="text-xs">اسم الفئة</Label>
              <Input value={newCatName} onChange={e => setNewCatName(e.target.value)} placeholder="مثال: منتجات إلكترونية" 
                onKeyDown={e => e.key === 'Enter' && handleAddCategory()} />
            </div>
            <div>
              <Label className="text-xs">اللون</Label>
              <div className="flex gap-1.5 mt-1">
                {COLOR_OPTIONS.map(c => (
                  <button key={c} onClick={() => setNewCatColor(c)}
                    className={`w-7 h-7 rounded-lg border-2 transition-all ${newCatColor === c ? 'border-foreground scale-110' : 'border-transparent'}`}
                    style={{ backgroundColor: c }} />
                ))}
              </div>
            </div>
            <Button onClick={handleAddCategory} disabled={!newCatName.trim()} className="gap-1">
              <Plus className="w-4 h-4" /> إضافة
            </Button>
          </div>

          {/* List */}
          <div className="space-y-2">
            {categories.map(cat => (
              <div key={cat.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: cat.color || '#6B3FA0' }} />
                  <span className="font-medium text-sm">{cat.name}</span>
                  {!cat.is_active && <Badge variant="secondary" className="text-xs">معطّل</Badge>}
                </div>
                <div className="flex items-center gap-3">
                  <Switch checked={cat.is_active !== false} onCheckedChange={v => toggleMutation.mutate({ id: cat.id, is_active: v })} />
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteMutation.mutate(cat.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
            {categories.length === 0 && (
              <p className="text-center text-muted-foreground py-6 text-sm">لا توجد فئات. أضف فئة جديدة أعلاه.</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* About */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Palette className="w-5 h-5 text-secondary" /> عن النظام
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p><strong className="text-foreground">النظام:</strong> نظام إدارة المبيعات — غزارة للتجارة والتسويق</p>
            <p><strong className="text-foreground">الإصدار:</strong> 1.0.0</p>
            <p><strong className="text-foreground">الوصف:</strong> نظام متكامل لإدارة فريق المبيعات وتتبع الأداء والإيرادات والأهداف</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}