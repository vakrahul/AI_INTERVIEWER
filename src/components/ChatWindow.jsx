import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Input, Button, List, Avatar, Space, Tag, Typography, Spin, Tooltip, Result, Progress, App as AntApp, notification, Modal } from 'antd';
import { UserOutlined, RobotOutlined, AudioOutlined, AudioMutedOutlined, CheckCircleFilled, InfoCircleOutlined, TrophyOutlined, SmileOutlined } from '@ant-design/icons';
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
  const [showCompletionSplash, setShowCompletionSplash] = useState(false);
  const [showTimeUpMessage, setShowTimeUpMessage] = useState(false);

  const { isListening, transcript, startListening, stopListening, hasRecognitionSupport } = useSpeechRecognition();
  
  const currentCandidate = candidates.find(c => c.id === currentInterview.candidateId);
  const chatHistory = currentCandidate?.chatHistory || [];
  const currentQuestion = currentInterview.currentQuestion;
  
  const timerRef = useRef(null);
  const endOfMessagesRef = useRef(null);
  const prevTimerRef = useRef(0); // Ref to track the previous timer value
  const hasShownTimerNotification = useRef(false); // Track if notification has been shown
  const timeUpTimeoutRef = useRef(null); // Track timeout for time up message

  const handleSendAnswer = async (answerText = answer) => {
    if (isThinking || !currentCandidate) return;
    if (!answerText.trim() && answerText !== '') return;
    
    clearInterval(timerRef.current);
    clearTimeout(timeUpTimeoutRef.current);
    setShowTimeUpMessage(false);
    stopListening();
    setIsThinking(true);
    
    await dispatch(processAnswer({ 
      candidateId: currentCandidate.id, 
      question: currentQuestion, 
      answer: answerText 
    })).unwrap();
    
    setAnswer('');
    setIsThinking(false);
  };
  
  const handleTimeUp = () => {
    message.warning("Time is up! Submitting your answer...");
    setShowTimeUpMessage(true);
    
    // Attempt to auto-submit
    handleSendAnswer(answer || '');
    
    // If it doesn't move to next question in 2 seconds, show message
    timeUpTimeoutRef.current = setTimeout(() => {
      if (showTimeUpMessage) {
        message.info("Please press Enter or click Send to move to the next question");
      }
    }, 2000);
  };

  // Show notification when timer starts (main questions begin)
  useEffect(() => {
    if (currentInterview.timer > 0 && prevTimerRef.current === 0 && !hasShownTimerNotification.current) {
      notification.info({
        message: 'Main Interview Questions Begin',
        description: 'The following questions will be timed and scored. Good luck!',
        placement: 'top',
        duration: 5,
        icon: <InfoCircleOutlined style={{ color: '#1677ff' }} />,
      });
      hasShownTimerNotification.current = true;
    }
    prevTimerRef.current = currentInterview.timer;
  }, [currentInterview.timer]);

  // Show splash screen when interview completes
  useEffect(() => {
    if (currentInterview?.status === 'completed' && !showCompletionSplash) {
      setShowCompletionSplash(true);
      
      // Show modal splash
      Modal.success({
        title: (
          <div style={{ textAlign: 'center' }}>
            <TrophyOutlined style={{ fontSize: '64px', color: '#ffd700', marginBottom: '16px' }} />
            <div style={{ fontSize: '24px', fontWeight: 'bold', marginTop: '16px' }}>
              Interview Completed!
            </div>
          </div>
        ),
        content: (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <SmileOutlined style={{ fontSize: '48px', color: '#52c41a', marginBottom: '16px' }} />
            <p style={{ fontSize: '16px', margin: '16px 0' }}>
              Congratulations on completing the interview!
            </p>
            <p style={{ fontSize: '14px', color: '#666' }}>
              Your responses have been recorded and will be reviewed by our team.
            </p>
          </div>
        ),
        okText: 'View Results',
        width: 500,
        centered: true,
        maskClosable: false,
      });
    }
  }, [currentInterview?.status]);

  useEffect(() => {
    if (currentInterview.status === 'active' && currentInterview.timer > 0) {
      setTimeLeft(currentInterview.timer);
      setShowTimeUpMessage(false); // Reset time up message for new question
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
    if (!isListening && transcript) {
      handleSendAnswer(transcript);
    }
    setAnswer(transcript);
  }, [transcript, isListening]);
  
  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const handleMicClick = () => {
    isListening ? stopListening() : startListening();
  };

  if (currentInterview?.status === 'completed') {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        height: '65vh', 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
        padding: '24px', 
        borderRadius: '8px',
        justifyContent: 'center',
        alignItems: 'center',
        animation: 'fadeIn 0.5s ease-in'
      }}>
        <Result
          icon={<TrophyOutlined style={{ fontSize: '100px', color: '#ffd700' }} />}
          title={<span style={{ color: 'white', fontSize: '32px', fontWeight: 'bold' }}>Interview Complete!</span>}
          subTitle={<span style={{ color: '#f0f0f0', fontSize: '18px' }}>Thank you for your time. Your results have been recorded on the interviewer dashboard.</span>}
          extra={
            <div style={{ marginTop: '20px', textAlign: 'center' }}>
              <CheckCircleFilled style={{ fontSize: '48px', color: '#52c41a', marginBottom: '16px' }} />
              <Title level={4} style={{ color: 'white', margin: 0 }}>
                Well Done!
              </Title>
            </div>
          }
        />
      </div>
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
          placeholder={
            showTimeUpMessage 
              ? "Time's up! Press Enter to continue..." 
              : isThinking 
              ? "AI is thinking..." 
              : "Type your answer here or use the microphone"
          }
          autoSize={{ minRows: 1, maxRows: 4 }}
          onPressEnter={(e) => { if (!e.shiftKey) { e.preventDefault(); handleSendAnswer(); } }}
          disabled={isThinking}
          status={showTimeUpMessage ? "warning" : undefined}
        />
        {hasRecognitionSupport && (
          <Tooltip title={isListening ? "Stop listening and submit" : "Answer with voice"}>
            <Button 
              icon={isListening ? <AudioMutedOutlined /> : <AudioOutlined />} 
              onClick={handleMicClick}
              type={isListening ? 'primary' : 'default'}
              danger={isListening}
              disabled={showTimeUpMessage}
            />
          </Tooltip>
        )}
        <Button 
          type="primary" 
          onClick={() => handleSendAnswer()} 
          loading={isThinking}
          danger={showTimeUpMessage}
        >
          {showTimeUpMessage ? "Continue →" : "Send"}
        </Button>
      </Space.Compact>
    </div>
  );
}

export default ChatWindow;