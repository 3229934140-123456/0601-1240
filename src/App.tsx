import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/layout/Navbar';
import Home from '@/pages/Home';
import Library from '@/pages/Library';
import Poster from '@/pages/Poster';
import Character from '@/pages/Character';
import Animation from '@/pages/Animation';
import Brand from '@/pages/Brand';
import Export from '@/pages/Export';

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

const pageTransition = {
  duration: 0.3,
  ease: 'easeOut',
};

function AnimatedPage({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={pageTransition}
      className="min-h-screen"
    >
      {children}
    </motion.div>
  );
}

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-pixel-bg pixel-grid-bg relative overflow-x-hidden">
        <div className="scanline-overlay pointer-events-none fixed inset-0 z-50 opacity-30" />
        <div className="crt-effect pointer-events-none fixed inset-0 z-50" />
        
        <Navbar />
        
        <main className="relative z-10">
          <AnimatePresence mode="wait">
            <Routes>
              <Route
                path="/"
                element={
                  <AnimatedPage>
                    <Home />
                  </AnimatedPage>
                }
              />
              <Route
                path="/library"
                element={
                  <AnimatedPage>
                    <Library />
                  </AnimatedPage>
                }
              />
              <Route
                path="/poster/:id"
                element={
                  <AnimatedPage>
                    <Poster />
                  </AnimatedPage>
                }
              />
              <Route
                path="/character/:id"
                element={
                  <AnimatedPage>
                    <Character />
                  </AnimatedPage>
                }
              />
              <Route
                path="/animation/:id"
                element={
                  <AnimatedPage>
                    <Animation />
                  </AnimatedPage>
                }
              />
              <Route
                path="/brand/:id"
                element={
                  <AnimatedPage>
                    <Brand />
                  </AnimatedPage>
                }
              />
              <Route
                path="/export/:id"
                element={
                  <AnimatedPage>
                    <Export />
                  </AnimatedPage>
                }
              />
            </Routes>
          </AnimatePresence>
        </main>

        <footer className="relative z-10 border-t-4 border-pixel-border bg-pixel-surface mt-8">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-pixel-neon-pink border-2 border-pixel-bg flex items-center justify-center">
                  <span className="text-pixel-xs text-pixel-bg font-bold">P</span>
                </div>
                <div>
                  <p className="text-pixel-xs text-pixel-neon-pink">PIXEL FORGE</p>
                  <p className="text-vt-sm text-pixel-text-muted">像素创意工坊 © 2024</p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <a href="#" className="text-vt-base text-pixel-text-secondary hover:text-pixel-neon-cyan transition-colors">
                  帮助文档
                </a>
                <a href="#" className="text-vt-base text-pixel-text-secondary hover:text-pixel-neon-cyan transition-colors">
                  教程
                </a>
                <a href="#" className="text-vt-base text-pixel-text-secondary hover:text-pixel-neon-pink transition-colors">
                  反馈
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
}
