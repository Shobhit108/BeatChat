import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const generateAIReply = async (text) => {
  try {
    const res = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a helpful chat assistant. Reply short." },
        { role: "user", content: text || "Hello" },
      ],
    });

    return res.choices[0].message.content;
  } catch (error) {
    console.log("OpenAI error:", error);
   return `AI: I received your message - "${text}". I will get back to you Soon :)`
  }
};

