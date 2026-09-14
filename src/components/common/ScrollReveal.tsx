import React from 'react';
import { useIntersectionObserver, UseIntersectionObserverOptions } from '../../hooks/useIntersectionObserver';

export type RevealAnimation =
  | 'fade-up'
  | 'fade-down'
  | 'fade-in'
  | 'fade-left'
  | 'fade-right'
  | 'scale-up';

export interface ScrollRevealProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  animation?: RevealAnimation;
  delay?: number; // Delay in milliseconds
  duration?: number; // Duration in milliseconds (default 650ms)
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
  className?: string;
  as?: React.ElementType;
}

export const ScrollReveal: React.FC<ScrollRevealProps> = ({
  children,
  animation = 'fade-up',
  delay = 0,
  duration = 650,
  threshold = 0.1,
  rootMargin = '0px 0px -40px 0px',
  triggerOnce = true,
  className = '',
  as: Component = 'div',
  style,
  ...rest
}) => {
  const { ref, isVisible } = useIntersectionObserver<HTMLDivElement>({
    threshold,
    rootMargin,
    triggerOnce,
  });

  const getAnimationClasses = () => {
    switch (animation) {
      case 'fade-up':
        return isVisible
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 translate-y-6';
      case 'fade-down':
        return isVisible
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 -translate-y-6';
      case 'fade-left':
        return isVisible
          ? 'opacity-100 translate-x-0'
          : 'opacity-0 translate-x-6';
      case 'fade-right':
        return isVisible
          ? 'opacity-100 translate-x-0'
          : 'opacity-0 -translate-x-6';
      case 'scale-up':
        return isVisible
          ? 'opacity-100 scale-100'
          : 'opacity-0 scale-[0.96]';
      case 'fade-in':
      default:
        return isVisible ? 'opacity-100' : 'opacity-0';
    }
  };

  return (
    <Component
      ref={ref}
      className={`transition-all ease-[cubic-bezier(0.16,1,0.3,1)] will-change-[opacity,transform] ${getAnimationClasses()} ${className}`}
      style={{
        transitionDuration: `${duration}ms`,
        transitionDelay: `${delay}ms`,
        ...style,
      }}
      {...rest}
    >
      {children}
    </Component>
  );
};

export interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  badge?: string;
  align?: 'left' | 'center' | 'right';
  action?: React.ReactNode;
  className?: string;
  id?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  eyebrow,
  title,
  subtitle,
  badge,
  align = 'left',
  action,
  className = '',
  id,
}) => {
  const { ref, isVisible } = useIntersectionObserver<HTMLDivElement>({
    threshold: 0.15,
    rootMargin: '0px 0px -40px 0px',
    triggerOnce: true,
  });

  const alignmentClass =
    align === 'center'
      ? 'text-center items-center mx-auto'
      : align === 'right'
      ? 'text-right items-end ml-auto'
      : 'text-left items-start';

  return (
    <div
      ref={ref}
      id={id}
      className={`flex flex-col md:flex-row md:items-end justify-between gap-4 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
      } ${className}`}
    >
      <div className={`space-y-1.5 max-w-2xl flex flex-col ${alignmentClass}`}>
        {eyebrow && (
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-widest text-amber-800 bg-amber-50 border border-amber-200/60 px-2.5 py-0.5 rounded-full inline-block">
              {eyebrow}
            </span>
            {badge && (
              <span className="text-[10px] font-bold bg-stone-900 text-amber-300 px-2 py-0.5 rounded-full uppercase tracking-wider">
                {badge}
              </span>
            )}
          </div>
        )}

        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-serif-luxury text-stone-900 tracking-tight leading-tight">
          {title}
        </h2>

        {subtitle && (
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed max-w-xl">
            {subtitle}
          </p>
        )}
      </div>

      {action && (
        <div
          className={`shrink-0 transition-opacity duration-700 delay-150 ${
            isVisible ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {action}
        </div>
      )}
    </div>
  );
};
