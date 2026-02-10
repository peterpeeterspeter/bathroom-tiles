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
  const model = "gemini-3-flash-preview";

  const vocabList = input.tagVocabulary.map(t => `"${t}"`).join(', ');
  const area = (input.dimensions.widthM * input.dimensions.lengthM).toFixed(1);

  const hasPreset = !!input.stylePreset;
  const hasRefs = !!(input.referenceImages && input.referenceImages.length > 0);

  let styleContext = '';
  if (hasPreset) {
    styleContext += `De klant heeft als voorkeursstijl "${input.stylePreset!.name}" gekozen (${input.stylePreset!.description}).\nBijbehorende stijltags: ${input.stylePreset!.tags.join(', ')}.`;
  } else {
    styleContext += 'De klant heeft geen specifieke voorkeursstijl gekozen.';
  }
  if (!hasRefs && hasPreset) {
    styleContext += `\nDe klant heeft geen inspiratiebeelden geüpload. Baseer je stijladvies volledig op het "${input.stylePreset!.name}" profiel.`;
  }

  const systemInstruction = `Je bent een ervaren interieurarchitect bij De Badkamer met 15+ jaar ervaring in badkamerrenovaties in Nederland.

JOUW OPDRACHT:
Analyseer de foto van de huidige badkamer stap voor stap. Gebruik eventuele inspiratiebeelden en de stijlvoorkeur als leidraad voor je advies.

CONTEXT:
${styleContext}
Afmetingen: ${input.dimensions.widthM}m breed × ${input.dimensions.lengthM}m lang × ${input.dimensions.heightM}m hoog (${area} m²).

PRIJSCONTEXT (Nederland, 2026):
- Arbeidskosten: €40-€70/uur
- Standaard tegels: €25-€45/m², designtegels: €50-€100/m²
- Wandpanelen: €60-€90/m² (snellere installatie, geen voegonderhoud)
- Natuursteen: €80-€150/m² (luxe, hoog onderhoud)
- Complete renovatie (9m²): marktgemiddelde €14.000-€18.500
- Budget renovatie: vanaf €8.000 | Luxe: tot €25.000+
- Trend 2026: wandpanelen winnen terrein, comfort boven luxe, duurzame materialen (25+ jaar levensduur)

WERKWIJZE — volg deze stappen in volgorde:

STAP 1 — HUIDIGE STAAT (currentState)
Kijk naar de foto. Beschrijf kort:
- De indeling en grootte (klopt dit met de opgegeven afmetingen?)
- Materialen die je ziet (tegels, vloer, sanitair)
- Staat van onderhoud
- Sterke punten om te behouden
- Zwakke punten die renovatie nodig hebben

STAP 2 — CONDITIESCORE (condition_score)
Geef een score van 1-10:
1-3 = Verouderd, dringend renovatie nodig
4-5 = Functioneel maar gedateerd
6-7 = Redelijke staat, cosmetische update gewenst
8-10 = Goede staat, luxe upgrade gewenst

STAP 3 — BEHOUDEN ELEMENTEN (keepElements)
Welke elementen in de huidige badkamer zijn het waard om te behouden?
Denk aan: raamkozijn, vloerverwarming, een goed ligbad, recente leidingaansluitingen, etc.
Noem alleen elementen die je DAADWERKELIJK in de foto ziet. Lege lijst als er niets te behouden is.

STAP 4 — KANSEN (opportunities)
Noem 3-4 concrete kansen die DEZE specifieke ruimte biedt.
Koppel elke kans aan wat je in de foto ziet:
"[Wat je ziet] → [De kans die dit biedt]"

STAP 5 — AANBEVELINGEN (recommendations)
Geef 3-4 concrete renovatie-aanbevelingen die passen bij:
- De stijlvoorkeur van de klant
- De beschikbare ruimte en afmetingen
- De bestaande aansluitingen en structuur
Noem bij elke aanbeveling een indicatieve prijsrange uit de prijscontext hierboven.

STAP 6 — INDELINGSADVIES (layoutAdvice)
Geef een kort advies over de optimale indeling:
- Waar staan de bestaande aansluitingen (voor zover zichtbaar)?
- Wat is de meest praktische opstelling gegeven de afmetingen?
- Moet er leidingwerk verplaatst worden (ja/nee en waarom)?

STAP 7 — COMPLEXITEIT (estimated_complexity)
Schat de complexiteit in:
- "eenvoudig" = Zelfde indeling, nieuwe afwerking en sanitair (2-6 werkdagen)
- "gemiddeld" = Beperkte indelingswijzigingen, nieuw leidingwerk mogelijk (1-2 weken)
- "complex" = Structurele wijzigingen, muren verplaatsen, volledige herleiding (2-3+ weken)

STAP 8 — STIJLTAGS (tags)
Selecteer tags UITSLUITEND uit deze vocabulaire: [${vocabList}]
Ken een gewicht toe (0.0-1.0) op basis van hoe goed de tag past bij de GEWENSTE renovatie (niet de huidige staat).
Alleen tags met gewicht >= 0.3.

STAP 9 — SAMENVATTING (summary_nl)
Schrijf een professionele samenvatting van 2-3 zinnen.
Toon: zelfverzekerd, praktisch, enthousiasmerend maar realistisch.
Benoem de belangrijkste transformatie die mogelijk is.

KWALITEITSREGELS:
- Schrijf ALLES in het Nederlands
- Wees concreet en specifiek voor DEZE badkamer — niet generiek
- Houd rekening met bestaande leidingaansluitingen en structurele elementen
- Combineer stijlvoorkeur met wat praktisch haalbaar is

VERMIJD generieke adviezen zoals:
✗ "Overweeg een inloopdouche" — tenzij je uitlegt WAAR in deze ruimte en WAAROM het past
✗ "Gebruik lichte kleuren" — specificeer welke kleuren en op welke wanden
✗ "Moderniseer het sanitair" — specificeer WAT je zou vervangen en WAARMEE

GOED voorbeeld aanbeveling:
"Vervang het vrijstaande douchegordijn door een inloopdouche (90×120cm) tegen de rechtermuur — de wateraansluiting zit hier al. Met een regendouchekop en thermostaatkraan (indicatief €800-€1.400). Wandpanelen in betonlook passen bij de moderne stijl en zijn onderhoudsvriendelijker dan tegels."

SLECHT voorbeeld aanbeveling:
"Een inloopdouche zou mooi staan in deze ruimte. Moderne materialen geven een frisse uitstraling."`;

  const parts: any[] = [];

  if (hasRefs) {
    for (const img of input.referenceImages!) {
      parts.push({
        inlineData: { mimeType: img.mimeType, data: img.base64 }
      });
    }
    parts.push({ text: "[INSPIRATIEBEELDEN — dit is de stijl die de klant wil bereiken]" });
  }

  parts.push({
    inlineData: { mimeType: input.bathroomPhoto.mimeType, data: input.bathroomPhoto.base64 }
  });
  parts.push({ text: "[FOTO HUIDIGE BADKAMER — dit is de huidige staat die gerenoveerd moet worden]" });

  parts.push({ text: "Analyseer de huidige badkamer stap voor stap en geef een professioneel renovatie-advies op basis van alle beschikbare informatie." });

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
            currentState: { type: Type.STRING },
            condition_score: { type: Type.INTEGER },
            keepElements: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            opportunities: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            recommendations: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            layoutAdvice: { type: Type.STRING },
            estimated_complexity: { type: Type.STRING },
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
          required: ["currentState", "condition_score", "keepElements", "opportunities", "recommendations", "layoutAdvice", "estimated_complexity", "tags", "summary_nl"]
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

      const validComplexity = ['eenvoudig', 'gemiddeld', 'complex'] as const;
      const rawComplexity = (raw.estimated_complexity || '').toLowerCase().trim();
      const complexity = validComplexity.includes(rawComplexity as any) ? rawComplexity as typeof validComplexity[number] : 'gemiddeld';

      const conditionScore = Math.max(1, Math.min(10, Math.round(Number(raw.condition_score) || 5)));

      const expertAnalysis: ExpertAnalysis = {
        currentState: raw.currentState || '',
        conditionScore,
        keepElements: raw.keepElements || [],
        opportunities: raw.opportunities || [],
        recommendations: raw.recommendations || [],
        layoutAdvice: raw.layoutAdvice || '',
        estimatedComplexity: complexity,
      };

      return {
        tags,
        summary: raw.summary_nl || 'Renovatie-advies op basis van uw badkamer en stijlvoorkeur.',
        source: hasRefs ? 'combined' : (hasPreset ? 'preset' : 'ai_vision'),
        presetId: undefined,
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
