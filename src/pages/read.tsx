import Head from 'next/head';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function ReadPage() {
    const router = useRouter();
    const { start, end, pId } = router.query;
    const [pageData, setPageData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const handleFinish = () => {
        if (pId) {
            const prayerId = parseInt(pId as string);
            const savedDone = localStorage.getItem('khatma_done_v4');
            let doneList: number[] = savedDone ? JSON.parse(savedDone) : [];
            
            if (!doneList.includes(prayerId)) {
                doneList.push(prayerId);
                localStorage.setItem('khatma_done_v4', JSON.stringify(doneList));
            }
        }
        router.push('/khatma');
    };

    useEffect(() => {
        if (!router.isReady) return;
        
        const fetchImages = async () => {
            setLoading(true);
            try {
                const s = parseInt(start as string) || 1;
                const e = parseInt(end as string) || s;
                const ids: number[] = [];
                for (let p = s; p <= e; p++) {
                    if (p > 604) break;
                    ids.push(p);
                }

                if (ids.length === 0) {
                    setLoading(false);
                    return;
                }

                const res = await fetch(`https://quran.yousefheiba.com/api/quranPagesImage?id=${ids.join(',')}`);
                const data = await res.json();
                
                if (data.status === 'success') {
                    // Filter carefully to only show the pages requested in the range
                    const filtered = data.pages.filter((p: any) => ids.includes(p.page_number));
                    setPageData(filtered);
                } else {
                    throw new Error("Failed to fetch pages data");
                }
            } catch (err: any) {
                console.error("Fetch Quran Pages Error:", err);
                setError(err.message || "An unknown error occurred");
            } finally {
                setLoading(false);
            }
        };

        fetchImages();
    }, [router.isReady, start, end]);

    return (
        <>
            <Head>
                <title>يقين - قراءة الختمة</title>
            </Head>

            <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-background-light dark:bg-[#1a1c1e] text-slate-900 dark:text-slate-100 font-display transition-colors duration-300" dir="rtl">
                <Navbar />

                <main className="flex-1 mt-20 max-w-[900px] mx-auto w-full px-4 py-12">
                    <div className="flex items-center justify-between mb-12">
                        <div className="text-right">
                            <h1 className="text-3xl font-black text-primary mb-2">مصحف "يقين"</h1>
                            <div className="flex items-center gap-3">
                                <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-black">من {start} إلى {end}</span>
                                <span className="text-slate-400 text-xs font-bold">إجمالي {pageData.length} صفحات</span>
                            </div>
                        </div>
                        <button onClick={() => router.back()} className="size-12 rounded-2xl bg-white dark:bg-white/5 border border-slate-100 dark:border-white/5 text-slate-400 flex items-center justify-center hover:bg-primary hover:text-white transition-all shadow-sm" >
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <div className="size-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                            <p className="font-bold text-slate-400">جاري تحميل الصفحات...</p>
                        </div>
                    ) : error ? (
                        <div className="text-center py-20 bg-red-500/5 rounded-3xl border border-red-500/20">
                            <span className="material-symbols-outlined text-4xl text-red-500 mb-4">error</span>
                            <p className="font-bold text-red-500">حدث خطأ أثناء تحميل البيانات</p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-12">
                            {pageData.map((page) => (
                                <div key={page.page_number} className="group relative flex flex-col gap-4">
                                    <div className="flex justify-between items-center px-4">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">الصفحة {page.page_number}</span>
                                        <div className="size-2 rounded-full bg-primary/20 group-hover:bg-primary transition-colors"></div>
                                    </div>
                                    
                                    <div className="bg-white dark:bg-white/[0.02] rounded-[2.5rem] border border-slate-100 dark:border-white/5 shadow-2xl shadow-black/5 overflow-hidden transition-all duration-500 hover:shadow-primary/10 hover:border-primary/20">
                                        <img 
                                            src={page.page_url}
                                            alt={`Quran Page ${page.page_number}`}
                                            className="w-full h-auto object-contain select-none pointer-events-none dark:brightness-90 dark:contrast-110"
                                            loading="lazy"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="mt-20 flex flex-col items-center gap-6">
                         <div className="size-1 bg-primary/20 rounded-full w-24"></div>
                         <button 
                            onClick={handleFinish}
                            className="group bg-primary text-white px-12 py-5 rounded-3xl font-black shadow-2xl shadow-primary/30 hover:scale-105 transition-all active:scale-95 flex items-center gap-3"
                        >
                            <span>تمت القراءة بحمد الله</span>
                            <span className="material-symbols-outlined transition-transform group-hover:translate-x-[-4px]">task_alt</span>
                        </button>
                    </div>
                </main>

                <Footer />
            </div>
            <style jsx global>{`
                @font-face {
                    font-family: 'Amiri Quran';
                    src: url('https://fonts.googleapis.com/css2?family=Amiri+Quran&display=swap');
                }
                .font-quran {
                    font-family: 'Amiri Quran', serif;
                }
            `}</style>
        </>
    );
}
