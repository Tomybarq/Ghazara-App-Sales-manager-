import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { TrendingUp, Users, Target, BarChart3, ShieldCheck, ArrowLeft } from 'lucide-react';

const LOGO_URL = "https://media.base44.com/images/public/user_692882eb18328ed5665de090/f4bb25d3f_file_00000000379471f881bd181baeddbd2c.png";

const features = [
  { icon: TrendingUp, title: 'تتبع الإيرادات', desc: 'راقب أداء المبيعات والإيرادات لحظة بلحظة' },
  { icon: Users, title: 'إدارة الفريق', desc: 'تتبع أداء كل موظف وعمولاته بدقة' },
  { icon: Target, title: 'الأهداف والإنجازات', desc: 'ضع أهدافاً واضحة وتابع نسب التحقيق' },
  { icon: BarChart3, title: 'تقارير ذكية', desc: 'احصل على تقارير مفصلة بمساعدة الذكاء الاصطناعي' },
];

export default function Landing() {
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    base44.auth.isAuthenticated().then(authed => {
      if (authed) {
        window.location.href = '/dashboard';
      } else {
        setChecking(false);
      }
    });
  }, []);

  if (checking) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background font-arabic" dir="rtl">
      {/* Header */}
      <header className="fixed top-0 inset-x-0 z-50 bg-white/80 backdrop-blur-md border-b border-border/50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={LOGO_URL} alt="Ghazara" className="w-10 h-10 object-contain" />
            <div>
              <p className="font-bold text-foreground text-sm leading-tight">غزارة</p>
              <p className="text-xs text-muted-foreground leading-tight">للتجارة والتسويق</p>
            </div>
          </div>
          <Button onClick={() => base44.auth.redirectToLogin('/dashboard')} className="gap-2">
            تسجيل الدخول <ArrowLeft className="w-4 h-4" />
          </Button>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6 text-center relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 right-1/4 w-72 h-72 bg-primary/8 rounded-full blur-3xl" />
          <div className="absolute bottom-10 left-1/4 w-96 h-96 bg-secondary/8 rounded-full blur-3xl" />
        </div>

        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="max-w-3xl mx-auto">
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-bl from-primary/20 to-secondary/20 flex items-center justify-center shadow-xl shadow-primary/10">
                <img src={LOGO_URL} alt="Ghazara" className="w-16 h-16 object-contain" />
              </div>
            </div>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 leading-tight">
            غزارة للتجارة والتسويق
          </h1>
          <p className="text-xl text-primary font-semibold mb-3">نظام إدارة المبيعات</p>
          <p className="text-muted-foreground text-lg mb-10 max-w-xl mx-auto leading-relaxed">
            منصة متكاملة لمتابعة أداء فريق المبيعات، وتتبع الإيرادات، وتحقيق الأهداف بكفاءة عالية
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button size="lg" onClick={() => base44.auth.redirectToLogin('/dashboard')} className="text-base px-8 gap-2 shadow-lg shadow-primary/20">
              ابدأ الآن <ArrowLeft className="w-5 h-5" />
            </Button>
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="py-16 px-6 bg-muted/30">
        <div className="max-w-5xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="text-2xl font-bold text-center mb-10"
          >
            كل ما تحتاجه في مكان واحد
          </motion.h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * (i + 1) }}
                className="bg-card rounded-2xl p-5 border border-border/50 shadow-sm hover:shadow-md transition-shadow text-center"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <f.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-bold mb-1">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="max-w-xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-medium mb-6">
            <ShieldCheck className="w-4 h-4" /> للاستخدام الداخلي فقط
          </div>
          <h2 className="text-2xl font-bold mb-3">جاهز للبدء؟</h2>
          <p className="text-muted-foreground mb-8">سجّل دخولك باستخدام بريدك الإلكتروني المعتمد من شركة غزارة</p>
          <Button size="lg" onClick={() => base44.auth.redirectToLogin('/dashboard')} className="px-10 gap-2">
            تسجيل الدخول <ArrowLeft className="w-5 h-5" />
          </Button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} شركة غزارة للتجارة والتسويق — جميع الحقوق محفوظة
      </footer>
    </div>
  );
}