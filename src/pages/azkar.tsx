import Head from 'next/head';
import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function AzkarPage() {
    const [azkarData, setAzkarData] = useState<any>(null);
    const [activeCategory, setActiveCategory] = useState<string>('morning_azkar');
    const [counts, setCounts] = useState<{[key: number]: number}>({});

    useEffect(() => {
        fetch('https://quran.yousefheiba.com/api/azkar')
            .then(r => r.json())
            .then(data => setAzkarData(data))
            .catch(e => console.error(e));
    }, []);

    const categories = [
        { id: 'morning_azkar', label: 'أذكار الصباح' },
        { id: 'evening_azkar', label: 'أذكار المساء' },
        { id: 'after_prayer_azkar', label: 'بعد الصلاة' },
        { id: 'sleep_azkar', label: 'أذكار النوم' },
        { id: 'wake_up_azkar', label: 'أذكار الاستيقاظ' }
    ];

    const currentAzkar = azkarData ? azkarData[activeCategory] || [] : [];

    const handleCount = (id: number, max: number) => {
        setCounts(prev => {
            const current = prev[id] || 0;
            if (current >= max) return prev;
            return { ...prev, [id]: current + 1 };
        });
    };

    const completedCount = currentAzkar.filter((z: any) => (counts[z.id] || 0) >= (z.count || 1)).length;
    const progress = currentAzkar.length > 0 ? Math.round((completedCount / currentAzkar.length) * 100) : 0;

    return (
        <>
            <Head>
                <title>يقين - الأذكار</title>
            </Head>

            <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 transition-colors duration-300">
                <Navbar />
                
                <main className="flex-1 px-4 lg:px-40 py-12 max-w-[1440px] mx-auto w-full">
                    <div className="flex flex-col md:flex-row gap-8">
                        <div className="flex-1">
                            <h1 className="text-4xl font-black mb-8">حصن المسلم</h1>
                            
                            <div className="flex border-b border-primary/10 mb-8 gap-6 overflow-x-auto no-scrollbar pb-2">
                                {categories.map(cat => (
                                    <button 
                                        key={cat.id}
                                        onClick={() => setActiveCategory(cat.id)}
                                        className={`pb-3 font-bold whitespace-nowrap transition-all border-b-2 ${activeCategory === cat.id ? 'border-primary text-primary' : 'border-transparent text-slate-400 hover:text-primary'}`}
                                    >
                                        {cat.label}
                                    </button>
                                ))}
                            </div>

                            <div className="bg-primary/5 rounded-2xl p-6 mb-8 border border-primary/10">
                                <div className="flex justify-between items-end mb-4">
                                    <div className="text-right">
                                        <h3 className="text-lg font-bold">التقدم في {categories.find(c => c.id === activeCategory)?.label}</h3>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">لقد أنجزت {completedCount} من أصل {currentAzkar.length} ذكراً</p>
                                    </div>
                                    <span className="text-primary font-black text-xl">{progress}%</span>
                                </div>
                                <div className="w-full bg-slate-200 dark:bg-slate-800 h-3 rounded-full overflow-hidden">
                                    <div className="bg-primary h-full transition-all duration-500 ease-out" style={{ width: `${progress}%` }}></div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                {currentAzkar.map((thikr: any) => {
                                    const count = counts[thikr.id] || 0;
                                    const isDone = count >= (thikr.count || 1);
                                    return (
                                        <div key={thikr.id} className={`bg-white dark:bg-surface-dark p-8 rounded-2xl border transition-all ${isDone ? 'border-green-500/30 bg-green-50/10' : 'border-slate-100 dark:border-border-dark shadow-sm hover:shadow-md'}`}>
                                            <p className="text-xl leading-relaxed mb-8 text-slate-800 dark:text-slate-100 text-center font-medium whitespace-pre-wrap">
                                                {thikr.text}
                                            </p>
                                            {thikr.note && (
                                                <p className="text-center text-sm text-primary/60 mb-6 italic">{thikr.note}</p>
                                            )}
                                            <div className="flex items-center justify-between border-t border-slate-100 dark:border-white/5 pt-6">
                                                <div className="flex gap-2">
                                                    <button 
                                                        onClick={() => setCounts(prev => ({...prev, [thikr.id]: 0}))}
                                                        className="size-10 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-white/5 text-slate-400 hover:text-red-500 transition-colors"
                                                        title="Reset"
                                                    >
                                                        <span className="material-symbols-outlined">restart_alt</span>
                                                    </button>
                                                </div>
                                                <button 
                                                    disabled={isDone}
                                                    onClick={() => handleCount(thikr.id, thikr.count || 1)}
                                                    className={`flex items-center gap-4 px-8 py-3 rounded-full font-bold shadow-lg transition-all active:scale-95 ${isDone ? 'bg-green-500 text-white shadow-green-500/20' : 'bg-primary text-white shadow-primary/30'}`}
                                                >
                                                    <span className="font-mono text-lg">{count} / {thikr.count || 1}</span>
                                                    <span className="material-symbols-outlined">touch_app</span>
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                                {azkarData && currentAzkar.length === 0 && (
                                    <div className="text-center py-20 text-slate-400 font-medium">قريباً...</div>
                                )}
                            </div>
                        </div>
                    </div>
                </main>

                <Footer />
            </div>
        </>
    );
}
