import Head from 'next/head';
import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function ImsakiyaPage() {
    const [mounted, setMounted] = useState(false);
    const [ramadanData, setRamadanData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState("جاري تحديد موقعك...");

    useEffect(() => {
        setMounted(true);
        if (typeof window !== 'undefined' && 'geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                async (pos) => {
                    const lat = pos.coords.latitude;
                    const lon = pos.coords.longitude;
                    const apiKey = process.env.NEXT_PUBLIC_ISLAMICAPI_KEY;

                    setStatus("جاري تحميل بيانات رمضان...");
                    try {
                        const method = process.env.NEXT_PUBLIC_PRAYER_TIME_METHOD || 5;
                        const school = process.env.NEXT_PUBLIC_PRAYER_TIME_SCHOOL || 1;
                        const res = await fetch(`https://islamicapi.com/api/v1/ramadan/?lat=${lat}&lon=${lon}&api_key=${apiKey}&method=${method}&school=${school}`);
                        const json = await res.json();
                        
                        const data = json.data || json;
                        if (data.fasting) {
                            setRamadanData(data.fasting);
                        } else {
                            setStatus("خطأ في تحميل البيانات من المصدر");
                        }
                    } catch (e) {
                        setStatus("فشل الاتصال بالخادم");
                    } finally {
                        setLoading(false);
                    }
                },
                (err) => {
                    setStatus("يرجى تفعيل صلاحية الوصول للموقع لعرض الإمساكية");
                    setLoading(false);
                }
            );
        }
    }, []);

    const ARABIC_DAYS: any = {
        'Sunday': 'الأحد',
        'Monday': 'الاثنين',
        'Tuesday': 'الثلاثاء',
        'Wednesday': 'الأربعاء',
        'Thursday': 'الخميس',
        'Friday': 'الجمعة',
        'Saturday': 'السبت'
    };

    const formatTime = (timeStr: string) => {
        if (!timeStr) return '';
        const [h, m] = timeStr.split(':');
        if (!h || !m) return timeStr;
        let hours = parseInt(h, 10);
        const ampm = hours >= 12 ? 'م' : 'ص';
        hours = hours % 12 || 12;
        return `${hours}:${m} ${ampm}`;
    };

    return (
        <>
            <Head>
                <title>يقين - إمساكية رمضان</title>
            </Head>

            <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display transition-colors duration-300">
                <Navbar />

                <main className="flex-1 mt-20 max-w-[1200px] mx-auto w-full px-4 lg:px-10 py-12">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2 text-primary">
                                <span className="material-symbols-outlined text-lg">calendar_month</span>
                                <span className="text-sm font-bold">رمضان ١٤٤٧ هـ</span>
                            </div>
                            <h1 className="text-4xl md:text-5xl font-black leading-tight">إمساكية رمضان</h1>
                            <p className="text-slate-500 dark:text-slate-400 text-lg">مواعيد الصيام والإفطار في عام ٢٠٢٦ م</p>
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <div className="size-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                            <p className="font-bold text-slate-500">{status}</p>
                        </div>
                    ) : ramadanData.length > 0 ? (
                        <div className="overflow-hidden rounded-3xl border border-primary/20 bg-white dark:bg-slate-900/50 backdrop-blur-sm shadow-xl shadow-primary/5">
                            <div className="overflow-x-auto">
                                <table className="w-full text-right border-collapse">
                                    <thead>
                                        <tr className="bg-primary/10 text-primary">
                                            <th className="px-6 py-5 text-sm font-black border-b border-primary/10">اليوم</th>
                                            <th className="px-6 py-5 text-sm font-black border-b border-primary/10">هجري</th>
                                            <th className="px-6 py-5 text-sm font-black border-b border-primary/10 text-center">الإمساك</th>
                                            <th className="px-6 py-5 text-sm font-black border-b border-primary/10 text-center">الإفطار</th>
                                            <th className="px-6 py-5 text-sm font-black border-b border-primary/10 text-center">المدة</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-primary/5">
                                        {ramadanData.map((day, idx) => (
                                            <tr key={idx} className="hover:bg-primary/5 transition-colors group">
                                                <td className="px-6 py-4 text-sm font-bold text-slate-800 dark:text-slate-100">{ARABIC_DAYS[day.day] || day.day}</td>
                                                <td className="px-6 py-4 text-sm text-primary font-bold">{day.hijri_readable}</td>
                                                <td className="px-6 py-4 text-sm text-center font-mono text-slate-600 dark:text-slate-300">{formatTime(day.time.sahur)}</td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className="inline-flex items-center justify-center rounded-xl bg-primary text-white text-sm font-black px-4 py-2 shadow-lg shadow-primary/20">
                                                        {formatTime(day.time.iftar)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-xs text-center text-slate-500 dark:text-slate-400 font-medium">{day.time.duration.replace('hours', 'ساعة').replace('minutes', 'دقيقة')}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-red-500/5 rounded-3xl border border-red-500/20">
                            <span className="material-symbols-outlined text-4xl text-red-500 mb-4">error</span>
                            <p className="font-bold text-red-500">{status}</p>
                        </div>
                    )}
                </main>

                <Footer />
            </div>
        </>
    );
}
