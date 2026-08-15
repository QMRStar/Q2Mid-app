export const dynamic = 'force-dynamic';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { supabase } from '@/app/lib/supabase';
import { NextResponse } from 'next/server';

const apiKey = process.env.GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(apiKey);

export async function POST(req) {
  try {
    const formData = await req.formData();
    const prompt = formData.get('prompt') || 'لخص واشرح هذا الملف بالتفصيل';
    const file = formData.get('file');
    const userId = formData.get('userId');

    // 1. التحقق من رصيد المستخدم في Supabase (إن وُجد)
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

    // 2. استخدام الإصدار المستقر gemini-1.5-flash
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const promptParts = [];

    // تحويل ملف PDF إلى Base64
    if (file && typeof file !== 'string') {
      const arrayBuffer = await file.arrayBuffer();
      const base64Data = Buffer.from(arrayBuffer).toString('base64');
      promptParts.push({
        inlineData: {
          data: base64Data,
          mimeType: file.type || 'application/pdf',
        },
      });
    }

    const aiPrompt = `أنت مساعد ذكي متخصص في قراءة وتحليل المستندات لمنصة Q2Mid. أجب بلغة عربية فصحى دقيقة وشاملة.\n\nالمطلوب: ${prompt}`;
    promptParts.push(aiPrompt);

    // 3. إرسال الطلب للنموذج
    const result = await model.generateContent(promptParts);
    const response = await result.response;
    const text = response.text();

    // 4. خصم محاولة إذا كان الحساب مجانياً
    if (userProfile && userProfile.plan === 'free') {
      await supabase
        .from('profiles')
        .update({ free_attempts: userProfile.free_attempts - 1 })
        .eq('id', userId);
    }

    return NextResponse.json({ text });
  } catch (error) {
    console.error('Gemini Error:', error);
    return NextResponse.json({ error: error.message || 'حدث خطأ أثناء معالجة الطلب' }, { status: 500 });
  }
}
