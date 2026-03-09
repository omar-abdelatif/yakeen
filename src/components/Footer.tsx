import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function Footer() {
    const [showTopBtn, setShowTopBtn] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 400) {
                setShowTopBtn(true);
            } else {
                setShowTopBtn(false);
            }
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <>
            {/* Scroll to Top Button */}
            <button 
                onClick={scrollToTop}
                className={`fixed bottom-24 right-6 md:bottom-10 md:right-10 z-[60] size-12 md:size-14 rounded-full bg-primary text-white shadow-2xl shadow-primary/40 flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 ${showTopBtn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`}
            >
                <span className="material-symbols-outlined text-3xl">keyboard_arrow_up</span>
            </button>
            {/* Desktop & General Footer */}
            <footer className="bg-white dark:bg-surface-dark border-t border-slate-200 dark:border-border-dark py-12 px-6 md:px-20 lg:px-40 mt-12 hidden md:block">
                <div className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 text-right" dir="rtl">
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-3 text-primary mb-2">
                            <span className="material-symbols-outlined text-4xl">star_half</span>
                            <h2 className="text-slate-900 dark:text-white text-2xl font-black">يقين</h2>
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-sm">
                            يقين هو دليلك الروحي الرقمي في رمضان وطوال العام، يقدم لك أدق مواقيت الصلاة والمحتوى الديني الموثوق.
                        </p>
                    </div>
                    <div>
                        <h4 className="text-slate-900 dark:text-white font-bold mb-6">روابط سريعة</h4>
                        <ul className="flex flex-col gap-4 text-slate-500 dark:text-slate-400 text-sm">
                            <li><Link className="hover:text-primary transition-colors" href="/quran">القرآن الكريم</Link></li>
                            <li><Link className="hover:text-primary transition-colors" href="/azkar">الأذكار</Link></li>
                            <li><Link className="hover:text-primary transition-colors" href="/imsakiya">إمساكية رمضان</Link></li>
                            <li><Link className="hover:text-primary transition-colors" href="/qibla">اتجاه القبلة</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-slate-900 dark:text-white font-bold mb-6">المزيد</h4>
                        <ul className="flex flex-col gap-4 text-slate-500 dark:text-slate-400 text-sm">
                            <li><Link className="hover:text-primary transition-colors" href="/about">عن التطبيق</Link></li>
                            <li><Link className="hover:text-primary transition-colors" href="/privacy">سياسة الخصوصية</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-slate-900 dark:text-white font-bold mb-6">تواصل معنا</h4>
                        <div className="flex gap-4 justify-start">
                            <button className="size-10 rounded-full bg-slate-100 dark:bg-background-dark text-slate-600 dark:text-slate-300 flex items-center justify-center hover:bg-primary hover:text-white transition-all duration-300">
                                <span className="material-symbols-outlined text-lg">public</span>
                            </button>
                            <button className="size-10 rounded-full bg-slate-100 dark:bg-background-dark text-slate-600 dark:text-slate-300 flex items-center justify-center hover:bg-primary hover:text-white transition-all duration-300">
                                <span className="material-symbols-outlined text-lg">alternate_email</span>
                            </button>
                        </div>
                    </div>
                </div>
                <div className="max-w-[1200px] mx-auto pt-8 mt-12 border-t border-slate-100 dark:border-border-dark flex flex-col md:flex-row justify-between items-center gap-4 text-slate-400 text-xs">
                    <p>© 2026 جميع الحقوق محفوظة لـ يقين</p>
                    <span>صنع بـ ❤️ لخدمة الإسلام</span>
                </div>
            </footer>

            {/* Mobile Bottom Navigation */}
            <nav className="md:hidden sticky bottom-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-t border-primary/10 px-6 py-4 flex justify-around items-center z-50">
                <Link className="flex flex-col items-center gap-1 text-slate-400 hover:text-primary transition-colors" href="/azkar">
                    <span className="material-symbols-outlined">volunteer_activism</span>
                    <span className="text-[10px]">الأذكار</span>
                </Link>
                <Link className="flex flex-col items-center gap-1 text-slate-400 hover:text-primary transition-colors" href="/quran">
                    <span className="material-symbols-outlined">menu_book</span>
                    <span className="text-[10px]">المصحف</span>
                </Link>
                <Link className="flex flex-col items-center gap-1 text-slate-400 hover:text-primary transition-colors" href="/qibla">
                    <span className="material-symbols-outlined">explore</span>
                    <span className="text-[10px]">القبلة</span>
                </Link>
                <Link className="flex flex-col items-center gap-1 text-slate-400 hover:text-primary transition-colors" href="/imsakiya">
                    <span className="material-symbols-outlined">calendar_month</span>
                    <span className="text-[10px]">الإمساكية</span>
                </Link>
                <Link className="flex flex-col items-center gap-1 text-slate-400 hover:text-primary transition-colors" href="/">
                    <span className="material-symbols-outlined">home</span>
                    <span className="text-[10px]">الرئيسية</span>
                </Link>
            </nav>
        </>
    );
}
