import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Send, Bot, Plus, MessageSquare, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const SUGGESTED_PROMPTS = [
  'من هو أفضل موظف مبيعات هذا الشهر؟',
  'ما هي إجمالي الإيرادات حسب كل فئة؟',
  'قارن أداء الموظفين في آخر 3 أشهر',
  'ما هي نسبة تحقيق الأهداف لكل موظف؟',
  'أعطني ملخصاً شاملاً لأداء المبيعات',
  'ما هي العمولات الإجمالية المدفوعة؟',
];

function MessageBubble({ message }) {
  const isUser = message.role === 'user';
  return (
    <div className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0 mt-0.5">
          <Bot className="w-4 h-4 text-white" />
        </div>
      )}
      <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${isUser ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'}`}>
        {isUser ? (
          <p>{message.content}</p>
        ) : (
          <ReactMarkdown
            className="prose prose-sm max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
            components={{
              p: ({ children }) => <p className="my-1 leading-relaxed">{children}</p>,
              ul: ({ children }) => <ul className="my-1 mr-4 list-disc">{children}</ul>,
              ol: ({ children }) => <ol className="my-1 mr-4 list-decimal">{children}</ol>,
              li: ({ children }) => <li className="my-0.5">{children}</li>,
              strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
              h3: ({ children }) => <h3 className="font-bold mt-2 mb-1">{children}</h3>,
            }}
          >
            {message.content}
          </ReactMarkdown>
        )}
        {message.tool_calls?.some(t => t.status === 'running' || t.status === 'in_progress') && (
          <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
            <Loader2 className="w-3 h-3 animate-spin" /> جاري تحليل البيانات...
          </div>
        )}
      </div>
    </div>
  );
}

export default function ReportsAgent() {
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!activeConversation) return;
    const unsub = base44.agents.subscribeToConversation(activeConversation.id, (data) => {
      setMessages(data.messages || []);
    });
    return unsub;
  }, [activeConversation?.id]);

  const loadConversations = async () => {
    const list = await base44.agents.listConversations({ agent_name: 'sales_report_agent' });
    setConversations(list || []);
  };

  const startNewConversation = async () => {
    const conv = await base44.agents.createConversation({
      agent_name: 'sales_report_agent',
      metadata: { name: `تقرير ${new Date().toLocaleDateString('ar-SA')}` },
    });
    setActiveConversation(conv);
    setMessages([]);
    setConversations(prev => [conv, ...prev]);
  };

  const openConversation = async (conv) => {
    const full = await base44.agents.getConversation(conv.id);
    setActiveConversation(full);
    setMessages(full.messages || []);
  };

  const sendMessage = async (text) => {
    const msg = text || input.trim();
    if (!msg || loading) return;
    setInput('');

    let conv = activeConversation;
    if (!conv) {
      conv = await base44.agents.createConversation({
        agent_name: 'sales_report_agent',
        metadata: { name: `تقرير ${new Date().toLocaleDateString('ar-SA')}` },
      });
      setActiveConversation(conv);
      setConversations(prev => [conv, ...prev]);
    }

    setLoading(true);
    await base44.agents.addMessage(conv, { role: 'user', content: msg });
    setLoading(false);
  };

  return (
    <div className="h-[calc(100vh-5rem)] flex gap-4">
      {/* Sidebar */}
      <aside className="w-60 flex-shrink-0 flex flex-col gap-2">
        <Button onClick={startNewConversation} className="gap-2 w-full">
          <Plus className="w-4 h-4" /> محادثة جديدة
        </Button>
        <div className="flex-1 space-y-1 overflow-y-auto">
          {conversations.map(conv => (
            <button
              key={conv.id}
              onClick={() => openConversation(conv)}
              className={`w-full text-right px-3 py-2.5 rounded-xl text-sm transition-colors ${activeConversation?.id === conv.id ? 'bg-primary text-primary-foreground' : 'hover:bg-muted text-foreground'}`}
            >
              <div className="flex items-center gap-2">
                <MessageSquare className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="truncate">{conv.metadata?.name || 'محادثة'}</span>
              </div>
            </button>
          ))}
        </div>
      </aside>

      {/* Chat */}
      <Card className="flex-1 flex flex-col overflow-hidden border-border/50">
        {/* Header */}
        <div className="flex items-center gap-3 p-4 border-b">
          <div className="p-2 rounded-lg bg-primary/10">
            <Bot className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="font-bold">مساعد تقارير المبيعات</h2>
            <p className="text-xs text-muted-foreground">مدعوم بالذكاء الاصطناعي — غزارة للتجارة والتسويق</p>
          </div>
          <Badge className="mr-auto bg-green-100 text-green-700 text-xs">متصل</Badge>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full gap-6 text-center">
              <div className="p-4 rounded-2xl bg-primary/10">
                <Bot className="w-10 h-10 text-primary" />
              </div>
              <div>
                <h3 className="font-bold text-lg mb-1">كيف يمكنني مساعدتك؟</h3>
                <p className="text-muted-foreground text-sm">اسألني أي سؤال عن بيانات المبيعات أو جرب إحدى الاقتراحات أدناه</p>
              </div>
              <div className="grid grid-cols-2 gap-2 w-full max-w-lg">
                {SUGGESTED_PROMPTS.map((p, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(p)}
                    className="text-right p-3 rounded-xl border border-border/60 hover:bg-muted text-sm transition-colors"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          )}
          {messages.filter(m => m.role !== 'system').map((msg, i) => (
            <MessageBubble key={i} message={msg} />
          ))}
          {loading && (
            <div className="flex gap-3">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="bg-muted rounded-2xl px-4 py-3">
                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t">
          <form onSubmit={(e) => { e.preventDefault(); sendMessage(); }} className="flex gap-2">
            <Input
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="اكتب سؤالك عن المبيعات..."
              className="flex-1"
              disabled={loading}
            />
            <Button type="submit" disabled={!input.trim() || loading} size="icon">
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}