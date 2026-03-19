import { useState, useEffect } from 'react';
import type { User } from '@supabase/supabase-js';

interface WelcomeScreenProps {
  user: User;
  onEnter: () => void;
}

export function WelcomeScreen({ user, onEnter }: WelcomeScreenProps) {
  const fullName = user.user_metadata?.full_name || user.user_metadata?.name || '';
  let firstName = fullName ? fullName.split(' ')[0] : '';
  
  if (!firstName && user.email) {
    const emailPrefix = user.email.split('@')[0];
    firstName = emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1);
  }
  
  if (!firstName) firstName = 'there';
  
  const fullText = `Welcome ${firstName}, are you hungry?`;
  const [displayedText, setDisplayedText] = useState('');
  const [showCursor, setShowCursor] = useState(true);
  const [isDoneTyping, setIsDoneTyping] = useState(false);

  // Blinking cursor effect
  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 500);
    return () => clearInterval(cursorInterval);
  }, []);

  // Typing effect
  useEffect(() => {
    let currentIndex = 0;
    const typingInterval = setInterval(() => {
      if (currentIndex <= fullText.length) {
        setDisplayedText(fullText.slice(0, currentIndex));
        currentIndex++;
      } else {
        clearInterval(typingInterval);
        setIsDoneTyping(true);
      }
    }, 60); // Speed of typing

    return () => clearInterval(typingInterval);
  }, [fullText]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#FDFBF7]">
      <div className="flex flex-col items-center justify-center text-center max-w-3xl px-6">
        <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-serif text-carbon mb-8 md:mb-12 min-h-[3rem] md:min-h-[4rem] flex items-center justify-center">
          <span>{displayedText}</span>
          <span className={`w-[2px] h-[28px] sm:h-[40px] md:h-[50px] bg-carbon ml-1 ${showCursor ? 'opacity-100' : 'opacity-0'} transition-opacity`} />
        </h1>
        
        <button
          onClick={onEnter}
          className={`font-mono text-sm uppercase tracking-widest text-carbon border border-carbon px-8 py-3 rounded-full hover:bg-carbon hover:text-parchment transition-all duration-500 ${
            isDoneTyping ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
          }`}
        >
          Enter
        </button>
      </div>
    </div>
  );
}
