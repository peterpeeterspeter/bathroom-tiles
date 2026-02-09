import { GoogleGenAI, Type } from "@google/genai";
import { StyleProfile, StyleTag, ExpertAnalysis } from "../types";

const createClient = () => {
  const apiKey = process.env.GOOGLE_AI_API_KEY || '';

  if (!apiKey) {
    console.error('[StyleAnalysis] Missing GOOGLE_AI_API_KEY.');
    throw new Error('Style analysis is not configured.');
  }

  return new GoogleGenAI({ apiKey });
};

const cleanJson = (text: string) => {
  if (!text) return "";
  const match = text.match(/```(?:json|JSON)?\s*([\s\S]*?)\s*```/);
  if (match) return match[1].trim();
  const firstOpen = text.indexOf('{');
  const lastClose = text.lastIndexOf('}');
  if (firstOpen !== -1 && lastClose !== -1) return text.substring(firstOpen, lastClose + 1);
  return text.trim();
};

export async function analyzeStyleFromReferences(
  images: { base64: string; mimeType: string }[],
  tagVocabulary: string[]
): Promise<StyleProfile> {
  const ai = createClient();
  const model = "gemini-3-flash-preview";

  const vocabList = tagVocabulary.map(t => `"${t}"`).join(', ');

  const systemInstruction = `
    You are an interior design style analyst for De Badkamer, a premium bathroom renovation company.
    Analyze the provided reference images and extract the dominant style characteristics.

    CRITICAL: You must select tags ONLY from this controlled vocabulary:
    [${vocabList}]

    Assign a weight between 0.0 and 1.0 to each tag based on how prominently it appears in the images.
    Only include tags with weight >= 0.3.

    Provide a short Dutch summary (1-2 sentences) describing the overall style.
  `;

  const parts: any[] = images.map(img => ({
    inlineData: { mimeType: img.mimeType, data: img.base64 }
  }));
  parts.push({ text: "Analyze the style characteristics of these bathroom/interior reference images." });

  try {
    const response = await ai.models.generateContent({
      model,
      contents: { parts },
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            tags: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  tag: { type: Type.STRING },
                  weight: { type: Type.NUMBER }
                },
                required: ["tag", "weight"]
              }
            },
            summary_nl: { type: Type.STRING },
          },
          required: ["tags", "summary_nl"]
        }
      }
    });

    if (response.text) {
      const raw = JSON.parse(cleanJson(response.text));
      const validTags = new Set(tagVocabulary);
      const tags: StyleTag[] = (raw.tags || [])
        .filter((t: any) => validTags.has(t.tag) && t.weight >= 0.3)
        .map((t: any) => ({ tag: t.tag, weight: Math.min(1, Math.max(0, t.weight)) }))
        .sort((a: StyleTag, b: StyleTag) => b.weight - a.weight);

      return {
        tags,
        summary: raw.summary_nl || 'Stijlanalyse op basis van referentiebeelden.',
        source: 'ai_vision',
      };
    }
    throw new Error("Style analysis failed");
  } catch (error) {
    console.error("Style analysis error:", error);
    return {
      tags: tagVocabulary.slice(0, 5).map(tag => ({ tag, weight: 0.5 })),
      summary: 'Automatische stijlanalyse niet beschikbaar. Standaard profiel toegepast.',
      source: 'ai_vision',
    };
  }
}

export interface ProjectContextInput {
  stylePreset?: { name: string; tags: string[]; description: string };
  referenceImages?: { base64: string; mimeType: string }[];
  bathroomPhoto: { base64: string; mimeType: string };
  dimensions: { widthM: number; lengthM: number; heightM: number };
  tagVocabulary: string[];
}

export async function analyzeProjectContext(input: ProjectContextInput): Promise<StyleProfile> {
  const ai = createClient();
  const model = "gemini-2.0-flash";

  const vocabList = input.tagVocabulary.map(t => `"${t}"`).join(', ');

  const presetContext = input.stylePreset
    ? `De klant heeft als voorkeursstijl "${input.stylePreset.name}" gekozen (${input.stylePreset.description}). Bijbehorende tags: ${input.stylePreset.tags.join(', ')}.`
    : 'De klant heeft geen specifieke voorkeursstijl gekozen.';

  const systemInstruction = `
    Je bent een ervaren interieurarchitect en badkamerrenovatie-expert bij De Badkamer, een premium renovatiebedrijf.
    
    JOUW OPDRACHT:
    Analyseer de foto van de huidige badkamer samen met eventuele inspiratiebeelden en de stijlvoorkeur van de klant.
    Geef een professioneel renovatie-advies als expert.
    
    CONTEXT:
    ${presetContext}
    Afmetingen: ${input.dimensions.widthM}m breed × ${input.dimensions.lengthM}m lang × ${input.dimensions.heightM}m hoog (${(input.dimensions.widthM * input.dimensions.lengthM).toFixed(1)} m²).
    
    ANALYSE-INSTRUCTIES:
    1. **Huidige staat** (currentState): Beschrijf kort wat je ziet in de huidige badkamer - indeling, materialen, staat van onderhoud, sterke en zwakke punten.
    2. **Kansen** (opportunities): Noem 3-4 concrete kansen die deze ruimte biedt voor renovatie (bijv. "De brede muur tegenover het raam is ideaal voor een inloopdouche").
    3. **Aanbevelingen** (recommendations): Geef 3-4 concrete renovatie-aanbevelingen die passen bij de stijlvoorkeur EN de ruimte.
    4. **Indeling-advies** (layoutAdvice): Geef een kort advies over de optimale indeling gezien de afmetingen en bestaande aansluitingen.
    5. **Stijltags**: Selecteer tags UITSLUITEND uit deze gecontroleerde vocabulaire: [${vocabList}]. Ken een gewicht toe van 0.0 tot 1.0 op basis van hoe goed de tag past bij de gewenste renovatie.
    6. **Samenvatting** (summary_nl): Een korte professionele samenvatting (2-3 zinnen) van je renovatie-advies in het Nederlands.

    BELANGRIJK:
    - Schrijf alles in het Nederlands
    - Wees concreet en specifiek voor DEZE badkamer, niet generiek
    - Houd rekening met de bestaande leidingaansluitingen en structurele elementen
    - Combineer de stijlvoorkeur met wat praktisch haalbaar is in deze ruimte
  `;

  const parts: any[] = [];

  parts.push({
    inlineData: { mimeType: input.bathroomPhoto.mimeType, data: input.bathroomPhoto.base64 }
  });
  parts.push({ text: "[FOTO HUIDIGE BADKAMER - analyseer de huidige staat]" });

  if (input.referenceImages && input.referenceImages.length > 0) {
    for (const img of input.referenceImages) {
      parts.push({
        inlineData: { mimeType: img.mimeType, data: img.base64 }
      });
    }
    parts.push({ text: "[INSPIRATIEBEELDEN - gebruik als referentie voor de gewenste stijl]" });
  }

  parts.push({ text: "Analyseer de huidige badkamer en geef een professioneel renovatie-advies op basis van alle beschikbare informatie." });

  try {
    const response = await ai.models.generateContent({
      model,
      contents: { parts },
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            tags: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  tag: { type: Type.STRING },
                  weight: { type: Type.NUMBER }
                },
                required: ["tag", "weight"]
              }
            },
            summary_nl: { type: Type.STRING },
            currentState: { type: Type.STRING },
            opportunities: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            recommendations: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            layoutAdvice: { type: Type.STRING },
          },
          required: ["tags", "summary_nl", "currentState", "opportunities", "recommendations", "layoutAdvice"]
        }
      }
    });

    if (response.text) {
      const raw = JSON.parse(cleanJson(response.text));
      const validTags = new Set(input.tagVocabulary);
      const tags: StyleTag[] = (raw.tags || [])
        .filter((t: any) => validTags.has(t.tag) && t.weight >= 0.3)
        .map((t: any) => ({ tag: t.tag, weight: Math.min(1, Math.max(0, t.weight)) }))
        .sort((a: StyleTag, b: StyleTag) => b.weight - a.weight);

      const expertAnalysis: ExpertAnalysis = {
        currentState: raw.currentState || '',
        opportunities: raw.opportunities || [],
        recommendations: raw.recommendations || [],
        layoutAdvice: raw.layoutAdvice || '',
      };

      return {
        tags,
        summary: raw.summary_nl || 'Renovatie-advies op basis van uw badkamer en stijlvoorkeur.',
        source: input.referenceImages?.length ? 'combined' : (input.stylePreset ? 'preset' : 'ai_vision'),
        presetId: input.stylePreset ? undefined : undefined,
        presetName: input.stylePreset?.name,
        expertAnalysis,
      };
    }
    throw new Error("Project context analysis failed");
  } catch (error) {
    console.error("Project context analysis error:", error);
    throw error;
  }
}

export function combineProfiles(preset: StyleProfile, vision: StyleProfile): StyleProfile {
  const tagMap = new Map<string, number>();

  for (const t of preset.tags) {
    tagMap.set(t.tag, t.weight * 0.6);
  }

  for (const t of vision.tags) {
    const existing = tagMap.get(t.tag);
    if (existing !== undefined) {
      tagMap.set(t.tag, (existing + t.weight) / 2);
    } else {
      tagMap.set(t.tag, t.weight);
    }
  }

  const tags: StyleTag[] = Array.from(tagMap.entries())
    .map(([tag, weight]) => ({ tag, weight }))
    .sort((a, b) => b.weight - a.weight);

  return {
    tags,
    summary: `${preset.summary} ${vision.summary}`.trim(),
    source: 'combined',
    presetId: preset.presetId,
    presetName: preset.presetName,
    referenceImageUrls: vision.referenceImageUrls,
  };
}

export function presetToProfile(preset: { id: number; name: string; label_nl: string; description_nl: string; tags: string[] }): StyleProfile {
  return {
    tags: preset.tags.map(tag => ({ tag, weight: 1.0 })),
    summary: preset.description_nl,
    source: 'preset',
    presetId: preset.id,
    presetName: preset.label_nl,
  };
}
