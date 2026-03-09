import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function Home() {
    const [time, setTime] = useState(new Date());
    const [prayerTimes, setPrayerTimes] = useState<any>(null);
    const [dateHijri, setDateHijri] = useState<any>(null);
    const [dateGregorian, setDateGregorian] = useState<any>(null);
    const [randomDua, setRandomDua] = useState<string>('اللهم إني أسألك علماً نافعاً، ورزقاً طيباً، وعملاً متقبلاً');
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [mounted, setMounted] = useState(false);

    const [randomAyah] = useState<any>({ text: "وَقُل رَّبِّ زِدْنِي عِلْمًا", surahName: "سورة طه", number: 114 });
    const [tasbihTotal, setTasbihTotal] = useState(0);
    const [tasbihTarget, setTasbihTarget] = useState(33);
    const [tasbihCurrent, setTasbihCurrent] = useState(0);
    const [tasbihText, setTasbihText] = useState('سبحان الله');
    const [isEditingTasbih, setIsEditingTasbih] = useState(false);

    const [ramadanSummary, setRamadanSummary] = useState<any[]>([]);

    useEffect(() => {
        setMounted(true);
        const interval = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const fetchPrayerTimes = async (lat: number, lon: number) => {
            const apiKey = process.env.NEXT_PUBLIC_ISLAMICAPI_KEY;
            try {
                const res = await fetch(`https://islamicapi.com/api/v1/prayer-time/?lat=${lat}&lon=${lon}&api_key=${apiKey}`);
                const json = await res.json();
                if (json.status === "success" && json.data.prayer_times) {
                    setPrayerTimes(json.data.prayer_times);
                    setDateHijri({
                        day: json.data.date.hijri_date.split('-')[2],
                        month: { ar: json.data.date.hijri_month_name_ar },
                        year: json.data.date.hijri_date.split('-')[0],
                        weekday: { ar: json.data.date.day_name_ar }
                    });
                    setDateGregorian(json.data.date.gregorian_date);
                }
            } catch (e) {
                console.error("Prayer times error:", e);
            }
        };

        if (typeof window !== 'undefined' && 'geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(async (pos) => {
                const lat = pos.coords.latitude;
                const lon = pos.coords.longitude;
                fetchPrayerTimes(lat, lon);

                const apiKey = process.env.NEXT_PUBLIC_ISLAMICAPI_KEY;
                try {
                    const res = await fetch(`https://islamicapi.com/api/v1/ramadan/?lat=${lat}&lon=${lon}&api_key=${apiKey}`);
                    const json = await res.json();
                    if (json.status === "success" && json.data.fasting) {
                        setRamadanSummary(json.data.fasting.slice(0, 6));
                    }
                } catch (e) {}
            }, () => {
                fetchPrayerTimes(30.0444, 31.2357); // Cairo Fallback
            });
        }

        fetch('https://quran.yousefheiba.com/api/duas')
            .then(r => r.json())
            .then(data => {
                const duas = data.prophetic_duas || [];
                if (duas.length > 0) {
                    setRandomDua(duas[Math.floor(Math.random() * duas.length)].text);
                }
            }).catch(e => console.error(e));
    }, []);

    const toggleRadio = () => {
        if (!audioRef.current) return;
        if (isPlaying) {
            audioRef.current.pause();
            setIsPlaying(false);
        } else {
            audioRef.current.play();
            setIsPlaying(true);
        }
    };

    const handleTasbih = () => {
        setTasbihCurrent(prev => {
            const next = prev + 1;
            if (next > tasbihTarget) {
                setTasbihTotal(t => t + tasbihTarget);
                return 1;
            }
            return next;
        });
    };

    const resetTasbih = () => {
        setTasbihTotal(t => t + tasbihCurrent);
        setTasbihCurrent(0);
    };

    const formatTime = (timeStr: string) => {
        if (!timeStr) return '';
        const [h, m] = timeStr.split(':');
        let hours = parseInt(h, 10);
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12 || 12;
        return `${hours.toString().padStart(2, '0')}:${m} ${ampm}`;
    };

    const getNextPrayerCountdown = () => {
        if (!prayerTimes) return { name: '', diffMs: 0 };
        const now = time;
        const times = Object.entries(prayerTimes).filter(([name]) => name !== 'Sunrise');
        let nextPrayerDef = times[0]; 
        let minDiff = Infinity;
        times.forEach(([name, val]) => {
           let [h, m] = (val as string).split(':').map(Number);
           let d = new Date(now);
           d.setHours(h, m, 0, 0);
           if (d < now) d.setDate(d.getDate() + 1);
           const diff = d.getTime() - now.getTime();
           if (diff < minDiff) { minDiff = diff; nextPrayerDef = [name, val]; }
        });
        return { name: nextPrayerDef[0], diffMs: minDiff };
    };

    const nextPrayer = getNextPrayerCountdown();

    const renderCountdown = (ms: number) => {
        if (!ms) return "00:00:00";
        const h = Math.floor(ms / (1000*60*60));
        const m = Math.floor((ms % (1000*60*60)) / (1000*60));
        const s = Math.floor((ms % (1000*60)) / 1000);
        return `${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`;
    };

    const PRAYER_ARABIC: any = { 'Fajr': 'الفجر', 'Dhuhr': 'الظهر', 'Asr': 'العصر', 'Maghrib': 'المغرب', 'Isha': 'العشاء', 'Imsak': 'الإمساك' };

    const tasbihStrokeDashoffset = 552.92 - (tasbihCurrent / tasbihTarget) * 552.92;

    return (
        <>
            <Head>
                <title>يقين - الرئيسية</title>
            </Head>
            <div className="relative flex h-auto min-h-screen w-full flex-col bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 overflow-x-hidden font-display transition-colors duration-300">
                <Navbar />

                <main className="px-6 md:px-20 lg:px-40 py-8 flex flex-col gap-8 max-w-[1440px] mx-auto w-full">
                    {/* Time and Date Section */}
                    <div className="flex flex-wrap justify-between items-center gap-4 bg-white dark:bg-surface-dark p-6 rounded-lg border border-slate-100 dark:border-border-dark shadow-sm">
                        <div className="flex flex-col gap-1">
                            <p className="text-primary text-5xl font-black leading-none tracking-tighter" suppressHydrationWarning>
                                {mounted ? time.toLocaleTimeString('en-US', { hour12: true, hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '00:00:00'}
                            </p>
                            <p className="text-slate-500 dark:text-slate-400 text-lg font-medium" suppressHydrationWarning>
                                {dateHijri ? `${dateHijri.weekday.ar}، ${dateHijri.day} ${dateHijri.month.ar} ${dateHijri.year} هـ` : 'الرجاء الانتظار...'}<br />
                                {dateGregorian ? dateGregorian : ''}
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <div className="flex flex-col items-center bg-primary/10 dark:bg-primary/20 px-4 py-2 rounded-md border border-primary/20">
                                <span className="text-primary text-xs font-bold">المتبقي للصلاة القادمة</span>
                                <span className="text-primary text-xl font-bold font-mono" suppressHydrationWarning>
                                    {mounted ? renderCountdown(nextPrayer.diffMs) : '00:00:00'}
                                </span>
                            </div>
                            <div className="flex flex-col items-center bg-primary/10 dark:bg-primary/20 px-4 py-2 rounded-md border border-primary/20">
                                <span className="text-primary text-xs font-bold">الصلاة القادمة</span>
                                <span className="text-primary text-xl font-bold">{PRAYER_ARABIC[nextPrayer.name] || '...'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Prayer Times Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                        {[
                            { key: 'Fajr', icon: 'wb_twilight', label: 'الفجر' },
                            { key: 'Dhuhr', icon: 'light_mode', label: 'الظهر' },
                            { key: 'Asr', icon: 'sunny', label: 'العصر' },
                            { key: 'Maghrib', icon: 'wb_shade', label: 'المغرب' },
                            { key: 'Isha', icon: 'dark_mode', label: 'العشاء' }
                        ].map((prayer) => {
                            const isNext = nextPrayer.name === prayer.key;
                            return (
                                <div key={prayer.key} className={`flex flex-col gap-4 rounded-lg p-5 transition-all hover:scale-[1.02] relative overflow-hidden ${isNext ? 'border-2 border-primary bg-primary/5 dark:bg-primary/10' : 'border border-slate-100 dark:border-border-dark bg-white dark:bg-surface-dark'}`}>
                                    {isNext && <div className="absolute top-0 right-0 bg-primary text-white text-[10px] px-2 py-0.5 rounded-bl-lg font-bold">القادم</div>}
                                    <span className="material-symbols-outlined text-primary text-3xl">{prayer.icon}</span>
                                    <div className="flex flex-col">
                                        <h3 className={`${isNext ? 'text-primary' : 'text-slate-400 dark:text-slate-500'} text-sm font-bold`}>{prayer.label}</h3>
                                        <p className="text-slate-900 dark:text-white text-2xl font-black font-mono">
                                            {prayerTimes ? formatTime(prayerTimes[prayer.key]) : '--:--'}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 flex flex-col gap-8">
                            <div>
                                <h2 className="text-slate-900 dark:text-white text-2xl font-black mb-6 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-primary">auto_awesome</span>
                                    الخدمات المميزة
                                </h2>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                    <Link href="/quran" className="group relative aspect-square rounded-lg overflow-hidden cursor-pointer shadow-lg">
                                        <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent z-10"></div>
                                        <Image className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="Quran" width={400} height={400} src={"https://lh3.googleusercontent.com/aida-public/AB6AXuBbnVcb_ucpDj34XYmt8U-VoQ9FlUBQZp8ZNF4QkSg3ssRK2pX7hriIrLGY0p-e7yx6-ZktMy-wks3n2r6xxxJ3Mj87bumDw1sHeGnBmuHhBLsTvTQ1YatQltCqlvbO0_P5wAG78ZsXfyOX3o17znfpmFpxWwI7pcYJMupCqjvqpTaXY0RhN1_SuHaBc14DyzuAlJcaFpU55kRrJwPyAFCroLj6FcfqeHzUS6t7TsMIjrzo2o4se4RJyqEQOOMdI-6-jfwfACEoBGg"} />
                                        <p className="absolute bottom-4 right-4 z-20 text-white font-bold text-lg">القرآن الكريم</p>
                                    </Link>
                                    <Link href="/duas" className="group relative aspect-square rounded-lg overflow-hidden cursor-pointer shadow-lg">
                                        <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent z-10"></div>
                                        <Image className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="Duas" width={400} height={400} src="https://lh3.googleusercontent.com/aida-public/AB6AXuAfU467upta33YEgAwT6ZgYDvPHa2VH_14ch-1CpwsfU1WPsrXCvxHUGc00HZyGLvwmJ7rQgE-MFFDxq5Ps9m48npCcfktI4sBK5wgJomSFQXZXYsXOA5qJ_rWS3a556oVxCvQYSU-weXV9GSodYHqkW78LV6pVri2d7ljVErE5qUdwg85jP7uaHkSrHngPyKxZhQjkpG9L5t_yDJ4CdoPHmpqKrElNVfIKD1pzNDc-G4RFDIywC3hsvkH4GO8l6f0gDNE-iG7xEBQ" />
                                        <p className="absolute bottom-4 right-4 z-20 text-white font-bold text-lg">الأدعية</p>
                                    </Link>
                                    <Link href="/imsakiya" className="group relative aspect-square rounded-lg overflow-hidden cursor-pointer shadow-lg">
                                        <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent z-10"></div>
                                        <Image className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="Imsakiya" width={400} height={400} src="https://lh3.googleusercontent.com/aida-public/AB6AXuDSx6pxkbOy1xNNffPchZjDw_3YxjXCSO-TizrIHd2r_Ktf8UNwAmrHoXQtd-DhgJYV5R1bIW0YcMu9xy30xsK7yeUoESfl1I5zRK5R5o4oCtjMKSl-RpNK-T8VGMpaEeQkV5ugJEyWHWX2W-Oq3ty9LamqCPo7bS7U2-u73bYxZJmaR9KCH5qEP3jq_StuXhEA-dYDtUR-jtl5Kgn83YtrgRquCOibpah0cWO7bZm5E82G8hU6wuKPmD4PX1GGshiCKaA3orGO_c0" />
                                        <p className="absolute bottom-4 right-4 z-20 text-white font-bold text-lg">الإمساكية</p>
                                    </Link>
                                    <Link href="/qibla" className="group relative aspect-square rounded-lg overflow-hidden cursor-pointer shadow-lg">
                                        <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent z-10"></div>
                                        <Image className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="Qibla" width={400} height={400} src="https://lh3.googleusercontent.com/aida-public/AB6AXuBa-5u82pC2wc_VKugN9Xwbrb1qQ3pv8-hgN5cA-i2r81WGTOjwTwOQFXmFukus4ObwhhEC1XV0hjEPxAoQOHVcNmIU8FrlMzb69MlwYjL3K8AQqP_CbJDKSosvBjgtdIOlFYRgEtGW8ff1veWD54NKqFYJcJM1wedizYTzzVxxSNvVjHzx6-TmYXFpvtSuFiuy_ALazeuqermRbn-DhWB0S__TKXW5YsV25h_bXeum0xsU2arNzojw37V1nzmvFdGCAQ8HauZ9Wvg" />
                                        <p className="absolute bottom-4 right-4 z-20 text-white font-bold text-lg">القبلة</p>
                                    </Link>
                                    <Link href="/azkar" className="group relative aspect-square rounded-lg overflow-hidden cursor-pointer shadow-lg">
                                        <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent z-10"></div>
                                        <Image className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="Azkar" width={400} height={400} src="https://lh3.googleusercontent.com/aida-public/AB6AXuBUIkq0uOG1vdbH07p0ii9lZPsmWe4ZRQTaxRGqx5SGvFCJ0sIhkhSL4aAxszshz1aY2Tp1tHI3L2PioHjKy3q0mFZZxGHeY-x-6BrV6HJD8XN4aVht73oir4zuhQnn9HiZwhBaplOOFOpa2sZxqPlgsQuXppL9_jsVG4OBQn_nEiTHy7wNYwkLgnxP_f3hIkHClFKtWndbCy0Mfhic13FAgI6UPrPkW4X4cryYgzC7Ewn1uGAvEBAzD6BrR3xdFpWdGftr0n9e2sQ" />
                                        <p className="absolute bottom-4 right-4 z-20 text-white font-bold text-lg">الأذكار</p>
                                    </Link>
                                </div>
                            </div>

                            <div className="bg-white dark:bg-surface-dark p-6 rounded-lg border border-slate-100 dark:border-border-dark shadow-sm flex-1 flex flex-col">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-slate-900 dark:text-white text-xl font-bold flex items-center gap-2">
                                        <span className="material-symbols-outlined text-primary">calendar_month</span>
                                        إمساكية رمضان 1447
                                    </h2>
                                    <Link href="/imsakiya" className="text-primary text-xs font-bold hover:underline">عرض الجدول الكامل ←</Link>
                                </div>
                                <div className="overflow-x-auto flex-1">
                                    <table className="w-full text-right border-collapse">
                                        <thead>
                                            <tr className="text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-border-dark">
                                                <th className="pb-3 font-medium">هجري</th>
                                                <th className="pb-3 font-medium">اليوم</th>
                                                <th className="pb-3 font-medium text-center">الإمساك</th>
                                                <th className="pb-3 font-medium text-center">الإفطار</th>
                                            </tr>
                                        </thead>
                                        <tbody className="text-slate-700 dark:text-slate-300">
                                            {ramadanSummary.length > 0 ? ramadanSummary.map((day, i) => (
                                                <tr key={i} className="border-b border-slate-50 dark:border-border-dark/50 hover:bg-slate-50 dark:hover:bg-primary/5">
                                                    <td className="py-4 font-bold text-sm">{day.hijri.split('-')[2]} رمضان</td>
                                                    <td className="py-4 text-xs">{(day.day)}</td>
                                                    <td className="py-4 font-mono text-primary text-xs text-center">{formatTime(day.time.sahur)}</td>
                                                    <td className="py-4 font-mono font-bold text-primary text-xs text-center">{formatTime(day.time.iftar)}</td>
                                                </tr>
                                            )) : (
                                                <tr><td colSpan={4} className="py-10 text-center text-slate-400">يرجى تفعيل الموقع لعرض البيانات</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-8">
                            {/* Electronic Tasbih */}
                            <div className="bg-white dark:bg-surface-dark p-8 rounded-lg border border-slate-100 dark:border-border-dark shadow-sm flex flex-col items-center gap-6">
                                <div className="w-full flex justify-between items-center">
                                    <h3 className="text-slate-900 dark:text-white font-bold">المسبحة</h3>
                                    <button onClick={() => setIsEditingTasbih(!isEditingTasbih)} className="material-symbols-outlined text-slate-400 hover:text-primary transition-colors">edit</button>
                                </div>
                                
                                {isEditingTasbih ? (
                                    <div className="w-full flex flex-col gap-2">
                                        <input 
                                            type="text" 
                                            value={tasbihText} 
                                            onChange={(e) => setTasbihText(e.target.value)}
                                            className="w-full p-2 rounded-lg bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-border-dark text-center font-bold"
                                            placeholder="اكتب الذكر هنا..."
                                        />
                                        <button onClick={() => setIsEditingTasbih(false)} className="w-full p-2 bg-primary text-white rounded-lg text-sm font-bold">حفظ</button>
                                    </div>
                                ) : (
                                    <p className="text-primary font-bold text-lg">{tasbihText}</p>
                                )}

                                <div className="relative flex items-center justify-center">
                                    <svg className="size-48 transform -rotate-90">
                                        <circle className="text-slate-100 dark:text-background-dark" cx="96" cy="96" fill="transparent" r="88" stroke="currentColor" strokeWidth={8}></circle>
                                        <circle className="text-primary transition-all duration-300 ease-out" cx="96" cy="96" fill="transparent" r="88" stroke="currentColor" strokeDasharray="552.92" strokeDashoffset={tasbihStrokeDashoffset} strokeLinecap="round" strokeWidth={8}></circle>
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <span className="text-slate-400 dark:text-slate-500 text-sm font-medium">العدد</span>
                                        <span className="text-slate-900 dark:text-white text-4xl font-black">{tasbihCurrent}</span>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-4 w-full">
                                    <div className="flex justify-around items-center w-full gap-4">
                                        <button onClick={handleTasbih} className="flex-1 py-4 bg-primary text-white rounded-2xl shadow-lg shadow-primary/30 active:scale-95 transition-all text-xl font-black">تسبيح</button>
                                        <button onClick={resetTasbih} className="size-14 flex items-center justify-center bg-slate-100 dark:bg-background-dark text-slate-500 rounded-2xl hover:text-red-500 transition-colors">
                                            <span className="material-symbols-outlined">restart_alt</span>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white dark:bg-surface-dark p-6 rounded-lg border border-slate-100 dark:border-border-dark shadow-sm flex flex-col gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="size-12 bg-primary/10 rounded-lg flex items-center justify-center">
                                        <span className="material-symbols-outlined text-primary">radio</span>
                                    </div>
                                    <h3 className="text-slate-900 dark:text-white font-bold">إذاعة القرآن الكريم</h3>
                                </div>
                                <div className="flex items-center gap-3 bg-slate-50 dark:bg-background-dark/50 p-3 rounded-lg">
                                    <audio ref={audioRef} src="https://quran.yousefheiba.com/api/radio" preload="none" />
                                    <button onClick={toggleRadio} className="size-10 bg-primary text-white rounded-full flex items-center justify-center hover:scale-105 transition-transform shadow-lg shadow-primary/20">
                                        <span className="material-symbols-outlined">{isPlaying ? 'pause' : 'play_arrow'}</span>
                                    </button>
                                    <div className="flex-1 h-1.5 bg-slate-200 dark:bg-border-dark rounded-full overflow-hidden">
                                        <div className={`h-full bg-primary transition-all duration-1000 ${isPlaying ? 'w-full animate-pulse' : 'w-0'}`}></div>
                                    </div>
                                    <span className="text-xs font-mono text-slate-500">LIVE</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>

                <Footer />
            </div>
        </>
    );
}
