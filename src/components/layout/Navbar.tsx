import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  Image,
  Edit3,
  User,
  Film,
  Palette,
  Download,
  Menu,
  X,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { path: '/', icon: Home, label: '首页' },
  { path: '/library', icon: Image, label: '素材库' },
  { path: '/poster/project-1', icon: Edit3, label: '海报编辑' },
  { path: '/character/project-1', icon: User, label: '角色展示' },
  { path: '/animation/project-1', icon: Film, label: '动图生成' },
  { path: '/brand/project-1', icon: Palette, label: '品牌套件' },
  { path: '/export/project-1', icon: Download, label: '导出中心' },
];

export default function Navbar() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getCurrentPage = () => {
    const path = location.pathname;
    if (path === '/') return 0;
    if (path.includes('library')) return 1;
    if (path.includes('poster')) return 2;
    if (path.includes('character')) return 3;
    if (path.includes('animation')) return 4;
    if (path.includes('brand')) return 5;
    if (path.includes('export')) return 6;
    return 0;
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-pixel-bg border-b-4 border-pixel-border">
        <div className="max-w-full mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-3 group">
              <motion.div
                className="w-10 h-10 bg-pixel-neon-pink border-4 border-pixel-bg"
                style={{ boxShadow: '4px 4px 0 0 #0D0B1F' }}
                animate={{ rotate: [0, -5, 5, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              >
                <div className="w-full h-full flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-pixel-bg" />
                </div>
              </motion.div>
              <div>
                <h1 className="text-pixel-sm text-pixel-neon-pink pixel-text-shadow">
                  PixelForge
                </h1>
                <p className="text-vt-sm text-pixel-text-muted -mt-1">
                  像素创意工坊
                </p>
              </div>
            </Link>

            <div className="hidden lg:flex items-center gap-1">
              {navItems.map((item, index) => {
                const Icon = item.icon;
                const isActive = getCurrentPage() === index;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      'relative flex items-center gap-2 px-4 py-2 text-vt-base transition-all duration-200',
                      'border-2 border-transparent hover:border-pixel-border',
                      isActive
                        ? 'text-pixel-neon-cyan'
                        : 'text-pixel-text-secondary hover:text-pixel-text-primary'
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                    {isActive && (
                      <motion.div
                        className="absolute bottom-0 left-0 right-0 h-1 bg-pixel-neon-cyan"
                        layoutId="navIndicator"
                      />
                    )}
                  </Link>
                );
              })}
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center gap-2">
                <div className="w-8 h-8 bg-pixel-neon-yellow border-2 border-pixel-bg flex items-center justify-center">
                  <span className="text-pixel-xs text-pixel-bg font-bold">DEV</span>
                </div>
                <span className="text-vt-base text-pixel-text-primary">开发者A</span>
              </div>

              <button
                className="lg:hidden p-2 border-2 border-pixel-border hover:border-pixel-neon-cyan transition-colors"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? (
                  <X className="w-5 h-5 text-pixel-neon-pink" />
                ) : (
                  <Menu className="w-5 h-5 text-pixel-text-primary" />
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="h-1 bg-gradient-to-r from-pixel-neon-pink via-pixel-neon-cyan to-pixel-neon-yellow" />
      </nav>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-16 left-0 right-0 z-40 lg:hidden bg-pixel-bg border-b-4 border-pixel-border"
          >
            <div className="p-4 space-y-2">
              {navItems.map((item, index) => {
                const Icon = item.icon;
                const isActive = getCurrentPage() === index;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      'flex items-center gap-3 p-3 border-2 transition-all',
                      isActive
                        ? 'bg-pixel-card border-pixel-neon-cyan text-pixel-neon-cyan'
                        : 'bg-pixel-surface border-pixel-border text-pixel-text-secondary hover:border-pixel-neon-pink'
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-vt-lg">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="h-16" />
    </>
  );
}
