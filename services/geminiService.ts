
import { GoogleGenAI, Type } from "@google/genai";
import { SYSTEM_INSTRUCTION } from "../constants";

export class GeminiService {
  private getAI() {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      console.error("JERSEYSWAP_CRITICAL: API_KEY is undefined.");
    }
    return new GoogleGenAI({ apiKey: apiKey || '' });
  }

  async generateNeuralBio(name: string, role: string, keywords: string[]): Promise<string> {
    const ai = this.getAI();
    const prompt = `Generate a short, high-energy "Scouting Report" style bio for a ${role} named ${name}. 
    Use these keywords as the vibe: ${keywords.join(', ')}. 
    Keep it under 50 words. Focus on "legacy," "neural dominance," and "next-gen impact."`;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          systemInstruction: "You are an elite sports brand copywriter for Nike and EA Sports.",
          temperature: 0.8,
        }
      });
      return response.text || "Neural bio synthesis complete.";
    } catch (err) {
      console.error(err);
      return `A dominant force in the ${role} arena, ${name} is defined by ${keywords.join(' and ')}.`;
    }
  }

  async performFlashImageEdit(base64Image: string, prompt: string): Promise<string> {
    try {
      const ai = this.getAI();
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            { inlineData: { data: base64Image.split(',')[1], mimeType: 'image/jpeg' } },
            { text: `Apply this edit to the image: ${prompt}. Maintain athlete identity and Nike/Apple design aesthetics.` },
          ],
        },
      });

      const part = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
      return part ? `data:image/png;base64,${part.inlineData.data}` : '';
    } catch (error) {
      console.error("Flash Image Edit failed:", error);
      throw error;
    }
  }

  async prepareAthletePlate(base64Image: string): Promise<string> {
    const prompt = `NEURAL PRE-PROCESSING: Analyze this image. Identify the athlete. Face must remain 100% identical. Ensure the image is optimized for a design swap while preserving the original environment.`;
    try {
      const ai = this.getAI();
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-image-preview',
        contents: {
          parts: [
            { inlineData: { data: base64Image.split(',')[1], mimeType: 'image/jpeg' } },
            { text: prompt },
          ],
        },
        config: { 
          systemInstruction: SYSTEM_INSTRUCTION,
          imageConfig: { aspectRatio: "3:4", imageSize: "1K" }
        }
      });
      const part = response.candidates?.[0]?.content?.parts.find(part => part.inlineData);
      return part ? `data:image/png;base64,${part.inlineData.data}` : base64Image;
    } catch (error) {
      console.error("Preparation failed:", error);
      return base64Image;
    }
  }

  async performJerseySwap(base64Image: string, teamName: string, number: string, removeBackground: boolean = false, customPrompt: string = ''): Promise<string> {
    const bgInstruction = removeBackground ? "Isolate the athlete and place them on a clean, professional stadium or studio background." : "Preserve the original background exactly as it is.";
    const designAdditions = customPrompt ? ` Additional design directive: ${customPrompt}.` : "";
    const prompt = `IDENTITY LOCK PROTOCOL: Replace clothing with official ${teamName} uniform (Number ${number}). Photorealistic 8K render. ${bgInstruction}${designAdditions}`;
    try {
      const ai = this.getAI();
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-image-preview',
        contents: {
          parts: [
            { inlineData: { data: base64Image.split(',')[1], mimeType: 'image/jpeg' } },
            { text: prompt },
          ],
        },
        config: { 
          systemInstruction: SYSTEM_INSTRUCTION,
          imageConfig: { aspectRatio: "3:4", imageSize: "1K" }
        }
      });
      const part = response.candidates?.[0]?.content?.parts.find(part => part.inlineData);
      return part ? `data:image/png;base64,${part.inlineData.data}` : '';
    } catch (error) {
      console.error("Swap failed:", error);
      throw error;
    }
  }

  async performGenerativeEdit(base64Image: string, prompt: string, tool: 'fill' | 'bg' | 'lighting' | 'erase', maskBase64?: string): Promise<string> {
    const fullPrompt = `Generative Edit: ${prompt}. ${maskBase64 ? "The second image is a mask." : ""}`;
    try {
      const ai = this.getAI();
      const parts: any[] = [{ inlineData: { data: base64Image.split(',')[1], mimeType: 'image/jpeg' } }];
      if (maskBase64) parts.push({ inlineData: { data: maskBase64.split(',')[1], mimeType: 'image/png' } });
      parts.push({ text: fullPrompt });
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-image-preview',
        contents: { parts },
        config: { 
          systemInstruction: SYSTEM_INSTRUCTION,
          imageConfig: { aspectRatio: "3:4", imageSize: "1K" }
        }
      });
      const part = response.candidates?.[0]?.content?.parts.find(part => part.inlineData);
      return part ? `data:image/png;base64,${part.inlineData.data}` : '';
    } catch (error) {
      console.error("Generative Edit failed:", error);
      throw error;
    }
  }

  async queryScoutMode(query: string) {
    const ai = this.getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: query,
      config: { tools: [{ googleSearch: {} }] },
    });
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => {
      if (chunk.web) return { uri: chunk.web.uri, title: chunk.web.title };
      return null;
    }).filter(Boolean) || [];
    return { text: response.text || "No intelligence found.", sources };
  }

  async queryCoachMode(query: string) {
    const ai = this.getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `User design advice: ${query}.`,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            text: { type: Type.STRING },
            suggestions: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["text", "suggestions"]
        }
      }
    });
    return JSON.parse(response.text || '{"text":"Neural error.","suggestions":[]}');
  }

  async generatePlayerStats(teamName: string) {
    const ai = this.getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Generate scouting background and stats for ${teamName}.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            background: { type: Type.STRING },
            highlights: { type: Type.ARRAY, items: { type: Type.STRING } },
            stats: {
              type: Type.OBJECT,
              properties: {
                SPD: { type: Type.NUMBER },
                ACC: { type: Type.NUMBER },
                STR: { type: Type.NUMBER },
                AWR: { type: Type.NUMBER },
                AGI: { type: Type.NUMBER },
                OVR: { type: Type.NUMBER }
              }
            }
          },
          required: ["background", "highlights", "stats"]
        }
      }
    });
    return JSON.parse(response.text || '{}');
  }
}
