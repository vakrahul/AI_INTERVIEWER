import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Input, Button, List, Avatar, Space, Tag, Typography, Spin, Tooltip, Result, Progress, App as AntApp } from 'antd';
import { UserOutlined, RobotOutlined, AudioOutlined, AudioMutedOutlined, CheckCircleFilled } from '@ant-design/icons';
import { processAnswer, setAiSpeakingStatus } from '/src/app/interviewSlice.js';
import { useSpeechRecognition } from '/src/hooks/useSpeechRecognition.js';
import { speakText } from '/src/lib/tts.js';
import AI_Avatar from './AI_Avatar.jsx';

const { TextArea } = Input;
const { Text } = Typography;

function AvatarInterview() {
  const dispatch = useDispatch();
  const { message } = AntApp.useApp();
  const { candidates, currentInterview } = useSelector((state) => state.interview);
  const [answer, setAnswer] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [timeLeft, setTimeLeft] = useState(currentInterview.timer);
  const { isListening, transcript, startListening, stopListening, hasRecognitionSupport } = useSpeechRecognition();
  
  const currentCandidate = candidates.find(c => c.id === currentInterview.candidateId);
  const chatHistory = currentCandidate?.chatHistory || [];
  const currentQuestion = currentInterview.currentQuestion;
  
  const timerRef = useRef(null);
  const endOfMessagesRef = useRef(null);
  
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
    setIsThinking(true);
    stopListening();
    await dispatch(processAnswer({ candidateId: currentCandidate.id, question: currentQuestion, answer: answerText })).unwrap();
    setAnswer('');
    setIsThinking(false);
  };
  
  const handleTimeUp = () => {
    message.warning("Time is up! Moving to the next question.");
    handleSendAnswer('');
  };

  useEffect(() => {
    if (currentInterview.status === 'active' && currentInterview.timer > 0) {
      setTimeLeft(currentInterview.timer);
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
    return () => clearInterval(timerRef.current);
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
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#001529', padding: '24px', justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ position: 'absolute', top: '40px', right: '40px' }}>
        {currentInterview.timer > 0 && (
          <Tooltip title="Time Remaining">
            <Progress type="circle" percent={timerPercentage} format={() => `${timeLeft}s`} size={80} strokeColor={timeLeft > 10 ? '#1677ff' : '#ff4d4f'} />
          </Tooltip>
        )}
      </div>
      
      <AI_Avatar />

      <Text style={{ color: 'white', fontSize: '18px', textAlign: 'center', margin: '20px 0', maxWidth: '700px' }}>
        {currentQuestion}
      </Text>

      <div style={{ width: '100%', maxWidth: '700px', margin: '20px 0' }}>
        <Space.Compact style={{ width: '100%' }}>
          <TextArea value={answer} onChange={(e) => setAnswer(e.target.value)} placeholder="Type or speak your answer..." autoSize={{ minRows: 2, maxRows: 5 }} disabled={isThinking} />
          {hasRecognitionSupport && (
            <Tooltip title={isListening ? "Stop listening" : "Answer with voice"}><Button icon={isListening ? <AudioMutedOutlined /> : <AudioOutlined />} onClick={handleMicClick} type={isListening ? 'primary' : 'default'} danger={isListening}/></Tooltip>
          )}
          <Button type="primary" onClick={() => handleSendAnswer()} loading={isThinking}>Submit</Button>
        </Space.Compact>
      </div>
    </div>
  );
}

export default AvatarInterview;