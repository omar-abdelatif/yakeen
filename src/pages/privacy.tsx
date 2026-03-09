import Head from 'next/head';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function PrivacyPage() {
    return (
        <>
            <Head>
                <title>سياسة الخصوصية - يقين</title>
            </Head>
            <div className="relative flex min-h-screen w-full flex-col bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 transition-colors duration-300">
                <Navbar />
                <main className="flex-1 max-w-4xl mx-auto px-6 py-20 text-right" dir="rtl">
                    <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-12">سياسة الخصوصية</h1>
                    <div className="bg-white dark:bg-surface-dark p-8 md:p-12 rounded-[2rem] border border-primary/10 shadow-sm space-y-8 text-slate-600 dark:text-slate-300">
                        <section>
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">جمع المعلومات</h2>
                            <p>
                                نحن في "يقين" نحترم خصوصيتك تماماً. التطبيق يطلب الوصول إلى موقعك الجغرافي (Geolocation) فقط لغرض واحد وهو حساب مواقيت الصلاة الدقيقة وتحديد اتجاه القبلة الخاص بمدينتك. لا يتم تخزين هذه البيانات في خوادمنا ولا يتم مشاركتها مع أي طرف ثالث.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">التخزين المحلي</h2>
                            <p>
                                نستخدم تقنيات التخزين المحلي في متصفحك لحفظ تفضيلاتك (مثل الوضع الليلي أو عداد السبحة) لضمان تجربة مستخدم سلسة في المرات القادمة التي تزور فيها التطبيق.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">روابط الأطراف الثالثة</h2>
                            <p>
                                قد يحتوي التطبيق على روابط لمواقع خارجية أو خدمات API (مثل جلب مواقيت الصلاة). هذه الخدمات لها سياسات خصوصية مستقلة، وننصحك بمراجعتها.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">التحديثات</h2>
                            <p>
                                قد نقوم بتحديث سياسة الخصوصية من وقت لآخر لمواكبة التغييرات في قوانين حماية البيانات أو تحديثات التطبيق.
                            </p>
                        </section>
                    </div>
                </main>
                <Footer />
            </div>
        </>
    );
}
