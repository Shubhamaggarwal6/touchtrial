import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageCircle, X, Send, Bot, User, Loader2, LogIn, ShoppingBag, Plus, Camera, Zap, Gamepad2, Battery, Smartphone } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { Link } from 'react-router-dom';
import { usePhones } from '@/hooks/use-phones';

interface PhoneRecommendation {
  phone_id: string;
  reason: string;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  recommendations?: PhoneRecommendation[];
}

type OnboardingStep = 'budget' | 'priority' | 'brand' | 'done';

const BUDGET_OPTIONS = [
  { label: 'Under ₹40,000', value: 'under-40k' },
  { label: '₹40,000 – ₹70,000', value: '40k-70k' },
  { label: '₹70,000 – ₹1,00,000', value: '70k-1L' },
  { label: '₹1,00,000+', value: 'above-1L' },
];

const PRIORITY_OPTIONS = [
  { label: 'Camera', value: 'camera', icon: Camera },
  { label: 'Performance', value: 'performance', icon: Zap },
  { label: 'Gaming', value: 'gaming', icon: Gamepad2 },
  { label: 'Battery Life', value: 'battery', icon: Battery },
  { label: 'All-rounder', value: 'all-rounder', icon: Smartphone },
];

const BRAND_OPTIONS = [
  { label: 'Apple', value: 'Apple' },
  { label: 'Samsung', value: 'Samsung' },
  { label: 'OnePlus', value: 'OnePlus' },
  { label: 'Google', value: 'Google' },
  { label: 'Xiaomi', value: 'Xiaomi' },
  { label: 'Vivo', value: 'Vivo' },
  { label: 'No preference', value: 'any' },
];

const MAX_MESSAGE_LENGTH = 1000;
const MAX_MESSAGES_HISTORY = 20;
const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/phone-advisor`;

export const PhoneAdvisorChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "Hi! 👋 I'm your TouchTrial phone advisor. Let me help you find the perfect phone to experience at home!\n\nFirst, what's your budget?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState<OnboardingStep>('budget');
  const [selectedBudget, setSelectedBudget] = useState('');
  const [selectedPriorities, setSelectedPriorities] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { user, session } = useAuth();
  const { addToCart, isInCart } = useCart();
  const { data: phoneCatalog = [] } = usePhones();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, onboardingStep]);

  const handleAddToCart = (phoneId: string) => {
    const phone = phoneCatalog.find(p => p.id === phoneId);
    if (phone) {
      addToCart(phone);
      toast({ title: 'Added!', description: `${phone.brand} ${phone.model} added to Home Experience` });
    }
  };

  const handleBudgetSelect = (budget: string, label: string) => {
    setSelectedBudget(budget);
    setMessages(prev => [
      ...prev,
      { role: 'user', content: label },
      { role: 'assistant', content: "Great choice! 👍 Now, what matters most to you in a phone? You can pick multiple." }
    ]);
    setOnboardingStep('priority');
  };

  const togglePriority = (value: string) => {
    setSelectedPriorities(prev =>
      prev.includes(value) ? prev.filter(p => p !== value) : [...prev, value]
    );
  };

  const confirmPriorities = () => {
    if (selectedPriorities.length === 0) {
      toast({ title: 'Select at least one', description: 'Pick what matters most to you', variant: 'destructive' });
      return;
    }
    const labels = selectedPriorities.map(v => PRIORITY_OPTIONS.find(o => o.value === v)?.label).join(', ');
    setMessages(prev => [
      ...prev,
      { role: 'user', content: labels },
      { role: 'assistant', content: "Almost there! 🎯 Any brand preference? Pick one or more, or choose 'No preference'." }
    ]);
    setOnboardingStep('brand');
  };

  const toggleBrand = (value: string) => {
    if (value === 'any') {
      setSelectedBrands(['any']);
      return;
    }
    setSelectedBrands(prev => {
      const filtered = prev.filter(b => b !== 'any');
      return filtered.includes(value) ? filtered.filter(b => b !== value) : [...filtered, value];
    });
  };

  const confirmBrands = () => {
    if (selectedBrands.length === 0) {
      toast({ title: 'Select at least one', description: 'Pick a brand or "No preference"', variant: 'destructive' });
      return;
    }
    const labels = selectedBrands.includes('any')
      ? 'No preference'
      : selectedBrands.join(', ');

    const budgetLabel = BUDGET_OPTIONS.find(o => o.value === selectedBudget)?.label || selectedBudget;
    const priorityLabels = selectedPriorities.map(v => PRIORITY_OPTIONS.find(o => o.value === v)?.label).join(', ');

    const summaryMessage = `Budget: ${budgetLabel}\nPriorities: ${priorityLabels}\nBrands: ${labels}`;

    setMessages(prev => [
      ...prev,
      { role: 'user', content: labels },
      { role: 'assistant', content: "Perfect! 🔍 Let me find the best phones for you..." }
    ]);
    setOnboardingStep('done');

    // Now send the structured preferences to AI
    sendStructuredQuery(summaryMessage);
  };

  const sendStructuredQuery = async (preferences: string) => {
    if (!session?.access_token) return;
    setIsLoading(true);

    const systemQuery = `Based on these preferences, recommend the best phones:\n${preferences}\n\nPlease recommend 2-3 phones and explain why each is a great fit.`;
    const aiMessages: Message[] = [{ role: 'user', content: systemQuery }];

    let assistantContent = '';
    let toolCallArgs = '';
    let recommendations: PhoneRecommendation[] = [];

    try {
      const resp = await fetch(CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
        body: JSON.stringify({ messages: aiMessages }),
      });

      if (!resp.ok) {
        const errData = await resp.json().catch(() => ({}));
        throw new Error(errData.error || `Request failed (${resp.status})`);
      }
      if (!resp.body) throw new Error('No response body');

      await processStream(resp.body, (content) => {
        assistantContent += content;
        setMessages(prev => {
          const last = prev[prev.length - 1];
          if (last?.role === 'assistant' && last.content.includes('Let me find')) {
            return [...prev.slice(0, -1), { role: 'assistant', content: assistantContent, recommendations }];
          }
          return prev;
        });
      }, (args) => {
        toolCallArgs += args;
      }, () => {
        if (toolCallArgs) {
          try {
            const toolData = JSON.parse(toolCallArgs);
            if (toolData.recommendations) recommendations = toolData.recommendations;
          } catch { /* ignore */ }
        }
        setMessages(prev => {
          const updated = [...prev];
          const lastIdx = updated.length - 1;
          if (updated[lastIdx]?.role === 'assistant') {
            updated[lastIdx] = { ...updated[lastIdx], content: assistantContent || "Here are my top picks for you!", recommendations };
          }
          return updated;
        });
      });
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : 'Failed to get response';
      toast({ title: 'Error', description: errMsg, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const processStream = async (
    body: ReadableStream<Uint8Array>,
    onContent: (text: string) => void,
    onToolArgs: (args: string) => void,
    onDone: () => void
  ) => {
    const reader = body.getReader();
    const decoder = new TextDecoder();
    let textBuffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      textBuffer += decoder.decode(value, { stream: true });

      let newlineIndex: number;
      while ((newlineIndex = textBuffer.indexOf('\n')) !== -1) {
        let line = textBuffer.slice(0, newlineIndex);
        textBuffer = textBuffer.slice(newlineIndex + 1);
        if (line.endsWith('\r')) line = line.slice(0, -1);
        if (line.startsWith(':') || line.trim() === '') continue;
        if (!line.startsWith('data: ')) continue;

        const jsonStr = line.slice(6).trim();
        if (jsonStr === '[DONE]') { onDone(); return; }

        try {
          const parsed = JSON.parse(jsonStr);
          const choice = parsed.choices?.[0];
          if (!choice) continue;

          const content = choice.delta?.content as string | undefined;
          if (content) onContent(content);

          const toolCalls = choice.delta?.tool_calls;
          if (toolCalls) {
            for (const tc of toolCalls) {
              if (tc.function?.arguments) onToolArgs(tc.function.arguments);
            }
          }
        } catch {
          textBuffer = line + '\n' + textBuffer;
          break;
        }
      }
    }
    onDone();
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedInput = input.trim();
    if (!trimmedInput || isLoading) return;

    if (trimmedInput.length > MAX_MESSAGE_LENGTH) {
      toast({ title: 'Message too long', description: `Please limit to ${MAX_MESSAGE_LENGTH} characters`, variant: 'destructive' });
      return;
    }
    if (!session?.access_token) {
      toast({ title: 'Authentication required', description: 'Please sign in', variant: 'destructive' });
      return;
    }

    const userMessage: Message = { role: 'user', content: trimmedInput };
    const recentMessages = messages.slice(-MAX_MESSAGES_HISTORY);
    const newMessages = [...recentMessages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    let assistantContent = '';
    let toolCallArgs = '';
    let recommendations: PhoneRecommendation[] = [];

    try {
      const resp = await fetch(CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
        body: JSON.stringify({
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
        }),
      });

      if (!resp.ok) {
        const errData = await resp.json().catch(() => ({}));
        throw new Error(errData.error || `Request failed (${resp.status})`);
      }
      if (!resp.body) throw new Error('No response body');

      await processStream(resp.body, (content) => {
        assistantContent += content;
        setMessages([...newMessages, { role: 'assistant', content: assistantContent, recommendations }]);
      }, (args) => {
        toolCallArgs += args;
      }, () => {
        if (toolCallArgs) {
          try {
            const toolData = JSON.parse(toolCallArgs);
            if (toolData.recommendations) recommendations = toolData.recommendations;
          } catch { /* ignore */ }
        }
        if (assistantContent || recommendations.length > 0) {
          setMessages([...newMessages, { role: 'assistant', content: assistantContent || "Here are my recommendations:", recommendations }]);
        }
      });
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : 'Failed to get response';
      toast({ title: 'Error', description: errMsg, variant: 'destructive' });
      if (!assistantContent) setMessages(newMessages);
    } finally {
      setIsLoading(false);
    }
  };

  const PhoneCard = ({ rec }: { rec: PhoneRecommendation }) => {
    const phone = phoneCatalog.find(p => p.id === rec.phone_id);
    if (!phone) return null;
    const inCart = isInCart(phone.id);

    return (
      <div className="bg-background border border-border rounded-xl p-3 mt-2 flex gap-3 items-center shadow-sm">
        <img src={phone.image} alt={phone.model} className="w-16 h-16 object-contain rounded-lg bg-muted p-1" />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold truncate">{phone.brand} {phone.model}</p>
          <p className="text-xs font-semibold text-primary">₹{phone.price.toLocaleString('en-IN')}</p>
          <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-2">{rec.reason}</p>
        </div>
        <Button
          size="sm"
          variant={inCart ? "secondary" : "default"}
          className="text-[10px] h-8 px-2 shrink-0 flex-col gap-0 leading-tight"
          onClick={() => !inCart && handleAddToCart(phone.id)}
          disabled={inCart}
        >
          {inCart ? (
            <><ShoppingBag className="h-3 w-3" /><span>Added</span></>
          ) : (
            <><Plus className="h-3 w-3" /><span>Try at Home</span></>
          )}
        </Button>
      </div>
    );
  };

  return (
    <>
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-lg",
          "bg-primary hover:bg-primary/90 transition-all duration-300",
          isOpen && "scale-0 opacity-0"
        )}
        size="icon"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>

      <div
        className={cn(
          "fixed bottom-6 right-6 z-50 w-[400px] max-w-[calc(100vw-3rem)]",
          "bg-background border border-border rounded-2xl shadow-2xl",
          "flex flex-col overflow-hidden transition-all duration-300",
          isOpen ? "h-[550px] opacity-100" : "h-0 opacity-0 pointer-events-none"
        )}
      >
        {/* Header */}
        <div className="bg-primary text-primary-foreground p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary-foreground/20 flex items-center justify-center">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold">Phone Advisor</h3>
              <p className="text-xs opacity-80">Find your perfect phone</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="text-primary-foreground hover:bg-primary-foreground/20">
            <X className="h-5 w-5" />
          </Button>
        </div>

        {!user ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
            <LogIn className="h-12 w-12 text-muted-foreground mb-4" />
            <h4 className="font-semibold mb-2">Sign in to chat</h4>
            <p className="text-sm text-muted-foreground mb-4">Sign in for personalized phone recommendations.</p>
            <Button asChild><Link to="/auth">Sign In</Link></Button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message, i) => (
                <div key={i} className={cn("flex gap-3", message.role === 'user' ? "flex-row-reverse" : "")}>
                  <div className={cn(
                    "h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0",
                    message.role === 'user' ? "bg-primary text-primary-foreground" : "bg-muted"
                  )}>
                    {message.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                  </div>
                  <div className={cn(
                    "max-w-[80%] rounded-2xl px-4 py-2 text-sm",
                    message.role === 'user'
                      ? "bg-primary text-primary-foreground rounded-br-md"
                      : "bg-muted rounded-bl-md"
                  )}>
                    <p className="whitespace-pre-wrap">{message.content}</p>
                    {message.recommendations && message.recommendations.length > 0 && (
                      <div className="mt-2 space-y-2">
                        {message.recommendations.map((rec, j) => (
                          <PhoneCard key={j} rec={rec} />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Onboarding: Budget */}
              {onboardingStep === 'budget' && !isLoading && (
                <div className="grid grid-cols-2 gap-2 pl-11">
                  {BUDGET_OPTIONS.map(opt => (
                    <Button key={opt.value} variant="outline" size="sm" className="text-xs h-8 rounded-full w-full" onClick={() => handleBudgetSelect(opt.value, opt.label)}>
                      {opt.label}
                    </Button>
                  ))}
                </div>
              )}

              {/* Onboarding: Priority */}
              {onboardingStep === 'priority' && !isLoading && (
                <div className="pl-11 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    {PRIORITY_OPTIONS.map(opt => {
                      const Icon = opt.icon;
                      const selected = selectedPriorities.includes(opt.value);
                      return (
                        <Button key={opt.value} variant={selected ? "default" : "outline"} size="sm" className="text-xs h-8 rounded-full gap-1 w-full" onClick={() => togglePriority(opt.value)}>
                          <Icon className="h-3 w-3" /> {opt.label}
                        </Button>
                      );
                    })}
                  </div>
                  <Button size="sm" className="text-xs" onClick={confirmPriorities} disabled={selectedPriorities.length === 0}>
                    Continue →
                  </Button>
                </div>
              )}

              {/* Onboarding: Brand */}
              {onboardingStep === 'brand' && !isLoading && (
                <div className="pl-11 space-y-2">
                  <div className="grid grid-cols-3 gap-2">
                    {BRAND_OPTIONS.map(opt => {
                      const selected = selectedBrands.includes(opt.value);
                      return (
                        <Button key={opt.value} variant={selected ? "default" : "outline"} size="sm" className="text-xs h-8 rounded-full w-full" onClick={() => toggleBrand(opt.value)}>
                          {opt.label}
                        </Button>
                      );
                    })}
                  </div>
                  <Button size="sm" className="text-xs" onClick={confirmBrands} disabled={selectedBrands.length === 0}>
                    Find My Phone →
                  </Button>
                </div>
              )}

              {isLoading && (
                <div className="flex gap-3">
                  <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Finding best phones...
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input - only show after onboarding */}
            {onboardingStep === 'done' && (
              <form onSubmit={sendMessage} className="p-4 border-t border-border">
                <div className="flex gap-2">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask me anything about phones..."
                    disabled={isLoading}
                    maxLength={MAX_MESSAGE_LENGTH}
                    className="flex-1"
                  />
                  <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </form>
            )}
          </>
        )}
      </div>
    </>
  );
};
