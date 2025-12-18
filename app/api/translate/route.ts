import { NextResponse } from "next/server";
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
//   apiKey : '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',
  baseURL: "https://openrouter.ai/api/v1",
});

console.log(process.env.OPENAI_API_KEY ? "API key loaded" : "No API key");


export async function POST(req: Request) {
  try {
    const { text, targetLanguage } = await req.json();

    if (!text) {
      return NextResponse.json({ translation: "" });
    }

const prompt = `
You are a professional medical translation engine.

TASK:
Translate the input text into the target language.

STRICT OUTPUT RULES (MANDATORY):
- Output ONLY the translated text.
- Do NOT add explanations, notes, labels, or commentary.
- Do NOT repeat the input text.
- Do NOT include quotes, punctuation notes, or formatting.
- Do NOT mention the source or target language.
- Preserve medical terminology exactly.
- If the input is already in the target language, return it unchanged.

INPUT TEXT:
${text}

TARGET LANGUAGE:
${targetLanguage}
`;


    const completion = await client.chat.completions.create({
      model: "openai/gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
    });

    return NextResponse.json({
      translation: completion.choices[0].message.content,
    });
  } catch (error) {
    console.error("Translation error:", error);
    return NextResponse.json(
      { error: "Translation failed" },
      { status: 500 }
    );
  }
}
