import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

export async function extractDetailsFromText(text, modelName = 'gemini-2.5-flash') {
  try {
    const model = genAI.getGenerativeModel({ model: modelName });
    const prompt = `From the resume text, extract name, email, phone. Respond with a JSON object with keys "name", "email", "phone". Missing fields should be null. Text: ${text}`;
    const result = await model.generateContent(prompt);
    const textResponse = result.response.text();
    const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : null;
  } catch (error) {
    console.error("Error parsing resume with AI:", error);
    return null;
  }
}

export async function extractSkillsFromText(text, modelName = 'gemini-2.5-flash') {
  try {
    const model = genAI.getGenerativeModel({ model: modelName });
    const prompt = `From the resume text, list key technical skills. Respond with a JSON object with a single key "skills" which is an array of strings. Example: {"skills": ["React", "Node.js"]}. Text: ${text}`;
    const result = await model.generateContent(prompt);
    const textResponse = result.response.text();
    const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
    const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : {};
    return parsed.skills || [];
  } catch (error) {
    console.error("Error extracting skills with AI:", error);
    return [];
  }
}

export async function generateNextInterviewStep(role, resumeText, chatHistory, modelName = 'gemini-2.5-flash') {
  const model = genAI.getGenerativeModel({ model: modelName });
  const aiQuestionCount = chatHistory.filter(m => m.author === 'ai').length;
  const technicalQuestionCount = aiQuestionCount >= 2 ? aiQuestionCount - 2 : 0;

  let difficulty = 'Easy';
  let time = 20;
  if (technicalQuestionCount >= 2 && technicalQuestionCount < 4) {
    difficulty = 'Medium';
    time = 60;
  } else if (technicalQuestionCount >= 4 && technicalQuestionCount < 6) {
    difficulty = 'Hard';
    time = 120;
  }

  // Extract previously asked questions to avoid repetition
  const previousQuestions = chatHistory
    .filter(m => m.author === 'ai' && m.content)
    .map(m => m.content)
    .join('\n');

  const prompt = `
You are a professional AI Interviewer for a "${role}" position. Your tone is insightful and challenging.

The interview flow is:
1) A conversational intro (1-2 questions).
2) A transition message.
3) Exactly 6 scored technical/behavioral questions.
4) A conclusion.

**Current State:**
- Total AI messages sent (including the initial intro): ${aiQuestionCount}.
- Number of the 6 main technical questions asked so far: ${technicalQuestionCount}.

**PREVIOUSLY ASKED QUESTIONS (DO NOT REPEAT ANY OF THESE):**
${previousQuestions}

**YOUR IMMEDIATE TASK: Generate the JSON for the next step based on the rules.**

**RULES (Follow Strictly):**
1.  **If the candidate's last answer was short, nonsensical, or empty, IGNORE IT. Your primary goal is to follow the sequence.**
2.  **If \`aiQuestionCount\` is 1:** Ask **one** brief, conversational follow-up to the user's self-introduction. The JSON "type" **MUST** be "conversation", and "time" **MUST** be 0.
3.  **If \`aiQuestionCount\` is 2:** The intro is complete. You **MUST** provide a transition message immediately followed by the first **Easy** technical question. Example: "Great, thank you. We will now begin the 6 scored questions. First, ...[Your Easy Question]...". The "type" **MUST** be "question", and "time" **MUST** be 20.
4.  **If \`aiQuestionCount\` is > 2 and \`technicalQuestionCount\` < 6:** Generate Question #${technicalQuestionCount + 1}. This question **MUST** be of **'${difficulty}'** difficulty and **MUST BE COMPLETELY DIFFERENT** from all previously asked questions listed above. The "type" **MUST** be "question", and "time" **MUST** be ${time}.
5.  **If \`technicalQuestionCount\` >= 6:** The main questions are finished. You **MUST** conclude. The "type" **MUST** be "conclusion".
6.  Your entire response **MUST** be a clean JSON object with "type", "content", and "time".

**IMPORTANT: Ensure your new question is UNIQUE and does NOT repeat or rephrase any of the previously asked questions.**

**CONTEXT:**
- Resume: ${resumeText}
- History: ${JSON.stringify(chatHistory)}

Generate the required JSON object now.
`;

  try {
    const result = await model.generateContent(prompt);
    const textResponse = result.response.text();
    const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
    if (jsonMatch && jsonMatch[0]) {
      return JSON.parse(jsonMatch[0]);
    } else {
      console.error("AI did not return valid JSON for the next step:", textResponse);
      return {
        type: 'conclusion',
        content: "It seems we've reached the end of our time. Thank you.",
        time: 0
      };
    }
  } catch (error) {
    console.error("Error generating next interview step:", error);
    return {
      type: 'conclusion',
      content: "There was an API error, so we'll have to end the interview here. Thank you.",
      time: 0
    };
  }
}

export async function evaluateAnswer(question, answer, modelName = 'gemini-2.5-flash') {
  try {
    const model = genAI.getGenerativeModel({ model: modelName });
    const prompt = `Evaluate the answer for the question. Respond with a JSON object with "feedback" (a short critique) and "score" (integer 0-10). Question: "${question}". Answer: "${answer}"`;
    const result = await model.generateContent(prompt);
    const textResponse = result.response.text();
    const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : { feedback: "Could not parse response.", score: 0 };
  } catch (error) {
    console.error("Error evaluating answer:", error);
    return { feedback: "Error evaluating answer.", score: 0 };
  }
}

export async function generateFinalSummary(chatHistory, modelName = 'gemini-2.5-flash') {
  try {
    const model = genAI.getGenerativeModel({ model: modelName });
    const prompt = `You are a senior hiring manager reviewing an interview transcript. Based on the entire transcript, provide a final assessment. Your response must be a clean JSON object with "summary" (a 2-3 sentence paragraph) and "finalScore" (an integer from 0 to 100). Transcript: ${JSON.stringify(chatHistory)}`;
    const result = await model.generateContent(prompt);
    const textResponse = result.response.text();
    const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : { summary: "Could not generate summary.", finalScore: 0 };
  } catch (error) {
    console.error("Error generating final summary:", error);
    return { summary: "Error generating summary.", finalScore: 0 };
  }
}