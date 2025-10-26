# 🤖 CrispHire AI: The Avatar Interviewer

This repository contains the source code for the **Swipe Internship Assignment**. CrispHire is an AI-powered interview assistant that replaces a standard chatbot with an interactive, avatar-led experience. It features a complete system for candidates to take interviews and for interviewers to review results, with all session data persisted locally.

![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Redux](https://img.shields.io/badge/Redux-764ABC?style=for-the-badge&logo=redux&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)

---

## 🚀 Core Concepts (The "Animation" in Code)

Instead of static images, here are conceptual code snippets representing the project's most dynamic features.

### 1. The Avatar-Led Interview Experience
The `Interviewee` page isn't just a chat box. It's a layout that combines the avatar (driven by speech synthesis) with the chat interface (driven by Redux state).

```jsx
// Conceptual layout of: src/pages/Interviewee.jsx

<div className="interview-layout-grid">
  
  {/* Column 1: The "Live" Avatar */}
  <div className="avatar-container">
    <AvatarInterviewer
      currentQuestionText={interview.currentQuestion.text}
      isListening={ui.isListening}
    />
  </div>

  {/* Column 2: The Controls & Data */}
  <div className="chat-container">
    <TimerBar
      timeLeft={interview.timer}
      onTimeUp={handleAutoSubmit}
    />
    <ChatHistory messages={interview.history} />
    <AnswerInput
      onSubmit={handleSubmitAnswer}
      disabled={ui.isSubmitting}
    />
  </div>

</div>
