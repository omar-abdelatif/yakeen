import Head from 'next/head';
import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function QiblaPage() {
    const [heading, setHeading] = useState<number | null>(null);
    const [qiblaDir, setQiblaDir] = useState<number>(0);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (typeof window !== 'undefined' && 'geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const lat = pos.coords.latitude;
                    const lon = pos.coords.longitude;
                    
                    // Makkah coordinates
                    const mLat = 21.4225;
                    const mLon = 39.8262;

                    const dLon = (mLon - lon) * Math.PI / 180;
                    const y = Math.sin(dLon);
                    const x = Math.cos(lat * Math.PI / 180) * Math.tan(mLat * Math.PI / 180) - 
                              Math.sin(lat * Math.PI / 180) * Math.cos(dLon);
                    
                    const qibla = (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
                    setQiblaDir(qibla);
                },
                (err) => {
                    setError("يرجى تفعيل صلاحية الوصول للموقع لتحديد القبلة");
                }
            );

            const handleOrientation = (e: any) => {
                if (e.webkitCompassHeading) {
                    setHeading(e.webkitCompassHeading);
                } else if (e.alpha !== null) {
                    setHeading(360 - e.alpha);
                }
            };

            window.addEventListener('deviceorientationabsolute', handleOrientation, true);
            window.addEventListener('deviceorientation', handleOrientation, true);

            return () => {
                window.removeEventListener('deviceorientationabsolute', handleOrientation);
                window.removeEventListener('deviceorientation', handleOrientation);
            };
        }
    }, []);

    const needleRotation = heading !== null ? qiblaDir - heading : qiblaDir;

    return (
        <>
            <Head>
                <title>يقين - اتجاه القبلة</title>
            </Head>

            <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display transition-colors duration-300">
                <Navbar />

                <main className="flex-1 mt-20 flex flex-col items-center justify-center p-6 lg:p-12">
                    <div className="text-center mb-12">
                        <h1 className="text-4xl font-black mb-4">بوصلة القبلة</h1>
                        <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                            حدد اتجاه القبلة بدقة باستخدام حساسات جهازك وموقعك الحالي.
                        </p>
                    </div>

                    <div className="relative size-72 md:size-96 flex items-center justify-center">
                        <div className="absolute inset-0 border-8 border-primary/10 rounded-full shadow-inner shadow-primary/5"></div>
                        <div className="absolute inset-4 border-2 border-dashed border-primary/20 rounded-full"></div>

                        <span className="absolute top-0 -translate-y-8 font-black text-primary">شمال</span>
                        <span className="absolute bottom-0 translate-y-8 font-black text-slate-400">جنوب</span>
                        <span className="absolute left-0 -translate-x-12 font-black text-slate-400">غرب</span>
                        <span className="absolute right-0 translate-x-12 font-black text-slate-400">شرق</span>

                        <div 
                            className="relative size-full transition-transform duration-300 ease-out"
                            style={{ transform: `rotate(${needleRotation}deg)` }}
                        >
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full w-2 h-32 md:h-44 bg-primary rounded-t-full shadow-lg shadow-primary/40"></div>
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 w-2 h-32 md:h-44 bg-slate-300 dark:bg-slate-700 rounded-b-full"></div>
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-6 bg-white border-4 border-primary rounded-full z-10"></div>
                            
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-4 bg-white dark:bg-surface-dark p-2 rounded-lg border-2 border-primary shadow-xl">
                                <span className="material-symbols-outlined text-primary text-2xl">mosque</span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-16 text-center">
                        {error ? (
                            <div className="bg-red-500/10 text-red-500 px-6 py-3 rounded-2xl flex items-center gap-3 font-bold">
                                <span className="material-symbols-outlined">error</span>
                                {error}
                            </div>
                        ) : (
                            <div className="bg-primary/10 text-primary px-8 py-4 rounded-3xl border border-primary/20 backdrop-blur-sm">
                                <span className="font-bold text-lg block mb-1">زاوية القبلة: {Math.round(qiblaDir)}°</span>
                                <span className="text-sm opacity-80">تم تحديد الاتجاه بناءً على إحداثيات موقعك</span>
                            </div>
                        )}
                    </div>
                </main>

                <Footer />
            </div>
        </>
    );
}
