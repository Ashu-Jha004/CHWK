'use client';

import { useState, useEffect } from 'react';
import { ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  // Show button when page is scrolled up to given distance
  const toggleVisibility = () => {
    if (window.pageYOffset > 500) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  // Set the top coordinate to 0
  // make scrolling smooth
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  useEffect(() => {
    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  return (
    <div className={cn(
      "fixed bottom-8 right-8 z-50 transition-all duration-300 transform",
      isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0 pointer-events-none"
    )}>
      <Button
        onClick={scrollToTop}
        size="icon"
        className="h-12 w-12 rounded-full shadow-lg bg-primary hover:bg-primary/90 text-primary-foreground group"
        aria-label="Scroll to top"
      >
        <ChevronUp className="h-6 w-6 transition-transform group-hover:-translate-y-1" />
      </Button>
    </div>
  );
}
