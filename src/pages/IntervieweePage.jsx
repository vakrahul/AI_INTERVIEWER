import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Button, Typography, Spin, Select, Radio, Space, Alert } from 'antd';
import { RocketOutlined } from '@ant-design/icons';
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
  const [mode, setMode] = useState('chat'); // 'chat' or 'avatar'
  const [showUploader, setShowUploader] = useState(false);
  const [showSplash, setShowSplash] = useState(true);

  const currentCandidate = candidates.find(c => c.id === currentInterview.candidateId);

  useEffect(() => {
    // Hide splash screen after 3 seconds
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 3000);

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
        right: 0,
        bottom: 0,
        background: 'linear-gradient(135deg, #fefefeff 0%, #000000ff 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        animation: 'fadeIn 0.5s ease-in'
      }}>
        <style>{`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-20px); }
          }
          @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.1); }
          }
        `}</style>
        <div style={{
          animation: 'float 3s ease-in-out infinite',
          marginBottom: '32px'
        }}>
          <RocketOutlined style={{
            fontSize: '80px',
            color: 'white',
            animation: 'pulse 2s ease-in-out infinite'
          }} />
        </div>
        <Title level={1} style={{
          color: 'white',
          marginBottom: '16px',
          fontSize: '48px',
          fontWeight: 'bold',
          textAlign: 'center'
        }}>
          CrispHire AI
        </Title>
        <Text style={{
          color: 'rgba(255, 255, 255, 0.9)',
          fontSize: '18px',
          marginBottom: '32px'
        }}>
          Intelligent Interview Platform
        </Text>
        <Spin size="large" style={{ 
          color: 'white'
        }} />
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
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Title style={{ color: 'white' }}>Final Step</Title>
        <Text style={{ color: 'gray', display: 'block', marginBottom: '32px' }}>
          Please select your role and preferred interview format.
        </Text>
        <Space direction="vertical" size="large">
          <Select
            style={{ width: 240 }}
            placeholder="Select a role"
            onChange={(value) => setRole(value)}
            size="large"
          >
            <Option value="Frontend Developer">Frontend Developer</Option>
            <Option value="Backend Developer">Backend Developer</Option>
            <Option value="Full Stack Developer">Full Stack Developer</Option>
            <Option value="Data Scientist">Data Scientist</Option>
            <Option value="Product Manager">Product Manager</Option>
            <Option value="UX Designer">UX Designer</Option>
            <Option value="DevOps Engineer">DevOps Engineer</Option>
            <Option value="QA Engineer">QA Engineer</Option>
            <Option value="Mobile Developer">Mobile Developer</Option>
            <Option value="AI/ML Engineer">AI/ML Engineer</Option>
            
          </Select>

          <Radio.Group onChange={(e) => setMode(e.target.value)} value={mode}>
            <Radio.Button value="chat">Standard Chat Interview</Radio.Button>
            <Radio.Button value="avatar">AI Avatar Interview</Radio.Button>
          </Radio.Group>
          
          <Button type="primary" size="large" onClick={handleStartInterview} disabled={!role}>
            Start Interview
          </Button>
        </Space>
      </div>
    );
  }

  // Before a resume is uploaded, show the welcome screen
  if (!showUploader) {
    return (
        <div style={{ textAlign: 'center', padding: '100px 0' }}>
            <Title style={{ color: 'white' }}>Welcome to Your AI-Powered Interview</Title>
            <Text style={{ color: 'gray', display: 'block', maxWidth: '500px', margin: '16px auto 24px' }}>
              This is an automated interview. Please answer each question within the time limit.
            </Text>
            <Alert 
              message="Pro Tip for Best Performance"
              description="If the AI fails to process your resume, try selecting a different AI model (like Gemini 2.5 Pro or Gemini 2.5 flash) from the dropdown on the Interviewer Dashboard before uploading."
              type="info"
              showIcon
              style={{maxWidth: '500px', margin: '0 auto 24px', textAlign: 'left'}}
            />
            <Button type="primary" size="large" onClick={() => setShowUploader(true)}>
              Begin
            </Button>
      </div>
    );
  }

  // After clicking "Begin", show the resume uploader
  return <ResumeUploader />;
}

export default IntervieweePage;