import React from 'react';
import { useSelector } from 'react-redux';
import { Avatar, Tooltip } from 'antd';
import { RobotOutlined } from '@ant-design/icons';
import { speakText } from '/src/lib/tts.js';

function ChatbotAvatar() {
  const { candidates, currentInterview = {} } = useSelector((state) => state.interview);
  const currentCandidate = candidates.find(c => c.id === currentInterview.candidateId);

  const handleAvatarClick = () => {
    if (currentCandidate && currentCandidate.name) {
      speakText(`Welcome, ${currentCandidate.name}! I'm ready to start when you are.`);
    } else {
      speakText("Welcome! Please begin the process by uploading your resume.");
    }
  };

  if (currentInterview?.status === 'active' || currentInterview?.status === 'completed') {
    return null;
  }

  return (
    <div style={{ position: 'fixed', bottom: '30px', right: '30px', cursor: 'pointer', zIndex: 1000 }} onClick={handleAvatarClick}>
      <Tooltip title="Click me for a greeting!">
        <Avatar size={64} icon={<RobotOutlined />} style={{ backgroundColor: '#00bcf2', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)' }}/>
      </Tooltip>
    </div>
  );
}

export default ChatbotAvatar;