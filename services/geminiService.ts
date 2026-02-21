
import { GoogleGenAI, Modality } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY || "";
const ai = new GoogleGenAI({ apiKey });

export const generateThaiTTS = async (text: string): Promise<string | null> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `กรุณาพูดประโยคต่อไปนี้ด้วยน้ำเสียงที่สุภาพและชัดเจนแบบเจ้าหน้าที่ประชาสัมพันธ์: ${text}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            // 'Puck', 'Charon', 'Kore', 'Fenrir', 'Zephyr'
            // 'Kore' is often good for female professional voices
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    return base64Audio || null;
  } catch (error: any) {
    if (error?.message?.includes('quota') || error?.message?.includes('429')) {
      console.warn("Gemini TTS Quota Exceeded. Falling back to local voice.");
    } else {
      console.error("Gemini TTS Error:", error);
    }
    return null;
  }
};
