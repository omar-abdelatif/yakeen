import Head from 'next/head';
import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function DuasPage() {
    const [duasData, setDuasData] = useState<any>(null);
    const [activeCategory, setActiveCategory] = useState<string | null>(null);

    useEffect(() => {
        fetch('https://quran.yousefheiba.com/api/duas')
            .then(r => r.json())
            .then(data => {
                setDuasData(data);
                if (data && Object.keys(data).length > 0) {
                    setActiveCategory(Object.keys(data)[0]);
                }
            })
            .catch(e => console.error(e));
    }, []);

    const CATEGORY_LABELS: {[key: string]: string} = {
        'prophetic_duas': 'الأدعية النبوية',
        'quran_duas': 'أدعية القرآن الكريم',
        'prophets_duas': 'أدعية الأنبياء',
        'quran_completion_duas': 'دعاء ختم القرآن'
    };

    const categories = duasData ? Object.keys(duasData) : [];
    const currentDuas = (duasData && activeCategory) ? duasData[activeCategory] : [];

    return (
        <>
            <Head>
                <title>يقين - الأدعية المأثورة</title>
            </Head>

            <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display transition-colors duration-300">
                <Navbar />

                <main className="flex-1 mt-20 max-w-[1440px] mx-auto w-full px-4 lg:px-40 py-12">
                    <div className="mb-12 text-center md:text-right">
                        <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-4">الأدعية المأثورة</h1>
                        <p className="text-slate-600 dark:text-slate-400 text-lg max-w-2xl leading-relaxed">
                            مجموعة مختارة من الأدعية المستجابة من محكم التنزيل وصحيح السنة النبوية.
                        </p>
                    </div>

                    <div className="mb-12 border-b border-primary/10">
                        <div className="flex gap-8 overflow-x-auto no-scrollbar pb-4">
                            {categories.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setActiveCategory(cat)}
                                    className={`pb-4 transition-all whitespace-nowrap text-lg ${activeCategory === cat ? 'border-b-4 border-primary text-primary font-black' : 'text-slate-400 hover:text-primary font-medium'}`}
                                >
                                    {CATEGORY_LABELS[cat] || cat}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {currentDuas.map((duaObj: any, idx: number) => (
                            <div key={idx} className="group relative p-8 rounded-3xl bg-white dark:bg-surface-dark border border-slate-100 dark:border-white/5 shadow-sm hover:border-primary/40 transition-all duration-300">
                                <div className="absolute top-0 right-0 p-4 opacity-10">
                                    <span className="text-6xl font-black text-primary">“</span>
                                </div>
                                <p className="text-2xl leading-loose text-slate-800 dark:text-slate-100 text-center font-bold mb-8 whitespace-pre-wrap">
                                    {duaObj.text}
                                </p>
                                <div className="flex justify-center gap-4 border-t border-slate-50 dark:border-white/5 pt-6">
                                    <button onClick={() => { navigator.clipboard.writeText(duaObj.text); alert('تم النسخ بنجاح'); }} className="flex items-center gap-2 px-6 py-2 bg-primary/10 text-primary rounded-full font-bold hover:bg-primary hover:text-white transition-all">
                                        <span className="material-symbols-outlined text-sm">content_copy</span>
                                        <span>نسخ الدعاء</span>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {!duasData && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-pulse text-right">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="h-64 bg-slate-100 dark:bg-white/5 rounded-3xl"></div>
                            ))}
                        </div>
                    )}
                </main>

                <Footer />
            </div>
        </>
    );
}
