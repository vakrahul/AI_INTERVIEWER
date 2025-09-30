import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Button, Typography, Spin, Select, Radio, Space } from 'antd';
import ResumeUploader from '/src/components/ResumeUploader.jsx';
import ChatWindow from '/src/components/ChatWindow.jsx';
import MissingInfoForm from '/src/components/MissingInfoForm.jsx';
import AvatarInterview from '/src/components/AvatarInterview.jsx';
import { startInterview, setSelectedRole, setInterviewMode } from '/src/app/interviewSlice.js';

const { Title, Text } = Typography;
const { Option } = Select;

function IntervieweePage() {
  const dispatch = useDispatch();
  const { candidates, currentInterview = {} } = useSelector((state) => state.interview);
  const [role, setRole] = useState(null);
  const [mode, setMode] = useState('chat');
  const [showUploader, setShowUploader] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [fadeIn, setFadeIn] = useState(false);

  const currentCandidate = candidates.find(c => c.id === currentInterview.candidateId);

  useEffect(() => {
    // Show splash screen for 2.5 seconds
    const timer = setTimeout(() => {
      setShowSplash(false);
      setFadeIn(true);
    }, 3500);
    return () => clearTimeout(timer);
  }, []);

  const handleStartInterview = () => {
    if (currentCandidate && role) {
      dispatch(setSelectedRole(role));
      dispatch(setInterviewMode(mode));
      dispatch(startInterview({ candidateId: currentCandidate.id }));
    }
  };

  // Splash Screen
  if (showSplash) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #ffffffff 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        animation: 'fadeOut 0.5s ease-out 4s forwards'
      }}>
        <style>
          {`
            @keyframes fadeOut {
              to {
                opacity: 0;
                visibility: hidden;
              }
            }
            @keyframes pulse {
              0%, 100% { transform: scale(1); opacity: 1; }
              50% { transform: scale(1.05); opacity: 0.8; }
            }
            @keyframes slideUp {
              from {
                opacity: 0;
                transform: translateY(30px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }
            @keyframes fadeInScale {
              from {
                opacity: 0;
                transform: scale(0.9);
              }
              to {
                opacity: 1;
                transform: scale(1);
              }
            }
            @keyframes float {
              0%, 100% { transform: translateY(0px); }
              50% { transform: translateY(-20px); }
            }
          `}
        </style>
        <div style={{
          fontSize: '72px',
          marginBottom: '24px',
          animation: 'pulse 2s ease-in-out infinite'
        }}>
          🤖
        </div>
        <Title level={1} style={{ 
          color: 'white', 
          margin: 0,
          animation: 'slideUp 0.8s ease-out'
        }}>
          AI Interview Platform
        </Title>
        <Spin size="large" style={{ marginTop: '32px' }} />
      </div>
    );
  }

  // If an interview is active or completed, show the correct component based on the chosen mode
  if (currentInterview?.status === 'active' || currentInterview?.status === 'completed') {
    return currentInterview.interviewMode === 'avatar' ? <AvatarInterview /> : <ChatWindow />;
  }
  
  // If resume parsing missed details, show the form to collect them
  if (currentInterview?.status === 'details_missing' && currentCandidate) {
    return <MissingInfoForm candidate={currentCandidate} />;
  }

  // If details are confirmed, show the role and mode selection screen
  if (currentInterview?.status === 'pending' && currentCandidate) {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: '100px 0',
        animation: fadeIn ? 'fadeInScale 0.6s ease-out' : 'none'
      }}>
        <Title style={{ 
          color: 'white',
          animation: 'slideUp 0.6s ease-out'
        }}>
          Final Step
        </Title>
        <Text style={{ 
          color: 'gray', 
          display: 'block', 
          marginBottom: '32px',
          animation: 'slideUp 0.6s ease-out 0.1s backwards'
        }}>
          Please select your role and preferred interview format.
        </Text>
        <Space direction="vertical" size="large" style={{
          animation: 'slideUp 0.6s ease-out 0.2s backwards'
        }}>
          <Select
            style={{ width: 240 }}
            placeholder="Select a role"
            onChange={(value) => setRole(value)}
            size="large"
          >
            <Option value="Frontend Developer">Frontend Developer</Option>
            <Option value="Backend Developer">Backend Developer</Option>
            <Option value="Full Stack Developer">Full Stack Developer</Option>
          </Select>

          <Radio.Group onChange={(e) => setMode(e.target.value)} value={mode}>
            <Radio.Button value="chat">Standard Chat Interview</Radio.Button>
            <Radio.Button value="avatar">AI Avatar Interview</Radio.Button>
          </Radio.Group>
          
          <Button 
            type="primary" 
            size="large" 
            onClick={handleStartInterview} 
            disabled={!role}
            style={{
              transition: 'all 0.3s ease',
              transform: role ? 'scale(1)' : 'scale(0.95)'
            }}
          >
            Start Interview
          </Button>
        </Space>
      </div>
    );
  }

  // Before a resume is uploaded, show the welcome screen
  if (!showUploader) {
    return (
        <div style={{ 
          textAlign: 'center', 
          padding: '100px 0',
          animation: fadeIn ? 'fadeInScale 0.6s ease-out' : 'none'
        }}>
            <div style={{
              fontSize: '64px',
              marginBottom: '24px',
              animation: 'float 3s ease-in-out infinite'
            }}>
              🤖
            </div>
            <Title style={{ 
              color: 'white',
              animation: 'slideUp 0.6s ease-out'
            }}>
              Welcome to Your AI-Powered Interview
            </Title>
            <Text style={{ 
              color: 'gray', 
              display: 'block', 
              maxWidth: '500px', 
              margin: '16px auto 24px',
              animation: 'slideUp 0.6s ease-out 0.1s backwards'
            }}>
              This is an automated interview. Please answer each question within the time limit.
            </Text>
            <Button 
              type="primary" 
              size="large" 
              onClick={() => setShowUploader(true)}
              style={{
                animation: 'slideUp 0.6s ease-out 0.2s backwards',
                transition: 'transform 0.2s ease',
              }}
              onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
              onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
            >
              Begin
            </Button>
      </div>
    );
  }

  // After clicking "Begin", show the resume uploader
  return (
    <div style={{ animation: fadeIn ? 'fadeInScale 0.6s ease-out' : 'none' }}>
      <ResumeUploader />
    </div>
  );
}

export default IntervieweePage;