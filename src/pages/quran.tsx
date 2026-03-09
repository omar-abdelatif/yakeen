import Head from 'next/head';
import { useState, useEffect, useRef } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function QuranPage() {
    const [surahs, setSurahs] = useState<any[]>([]);
    const [reciters, setReciters] = useState<any[]>([]);
    const [selectedReciter, setSelectedReciter] = useState<any>(null);
    const [currentSurah, setCurrentSurah] = useState<any>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [currentTime, setCurrentTime] = useState('00:00');
    const [duration, setDuration] = useState('00:00');
    const audioRef = useRef<HTMLAudioElement>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState<'listening' | 'reading'>('listening');
    const [surahText, setSurahText] = useState<any[]>([]);
    const [loadingText, setLoadingText] = useState(false);

    useEffect(() => {
        fetch('https://quran.yousefheiba.com/api/surahs')
            .then(r => r.json())
            .then(data => {
                setSurahs(data);
                if (data.length > 0) setCurrentSurah(data[0]);
            });

        fetch('https://quran.yousefheiba.com/api/reciters')
            .then(r => r.json())
            .then(data => {
                const list = data.reciters || [];
                setReciters(list);
                if (list.length > 0) setSelectedReciter(list[0]);
            });
    }, []);

    useEffect(() => {
        if (activeTab === 'reading' && currentSurah) {
            fetchSurahText(currentSurah.id);
        }
    }, [activeTab, currentSurah]);

    const fetchSurahText = async (surahId: number) => {
        setLoadingText(true);
        try {
            const res = await fetch(`https://api.alquran.cloud/v1/surah/${surahId}`);
            const data = await res.json();
            if (data.code === 200) {
                setSurahText(data.data.ayahs);
            }
        } catch (e) {
            console.error("Failed to fetch surah text", e);
        } finally {
            setLoadingText(false);
        }
    };

    const togglePlay = () => {
        if (!audioRef.current) return;
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    const handleTimeUpdate = () => {
        if (!audioRef.current) return;
        const cur = audioRef.current.currentTime;
        const dur = audioRef.current.duration;
        if (dur) {
            setProgress((cur / dur) * 100);
            setCurrentTime(formatSeconds(cur));
            setDuration(formatSeconds(dur));
        }
    };

    const formatSeconds = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const playSurah = (surah: any) => {
        setCurrentSurah(surah);
        setIsPlaying(true);
        if (audioRef.current) {
            audioRef.current.load();
            audioRef.current.play().catch(e => console.error("Playback failed", e));
        }
    };

    const audioUrl = currentSurah && selectedReciter 
        ? `https://quran.yousefheiba.com/api/surahAudio?reciter=${selectedReciter.reciter_short_name}&id=${currentSurah.id}`
        : '';

    const filteredSurahs = surahs.filter(s => 
        s.name_ar.includes(searchQuery) || s.name_en.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <>
            <Head>
                <title>يقين - القرآن الكريم</title>
            </Head>

            <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display transition-colors duration-300">
                <Navbar />

                <main className="flex-1 mt-20 flex flex-col lg:flex-row max-w-[1440px] mx-auto w-full px-4 lg:px-40 py-8 gap-8">
                    {/* Sidebar */}
                    <aside className="w-full lg:w-80 flex flex-col gap-6 shrink-0">
                        {/* Tabs Toggle */}
                        <div className="flex p-1 bg-slate-100 dark:bg-surface-dark rounded-2xl border border-primary/10">
                            <button 
                                onClick={() => setActiveTab('listening')}
                                className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'listening' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-500 hover:text-primary'}`}
                            >
                                <span className="flex items-center justify-center gap-2">
                                    <span className="material-symbols-outlined text-sm">headphones</span>
                                    استماع
                                </span>
                            </button>
                            <button 
                                onClick={() => setActiveTab('reading')}
                                className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'reading' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-500 hover:text-primary'}`}
                            >
                                <span className="flex items-center justify-center gap-2">
                                    <span className="material-symbols-outlined text-sm">auto_stories</span>
                                    قراءة
                                </span>
                            </button>
                        </div>

                        {activeTab === 'listening' && (
                            <div className="bg-white dark:bg-surface-dark p-6 rounded-3xl border border-primary/10 shadow-sm animate-in fade-in duration-300">
                                <h3 className="text-lg font-black mb-4 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-primary">person</span>
                                    القارئ
                                </h3>
                                <div className="relative">
                                    <select 
                                        value={selectedReciter?.reciter_id || ''}
                                        onChange={(e) => setSelectedReciter(reciters.find(r => r.reciter_id == e.target.value))}
                                        className="w-full bg-slate-50 dark:bg-background-dark border border-slate-100 dark:border-white/5 rounded-2xl px-4 py-3 appearance-none focus:ring-2 focus:ring-primary focus:outline-none font-bold"
                                    >
                                        {reciters.map(r => <option key={r.reciter_id} value={r.reciter_id}>{r.reciter_name}</option>)}
                                    </select>
                                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-primary">expand_more</span>
                                </div>
                            </div>
                        )}

                        <div className="bg-white dark:bg-surface-dark p-6 rounded-3xl border border-primary/10 shadow-sm flex-1 flex flex-col max-h-[600px]">
                             <h3 className="text-lg font-black mb-4 flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">list</span>
                                السور
                            </h3>
                            <div className="relative mb-4">
                                <input 
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-slate-50 dark:bg-background-dark border border-slate-100 dark:border-white/5 rounded-xl px-4 py-2 pr-10 focus:ring-1 focus:ring-primary focus:outline-none font-medium text-sm"
                                    placeholder="ابحث..."
                                />
                                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">search</span>
                            </div>

                            <div className="flex-1 overflow-y-auto space-y-2 no-scrollbar">
                                {filteredSurahs.map(surah => (
                                    <button 
                                        key={surah.id}
                                        onClick={() => playSurah(surah)}
                                        className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${currentSurah?.id === surah.id ? 'bg-primary text-white' : 'hover:bg-primary/5 bg-slate-50/50 dark:bg-white/5'}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className={`text-[10px] font-bold ${currentSurah?.id === surah.id ? 'text-white/70' : 'text-primary'}`}>{surah.id}</span>
                                            <div className="text-right">
                                                <p className="font-bold text-sm">{surah.name_ar}</p>
                                            </div>
                                        </div>
                                        <span className={`text-[10px] ${currentSurah?.id === surah.id ? 'text-white/60' : 'text-slate-400'}`}>{surah.ayat_count} آية</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </aside>

                    {/* Main Content Area */}
                    <div className="flex-1 flex flex-col gap-6">
                        {activeTab === 'listening' ? (
                            <div className="bg-white dark:bg-surface-dark rounded-3xl border border-primary/10 shadow-sm overflow-hidden flex flex-col h-[700px] animate-in slide-in-from-left duration-300">
                                <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-radial from-primary/5 to-transparent">
                                    <div className="size-48 rounded-full bg-primary/10 flex items-center justify-center mb-8 relative">
                                        <div className={`absolute inset-0 rounded-full border-4 border-primary/20 ${isPlaying ? 'animate-ping' : ''}`}></div>
                                        <span className="material-symbols-outlined text-primary text-8xl">graphic_eq</span>
                                    </div>
                                    <h2 className="text-4xl font-black mb-2">{currentSurah?.name_ar}</h2>
                                    <p className="text-xl text-primary font-bold mb-4">{selectedReciter?.reciter_name}</p>
                                    <div className="flex items-center gap-4 text-slate-400 font-medium">
                                        <span>{currentSurah?.type === 'Meccan' ? 'مكية' : 'مدنية'}</span>
                                        <span>•</span>
                                        <span>{currentSurah?.ayat_count} آية</span>
                                    </div>
                                </div>
                                
                                {/* Player Bar */}
                                <div className="bg-white dark:bg-slate-900 border-t border-primary/20 p-8">
                                    <audio 
                                        ref={audioRef} 
                                        src={audioUrl} 
                                        onTimeUpdate={handleTimeUpdate} 
                                        onEnded={() => setIsPlaying(false)}
                                    />
                                    <div className="space-y-6">
                                        <div className="relative group cursor-pointer h-2 bg-primary/10 rounded-full">
                                            <div className="absolute top-0 right-0 h-full bg-primary transition-all duration-300 rounded-full" style={{ width: `${progress}%` }}></div>
                                        </div>
                                        <div className="flex justify-between text-xs font-mono text-slate-400">
                                            <span>{duration}</span>
                                            <span>{currentTime}</span>
                                        </div>
                                        <div className="flex items-center justify-center gap-12">
                                            <button className="text-slate-400 hover:text-primary transition-colors">
                                                <span className="material-symbols-outlined text-4xl">skip_next</span>
                                            </button>
                                            <button 
                                                onClick={togglePlay}
                                                className="size-20 bg-primary text-white rounded-full flex items-center justify-center shadow-xl shadow-primary/30 hover:scale-105 transition-all active:scale-95"
                                            >
                                                <span className="material-symbols-outlined text-5xl">{isPlaying ? 'pause' : 'play_arrow'}</span>
                                            </button>
                                            <button className="text-slate-400 hover:text-primary transition-colors">
                                                <span className="material-symbols-outlined text-4xl">skip_previous</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white dark:bg-surface-dark rounded-3xl border border-primary/10 shadow-sm overflow-hidden flex flex-col h-[700px] animate-in slide-in-from-right duration-300">
                                <div className="bg-primary/5 p-6 border-b border-primary/10 flex justify-between items-center text-right">
                                    <h2 className="text-2xl font-black text-primary">{currentSurah?.name_ar}</h2>
                                    <div className="flex items-center gap-4">
                                        <span className="text-sm font-bold opacity-50">{currentSurah?.ayat_count} آية</span>
                                        <span className="bg-primary text-white text-xs px-3 py-1 rounded-full font-bold">{currentSurah?.type === 'Meccan' ? 'مكية' : 'مدنية'}</span>
                                    </div>
                                </div>
                                <div className="flex-1 overflow-y-auto p-8 md:p-12 space-y-8 text-center scroll-smooth no-scrollbar" dir="rtl">
                                    {loadingText ? (
                                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                                            <div className="size-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                                            <p className="text-slate-400">جاري تحميل الآيات...</p>
                                        </div>
                                    ) : (
                                        <>
                                            {currentSurah?.id !== 1 && currentSurah?.id !== 9 && (
                                                <div className="font-quran text-3xl mb-12 text-primary">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</div>
                                            )}
                                            <div className="flex flex-wrap justify-center gap-y-12">
                                                {surahText.map((ayah: any) => (
                                                    <span key={ayah.number} className="inline-block relative px-2">
                                                        <span className="font-quran text-3xl md:text-4xl leading-[2.5] text-slate-800 dark:text-slate-100">
                                                            {ayah.text}
                                                        </span>
                                                        <span className="inline-flex items-center justify-center mx-3 size-10 rounded-full border-2 border-primary/20 text-xs font-bold text-primary font-mono align-middle">
                                                            {ayah.numberInSurah}
                                                        </span>
                                                    </span>
                                                ))}
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </main>

                <Footer />
            </div>

            <style jsx global>{`
                @font-face {
                    font-family: 'QuranFont';
                    src: url('https://fonts.googleapis.com/css2?family=Amiri+Quran&display=swap');
                }
                .font-quran {
                    font-family: 'Amiri Quran', serif;
                }
            `}</style>
        </>
    );
}
