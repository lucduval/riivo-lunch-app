import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import gsap from 'gsap';
import { supabase } from '../lib/supabase';
import { useCart } from '../lib/CartContext';
import { X, Sparkles, ChevronRight, ShoppingCart } from 'lucide-react';

type AdvisorProps = {
  restaurantId: string;
  isOpen: boolean;
  onClose: () => void;
};

type Recommendation = {
  id: string;
  name: string;
  price: number;
  category: string;
  rationale: string;
};

type Answers = {
  hunger: string;
  mood: string;
  adventurous: string;
  funAnswer: string;
  dietary: string;
};

const FUN_QUESTIONS = [
  { question: "If your lunch could have a theme song, what genre would it be?", options: ["Classical — I'm refined", "Heavy Metal — feed me NOW", "Lo-fi beats — keep it chill", "Musical theatre — extra everything"] },
  { question: "Pick a celebrity to share this meal with:", options: ["Gordon Ramsay (risky)", "Nonna from TikTok", "Post Malone (because... Posti?)", "My therapist — I need to talk about my food choices"] },
  { question: "What's your current email inbox situation?", options: ["Inbox zero, naturally", "47 unread — it's fine", "I stopped counting at 1000", "I use carrier pigeons"] },
  { question: "How would your coworkers describe your lunch habits?", options: ["Predictable as sunrise", "Chaotic neutral", "They're scared of me", "I eat? Since when?"] },
];

const steps = [
  {
    id: 'hunger',
    question: "How hungry are you right now?",
    options: [
      { label: "Just a nibble", value: "low", emoji: "🐭" },
      { label: "Reasonably peckish", value: "medium", emoji: "🍽️" },
      { label: "I could eat a horse", value: "high", emoji: "🐴" },
      { label: "I haven't eaten since birth", value: "extreme", emoji: "💀" },
    ]
  },
  {
    id: 'mood',
    question: "What's the vibe today?",
    options: [
      { label: "Comfort me", value: "comfort", emoji: "🧸" },
      { label: "Keep it light & fresh", value: "light", emoji: "🥗" },
      { label: "Something indulgent", value: "indulgent", emoji: "🤤" },
      { label: "Surprise me, I trust no one", value: "surprise", emoji: "🎲" },
    ]
  },
  {
    id: 'adventurous',
    question: "How adventurous are you feeling?",
    options: [
      { label: "I order the same thing every time", value: "safe", emoji: "🏠" },
      { label: "Open to suggestions", value: "moderate", emoji: "🤔" },
      { label: "Wild card — dealer's choice", value: "adventurous", emoji: "🎰" },
    ]
  },
  {
    id: 'fun',
    question: '', // Will be set dynamically
    options: [] // Will be set dynamically
  },
  {
    id: 'dietary',
    question: "Any dietary preferences?",
    options: [
      { label: "No restrictions", value: "none", emoji: "✅" },
      { label: "Vegetarian", value: "vegetarian", emoji: "🌿" },
      { label: "Pescatarian", value: "pescatarian", emoji: "🐟" },
      { label: "No red meat", value: "no-red-meat", emoji: "🍗" },
    ]
  }
];

export function MealAdvisor({ restaurantId, isOpen, onClose }: AdvisorProps) {
  const { addItem } = useCart();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Partial<Answers>>({});
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [addedItems, setAddedItems] = useState<Set<string>>(new Set());
  const [funQuestion] = useState(() => FUN_QUESTIONS[Math.floor(Math.random() * FUN_QUESTIONS.length)]);

  const overlayRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      gsap.to(overlayRef.current, { opacity: 1, duration: 0.4, display: 'block' });
      gsap.to(panelRef.current, { y: '0%', opacity: 1, duration: 0.6, ease: "power3.out" });
    } else {
      gsap.to(overlayRef.current, { opacity: 0, duration: 0.4, display: 'none' });
      gsap.to(panelRef.current, { y: '20px', opacity: 0, duration: 0.4, ease: "power3.in" });
      setTimeout(() => {
        setCurrentStep(0);
        setAnswers({});
        setRecommendations([]);
        setLoading(false);
        setError(null);
        setAddedItems(new Set());
      }, 500);
    }
  }, [isOpen]);

  useEffect(() => {
    if (contentRef.current && isOpen) {
      gsap.fromTo(contentRef.current, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" });
    }
  }, [currentStep, loading, recommendations.length, isOpen]);

  const handleAnswer = async (value: string) => {
    const stepId = steps[currentStep].id;
    const newAnswers = { ...answers };

    if (stepId === 'fun') {
      newAnswers.funAnswer = value;
    } else {
      (newAnswers as any)[stepId] = value;
    }
    setAnswers(newAnswers);

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setLoading(true);
      try {
        const { data, error } = await supabase.functions.invoke('meal-advisor', {
          body: { restaurant_id: restaurantId, answers: newAnswers }
        });
        if (error) {
          console.error('Meal advisor function error:', error);
          setError('The kitchen AI is taking a break. Try again or browse the menu.');
        } else if (data && Array.isArray(data)) {
          setRecommendations(data);
        } else {
          console.error('Unexpected response:', data);
          setError('Got an unexpected response. Try again or browse the menu.');
        }
      } catch (e) {
        console.error('Meal advisor error:', e);
        setError('Could not reach the kitchen AI. Try again or browse the menu.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleAddToCart = (rec: Recommendation) => {
    addItem({ id: rec.id, name: rec.name, price: rec.price, category: rec.category });
    setAddedItems(prev => new Set(prev).add(rec.id));
  };

  const currentStepData = steps[currentStep];
  const isFunStep = currentStepData.id === 'fun';
  const displayQuestion = isFunStep ? funQuestion.question : currentStepData.question;
  const displayOptions = isFunStep
    ? funQuestion.options.map((o, i) => ({ label: o, value: o, emoji: ['🎵', '🌟', '📧', '🍽️'][i] || '✨' }))
    : currentStepData.options;

  const progress = recommendations.length > 0 ? 100 : ((currentStep) / steps.length) * 100;

  return createPortal(
    <>
      <div
        ref={overlayRef}
        className="fixed inset-0 bg-carbon/40 backdrop-blur-sm z-[120] hidden opacity-0 cursor-pointer"
        onClick={onClose}
      />
      <div
        ref={panelRef}
        className="fixed inset-x-4 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 top-[10vh] md:top-[15vh] md:w-[560px] bg-parchment border border-carbon rounded-[2rem] z-[130] opacity-0 translate-y-[20px] overflow-hidden shadow-2xl max-h-[80vh] flex flex-col"
      >
        {/* Header */}
        <div className="p-6 md:p-8 border-b border-carbon/10 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <Sparkles size={20} className="text-mustard" />
            <h2 className="font-baskerville text-2xl text-carbon">Help Me Choose</h2>
          </div>
          <button onClick={onClose} className="text-carbon hover:opacity-50 transition-opacity">
            <X size={24} strokeWidth={1} />
          </button>
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-carbon/5 shrink-0">
          <div className="h-full bg-mustard transition-all duration-500 ease-out" style={{ width: `${progress}%` }} />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8" ref={contentRef}>
          {error ? (
            <div className="flex flex-col items-center justify-center py-16 gap-6 text-center">
              <div className="w-16 h-16 rounded-full bg-carbon/5 flex items-center justify-center">
                <span className="text-2xl">😅</span>
              </div>
              <div>
                <p className="font-baskerville text-xl text-carbon mb-2">Oops.</p>
                <p className="font-mono text-xs text-carbon/50 leading-relaxed max-w-xs">{error}</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setError(null);
                    setCurrentStep(0);
                    setAnswers({});
                  }}
                  className="font-mono text-xs uppercase tracking-wider bg-carbon text-parchment px-5 py-2.5 rounded-full hover:bg-mustard hover:text-carbon transition-colors"
                >
                  Try again
                </button>
                <button
                  onClick={onClose}
                  className="font-mono text-xs uppercase tracking-wider text-carbon/50 px-5 py-2.5 rounded-full border border-carbon/10 hover:border-carbon/30 transition-colors"
                >
                  Browse menu
                </button>
              </div>
            </div>
          ) : loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-6">
              <div className="relative w-16 h-16">
                <div className="absolute inset-0 border-2 border-carbon/10 rounded-full" />
                <div className="absolute inset-0 border-2 border-mustard border-t-transparent rounded-full animate-spin" />
              </div>
              <div className="text-center">
                <p className="font-baskerville text-xl text-carbon mb-2">Consulting the kitchen...</p>
                <p className="font-mono text-xs text-carbon/50 uppercase tracking-wider">Analysing your vibe profile</p>
              </div>
            </div>
          ) : recommendations.length > 0 ? (
            <div>
              <div className="text-center mb-8">
                <h3 className="font-baskerville text-2xl text-carbon mb-2">Your Top 3 Picks</h3>
                <p className="font-mono text-xs text-carbon/50 uppercase tracking-wider">Curated by AI, judged by you</p>
              </div>
              <div className="space-y-4">
                {recommendations.map((rec, i) => (
                  <div key={rec.id} className="bg-smoke border border-carbon/10 rounded-[1.5rem] p-5 hover:border-mustard/50 transition-colors duration-300">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <span className="font-mono text-xs text-mustard font-bold">#{i + 1}</span>
                          <h4 className="font-baskerville text-xl text-carbon">{rec.name}</h4>
                        </div>
                        <span className="font-mono text-xs text-carbon/40 mb-2 block">R{rec.price?.toFixed(2)} · {rec.category}</span>
                        <p className="font-mono text-xs text-carbon/60 leading-relaxed">{rec.rationale}</p>
                      </div>
                      <button
                        onClick={() => handleAddToCart(rec)}
                        disabled={addedItems.has(rec.id)}
                        className={`shrink-0 flex items-center gap-2 px-4 py-2 rounded-full font-mono text-xs uppercase tracking-wider transition-all duration-300 ${
                          addedItems.has(rec.id)
                            ? 'bg-carbon/10 text-carbon/40 cursor-default'
                            : 'bg-carbon text-parchment hover:bg-mustard hover:text-carbon'
                        }`}
                      >
                        <ShoppingCart size={14} />
                        {addedItems.has(rec.id) ? 'Added' : 'Add'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-8 text-center">
                <button
                  onClick={onClose}
                  className="font-mono text-xs text-carbon/50 uppercase tracking-wider hover:text-carbon transition-colors underline underline-offset-4"
                >
                  Back to full menu
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div className="mb-8">
                <p className="font-mono text-[10px] uppercase tracking-widest text-carbon/40 mb-3">
                  Question {currentStep + 1} of {steps.length}
                </p>
                <h3 className="font-baskerville text-2xl text-carbon leading-snug">{displayQuestion}</h3>
              </div>
              <div className="space-y-3">
                {displayOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleAnswer(option.value)}
                    className="w-full text-left bg-smoke border border-carbon/10 rounded-[1.25rem] p-4 md:p-5 hover:border-mustard/50 hover:bg-mustard/5 transition-all duration-200 group flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-xl">{option.emoji}</span>
                      <span className="font-mono text-sm text-carbon">{option.label}</span>
                    </div>
                    <ChevronRight size={16} className="text-carbon/20 group-hover:text-mustard group-hover:translate-x-1 transition-all" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>,
    document.body
  );
}
