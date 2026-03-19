export function Footer() {
  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  return (
    <footer className="bg-carbon text-parchment rounded-t-[2rem] md:rounded-t-[4rem] px-6 py-12 md:px-12 md:py-24 mt-0 relative z-10 w-full overflow-hidden">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-end gap-8 md:gap-12 mb-12 md:mb-24">

        <div>
          <h2 className="font-baskerville italic text-[2.5rem] md:text-[4rem] leading-none mb-4 text-parchment">riivo</h2>
          <p className="font-mono text-xs text-parchment/60 uppercase tracking-[0.2em] max-w-xs">
            Newton's favourite snack. riivo's weekly ritual.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <button onClick={() => scrollToSection('selection')} className="font-mono text-sm uppercase tracking-widest text-parchment/80 hover:text-mustard transition-colors text-left">Today's Selection</button>
          <button onClick={() => scrollToSection('archive')} className="font-mono text-sm uppercase tracking-widest text-parchment/80 hover:text-mustard transition-colors text-left">The Archive</button>
          <button onClick={() => scrollToSection('foryou')} className="font-mono text-sm uppercase tracking-widest text-parchment/80 hover:text-mustard transition-colors text-left">For You</button>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
          <span className="font-mono text-xs text-parchment/60 uppercase tracking-widest">System Operational</span>
        </div>
      </div>

      <div className="relative pt-8 max-w-7xl mx-auto text-center">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-parchment/10" />
        <p className="font-mono text-[10px] text-parchment/40 uppercase tracking-widest">
          A riivo product. Est. every Friday at noon.
        </p>
      </div>
    </footer>
  );
}
