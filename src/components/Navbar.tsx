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
        <>
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
                        <Link className="text-slate-600 dark:text-slate-300 hover:text-primary transition-colors text-sm font-medium" href="/khatma">الختمة</Link>
                    </nav>

                    <div className="flex items-center gap-4">
                        <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="p-2 rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all duration-300" title="Toggle Theme">
                            <span className="material-symbols-outlined">
                                {mounted ? (theme === 'dark' ? 'light_mode' : 'dark_mode') : 'light_mode'}
                            </span>
                        </button>
                    </div>
                </div>
            </header>

            {/* PWA Install Alert Box */}
            {showInstallBtn && (
                <div className="fixed bottom-6 left-6 right-6 z-[100] md:left-auto md:right-10 md:w-96 animate-in slide-in-from-bottom duration-500">
                    <div className="bg-white dark:bg-surface-dark border-2 border-primary/30 p-5 rounded-2xl shadow-2xl shadow-primary/20 flex flex-col gap-4 text-right" dir="rtl">
                        <div className="flex items-start justify-between gap-4">
                            <div className="size-10 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                                <span className="material-symbols-outlined text-primary">install_mobile</span>
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-slate-900 dark:text-white">تثبيت تطبيق يقين</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">يقين متوفر الآن كتطبيق! قم بتثبيته على شاشتك الرئيسية للوصول السريع لجميع خدماتنا.</p>
                            </div>
                            <button onClick={() => setShowInstallBtn(false)} className="text-slate-400 hover:text-red-500 transition-colors">
                                <span className="material-symbols-outlined text-sm">close</span>
                            </button>
                        </div>
                        <div className="flex gap-3">
                            <button 
                                onClick={handleInstallClick}
                                className="flex-1 py-2.5 bg-primary text-white rounded-xl font-bold text-sm shadow-lg shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all"
                            >
                                تثبيت الآن
                            </button>
                            <button 
                                onClick={() => setShowInstallBtn(false)}
                                className="px-4 py-2.5 bg-slate-100 dark:bg-white/5 text-slate-500 rounded-xl font-bold text-sm"
                            >
                                ليس الآن
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}


