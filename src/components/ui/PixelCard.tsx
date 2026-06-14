import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface PixelCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  glow?: boolean;
  onClick?: () => void;
}

export default function PixelCard({ children, className, hover = true, glow = false, onClick }: PixelCardProps) {
  return (
    <motion.div
      className={cn(
        'bg-pixel-card border-4 border-pixel-border relative',
        hover && 'cursor-pointer transition-all duration-200',
        glow && 'hover:shadow-neon-pink',
        className
      )}
      style={{ boxShadow: '4px 4px 0 0 #0D0B1F' }}
      whileHover={hover ? { x: -2, y: -2, transition: { duration: 0.1 } } : undefined}
      animate={glow ? { boxShadow: ['4px 4px 0 0 #0D0B1F', '4px 4px 0 0 #0D0B1F, 0 0 20px rgba(255, 107, 157, 0.4)', '4px 4px 0 0 #0D0B1F'] } : undefined}
      transition={glow ? { duration: 2, repeat: Infinity } : undefined}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
}
