import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

export async function extractDetailsFromText(text) {
  // Change this line
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  const prompt = `
    From the following resume text, extract the full name, email address, and phone number.
    Return the result as a clean JSON object with the keys "name", "email", and "phone".
    If a field is not found, its value should be null.
    Do not include any extra characters or markdown formatting like \`\`\`json.

    Resume Text:
    ---
    ${text}
    ---
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const jsonString = response.text();
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("Error parsing resume with AI:", error);
    return { name: null, email: null, phone: null };
  }
}