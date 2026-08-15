'use client';
import { useState } from 'react';
import { UploadCloud, MessageSquare, Crown, Send, ShieldCheck } from 'lucide-react';

export default function Home() {
  const [file, setFile] = useState(null);
  const [attempts, setAttempts] = useState(3);
  const [isPremium, setIsPremium] = useState(false);

  return (
    <div className="min-h-screen bg-[#0F172A] text-white font-sans selection:bg-blue-500 selection:text-white" dir="rtl">
      {/* شريط التنقل العلوي */}
      <nav className="flex justify-between items-center p-6 bg-white/5 backdrop-blur-md border-b border-white/10">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
          Q2Mid
        </h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-300">
            {isPremium ? 'حساب Premium 👑' : `المحاولات المجانية: ${attempts}/3`}
          </span>
          <button className="bg-purple-600 hover:bg-purple-500 px-4 py-2 rounded-lg font-semibold transition shadow-[0_0_15px_rgba(139,92,246,0.4)] flex items-center gap-2">
            <Crown size={18} /> الترقية الآن
          </button>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto mt-12 p-6">
        {/* قسم رفع الملفات */}
        <div className="bg-white/5 border border-white/10 p-12 rounded-2xl text-center backdrop-blur-lg hover:border-blue-500/50 transition duration-300">
          <UploadCloud className="mx-auto text-blue-500 mb-4" size={64} />
          <h2 className="text-2xl font-bold mb-2">ارفع ملف PDF للبدء</h2>
          <p className="text-gray-400 mb-6">الذكاء الاصطناعي الخاص بنا سيقوم بالقراءة والتحليل الفوري</p>
          <input type="file" id="file-upload" className="hidden" accept=".pdf" onChange={(e) => setFile(e.target.files?.[0])} />
          <label htmlFor="file-upload" className="cursor-pointer bg-blue-600 hover:bg-blue-500 px-8 py-3 rounded-full font-bold shadow-[0_0_20px_rgba(59,130,246,0.5)] transition inline-block">
            {file ? `تم اختيار: ${file.name}` : 'اختر ملفاً'}
          </label>
        </div>

        {/* قسم المحادثة */}
        <div className="mt-8 bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-lg h-96 flex flex-col justify-end relative">
          {attempts === 0 && !isPremium && (
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center z-10 text-center p-6">
              <ShieldCheck className="text-purple-500 mb-4" size={50} />
              <h3 className="text-2xl font-bold mb-2">نفدت محاولاتك المجانية!</h3>
              <p className="text-gray-300 mb-6">قم بالترقية للحصول على وصول غير محدود وتمتع بكافة المميزات.</p>
              
              <div className="flex gap-4">
                <a href="https://t.me/ID29i" target="_blank" rel="noreferrer" className="bg-[#229ED9] hover:bg-[#1CA0DE] px-6 py-3 rounded-lg font-bold flex items-center gap-2 transition">
                  الاشتراك عبر تيليجرام (5$/شهر)
                </a>
              </div>
              <p className="text-xs text-gray-400 mt-4">للتواصل والدعم الفني: appsmr32@gmail.com</p>
            </div>
          )}

          <div className="flex gap-4 items-center bg-black/30 p-2 rounded-xl border border-white/10">
            <input 
              type="text" 
              placeholder="اسأل أي شيء عن الملف..." 
              className="flex-1 bg-transparent outline-none p-3 text-white placeholder-gray-500"
              disabled={attempts === 0 && !isPremium}
            />
            <button className="bg-blue-600 p-3 rounded-lg hover:bg-blue-500 transition">
              <Send size={20} />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
