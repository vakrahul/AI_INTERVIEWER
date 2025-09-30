import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { evaluateAnswer, generateNextInterviewStep, generateFinalSummary } from '/src/api/gemini.js';

export const processAnswer = createAsyncThunk(
  'interview/processAnswer',
  async ({ candidateId, question, answer }, { dispatch, getState }) => {
    dispatch(addMessageToHistory({ candidateId, message: { author: 'user', text: answer } }));
    
    const state = getState().interview;
    if (state.currentInterview.timer > 0) {
      const evaluation = await evaluateAnswer(question, answer, state.selectedModel);
      dispatch(addEvaluationToAnswer({ candidateId, answerText: answer, evaluation }));
    }

    const updatedState = getState().interview;
    const candidate = updatedState.candidates.find(c => c.id === candidateId);
    const response = await generateNextInterviewStep(updatedState.currentInterview.selectedRole, candidate.resumeText, candidate.chatHistory, state.selectedModel);
    
    dispatch(addMessageToHistory({ candidateId, message: { author: 'ai', text: response.content } }));
    
    if (response.type === 'conclusion') {
      const { summary, finalScore } = await generateFinalSummary(candidate.chatHistory, state.selectedModel);
      dispatch(setFinalResults({ candidateId, summary, finalScore }));
    }
    return response;
  }
);

const initialState = {
  candidates: [],
  currentInterview: {
    candidateId: null,
    status: 'initial',
    selectedRole: null,
    currentQuestion: null,
    timer: 0,
    isAiSpeaking: false,
    interviewMode: 'chat', // 'chat' or 'avatar'
  },
  selectedModel: 'gemini-pro',
};

const interviewSlice = createSlice({
  name: 'interview',
  initialState,
  reducers: {
    addCandidate: (state, action) => {
      if (!state.currentInterview) { state.currentInterview = initialState.currentInterview; }
      const newCandidate = { ...action.payload, chatHistory: [], scores: [], skills: action.payload.skills || [], resumeFile: action.payload.resumeFile };
      state.candidates.push(newCandidate);
      state.currentInterview.candidateId = newCandidate.id;
      if (!newCandidate.name || !newCandidate.email || !newCandidate.phone) {
        state.currentInterview.status = 'details_missing';
      } else {
        state.currentInterview.status = 'pending';
      }
    },
    updateCandidateDetails: (state, action) => {
      const { id, name, email, phone } = action.payload;
      const candidate = state.candidates.find(c => c.id === id);
      if (candidate) {
        candidate.name = name;
        candidate.email = email;
        candidate.phone = phone;
      }
      state.currentInterview.status = 'pending';
    },
    setSelectedRole: (state, action) => {
      state.currentInterview.selectedRole = action.payload;
    },
    setSelectedModel: (state, action) => {
      state.selectedModel = action.payload;
    },
    setInterviewMode: (state, action) => {
      state.currentInterview.interviewMode = action.payload;
    },
    startInterview: (state, action) => {
      state.currentInterview.status = 'active';
      state.currentInterview.candidateId = action.payload.candidateId;
      const firstQuestion = "Thank you. To begin, could you please tell me a little bit about yourself and your experience?";
      state.currentInterview.currentQuestion = firstQuestion;
      state.currentInterview.timer = 0;
      const candidate = state.candidates.find(c => c.id === action.payload.candidateId);
      if (candidate) {
        candidate.chatHistory.push({ author: 'ai', text: firstQuestion });
      }
    },
    addMessageToHistory: (state, action) => {
      const { candidateId, message } = action.payload;
      const candidate = state.candidates.find(c => c.id === candidateId);
      if (candidate) { candidate.chatHistory.push(message); }
    },
    addEvaluationToAnswer: (state, action) => {
      const { candidateId, answerText, evaluation } = action.payload;
      const candidate = state.candidates.find(c => c.id === candidateId);
      if (candidate) {
        const lastMessage = candidate.chatHistory[candidate.chatHistory.length - 1];
        if (lastMessage && lastMessage.author === 'user' && lastMessage.text === answerText) {
          lastMessage.feedback = evaluation.feedback;
          lastMessage.score = evaluation.score;
        }
        candidate.scores.push(evaluation.score);
      }
    },
    setFinalResults: (state, action) => {
      const { candidateId, summary, finalScore } = action.payload;
      const candidate = state.candidates.find(c => c.id === candidateId);
      if (candidate) {
        candidate.summary = summary;
        candidate.finalScore = finalScore;
      }
    },
    resetCurrentInterview: (state) => {
      state.currentInterview = initialState.currentInterview;
    },
    setAiSpeakingStatus: (state, action) => {
      state.currentInterview.isAiSpeaking = action.payload;
    },
  },
  extraReducers: (builder) => {
    const handleNextStep = (state, action) => {
      const { type, content, time } = action.payload;
      state.currentInterview.currentQuestion = content;
      state.currentInterview.timer = time || 0;
      if (type === 'conclusion') {
        state.currentInterview.status = 'completed';
      }
    };
    builder.addCase(processAnswer.fulfilled, handleNextStep);
  },
});

export const { 
    addCandidate, 
    updateCandidateDetails,
    setSelectedRole,
    setSelectedModel,
    setInterviewMode,
    startInterview,
    addMessageToHistory, 
    addEvaluationToAnswer,
    setFinalResults,
    resetCurrentInterview,
    setAiSpeakingStatus
} = interviewSlice.actions;

export default interviewSlice.reducer;

