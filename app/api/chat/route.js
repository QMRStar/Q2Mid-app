export const dynamic = 'force-dynamic';
import { supabase } from '@/app/lib/supabase';
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const formData = await req.formData();
    const prompt = formData.get('prompt') || 'شرح وتلخيص هذا الملف بالتفصيل';
    const file = formData.get('file');
    const userId = formData.get('userId');

    // 1. التحقق من رصيد المستخدم في Supabase
    let userProfile = null;
    if (userId) {
      const { data } = await supabase
        .from('profiles')
        .select('free_attempts, plan')
        .eq('id', userId)
        .single();
      userProfile = data;

      if (userProfile && userProfile.plan === 'free' && userProfile.free_attempts <= 0) {
        return NextResponse.json({ error: 'نفدت المحاولات المجانية' }, { status: 403 });
      }
    }

    // 2. تجهيز البيانات للذكاء الاصطناعي
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'مفتاح GEMINI_API_KEY غير موجود في إعدادات البيئة' }, { status: 500 });
    }

    const parts = [];

    // تحويل الـ PDF إلى Base64
    if (file && typeof file !== 'string') {
      const arrayBuffer = await file.arrayBuffer();
      const base64Data = Buffer.from(arrayBuffer).toString('base64');
      parts.push({
        inline_data: {
          mime_type: file.type || 'application/pdf',
          data: base64Data,
        },
      });
    }

    parts.push({
      text: `أنت مساعد ذكي متخصص في المستندات لمنصة Q2Mid. أجب بلغة عربية فصحى واضحة وشاملة.\n\nالمطلوب: ${prompt}`,
    });

    // 3. إرسال الطلب المباشر عبر REST API
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const apiResponse = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts }],
      }),
    });

    const data = await apiResponse.json();

    if (!apiResponse.ok) {
      return NextResponse.json(
        { error: data.error?.message || 'خطأ أثناء الاتصال بنموذج الذكاء الاصطناعي' },
        { status: apiResponse.status }
      );
    }

    const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text || 'لم يتم استخراج رد.';

    // 4. خصم المحاولة إن وجد
    if (userProfile && userProfile.plan === 'free') {
      await supabase
        .from('profiles')
        .update({ free_attempts: userProfile.free_attempts - 1 })
        .eq('id', userId);
    }

    return NextResponse.json({ text: replyText });
  } catch (error) {
    console.error('Chat API Error:', error);
    return NextResponse.json({ error: error.message || 'حدث خطأ أثناء معالجة الطلب' }, { status: 500 });
  }
}
