import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Input, Button, List, Avatar, Space, Tag, Typography, Spin, Tooltip, Result, Progress, App as AntApp } from 'antd';
import { UserOutlined, RobotOutlined, AudioOutlined, AudioMutedOutlined, CheckCircleFilled } from '@ant-design/icons';
import { processAnswer } from '/src/app/interviewSlice.js';
import { useSpeechRecognition } from '/src/hooks/useSpeechRecognition.js';

const { TextArea } = Input;
const { Text, Title } = Typography;

function ChatWindow() {
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
  
  const handleSendAnswer = async (answerText = answer) => {
    if (isThinking || !currentCandidate) return;
    if (!answerText.trim() && answerText !== '') return;
    
    clearInterval(timerRef.current);
    setIsThinking(true);
    stopListening();
    
    await dispatch(processAnswer({ 
      candidateId: currentCandidate.id, 
      question: currentQuestion, 
      answer: answerText 
    })).unwrap();
    
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
    if (!isListening && transcript) {
      handleSendAnswer(transcript);
    }
    setAnswer(transcript);
  }, [transcript, isListening]);
  
  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const handleMicClick = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  if (currentInterview?.status === 'completed') {
    return (
      <Result
        icon={<CheckCircleFilled style={{ color: '#52c41a' }} />}
        title="Interview Complete!"
        subTitle="Thank you for your time. Your results have been recorded on the interviewer dashboard."
      />
    );
  }

  const timerPercentage = currentInterview.timer > 0 ? (timeLeft / currentInterview.timer) * 100 : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '65vh', background: '#001529', padding: '24px', borderRadius: '8px' }}>
      <Space align="center" style={{ marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid #ffffff20' }}>
        <Avatar size={64} icon={<RobotOutlined />} />
        <div style={{ flex: 1 }}>
          <Title level={4} style={{ color: 'white', margin: 0 }}>AI Interviewer</Title>
          <Text type="secondary">Status: In Progress</Text>
        </div>
        <div style={{ marginLeft: 'auto' }}>
          {currentInterview.timer > 0 && (
            <Tooltip title="Time Remaining">
              <Progress type="circle" percent={timerPercentage} format={() => `${timeLeft}s`} size={60} strokeColor={timeLeft > 10 ? '#1677ff' : '#ff4d4f'} />
            </Tooltip>
          )}
        </div>
      </Space>

      <Spin spinning={isThinking} tip="AI is evaluating...">
        <div style={{ flexGrow: 1, overflowY: 'auto', marginBottom: '16px', height: 'calc(65vh - 190px)'}}>
          <List
            dataSource={chatHistory}
            renderItem={(item) => (
              <List.Item>
                <List.Item.Meta
                  avatar={item.author === 'ai' ? <Avatar icon={<RobotOutlined />} /> : <Avatar icon={<UserOutlined />} />}
                  title={<span style={{ color: 'white' }}>{item.author === 'ai' ? 'CrispHire AI' : (currentCandidate?.name || 'You')}</span>}
                  description={
                    <div>
                      <p style={{ color: '#ccc', margin: 0, whiteSpace: 'pre-wrap' }}>{item.text}</p>
                      {item.author === 'user' && item.feedback && (
                        <div style={{ marginTop: '8px', padding: '8px', background: '#ffffff10', borderRadius: '4px' }}>
                          <Space>
                            <Tag color={item.score > 5 ? 'success' : 'error'}>Score: {item.score}/10</Tag>
                            <Text style={{ color: '#aaa' }}>{item.feedback}</Text>
                          </Space>
                        </div>
                      )}
                    </div>
                  }
                />
              </List.Item>
            )}
          />
          <div ref={endOfMessagesRef} />
        </div>
      </Spin>

      <Space.Compact style={{ width: '100%' }}>
        <TextArea
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder={isThinking ? "AI is thinking..." : "Type your answer here or use the microphone"}
          autoSize={{ minRows: 1, maxRows: 4 }}
          onPressEnter={(e) => { if (!e.shiftKey) { e.preventDefault(); handleSendAnswer(); } }}
          disabled={isThinking}
        />
        {hasRecognitionSupport && (
          <Tooltip title={isListening ? "Stop listening and submit" : "Answer with voice"}>
            <Button 
              icon={isListening ? <AudioMutedOutlined /> : <AudioOutlined />} 
              onClick={handleMicClick}
              type={isListening ? 'primary' : 'default'}
              danger={isListening}
            />
          </Tooltip>
        )}
        <Button type="primary" onClick={() => handleSendAnswer()} loading={isThinking}>Send</Button>
      </Space.Compact>
    </div>
  );
}

export default ChatWindow;
