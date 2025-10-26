<h1 align="center">
  🤖 AI Interviewer
</h1>

<p align="center">
  <img src="https://media.giphy.com/media/qgQUggAC3Pfv687qPC/giphy.gif" alt="AI Robot Typing" width="300"/>
</p>

<p align="center">
  A smart, voice-enabled mock interview application powered by Google's Gemini AI.
  <br />
  Upload your resume, and practice your interview skills with an AI that asks relevant questions and listens to your answers.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React">
  <img src="https://img.shields.io/badge/Redux-593D88?style=for-the-badge&logo=redux&logoColor=white" alt="Redux">
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS">
  <img src="https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=white" alt="Vite">
  <img src="https://img.shields.io/badge/Google_Gemini-4285F4?style=for-the-badge&logo=google&logoColor=white" alt="Gemini AI">
</p>

---

## 📋 Table of Contents

- [About The Project](#about-the-project)
- [✨ Key Features](#-key-features)
- [🛠️ Built With](#️-built-with)
- [🚀 Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [Acknowledgements](#acknowledgements)

---

## 🎯 About The Project

**AI Interviewer** is a web-based application designed to help job seekers prepare for technical and behavioral interviews. The user uploads their resume, which is then parsed and sent to the Google Gemini AI. Based on the user's experience and skills, the AI generates relevant interview questions and speaks them using the browser's Text-to-Speech.

The user can then respond by speaking, and their voice is transcribed using the Web Speech Recognition API. This creates an interactive, conversational loop, simulating a real interview experience.

---

## ✨ Key Features

* **📄 Resume Parsing:** Upload your PDF resume to provide context for the interview.
* **🧠 AI-Powered Questions:** Uses Google's `gemini-pro` model to generate insightful questions based on your resume.
* **🎙️ Voice-to-Text:** Speak your answers naturally. The app uses the Web Speech API to transcribe your voice in real-time.
* **🔊 Text-to-Speech:** The AI interviewer speaks its questions aloud for a more realistic, hands-free experience.
* **💬 Interactive Chat UI:** View a clean, simple chat history of your conversation with the AI.
* **🤖 Animated Avatar:** The AI avatar visually indicates when it is "speaking" or "idle".
* **⚛️ Modern Tech Stack:** Built with React, Redux Toolkit for state management, and Tailwind CSS for styling.

---

## 🛠️ Built With

This project is built with a modern and powerful set of technologies:

* **Frontend:** [React.js](https://reactjs.org/)
* **State Management:** [Redux Toolkit](https://redux-toolkit.js.org/)
* **Styling:** [Tailwind CSS](https://tailwindcss.com/)
* **Build Tool:** [Vite](https://vitejs.dev/)
* **AI Model:** [Google Gemini API](https://ai.google.dev/)
* **PDF Parsing:** [pdf-parse](https://www.npmjs.com/package/pdf-parse)
* **Voice I/O:** [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API) (SpeechRecognition & SpeechSynthesis)

---

## 🚀 Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

You must have [Node.js](https://nodejs.org/) (v18 or higher) and `npm` installed on your machine.

### Installation

1.  **Clone the repository:**
    ```sh
    git clone [https://github.com/vakrahul/AI_INTERVIEWER.git](https://github.com/vakrahul/AI_INTERVIEWER.git)
    cd AI_INTERVIEWER
    ```

2.  **Install NPM packages:**
    ```sh
    npm install
    ```

3.  **Set up your Environment Variable:**
    * Create a file named `.env` in the root of the project.
    * Get your Google Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey).
    * Add your API key to the `.env` file:
        ```env
        VITE_GEMINI_API_KEY="YOUR_API_KEY_HERE"
        ```

4.  **Run the development server:**
    ```sh
    npm run dev
    ```
    Your project will be running at `http://localhost:5173/` (or the next available port).

---

## 🙏 Acknowledgements

* [Google AI Studio](https://aistudio.google.com/) for the powerful Gemini model.
* [Vite](https://vitejs.dev/) for the amazing development experience.
* [Redux Toolkit](https://redux-toolkit.js.org/) for simplifying state management.
