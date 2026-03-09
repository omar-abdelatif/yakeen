import Head from 'next/head';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function AboutPage() {
    return (
        <>
            <Head>
                <title>عن يقين - دليلك الرقمي للعبادة</title>
            </Head>
            <div className="relative flex min-h-screen w-full flex-col bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 transition-colors duration-300">
                <Navbar />
                <main className="flex-1 mt-20 max-w-4xl mx-auto px-6 py-20 text-right" dir="rtl">
                    <h1 className="text-5xl font-black text-primary mb-8 animate-in slide-in-from-bottom duration-500">عن يقين</h1>
                    <div className="space-y-8 text-lg leading-relaxed text-slate-600 dark:text-slate-300">
                        <section className="bg-white dark:bg-surface-dark p-8 rounded-3xl border border-primary/10 shadow-sm">
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">رؤيتنا</h2>
                            <p>
                                يهدف تطبيق "يقين" إلى توفير تجربة رقمية شاملة وموثوقة للمسلم في العصر الحديث. نحن نؤمن بأن التكنولوجيا يجب أن تكون أداة لتقوية الروحانية وتسهيل أداء العبادات اليومية.
                            </p>
                        </section>

                        <section className="bg-white dark:bg-surface-dark p-8 rounded-3xl border border-primary/10 shadow-sm">
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">لماذا يقين؟</h2>
                            <p>
                                تم تصميم "يقين" ليكون بسيطاً، جميلاً، وخالياً من المشتتات. نركز على الدقة في مواقيت الصلاة، والجودة في تلاوات القرآن الكريم، والسهولة في الوصول إلى الأذكار والأدعية التي يحتاجها المسلم في يومه وليلته.
                            </p>
                        </section>

                        <section className="bg-white dark:bg-surface-dark p-8 rounded-3xl border border-primary/10 shadow-sm">
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">مميزات التطبيق</h2>
                            <ul className="list-disc list-inside space-y-2">
                                <li>مواقيت صلاة دقيقة بناءً على موقعك الجغرافي.</li>
                                <li>مصحف رقمي مع إمكانية القراءة والاستماع لأشهر القراء.</li>
                                <li>إمساكية رمضان محدثة لحظياً.</li>
                                <li>بوصلة دقيقة لتحديد اتجاه القبلة.</li>
                                <li>مجموعة واسعة من الأذكار والأدعية الموثوقة.</li>
                            </ul>
                        </section>
                    </div>
                </main>
                <Footer />
            </div>
        </>
    );
}
