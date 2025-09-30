import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

// All functions use the stable "gemini-pro" model by default.
// This can be overridden by the model selector on the dashboard.

export async function extractDetailsFromText(text, modelName = 'gemini-pro') {
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

export async function extractSkillsFromText(text, modelName = 'gemini-pro') {
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

export async function generateNextInterviewStep(role, resumeText, chatHistory, modelName = 'gemini-pro') {
  const model = genAI.getGenerativeModel({ model: modelName });
  const aiQuestionCount = chatHistory.filter(m => m.author === 'ai').length;
  // The "real" scored questions begin after the intro + 1 or 2 conversational follow-ups.
  // We'll consider the real interview to start after 3 AI messages.
  const technicalQuestionCount = aiQuestionCount > 2 ? aiQuestionCount - 2 : 0;

  let difficulty = 'Easy';
  let time = 20;

  if (technicalQuestionCount >= 2 && technicalQuestionCount < 4) {
    difficulty = 'Medium';
    time = 60;
  } else if (technicalQuestionCount >= 4 && technicalQuestionCount < 6) {
    difficulty = 'Hard';
    time = 120;
  }

  const prompt = `
    You are a professional AI Interviewer for a "${role}" position. Your tone is insightful and challenging.
    The interview flow is: a brief conversational intro (1-2 questions), then exactly 6 scored technical/behavioral questions, then a conclusion.

    **Current State:**
    - You have already asked the candidate to introduce themselves.
    - Total AI messages sent so far: ${aiQuestionCount}.
    - Number of the 6 main technical questions asked so far: ${technicalQuestionCount}.
    
    **YOUR IMMEDIATE TASK:**
    Based on the rules below, generate the next step.

    **RULES (Follow Strictly):**
    1.  **If \`aiQuestionCount\` is 1 or 2:** The conversational introduction is in progress. Analyze the candidate's self-introduction from the chat history and ask a short, conversational follow-up. The response "type" **MUST** be "conversation", and "time" **MUST** be 0.
    2.  **If \`technicalQuestionCount\` is less than 6:** The main interview is in progress. Your task is to generate Question #${technicalQuestionCount + 1}. This question **MUST** be of **'${difficulty}'** difficulty and related to the candidate's resume. The response "type" **MUST** be "question" and "time" **MUST** be ${time}.
    3.  **If \`technicalQuestionCount\` is 6 or more:** The main questions are finished. You **MUST** provide a professional concluding statement. The "type" **MUST** be "conclusion".
    4.  Your entire response **MUST** be a clean JSON object with "type", "content", and "time".

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
      return { type: 'conclusion', content: "It seems we've reached the end of our time. Thank you.", time: 0 };
    }
  } catch (error) {
    console.error("Error generating next interview step:", error);
    return { type: 'conclusion', content: "There was an error. We'll have to end here. Thank you.", time: 0 };
  }
}

export async function evaluateAnswer(question, answer, modelName = 'gemini-pro') {
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

export async function generateFinalSummary(chatHistory, modelName = 'gemini-pro') {
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