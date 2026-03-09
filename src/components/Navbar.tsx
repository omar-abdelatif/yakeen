import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';

export default function Navbar() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [showInstallBtn, setShowInstallBtn] = useState(false);

    useEffect(() => {
        setMounted(true);

        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e);
            setShowInstallBtn(true);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        };
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            setShowInstallBtn(false);
        }
        setDeferredPrompt(null);
    };

    return (
        <header className="fixed top-0 left-0 z-50 w-full border-b border-primary/20 bg-white/80 dark:bg-surface-dark/80 backdrop-blur-md px-4 lg:px-40 py-3 transition-all">
            <div className="max-w-[1200px] mx-auto flex items-center justify-between gap-4">
                <Link href="/" className="flex items-center gap-3 text-primary">
                    <div className="size-8 bg-primary rounded-lg flex items-center justify-center text-white">
                        <span className="material-symbols-outlined text-2xl font-black">star_half</span>
                    </div>
                    <h2 className="text-xl font-bold leading-tight tracking-tight">يقين</h2>
                </Link>
                
                <nav className="hidden md:flex items-center gap-8">
                    <Link className="text-slate-600 dark:text-slate-300 hover:text-primary transition-colors text-sm font-medium" href="/">الرئيسية</Link>
                    <Link className="text-slate-600 dark:text-slate-300 hover:text-primary transition-colors text-sm font-medium" href="/quran">القرآن</Link>
                    <Link className="text-slate-600 dark:text-slate-300 hover:text-primary transition-colors text-sm font-medium" href="/azkar">الأذكار</Link>
                    <Link className="text-slate-600 dark:text-slate-300 hover:text-primary transition-colors text-sm font-medium" href="/duas">الأدعية</Link>
                    <Link className="text-slate-600 dark:text-slate-300 hover:text-primary transition-colors text-sm font-medium" href="/imsakiya">الإمساكية</Link>
                    <Link className="text-slate-600 dark:text-slate-300 hover:text-primary transition-colors text-sm font-medium" href="/qibla">القبلة</Link>
                </nav>

                <div className="flex items-center gap-4">
                    {showInstallBtn && (
                        <button 
                            onClick={handleInstallClick}
                            className="flex md:hidden items-center gap-2 px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-bold shadow-sm shadow-primary/20"
                        >
                            <span className="material-symbols-outlined text-sm">download</span>
                            تثبيت
                        </button>
                    )}
                    <button 
                        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                        className="p-2 rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all duration-300"
                        title="Togle Theme"
                    >
                        <span className="material-symbols-outlined">
                            {mounted ? (theme === 'dark' ? 'light_mode' : 'dark_mode') : 'light_mode'}
                        </span>
                    </button>
                </div>
            </div>
        </header>
    );
}

