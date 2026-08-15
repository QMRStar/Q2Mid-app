import { GoogleGenerativeAI } from '@google/generative-ai';
import { supabase } from '@/app/lib/supabase'; // تم تحديث المسار
import { NextResponse } from 'next/server';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(req) {
  try {
    const { prompt, pdfText, userId } = await req.json();

    // 1. التحقق من رصيد المستخدم في قاعدة البيانات
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('free_attempts, plan')
      .eq('id', userId)
      .single();

    if (userProfile && userProfile.plan === 'free' && userProfile.free_attempts <= 0) {
      return NextResponse.json({ error: 'نفدت المحاولات المجانية' }, { status: 403 });
    }

    // 2. إرسال الطلب لـ Gemini مع توجيه باللغة العربية
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const aiPrompt = `أنت مساعد ذكي متخصص في المستندات لمنصة Q2Mid. أجب بلغة عربية فصحى واضحة. 
    النص المستخرج: ${pdfText}. 
    السؤال: ${prompt}`;
    
    const result = await model.generateContent(aiPrompt);
    const response = await result.response;
    const text = response.text();

    // 3. خصم محاولة إذا كان الحساب مجانياً
    if (userProfile && userProfile.plan === 'free') {
      await supabase
        .from('profiles')
        .update({ free_attempts: userProfile.free_attempts - 1 })
        .eq('id', userId);
    }

    return NextResponse.json({ text });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
