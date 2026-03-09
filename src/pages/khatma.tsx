import Head from 'next/head';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

interface RamadanDay {
    date: string;
    hijri_date: string;
    hijri_readable: string;
    day_number: number;
}

export default function KhatmaPage() {
    const [mounted, setMounted] = useState(false);
    const [progress, setProgress] = useState(0);
    const [planDays, setPlanDays] = useState(30);
    const [donePrayers, setDonePrayers] = useState<number[]>([]);
    const [hijriOffset, setHijriOffset] = useState(0);
    const [ramadanData, setRamadanData] = useState<RamadanDay[]>([]);
    const [isLoadingHijri, setIsLoadingHijri] = useState(true);
    const sliderRef = useRef<HTMLDivElement>(null);

    const TOTAL_PAGES = 604;
    const PRAYER_NAMES = ['الفجر', 'الظهر', 'العصر', 'المغرب', 'العشاء'];

    useEffect(() => {
        setMounted(true);
        const savedDone = localStorage.getItem('khatma_done_v4');
        const savedPlan = localStorage.getItem('khatma_plan');
        const savedOffset = localStorage.getItem('hijri_offset');
        if (savedDone) setDonePrayers(JSON.parse(savedDone));
        if (savedPlan) setPlanDays(parseInt(savedPlan));
        if (savedOffset) setHijriOffset(parseInt(savedOffset));

        const fetchHijriData = async () => {
            try {
                const method = process.env.NEXT_PUBLIC_PRAYER_TIME_METHOD || 5;
                const school = process.env.NEXT_PUBLIC_PRAYER_TIME_SCHOOL || 1;
                const apiKey = process.env.NEXT_PUBLIC_ISLAMICAPI_KEY;

                let lat = 30.0444, lon = 31.2357; 
                try {
                    const pos = await new Promise<GeolocationPosition>((res, rej) =>
                        navigator.geolocation.getCurrentPosition(res, rej, { timeout: 5000 })
                    );
                    lat = pos.coords.latitude;
                    lon = pos.coords.longitude;
                } catch (e) { console.warn("Using default location for Hijri data"); }

                const url = `https://islamicapi.com/api/v1/ramadan/?lat=${lat}&lon=${lon}&api_key=${apiKey}&method=${method}&school=${school}`;
                const response = await fetch(url);
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                const result = await response.json();
                const data = result.data || result;
                if (data.fasting) {
                    setRamadanData(data.fasting);
                }
            } catch (err) {
                console.error("KhatmaPage: Hijri fetch failed", err);
            } finally {
                setIsLoadingHijri(false);
            }
        };

        fetchHijriData();
    }, []);

    const pagesPerDay = Math.ceil(TOTAL_PAGES / planDays);
    const pagesPerPrayer = pagesPerDay / 5;
    const pagesCompleted = donePrayers.length * pagesPerPrayer;

    useEffect(() => {
        if (mounted) {
            localStorage.setItem('khatma_done_v4', JSON.stringify(donePrayers));
            localStorage.setItem('khatma_plan', planDays.toString());
            localStorage.setItem('hijri_offset', hijriOffset.toString());
            setProgress(Math.min(100, Math.round((pagesCompleted / TOTAL_PAGES) * 100)));
        }
    }, [donePrayers, planDays, hijriOffset, mounted, pagesCompleted]);

    const handlePrayerToggle = (pIdx: number, dayNum: number) => {
        const id = (dayNum - 1) * 5 + pIdx;
        setDonePrayers(prev => 
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    };

    const handleManualDaySelect = (dayNum: number) => {
        if (confirm(`هل تريد الانتقال إلى اليوم رقم ${dayNum}؟ سيعتبر أنك أنجزت كافة الصلوات حتى هذا اليوم.`)) {
            const upTo = (dayNum - 1) * 5;
            const newList = Array.from({ length: upTo }, (_, i) => i);
            setDonePrayers(newList);
        }
    };

    const scrollSlider = (direction: 'left' | 'right') => {
        if (sliderRef.current) {
            const scrollAmount = 340;
            sliderRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    const todayIndex = ramadanData.findIndex(d => d.date === new Date().toISOString().split('T')[0]);
    const currentDay = todayIndex !== -1 ? todayIndex + 1 : Math.floor(pagesCompleted / pagesPerDay) + 1;

    useEffect(() => {
        if (ramadanData.length > 0) {
            const idx = ramadanData.findIndex(d => d.date === new Date().toISOString().split('T')[0]);
            if (idx !== -1) {
                setTimeout(() => {
                    const el = document.getElementById(`day-card-${idx + 1}`);
                    if (el) {
                        el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
                    }
                }, 500);
            }
        }
    }, [ramadanData]);

    const remainingPages = TOTAL_PAGES - pagesCompleted;
    const remainingDays = Math.ceil(remainingPages / pagesPerDay);
    const completionDate = new Date();
    completionDate.setDate(completionDate.getDate() + remainingDays);

    const getHijriForDate = (dateObj: Date) => {
        return new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura-nu-lat', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        }).format(dateObj);
    };

    const getHijriForDay = (dayIndex: number) => {
        if (ramadanData.length > 0) {
            const entry = ramadanData[dayIndex];
            if (entry) {
                const parts = entry.date.split('-');
                const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
                return getHijriForDate(d);
            }
        }
        
        const d = new Date();
        d.setDate(d.getDate() + dayIndex);
        return getHijriForDate(d);
    };

    return (
        <>
            <Head>
                <title>يقين - جدول الختمة</title>
            </Head>

            <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display transition-colors duration-300 text-right" dir="rtl">
                <Navbar />

                <main className="flex-1 mt-20 max-w-[1200px] mx-auto w-full px-4 lg:px-10 py-12">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
                        <div className="text-right">
                            <div className="flex flex-col gap-1 mb-4">
                                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-bold text-sm">
                                    <span className="material-symbols-outlined text-sm">calendar_month</span>
                                    {new Date().toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                </div>
                                <div className="text-primary font-black text-lg">
                                    {getHijriForDate(new Date())}
                                </div>
                            </div>
                            <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white">جدول الختمة اليومي</h1>
                        </div>
                        <div className="flex flex-col items-center md:items-end gap-2 bg-primary/5 p-5 rounded-3xl border border-primary/10">
                            <p className="text-xs font-bold text-primary opacity-60">معدل القراءة اليومي</p>
                            <p className="text-2xl font-black">{pagesPerDay} صفحة</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 flex flex-col gap-6 overflow-hidden">
                            <div className="flex items-center justify-between px-2">
                                <h2 className="text-xl font-black flex items-center gap-2">
                                    <span className="material-symbols-outlined text-primary">pending_actions</span>
                                    خطة الأيام
                                </h2>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => scrollSlider('right')} className="size-8 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/5 flex items-center justify-center hover:bg-primary hover:text-white transition-all shadow-sm">
                                        <span className="material-symbols-outlined text-sm">chevron_right</span>
                                    </button>
                                    <button onClick={() => scrollSlider('left')} className="size-8 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/5 flex items-center justify-center hover:bg-primary hover:text-white transition-all shadow-sm">
                                        <span className="material-symbols-outlined text-sm">chevron_left</span>
                                    </button>
                                </div>
                            </div>

                            <div 
                                ref={sliderRef}
                                className="flex gap-4 overflow-x-auto pb-6 no-scrollbar snap-x rtl:flex-row-reverse scroll-smooth"
                            >
                                {Array.from({ length: Math.min(planDays, 100) }).map((_, i) => {
                                    const dayNum = i + 1;
                                    const isCurrent = dayNum === currentDay;
                                    const isPast = dayNum < currentDay;

                                    const dayStartIdx = (dayNum - 1) * 5;
                                    const dayPrayersDoneCount = donePrayers.filter(id => id >= dayStartIdx && id < dayStartIdx + 5).length;

                                    return (
                                        <div
                                            key={dayNum}
                                            id={`day-card-${dayNum}`}
                                            className={`min-w-[280px] md:min-w-[320px] snap-center bg-white dark:bg-surface-dark p-6 rounded-3xl border transition-all cursor-pointer relative overflow-hidden ${isCurrent
                                                    ? 'border-primary shadow-2xl shadow-primary/10 scale-[1.02]'
                                                    : 'border-slate-100 dark:border-white/5'
                                                }`}
                                        >
                                            {isCurrent && <div className="absolute top-0 right-0 bg-primary text-white text-[9px] font-black px-4 py-1.5 rounded-bl-2xl uppercase tracking-tighter">اليوم الحالي</div>}

                                            <div className="flex justify-between items-center mb-6 border-b border-slate-50 dark:border-white/5 pb-4">
                                                <div className="text-right">
                                                    <h3 className={`text-xl font-black ${isCurrent ? 'text-primary' : 'text-slate-400'}`}>اليوم {dayNum}</h3>
                                                    <p className="text-[10px] font-bold text-slate-400">{getHijriForDay(i)}</p>
                                                </div>
                                                <div className={`size-10 rounded-xl flex items-center justify-center font-black ${dayPrayersDoneCount === 5 ? 'bg-green-500 text-white shadow-lg shadow-green-500/20' : 'bg-primary/10 text-primary'}`}>
                                                    {dayPrayersDoneCount}/5
                                                </div>
                                            </div>

                                            <div className="space-y-3">
                                                {PRAYER_NAMES.map((pName, pIdx) => {
                                                    const pId = (dayNum - 1) * 5 + pIdx;
                                                    const isDone = donePrayers.includes(pId);
                                                    
                                                    // Calculation for Start/End Pages for this specific prayer
                                                    const startPg = Math.min(604, Math.floor(pId * pagesPerPrayer) + 1);
                                                    const endPg = Math.min(604, Math.floor((pId + 1) * pagesPerPrayer));

                                                    return (
                                                        <div key={pName} className="flex flex-col gap-2">
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); handlePrayerToggle(pIdx, dayNum); }}
                                                                className={`w-full flex items-center justify-between p-3.5 rounded-2xl border transition-all ${isDone
                                                                        ? 'bg-primary/5 border-primary/10'
                                                                        : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-white/5 shadow-sm'
                                                                    }`}
                                                            >
                                                                <div className="flex items-center gap-3">
                                                                    <div className={`size-8 rounded-lg flex items-center justify-center shrink-0 ${isDone ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-400'}`}>
                                                                        <span className="material-symbols-outlined text-xs">{isDone ? 'check' : 'circle'}</span>
                                                                    </div>
                                                                    <div className="text-right">
                                                                        <p className={`text-sm font-bold ${isDone ? 'text-primary' : 'text-slate-600 dark:text-slate-300'}`}>{pName}</p>
                                                                        <p className="text-[9px] font-bold text-slate-400">الصفحات: {startPg} - {endPg}</p>
                                                                    </div>
                                                                </div>
                                                                {isCurrent && pId === donePrayers.length && <span className="size-2 rounded-full bg-primary animate-ping"></span>}
                                                            </button>

                                                            <Link href={`/read?start=${startPg}&end=${endPg}&pId=${pId}`}  onClick={(e) => e.stopPropagation()}     className="w-full py-2 bg-primary/5 text-primary text-[10px] font-black rounded-lg flex items-center justify-center gap-2 hover:bg-primary hover:text-white transition-all"     >
                                                                <span className="material-symbols-outlined text-xs">book</span>
                                                                قراءة الصفحات
                                                            </Link>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="bg-primary/5 border border-primary/10 p-6 rounded-3xl flex items-center gap-4">
                                <div className="size-12 rounded-2xl bg-white dark:bg-slate-800 flex items-center justify-center text-primary shadow-sm shrink-0">
                                    <span className="material-symbols-outlined">touch_app</span>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-black text-primary">الملاحة والتحكم</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                                        يمكنك استخدام الأسهم أعلاه أو السحب يدوياً للتنقل بين الأيام. اضغط على أي بطاقة للانتقال السريع.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-6">
                            <div className="bg-white dark:bg-surface-dark p-8 rounded-3xl border border-primary/10 shadow-sm flex flex-col items-center">
                                <div className="relative size-40 flex items-center justify-center mb-6">
                                    <svg className="size-full transform -rotate-90">
                                        <circle className="text-slate-100 dark:text-slate-800" cx="80" cy="80" fill="transparent" r="70" stroke="currentColor" strokeWidth={10}></circle>
                                        <circle className="text-primary transition-all duration-1000 ease-out" cx="80" cy="80" fill="transparent" r="70" stroke="currentColor" strokeDasharray="440" strokeDashoffset={440 - (progress / 100) * 440} strokeLinecap="round" strokeWidth={10}></circle>
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <span className="text-3xl font-black text-primary border-b-2 border-primary/10 pb-1">{progress}%</span>
                                    </div>
                                </div>
                                <h3 className="font-bold text-lg mb-2 text-center text-slate-800 dark:text-white">الإنجاز الكلي</h3>
                                <p className="text-sm text-slate-400 text-center mb-8">{Math.round(pagesCompleted)} من {TOTAL_PAGES} صفحة</p>

                                <div className="w-full space-y-4">
                                    <div className="p-5 bg-slate-50 dark:bg-white/5 rounded-3xl flex flex-col gap-2">
                                        <div className="flex justify-between items-center text-xs font-bold text-slate-400 uppercase tracking-tighter">
                                            <span>موعد الختم المتوقع</span>
                                            <span className="material-symbols-outlined text-xs">auto_awesome</span>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-black text-primary text-lg leading-none mb-1">
                                                {mounted ? completionDate.toLocaleDateString('ar-EG', { month: 'long', day: 'numeric', year: 'numeric' }) : '...'}
                                            </p>
                                            <p className="text-xs font-bold text-slate-500">
                                                الموافق: {mounted ? getHijriForDate(completionDate) : '...'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white dark:bg-surface-dark p-8 rounded-3xl border border-primary/10 shadow-sm">
                                <h3 className="text-xl font-black mb-6 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-primary">settings</span>
                                    إعدادات الخطة
                                </h3>
                                <div className="space-y-4">
                                    <p className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-widest text-center">المدة المطلوبة لختم المصحف</p>
                                    <div className="grid grid-cols-3 gap-2">
                                        {[15, 30, 60].map(d => (
                                            <button
                                                key={d}
                                                onClick={() => setPlanDays(d)}
                                                className={`py-3.5 rounded-2xl border font-black transition-all ${planDays === d ? 'bg-primary border-primary text-white shadow-xl shadow-primary/20 scale-105' : 'border-slate-100 dark:border-white/5 text-slate-400 hover:text-primary hover:bg-primary/5'}`}
                                            >
                                                {d}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <button onClick={() => { if (confirm('هل أنت متأكد من إعادة ضبط الختمة؟')) { setDonePrayers([]); localStorage.removeItem('khatma_done_v4'); } }} className="w-full py-4 rounded-2xl border border-red-500/10 text-red-500/50 hover:text-red-500 hover:bg-red-500/5 transition-all font-bold text-sm flex items-center justify-center gap-2" >
                                <span className="material-symbols-outlined text-sm">restart_alt</span>
                                إعادة ضبط الخطة
                            </button>
                        </div>
                    </div>
                </main>

                <Footer />
            </div>

            <style jsx global>{`
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </>
    );
}

