'use client';

import { useState } from 'react';

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [prompt, setPrompt] = useState('شرح');
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!file && !prompt.trim()) return;
    setLoading(true);

    const userMessage = prompt || (file ? `ملف: ${file.name}` : '');
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);

    try {
      const formData = new FormData();
      if (file) formData.append('file', file);
      formData.append('prompt', prompt);

      const res = await fetch('/api/chat', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (data.response || data.text || data.message) {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: data.response || data.text || data.message },
        ]);
      } else if (data.error) {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: `خطأ: ${data.error}` },
        ]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'حدث خطأ أثناء الاتصال بالسيرفر.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white flex flex-col items-center p-4">
      <div className="w-full max-w-md flex flex-col gap-4 mt-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center shadow-lg">
          <label
            htmlFor="file-upload"
            className="cursor-pointer bg-blue-600 hover:bg-blue-500 text-white font-medium py-3 px-6 rounded-full inline-block transition w-full shadow-lg"
          >
            {file ? `تم اختيار: ${file.name}` : 'ارفع ملف PDF للبدء'}
          </label>
          <input
            type="file"
            id="file-upload"
            className="hidden"
            accept=".pdf"
            onChange={(e) => {
              if (e.target.files?.[0]) setFile(e.target.files[0]);
            }}
          />
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 h-96 overflow-y-auto flex flex-col gap-3">
          {messages.length === 0 ? (
            <p className="text-gray-500 text-center my-auto">
              ارفع الملف واضغط إرسال لبدء التحليل
            </p>
          ) : (
            messages.map((msg, i) => (
              <div
                key={i}
                className={`p-3 rounded-xl max-w-[85%] text-sm whitespace-pre-wrap ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white self-end'
                    : 'bg-slate-800 text-gray-200 self-start'
                }`}
              >
                {msg.content}
              </div>
            ))
          )}
          {loading && (
            <p className="text-blue-400 text-sm text-center animate-pulse">
              جاري القراءة والتحليل بواسطة الذكاء الاصطناعي...
            </p>
          )}
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-2 flex items-center gap-2">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="اكتب طلبك هنا..."
            className="bg-transparent flex-1 px-3 text-sm text-white focus:outline-none text-right"
          />
          <button
            onClick={handleSend}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 p-2.5 rounded-lg text-white transition"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-5 h-5 -rotate-90"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
              />
            </svg>
          </button>
        </div>
      </div>
    </main>
  );
}
