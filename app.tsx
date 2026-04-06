import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'motion/react';
import { 
  Sparkles, 
  Copy, 
  RefreshCw, 
  BookOpen, 
  Palette, 
  Code, 
  Rocket, 
  Youtube, 
  Volume2, 
  VolumeX,
  CheckCircle2,
  ChevronRight,
  History,
  Heart,
  X,
  Share2,
  SkipForward,
  Music
} from 'lucide-react';
import { CATEGORIES, PROMPTS, BACKGROUND_MUSIC, Category, Prompt } from './data';

const iconMap = {
  BookOpen,
  Palette,
  Code,
  Rocket,
  Youtube,
  Sparkles
};

// Typing Animation Component
const TypingText = ({ text }: { text: string }) => {
  const [displayedText, setDisplayedText] = useState('');
  
  useEffect(() => {
    setDisplayedText('');
    let i = 0;
    const interval = setInterval(() => {
      if (i < text.length) {
        setDisplayedText((prev) => prev + text.charAt(i));
        i++;
      } else {
        clearInterval(interval);
      }
    }, 20);
    return () => clearInterval(interval);
  }, [text]);

  return <span>{displayedText}</span>;
};

// Visualizer Component
const Visualizer = ({ isPlaying }: { isPlaying: boolean }) => {
  return (
    <div className="flex items-end gap-1 h-4">
      {[0, 1, 2, 3, 4].map((i) => (
        <motion.div
          key={i}
          animate={isPlaying ? {
            height: [4, 16, 8, 14, 4],
          } : { height: 4 }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            delay: i * 0.1,
            ease: "easeInOut"
          }}
          className="w-1 bg-indigo-400 rounded-full"
        />
      ))}
    </div>
  );
};

export default function App() {
  const [currentPrompt, setCurrentPrompt] = useState<Prompt | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category>('random');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [copied, setCopied] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [currentMusicIndex, setCurrentMusicIndex] = useState(0);
  const [history, setHistory] = useState<Prompt[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [likedPrompts, setLikedPrompts] = useState<Set<string>>(new Set());
  
  const bgMusicRef = useRef<HTMLAudioElement | null>(null);
  const sfxRef = useRef<HTMLAudioElement | null>(null);
  const hoverSfxRef = useRef<HTMLAudioElement | null>(null);

  // Parallax Mouse Effect
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { damping: 50, stiffness: 400 });
  const springY = useSpring(mouseY, { damping: 50, stiffness: 400 });
  const invSpringX = useTransform(springX, (v) => -v);
  const invSpringY = useTransform(springY, (v) => -v);

  const handleMouseMove = (e: React.MouseEvent) => {
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    mouseX.set((clientX / innerWidth - 0.5) * 50);
    mouseY.set((clientY / innerHeight - 0.5) * 50);
  };

  useEffect(() => {
    // Initialize audio
    const initialTrack = BACKGROUND_MUSIC[0];
    const audio = new Audio(initialTrack.url);
    audio.loop = true;
    audio.volume = 0.5;
    audio.preload = 'auto';
    bgMusicRef.current = audio;

    sfxRef.current = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-magic-notification-ring-2359.mp3');
    sfxRef.current.volume = 0.6;

    hoverSfxRef.current = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-modern-click-box-check-2631.mp3');
    hoverSfxRef.current.volume = 0.2;

    return () => {
      audio.pause();
      audio.src = '';
    };
  }, []);

  useEffect(() => {
    const playAudio = async () => {
      if (!bgMusicRef.current) return;
      
      if (!isMuted && !showWelcome) {
        try {
          await bgMusicRef.current.play();
        } catch (err) {
          console.warn("Autoplay blocked or failed, waiting for interaction:", err);
        }
      } else {
        bgMusicRef.current.pause();
      }
    };
    
    playAudio();
  }, [isMuted, showWelcome]);

  const playHoverSfx = () => {
    if (!isMuted && hoverSfxRef.current) {
      hoverSfxRef.current.currentTime = 0;
      hoverSfxRef.current.play().catch(() => {});
    }
  };

  const changeMusic = () => {
    if (!bgMusicRef.current) return;
    
    let nextIndex;
    do {
      nextIndex = Math.floor(Math.random() * BACKGROUND_MUSIC.length);
    } while (nextIndex === currentMusicIndex && BACKGROUND_MUSIC.length > 1);

    setCurrentMusicIndex(nextIndex);
    
    const audio = bgMusicRef.current;
    const targetVolume = 0.5;
    
    // Smooth transition
    const fadeOut = setInterval(() => {
      if (audio.volume > 0.05) {
        audio.volume -= 0.05;
      } else {
        clearInterval(fadeOut);
        
        // Reset and load new source
        audio.pause();
        const nextTrack = BACKGROUND_MUSIC[nextIndex];
        if (nextTrack && nextTrack.url) {
          audio.src = nextTrack.url;
          audio.load();
          
          if (!isMuted) {
            // Wait for metadata to be loaded to avoid "no supported source" error
            const onCanPlay = () => {
              audio.play().then(() => {
                const fadeIn = setInterval(() => {
                  if (audio.volume < targetVolume) {
                    audio.volume = Math.min(targetVolume, audio.volume + 0.05);
                  } else {
                    clearInterval(fadeIn);
                  }
                }, 50);
              }).catch(err => console.error("Play failed after change:", err));
              audio.removeEventListener('canplay', onCanPlay);
            };
            audio.addEventListener('canplay', onCanPlay);
          }
        }
      }
    }, 50);
  };

  const generatePrompt = () => {
    setIsGenerating(true);
    if (!isMuted && sfxRef.current) {
      sfxRef.current.currentTime = 0;
      sfxRef.current.play().catch(() => {});
    }

    changeMusic();

    setTimeout(() => {
      let filtered = PROMPTS;
      if (selectedCategory !== 'random') {
        filtered = PROMPTS.filter(p => p.category === selectedCategory);
      }
      
      const randomIndex = Math.floor(Math.random() * filtered.length);
      const newPrompt = filtered[randomIndex];
      
      setCurrentPrompt(newPrompt);
      setHistory(prev => [newPrompt, ...prev].slice(0, 20));
      setIsGenerating(false);
      setCopied(false);
    }, 800);
  };

  const copyToClipboard = () => {
    if (currentPrompt) {
      navigator.clipboard.writeText(currentPrompt.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const toggleLike = (id: string) => {
    setLikedPrompts(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const startApp = () => {
    setShowWelcome(false);
    setIsMuted(false);
  };

  if (showWelcome) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 p-6 relative overflow-hidden" onMouseMove={handleMouseMove}>
        {/* Parallax Background Blobs */}
        <motion.div 
          style={{ x: springX, y: springY }}
          className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/20 blur-[120px] rounded-full" 
        />
        <motion.div 
          style={{ x: invSpringX, y: invSpringY }}
          className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-pink-600/20 blur-[120px] rounded-full" 
        />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center z-10 max-w-2xl"
        >
          <motion.div
            animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
            transition={{ duration: 5, repeat: Infinity }}
            className="inline-block mb-6"
          >
            <Sparkles className="w-20 h-20 text-indigo-400 drop-shadow-[0_0_15px_rgba(129,140,248,0.5)]" />
          </motion.div>
          
          <h1 className="text-6xl md:text-8xl font-display font-bold mb-6 tracking-tighter leading-none">
            AI <span className="gradient-text">PROMPT</span><br/>GENERATOR
          </h1>
          
          <p className="text-xl text-slate-400 mb-12 font-sans max-w-lg mx-auto">
            The ultimate creative engine for AI artists, writers, and builders. 
            Instant inspiration, active vibes.
          </p>
          
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onMouseEnter={playHoverSfx}
            onClick={startApp}
            className="group relative px-10 py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full font-bold text-xl transition-all duration-300 shadow-2xl shadow-indigo-500/40 flex items-center gap-3 mx-auto"
          >
            START EXPLORING
            <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 font-sans selection:bg-indigo-500/30 overflow-hidden relative" onMouseMove={handleMouseMove}>
      
      {/* Parallax Background */}
      <motion.div 
        style={{ x: springX, y: springY }}
        className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-30"
      >
        <div className="absolute top-[20%] left-[10%] w-64 h-64 bg-indigo-500/20 blur-[100px] rounded-full" />
        <div className="absolute bottom-[20%] right-[10%] w-96 h-96 bg-purple-500/20 blur-[120px] rounded-full" />
      </motion.div>

      {/* Header */}
      <header className="p-6 flex justify-between items-center max-w-7xl mx-auto relative z-20">
        <div className="flex items-center gap-2 group cursor-pointer">
          <motion.div whileHover={{ rotate: 180 }} transition={{ duration: 0.5 }}>
            <Sparkles className="w-8 h-8 text-indigo-400" />
          </motion.div>
          <span className="font-display font-bold text-2xl tracking-tighter">PROMPTGEN</span>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Now Playing Indicator */}
          {!showWelcome && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="hidden md:flex items-center gap-3 glass px-4 py-2 rounded-full border-white/10"
            >
              <Visualizer isPlaying={!isMuted} />
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest leading-none mb-1">Now Playing</span>
                <span className="text-xs font-bold text-slate-100 truncate max-w-[120px]">
                  {BACKGROUND_MUSIC[currentMusicIndex].title}
                </span>
              </div>
              <button 
                onClick={changeMusic}
                onMouseEnter={playHoverSfx}
                className="p-1.5 hover:bg-white/10 rounded-full transition-colors text-slate-400 hover:text-white"
                title="Skip Track"
              >
                <SkipForward className="w-4 h-4" />
              </button>
            </motion.div>
          )}

          <button 
            onMouseEnter={playHoverSfx}
            onClick={() => setShowHistory(true)}
            className="p-3 glass rounded-full hover:bg-white/20 transition-colors relative"
          >
            <History className="w-5 h-5" />
            {history.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-indigo-500 rounded-full text-[10px] flex items-center justify-center font-bold">
                {history.length}
              </span>
            )}
          </button>
          <button 
            onMouseEnter={playHoverSfx}
            onClick={() => setIsMuted(!isMuted)}
            className="p-3 glass rounded-full hover:bg-white/20 transition-colors"
          >
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8 flex flex-col items-center justify-center min-h-[80vh] relative z-10">
        
        {/* Category Selector */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {CATEGORIES.map((cat) => {
            const Icon = iconMap[cat.icon as keyof typeof iconMap];
            const isActive = selectedCategory === cat.id;
            
            return (
              <motion.button
                key={cat.id}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onMouseEnter={playHoverSfx}
                onClick={() => setSelectedCategory(cat.id as Category)}
                className={`
                  flex items-center gap-2 px-5 py-2.5 rounded-full border transition-all duration-300
                  ${isActive 
                    ? `bg-gradient-to-r ${cat.color} border-transparent shadow-xl shadow-indigo-500/20 scale-105` 
                    : 'glass border-white/10 hover:border-white/30 text-slate-400 hover:text-white'}
                `}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm font-bold tracking-wide uppercase">{cat.label}</span>
              </motion.button>
            );
          })}
        </div>

        {/* Prompt Display Area */}
        <div className="w-full relative min-h-[400px] flex items-center justify-center perspective-1000">
          <AnimatePresence mode="wait">
            {!currentPrompt && !isGenerating ? (
              <motion.div
                key="placeholder"
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 1.1, y: -20 }}
                className="text-center"
              >
                <motion.div 
                  animate={{ y: [0, -15, 0], rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="w-32 h-32 bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-indigo-500/20 shadow-[0_0_50px_rgba(99,102,241,0.1)]"
                >
                  <Sparkles className="w-14 h-14 text-indigo-400" />
                </motion.div>
                <h2 className="text-3xl font-display font-bold text-slate-200 tracking-tight">READY FOR A REEL OF IDEAS?</h2>
                <p className="text-slate-500 mt-3 text-lg">Pick a vibe and let the AI surprise you.</p>
              </motion.div>
            ) : isGenerating ? (
              <motion.div
                key="generating"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.2 }}
                className="flex flex-col items-center gap-6"
              >
                <div className="relative w-24 h-24">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      animate={{ 
                        scale: [1, 1.5, 1],
                        opacity: [0.5, 1, 0.5],
                        rotate: [0, 180, 360]
                      }}
                      transition={{ 
                        duration: 2, 
                        repeat: Infinity, 
                        delay: i * 0.4,
                        ease: "easeInOut"
                      }}
                      className="absolute inset-0 border-2 border-indigo-500 rounded-full"
                      style={{ borderStyle: i === 1 ? 'dashed' : 'solid' }}
                    />
                  ))}
                  <Sparkles className="absolute inset-0 m-auto w-8 h-8 text-indigo-400 animate-pulse" />
                </div>
                <span className="text-indigo-400 font-bold text-xl tracking-widest uppercase animate-pulse">CRAFTING MAGIC...</span>
              </motion.div>
            ) : (
              <motion.div
                key={currentPrompt?.id}
                initial={{ opacity: 0, y: 100, rotateX: -30, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
                exit={{ opacity: 0, y: -100, rotateX: 30, scale: 0.8 }}
                transition={{ type: 'spring', damping: 15, stiffness: 100 }}
                className="w-full max-w-3xl"
              >
                <div className="glass p-10 md:p-16 rounded-[2.5rem] relative overflow-hidden group shadow-2xl shadow-indigo-500/10 border-white/20">
                  {/* Active Background for Card */}
                  <motion.div 
                    animate={{ 
                      scale: [1, 1.2, 1],
                      opacity: [0.1, 0.2, 0.1]
                    }}
                    transition={{ duration: 8, repeat: Infinity }}
                    className={`absolute -top-20 -right-20 w-64 h-64 bg-gradient-to-br ${CATEGORIES.find(c => c.id === currentPrompt?.category)?.color} blur-[80px]`} 
                  />
                  
                  <div className="flex justify-between items-center mb-8">
                    <span className="px-4 py-1.5 rounded-full bg-white/5 text-xs font-black uppercase tracking-[0.2em] text-indigo-400 border border-white/10">
                      {currentPrompt?.category}
                    </span>
                    <div className="flex gap-2">
                      <motion.button
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.8 }}
                        onClick={() => toggleLike(currentPrompt!.id)}
                        className={`p-2 rounded-full transition-colors ${likedPrompts.has(currentPrompt!.id) ? 'text-pink-500' : 'text-slate-500 hover:text-white'}`}
                      >
                        <Heart className={`w-6 h-6 ${likedPrompts.has(currentPrompt!.id) ? 'fill-current' : ''}`} />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.8 }}
                        className="p-2 rounded-full text-slate-500 hover:text-white transition-colors"
                      >
                        <Share2 className="w-6 h-6" />
                      </motion.button>
                    </div>
                  </div>

                  <h3 className="text-3xl md:text-4xl font-display font-bold leading-[1.3] text-slate-100 tracking-tight">
                    <TypingText text={currentPrompt!.text} />
                  </h3>

                  <div className="mt-12 flex flex-wrap gap-4">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onMouseEnter={playHoverSfx}
                      onClick={copyToClipboard}
                      className="flex-1 min-w-[160px] flex items-center justify-center gap-3 px-8 py-4 glass rounded-2xl hover:bg-white/20 transition-all border-white/10"
                    >
                      {copied ? (
                        <>
                          <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                          <span className="text-emerald-400 font-bold uppercase tracking-wider">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-6 h-6" />
                          <span className="font-bold uppercase tracking-wider">Copy Prompt</span>
                        </>
                      )}
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onMouseEnter={playHoverSfx}
                      onClick={generatePrompt}
                      className="flex-1 min-w-[160px] flex items-center justify-center gap-3 px-8 py-4 bg-white text-slate-950 rounded-2xl hover:bg-slate-200 transition-all font-black uppercase tracking-wider shadow-lg"
                    >
                      <RefreshCw className="w-6 h-6" />
                      <span>Next Reel</span>
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Main Action Button (if no prompt yet) */}
        {!currentPrompt && !isGenerating && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(79, 70, 229, 0.4)" }}
            whileTap={{ scale: 0.95 }}
            onMouseEnter={playHoverSfx}
            onClick={generatePrompt}
            className="mt-12 px-12 py-6 bg-indigo-600 text-white rounded-full font-black text-2xl shadow-2xl shadow-indigo-600/30 transition-all flex items-center gap-4 group"
          >
            <RefreshCw className="w-7 h-7 group-hover:rotate-180 transition-transform duration-500" />
            GENERATE MAGIC
          </motion.button>
        )}
      </main>

      {/* History Sidebar */}
      <AnimatePresence>
        {showHistory && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowHistory(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 w-full max-w-md h-full bg-slate-900 border-l border-white/10 z-50 p-8 overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-10">
                <h2 className="text-3xl font-display font-bold tracking-tighter">HISTORY</h2>
                <button onClick={() => setShowHistory(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>

              {history.length === 0 ? (
                <div className="text-center py-20 opacity-30">
                  <History className="w-16 h-16 mx-auto mb-4" />
                  <p className="text-xl font-bold">NO HISTORY YET</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {history.map((item, idx) => (
                    <motion.div 
                      key={idx}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="glass p-6 rounded-2xl group cursor-pointer hover:border-indigo-500/50 transition-colors"
                      onClick={() => {
                        setCurrentPrompt(item);
                        setShowHistory(false);
                      }}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">{item.category}</span>
                        {likedPrompts.has(item.id) && <Heart className="w-3 h-3 text-pink-500 fill-current" />}
                      </div>
                      <p className="text-sm text-slate-300 line-clamp-3 font-medium leading-relaxed">{item.text}</p>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="p-8 text-center text-slate-600 text-xs font-bold uppercase tracking-[0.3em] relative z-10">
        <p>© 2026 PROMPTGEN // SPARK THE FUTURE</p>
      </footer>
    </div>
  );
}
