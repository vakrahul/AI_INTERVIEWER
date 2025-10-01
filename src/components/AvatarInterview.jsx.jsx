import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Input, Button, List, Avatar, Space, Tag, Typography, Spin, Tooltip, Result, Progress, App as AntApp } from 'antd';
import { UserOutlined, RobotOutlined, AudioOutlined, AudioMutedOutlined, CheckCircleFilled } from '@ant-design/icons';
import { processAnswer, setAiSpeakingStatus } from '/src/app/interviewSlice.js';
import { useSpeechRecognition } from '/src/hooks/useSpeechRecognition.js';
import { speakText } from '/src/lib/tts.js';
import SpeakingAvatar from './SpeakingAvatar.jsx';

const { TextArea } = Input;
const { Text } = Typography;

function AvatarInterview() {
  const dispatch = useDispatch();
  const { message } = AntApp.useApp();
  const { candidates, currentInterview } = useSelector((state) => state.interview);
  const [answer, setAnswer] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [timeLeft, setTimeLeft] = useState(currentInterview.timer);
  const [showTimeUpMessage, setShowTimeUpMessage] = useState(false);
  const { isListening, transcript, startListening, stopListening, hasRecognitionSupport } = useSpeechRecognition();
  
  const currentCandidate = candidates.find(c => c.id === currentInterview.candidateId);
  const chatHistory = currentCandidate?.chatHistory || [];
  const currentQuestion = currentInterview.currentQuestion;
  
  const timerRef = useRef(null);
  const endOfMessagesRef = useRef(null);
  const timeUpTimeoutRef = useRef(null);
  
  useEffect(() => {
    const lastMessage = chatHistory[chatHistory.length - 1];
    if (lastMessage && lastMessage.author === 'ai') {
      const speakAndAnimate = async () => {
        dispatch(setAiSpeakingStatus(true));
        try {
          await speakText(lastMessage.text);
        } catch (error) {
          console.error("Speech synthesis failed:", error);
        } finally {
          dispatch(setAiSpeakingStatus(false));
        }
      };
      speakAndAnimate();
    }
  }, [chatHistory, dispatch]);
  
  const handleSendAnswer = async (answerText = answer) => {
    if (isThinking || !currentCandidate || !answerText.trim()) return;
    clearInterval(timerRef.current);
    clearTimeout(timeUpTimeoutRef.current);
    setShowTimeUpMessage(false);
    setIsThinking(true);
    stopListening();
    await dispatch(processAnswer({ candidateId: currentCandidate.id, question: currentQuestion, answer: answerText })).unwrap();
    setAnswer('');
    setIsThinking(false);
  };
  
  const handleTimeUp = () => {
    message.warning("Time is up! Submitting your answer...");
    setShowTimeUpMessage(true);
    
    handleSendAnswer(answer || '');
    
    timeUpTimeoutRef.current = setTimeout(() => {
      if (showTimeUpMessage) {
        message.info("Please press Submit to move to the next question");
      }
    }, 2000);
  };

  useEffect(() => {
    if (currentInterview.status === 'active' && currentInterview.timer > 0) {
      setTimeLeft(currentInterview.timer);
      setShowTimeUpMessage(false);
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setTimeLeft(prevTime => {
          if (prevTime <= 1) {
            clearInterval(timerRef.current);
            handleTimeUp();
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => {
      clearInterval(timerRef.current);
      clearTimeout(timeUpTimeoutRef.current);
    };
  }, [currentInterview.currentQuestion]);
  
  useEffect(() => {
    if (!isListening && transcript) { handleSendAnswer(transcript); }
    setAnswer(transcript);
  }, [transcript, isListening]);
  
  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const handleMicClick = () => {
    isListening ? stopListening() : startListening();
  };

  if (currentInterview?.status === 'completed') {
    return <Result icon={<CheckCircleFilled style={{ color: '#52c41a' }} />} title="Interview Complete!" subTitle="Thank you. Your results have been recorded." />;
  }

  const timerPercentage = currentInterview.timer > 0 ? (timeLeft / currentInterview.timer) * 100 : 0;

  return (
    <>
      <style>
        {`
          @keyframes urgentPulse {
            0%, 100% {
              transform: scale(1);
              box-shadow: 0 0 0 0 rgba(255, 77, 79, 0.7);
            }
            50% {
              transform: scale(1.05);
              box-shadow: 0 0 0 10px rgba(255, 77, 79, 0);
            }
          }

          @keyframes ambientGlow {
            0%, 100% {
              box-shadow: 0 0 40px rgba(22, 119, 255, 0.3), 0 0 80px rgba(22, 119, 255, 0.2);
            }
            50% {
              box-shadow: 0 0 60px rgba(22, 119, 255, 0.5), 0 0 120px rgba(22, 119, 255, 0.3);
            }
          }

          @keyframes subtleFloat {
            0%, 100% {
              transform: translateY(0px);
            }
            50% {
              transform: translateY(-8px);
            }
          }

          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes pulseRing {
            0% {
              transform: scale(0.95);
              opacity: 0.8;
            }
            50% {
              transform: scale(1);
              opacity: 1;
            }
            100% {
              transform: scale(0.95);
              opacity: 0.8;
            }
          }

          @keyframes shimmer {
            0% {
              background-position: -1000px 0;
            }
            100% {
              background-position: 1000px 0;
            }
          }

          .interview-container {
            display: flex;
            flex-direction: column;
            height: 100vh;
            background: linear-gradient(135deg, #0a0e27 0%, #001529 50%, #0d1b2a 100%);
            padding: 24px;
            justify-content: center;
            align-items: center;
            position: relative;
            overflow: hidden;
          }

          .interview-container::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: radial-gradient(circle at 50% 50%, rgba(22, 119, 255, 0.1) 0%, transparent 50%);
            pointer-events: none;
          }

          .avatar-spotlight {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 500px;
            height: 500px;
            background: radial-gradient(circle, rgba(22, 119, 255, 0.15) 0%, transparent 70%);
            border-radius: 50%;
            animation: pulseRing 4s ease-in-out infinite;
            pointer-events: none;
          }

          .avatar-container {
            position: relative;
            animation: subtleFloat 6s ease-in-out infinite;
          }

          .question-text {
            color: white;
            font-size: 20px;
            text-align: center;
            margin: 20px 0;
            max-width: 700px;
            line-height: 1.6;
            animation: fadeInUp 0.6s ease-out;
            text-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
            font-weight: 400;
            letter-spacing: 0.3px;
            padding: 20px;
            background: rgba(255, 255, 255, 0.03);
            border-radius: 12px;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.1);
          }

          .input-container {
            width: 100%;
            max-width: 700px;
            margin: 20px 0;
            animation: fadeInUp 0.8s ease-out;
            position: relative;
          }

          .input-container::before {
            content: '';
            position: absolute;
            top: -2px;
            left: -2px;
            right: -2px;
            bottom: -2px;
            background: linear-gradient(90deg, #1677ff, #00d4ff, #1677ff);
            background-size: 200% 100%;
            border-radius: 8px;
            opacity: 0;
            transition: opacity 0.3s ease;
            animation: shimmer 3s linear infinite;
            z-index: -1;
          }

          .input-container:focus-within::before {
            opacity: 0.5;
          }

          .input-wrapper {
            display: flex;
            gap: 8px;
            align-items: flex-end;
          }

          .textarea-wrapper {
            flex: 1;
          }

          .button-group {
            display: flex;
            gap: 8px;
            align-items: flex-end;
          }

          .timer-container {
            position: absolute;
            top: 40px;
            right: 40px;
            animation: fadeInUp 0.4s ease-out;
          }

          .listening-indicator {
            position: fixed;
            bottom: 40px;
            left: 50%;
            transform: translateX(-50%);
            padding: 12px 24px;
            background: rgba(255, 77, 79, 0.9);
            color: white;
            border-radius: 24px;
            font-weight: 500;
            animation: pulseRing 2s ease-in-out infinite;
            box-shadow: 0 4px 20px rgba(255, 77, 79, 0.4);
            backdrop-filter: blur(10px);
          }

          .thinking-overlay {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.3);
            backdrop-filter: blur(5px);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10;
          }

          .thinking-text {
            color: white;
            font-size: 18px;
            font-weight: 500;
            animation: pulseRing 1.5s ease-in-out infinite;
          }

          .time-up-warning {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(255, 77, 79, 0.95);
            color: white;
            padding: 24px 48px;
            border-radius: 16px;
            font-size: 20px;
            font-weight: 600;
            animation: urgentPulse 1s ease-in-out infinite;
            box-shadow: 0 8px 32px rgba(255, 77, 79, 0.4);
            backdrop-filter: blur(10px);
            z-index: 100;
            text-align: center;
          }
        `}
      </style>

      <div className="interview-container">
        {/* Ambient Spotlight Effect */}
        <div className="avatar-spotlight" />

        {/* Timer */}
        <div className="timer-container">
          {currentInterview.timer > 0 && (
            <Tooltip title="Time Remaining">
              <Progress 
                type="circle" 
                percent={timerPercentage} 
                format={() => `${timeLeft}s`} 
                size={80} 
                strokeColor={timeLeft > 10 ? '#1677ff' : '#ff4d4f'}
                trailColor="rgba(255, 255, 255, 0.1)"
              />
            </Tooltip>
          )}
        </div>
        
        {/* AI Avatar with Animation */}
        <div className="avatar-container">
          <SpeakingAvatar />
        </div>

        {/* Question Text */}
        <Text className="question-text">
          {currentQuestion}
        </Text>

        {/* Input Section - Fixed Alignment */}
        <div className="input-container">
          <div className="input-wrapper">
            <div className="textarea-wrapper">
              <TextArea 
                value={answer} 
                onChange={(e) => setAnswer(e.target.value)} 
                placeholder="Type or speak your answer..." 
                autoSize={{ minRows: 2, maxRows: 5 }} 
                disabled={isThinking}
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  color: 'white',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px'
                }}
              />
            </div>
            
            <div className="button-group">
              {hasRecognitionSupport && (
                <Tooltip title={isListening ? "Stop listening" : "Answer with voice"}>
                  <Button 
                    icon={isListening ? <AudioMutedOutlined /> : <AudioOutlined />} 
                    onClick={handleMicClick} 
                    type={isListening ? 'primary' : 'default'} 
                    danger={isListening}
                    size="large"
                    style={{
                      background: isListening ? '#ff4d4f' : 'rgba(255, 255, 255, 0.1)',
                      borderColor: 'rgba(255, 255, 255, 0.2)',
                      height: '40px'
                    }}
                  />
                </Tooltip>
              )}
              <Button 
                type="primary" 
                onClick={() => handleSendAnswer()} 
                loading={isThinking}
                size="large"
                style={{
                  background: 'linear-gradient(135deg, #1677ff 0%, #00d4ff 100%)',
                  border: 'none',
                  fontWeight: 500,
                  height: '40px',
                  minWidth: '100px'
                }}
              >
                Submit
              </Button>
            </div>
          </div>
        </div>

        {/* Listening Indicator */}
        {isListening && (
          <div className="listening-indicator">
            🎤 Listening...
          </div>
        )}

        {/* Thinking Overlay */}
        {isThinking && (
          <div className="thinking-overlay">
            <div className="thinking-text">
              🤔 AI is processing your answer...
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default AvatarInterview;