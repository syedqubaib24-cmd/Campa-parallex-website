
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { DRINK_VARIANTS } from './constants';
import { DrinkVariant, ThemeMode } from './types';
import LoadingOverlay from './components/LoadingOverlay';
import Navbar from './components/Navbar';

const App: React.FC = () => {
  const [variantIndex, setVariantIndex] = useState(0);
  const [mode, setMode] = useState<ThemeMode>('dark');
  const [loading, setLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);
  const [activeSection, setActiveSection] = useState('product');
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const framesRef = useRef<HTMLImageElement[]>([]);
  const currentVariant = DRINK_VARIANTS[variantIndex];
  
  // Preload frames for the current variant
  const preloadFrames = useCallback(async (variant: DrinkVariant) => {
    setLoading(true);
    setLoadProgress(0);
    const loadedFrames: HTMLImageElement[] = [];
    let loadedCount = 0;

    const loadImage = (index: number): Promise<HTMLImageElement> => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        // Construct frame filename: e.g. frame_00_delay-0.1s.webp, frame_01_delay-0.1s.webp ...
        const frameNum = index.toString().padStart(2, '0');
        img.src = `${variant.baseUrl}${frameNum}_delay-0.1s.webp`;
        img.onload = () => {
          loadedCount++;
          setLoadProgress((loadedCount / variant.frameCount) * 100);
          resolve(img);
        };
        img.onerror = () => {
          // If a frame fails, we still want to resolve to keep progress going
          console.error(`Failed to load frame ${index}`);
          resolve(img);
        };
      });
    };

    const promises = [];
    for (let i = 0; i < variant.frameCount; i++) {
      promises.push(loadImage(i));
    }

    const images = await Promise.all(promises);
    framesRef.current = images;
    setLoading(false);
    
    // Initial draw
    drawFrame(0);
  }, []);

  const drawFrame = (index: number) => {
    const canvas = canvasRef.current;
    if (!canvas || framesRef.current.length === 0) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = framesRef.current[index];
    if (!img) return;

    // Cover behavior
    const canvasAspect = canvas.width / canvas.height;
    const imgAspect = img.width / img.height;
    let drawWidth, drawHeight, offsetX, offsetY;

    if (canvasAspect > imgAspect) {
      drawWidth = canvas.width;
      drawHeight = canvas.width / imgAspect;
      offsetX = 0;
      offsetY = (canvas.height - drawHeight) / 2;
    } else {
      drawWidth = canvas.height * imgAspect;
      drawHeight = canvas.height;
      offsetX = (canvas.width - drawWidth) / 2;
      offsetY = 0;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
  };

  useEffect(() => {
    preloadFrames(currentVariant);
  }, [variantIndex, preloadFrames]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const scrollMax = document.documentElement.scrollHeight - windowHeight;
      
      // Calculate active section
      const sections = ['product', 'ingredients', 'nutrition', 'reviews', 'faq', 'contact'];
      for (const section of sections) {
        const el = document.getElementById(section);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 100 && rect.bottom >= 100) {
            setActiveSection(section);
          }
        }
      }

      // Sync canvas frame with scroll
      // We only care about the hero parallax (0 to 100vh range)
      const scrollPercent = Math.min(scrollY / windowHeight, 1);
      const frameIndex = Math.floor(scrollPercent * (currentVariant.frameCount - 1));
      drawFrame(frameIndex);
    };

    const handleResize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
        drawFrame(0);
      }
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleResize);
    handleResize();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, [currentVariant]);

  const handleVariantChange = (dir: 'next' | 'prev') => {
    if (loading || isTransitioning) return;
    
    setIsTransitioning(true);
    setTimeout(() => {
      if (dir === 'next') {
        setVariantIndex((prev) => (prev + 1) % DRINK_VARIANTS.length);
      } else {
        setVariantIndex((prev) => (prev - 1 + DRINK_VARIANTS.length) % DRINK_VARIANTS.length);
      }
      setIsTransitioning(false);
    }, 500);
  };

  const textClass = mode === 'dark' ? 'text-white' : 'text-black';
  const bgClass = mode === 'dark' ? 'bg-black' : 'bg-[#f8f8f8]';

  return (
    <div className={`transition-colors duration-700 ${bgClass} ${textClass}`}>
      {loading && <LoadingOverlay progress={loadProgress} variantName={currentVariant.subtitle} />}
      
      <Navbar mode={mode} setMode={setMode} activeSection={activeSection} themeColor={currentVariant.themeColor} />

      {/* Hero Section */}
      <section className="relative h-[100vh] w-full overflow-hidden">
        <canvas 
          ref={canvasRef} 
          className="absolute inset-0 z-0 pointer-events-none opacity-80"
        />

        <div className="relative z-10 h-full flex items-center px-12 md:px-24">
          {/* Left Content */}
          <div className={`max-w-xl transition-all duration-500 ${isTransitioning ? 'opacity-0 -translate-x-10' : 'opacity-100 translate-x-0'}`}>
            <h1 className="text-8xl md:text-[10rem] font-black tracking-tighter leading-none mb-0">
              {currentVariant.name}
            </h1>
            <h2 className="text-4xl md:text-6xl font-light tracking-widest uppercase mb-8 opacity-80">
              {currentVariant.subtitle}
            </h2>
            <p className="text-lg md:text-xl font-light leading-relaxed mb-10 opacity-60">
              {currentVariant.description}
            </p>
            <div className="flex gap-4">
              <button 
                className="px-10 py-4 rounded-full border border-current text-xs uppercase tracking-widest font-bold hover:bg-white hover:text-black transition-all"
              >
                Add To
              </button>
              <button 
                style={{ backgroundColor: currentVariant.themeColor }}
                className="px-10 py-4 rounded-full text-black text-xs uppercase tracking-widest font-bold shadow-xl hover:scale-105 transition-all"
              >
                Cart
              </button>
            </div>
          </div>

          {/* Right Navigation */}
          <div className="absolute right-12 md:right-24 top-1/2 -translate-y-1/2 flex items-center gap-12">
             <div className="flex flex-col items-center gap-4 group">
               <button 
                onClick={() => handleVariantChange('prev')}
                className="flex flex-col items-center gap-1 opacity-40 hover:opacity-100 transition-opacity"
               >
                 <span className="text-[10px] tracking-[0.4em] font-bold rotate-90 mb-4 uppercase">Prev</span>
                 <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
               </button>
               
               <div className="w-[1px] h-32 bg-current opacity-20 relative">
                  <div 
                    className="absolute top-0 left-0 w-full transition-all duration-500"
                    style={{ 
                      height: '33.33%', 
                      backgroundColor: currentVariant.themeColor,
                      transform: `translateY(${variantIndex * 100}%)`
                    }}
                  />
               </div>

               <button 
                onClick={() => handleVariantChange('next')}
                className="flex flex-col items-center gap-1 opacity-40 hover:opacity-100 transition-opacity"
               >
                 <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                 <span className="text-[10px] tracking-[0.4em] font-bold rotate-90 mt-4 uppercase">Next</span>
               </button>
             </div>

             <div className="text-8xl md:text-[14rem] font-black opacity-10 select-none">
                0{variantIndex + 1}
             </div>
          </div>
        </div>

        {/* Social Icons Bottom Center */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex gap-8 z-20 opacity-40 hover:opacity-100 transition-opacity">
           <a href="#" className="hover:scale-110 transition-transform"><svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg></a>
           <a href="#" className="hover:scale-110 transition-transform"><svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg></a>
           <a href="#" className="hover:scale-110 transition-transform"><svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/></svg></a>
        </div>
      </section>

      {/* Content Sections */}
      <div className="relative z-30 pt-20">
        
        {/* Product Section */}
        <section id="product" className="min-h-screen px-12 md:px-24 py-32 flex flex-col md:flex-row items-center gap-16">
          <div className="flex-1">
            <h3 className="text-sm uppercase tracking-[0.5em] mb-4 font-bold" style={{ color: currentVariant.themeColor }}>The Original Indian Soda</h3>
            <h2 className="text-6xl md:text-7xl font-black mb-8">Nostalgia In <br/>Every Sip.</h2>
            <p className="text-xl opacity-60 font-light max-w-lg mb-12">
              Campa is more than just a drink; it's a legacy. Born from the vibrant culture of India, reimagined for the modern connoisseur. Our unique blend of natural botanicals and crisp carbonation delivers a refreshment that is both timeless and trendsetting.
            </p>
            <div className="grid grid-cols-2 gap-8">
              <div>
                <p className="text-4xl font-black mb-2">0%</p>
                <p className="text-xs uppercase tracking-widest opacity-40">Artificial Flavors</p>
              </div>
              <div>
                <p className="text-4xl font-black mb-2">100%</p>
                <p className="text-xs uppercase tracking-widest opacity-40">Natural Spark</p>
              </div>
            </div>
          </div>
          <div className="flex-1 w-full flex justify-center">
             <div className="relative w-full aspect-square max-w-md rounded-3xl overflow-hidden group">
                <img src={`https://picsum.photos/seed/${variantIndex}1/800/800`} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" alt="Soda Product" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-8">
                  <p className="text-sm font-bold tracking-widest uppercase">Premium Craft Soda</p>
                </div>
             </div>
          </div>
        </section>

        {/* Ingredients Section */}
        <section id="ingredients" className="px-12 md:px-24 py-32 bg-current/5">
          <div className="text-center mb-24">
            <h2 className="text-5xl md:text-7xl font-black mb-4">Pure Ingredients.</h2>
            <p className="opacity-50 tracking-widest uppercase text-xs">Only the best goes into Campa</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
             {[
               { title: "Sparkling Water", desc: "Sourced from pristine springs, filtered for clarity." },
               { title: "Natural Cane Sugar", desc: "Just the right amount of sweetness from pure sources." },
               { title: "Essential Oils", desc: "Citrus peels and botanical extracts for complex flavor." }
             ].map((ing, i) => (
               <div key={i} className="p-12 rounded-3xl border border-current/10 hover:border-current/40 transition-colors">
                 <div className="w-12 h-12 mb-8 rounded-full flex items-center justify-center font-black text-xl border border-current" style={{ borderColor: currentVariant.themeColor, color: currentVariant.themeColor }}>
                   0{i+1}
                 </div>
                 <h4 className="text-2xl font-bold mb-4">{ing.title}</h4>
                 <p className="opacity-60 font-light leading-relaxed">{ing.desc}</p>
               </div>
             ))}
          </div>
        </section>

        {/* Nutrition Section */}
        <section id="nutrition" className="min-h-screen px-12 md:px-24 py-32 flex flex-col md:flex-row items-center gap-24">
           <div className="flex-1 order-2 md:order-1">
             <div className={`p-10 border-4 border-current max-w-md mx-auto ${mode === 'dark' ? 'bg-white text-black' : 'bg-black text-white'}`}>
                <h3 className="text-4xl font-black border-b-8 border-current pb-2 mb-2">Nutrition Facts</h3>
                <p className="border-b-2 border-current pb-1 mb-4">Serving size 1 can (330ml)</p>
                <div className="flex justify-between items-end border-b-8 border-current mb-4">
                   <div className="font-black">
                     <p className="text-xs">Amount per serving</p>
                     <p className="text-3xl">Calories</p>
                   </div>
                   <p className="text-4xl font-black">120</p>
                </div>
                <div className="space-y-2 font-bold">
                   <div className="flex justify-between border-b border-current py-1"><p>Total Fat 0g</p><p>0%</p></div>
                   <div className="flex justify-between border-b border-current py-1"><p>Sodium 35mg</p><p>2%</p></div>
                   <div className="flex justify-between border-b border-current py-1"><p>Total Carbohydrate 31g</p><p>11%</p></div>
                   <div className="flex justify-between border-b border-current py-1 pl-4 font-normal italic"><p>Total Sugars 30g</p></div>
                   <div className="flex justify-between border-b-8 border-current py-1 pl-8 font-normal"><p>Includes 30g Added Sugars</p><p>60%</p></div>
                   <div className="flex justify-between py-1"><p>Protein 0g</p><p>0%</p></div>
                </div>
             </div>
           </div>
           <div className="flex-1 order-1 md:order-2">
              <h2 className="text-6xl font-black mb-8">Transparent <br/>Labeling.</h2>
              <p className="text-xl opacity-60 font-light mb-8">
                We believe you should know exactly what's in your drink. No hidden chemicals, no misleading claims. Just honest ingredients for an honest refreshment.
              </p>
              <ul className="space-y-4 font-bold uppercase tracking-widest text-sm">
                <li className="flex items-center gap-4"><span className="w-2 h-2 rounded-full" style={{ backgroundColor: currentVariant.themeColor }}></span> Non-GMO Verified</li>
                <li className="flex items-center gap-4"><span className="w-2 h-2 rounded-full" style={{ backgroundColor: currentVariant.themeColor }}></span> Gluten Free</li>
                <li className="flex items-center gap-4"><span className="w-2 h-2 rounded-full" style={{ backgroundColor: currentVariant.themeColor }}></span> Vegan Certified</li>
              </ul>
           </div>
        </section>

        {/* Reviews Section */}
        <section id="reviews" className="px-12 md:px-24 py-32 bg-current/5 overflow-hidden">
           <div className="flex flex-col md:flex-row items-end justify-between mb-24 gap-8">
              <h2 className="text-7xl md:text-8xl font-black tracking-tighter">Loved By <br/>Legends.</h2>
              <p className="text-xl max-w-sm opacity-60 font-light">Trusted by athletes, artists, and everyone in between.</p>
           </div>
           <div className="flex gap-12 overflow-x-auto pb-12 snap-x no-scrollbar">
             {[1,2,3,4].map((n) => (
               <div key={n} className="min-w-[350px] p-12 bg-current/5 rounded-3xl snap-center border border-current/10">
                 <div className="flex gap-1 mb-8">
                   {[...Array(5)].map((_, i) => (
                     <svg key={i} className="w-4 h-4 fill-current" style={{ color: currentVariant.themeColor }} viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                   ))}
                 </div>
                 <p className="text-xl font-light mb-8 italic">"The perfect companion for a sunny afternoon. Campa brings back so many memories but feels completely fresh and modern."</p>
                 <div className="flex items-center gap-4">
                   <div className="w-12 h-12 rounded-full overflow-hidden grayscale">
                      <img src={`https://picsum.photos/seed/${n+10}/100/100`} alt="user" />
                   </div>
                   <div>
                     <p className="font-bold">Rahul Verma</p>
                     <p className="text-xs uppercase tracking-widest opacity-40">Verified Buyer</p>
                   </div>
                 </div>
               </div>
             ))}
           </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="px-12 md:px-24 py-32 max-w-4xl mx-auto">
          <h2 className="text-5xl font-black mb-16 text-center">Frequently Asked.</h2>
          <div className="space-y-4">
            {[
              { q: "Where can I find Campa?", a: "Campa is available at leading retailers across India and can be ordered directly from our website." },
              { q: "Is Campa suitable for vegans?", a: "Yes, all our variants are 100% vegan certified and contain no animal products." },
              { q: "What is the shelf life?", a: "Campa is best enjoyed within 12 months of the manufacturing date." },
              { q: "Are the cans recyclable?", a: "Absolutely. We use 100% recyclable aluminum for all our packaging." }
            ].map((item, i) => (
              <details key={i} className="group border border-current/10 rounded-2xl">
                <summary className="p-8 font-bold text-lg cursor-pointer flex justify-between items-center list-none uppercase tracking-widest text-sm">
                  {item.q}
                  <span className="transition-transform group-open:rotate-180">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </span>
                </summary>
                <div className="p-8 pt-0 opacity-60 font-light leading-relaxed">
                  {item.a}
                </div>
              </details>
            ))}
          </div>
        </section>

        {/* Contact / Final CTA */}
        <section id="contact" className="px-12 md:px-24 py-48 text-center bg-black text-white">
           <div className="max-w-4xl mx-auto">
              <h2 className="text-7xl md:text-9xl font-black tracking-tighter mb-12">THIRST FOR <br/>LEGACY?</h2>
              <p className="text-2xl font-light opacity-60 mb-16">Join the movement and be the first to know about new flavors and limited drops.</p>
              <div className="flex flex-col md:flex-row gap-4 justify-center">
                 <input type="email" placeholder="YOUR EMAIL" className="px-10 py-5 rounded-full bg-white/10 border border-white/20 text-white w-full md:w-96 focus:outline-none focus:border-white transition-colors" />
                 <button className="px-12 py-5 rounded-full bg-white text-black font-black uppercase tracking-widest hover:scale-105 transition-all">Subscribe</button>
              </div>
           </div>
        </section>

        {/* Footer */}
        <footer className="px-12 md:px-24 py-12 bg-black text-white border-t border-white/10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="text-2xl font-black tracking-tighter">CAMPA</div>
            <div className="flex gap-12 text-[10px] uppercase tracking-[0.3em] font-bold opacity-40">
              <a href="#" className="hover:opacity-100 transition-opacity">About</a>
              <a href="#" className="hover:opacity-100 transition-opacity">Contact</a>
              <a href="#" className="hover:opacity-100 transition-opacity">Privacy</a>
              <a href="#" className="hover:opacity-100 transition-opacity">Terms</a>
            </div>
            <p className="text-[10px] uppercase tracking-[0.2em] font-bold opacity-20">© 2024 Campa Beverage Co. All rights reserved.</p>
          </div>
        </footer>

      </div>
    </div>
  );
};

export default App;
