import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

type ButtonVariant = 'default' | 'primary' | 'secondary' | 'warning' | 'danger' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface PixelButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: React.ReactNode;
}

const PixelButton = forwardRef<HTMLButtonElement, PixelButtonProps>(
  ({ className, variant = 'default', size = 'md', children, ...props }, ref) => {
    const sizeClasses = {
      sm: 'px-2 py-1 text-pixel-xs',
      md: 'px-4 py-2 text-pixel-xs',
      lg: 'px-6 py-3 text-pixel-sm',
    };

    const variantClasses = {
      default: 'bg-pixel-card text-pixel-text-primary hover:bg-pixel-border',
      primary: 'bg-pixel-neon-pink text-pixel-bg hover:bg-opacity-90',
      secondary: 'bg-pixel-neon-cyan text-pixel-bg hover:bg-opacity-90',
      warning: 'bg-pixel-neon-yellow text-pixel-bg hover:bg-opacity-90',
      danger: 'bg-red-500 text-white hover:bg-red-600',
      ghost: 'bg-transparent text-pixel-text-primary border-pixel-border hover:bg-pixel-card',
    };

    const shadowColors = {
      default: '#0D0B1F',
      primary: '#0D0B1F',
      secondary: '#0D0B1F',
      warning: '#0D0B1F',
      danger: '#7F1D1D',
      ghost: 'transparent',
    };

    return (
      <button
        ref={ref}
        className={cn(
          'font-pixel border-4 border-pixel-bg transition-all duration-150',
          'relative overflow-hidden select-none',
          'active:translate-x-1 active:translate-y-1',
          sizeClasses[size],
          variantClasses[variant],
          className
        )}
        style={{
          boxShadow: `4px 4px 0 0 ${shadowColors[variant]}`,
        }}
        onMouseDown={(e) => {
          e.currentTarget.style.boxShadow = `2px 2px 0 0 ${shadowColors[variant]}`;
        }}
        onMouseUp={(e) => {
          e.currentTarget.style.boxShadow = `4px 4px 0 0 ${shadowColors[variant]}`;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = `4px 4px 0 0 ${shadowColors[variant]}`;
        }}
        {...props}
      >
        <span className="relative z-10">{children}</span>
        <div className="absolute inset-0 bg-white opacity-0 hover:opacity-10 transition-opacity" />
      </button>
    );
  }
);

PixelButton.displayName = 'PixelButton';

export default PixelButton;
