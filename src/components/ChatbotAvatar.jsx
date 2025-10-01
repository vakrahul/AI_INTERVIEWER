import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Avatar, Tooltip } from 'antd';
import { RobotOutlined } from '@ant-design/icons';
import { speakText } from '/src/lib/tts.js';

function ChatbotAvatar() {
  const { candidates, currentInterview = {} } = useSelector((state) => state.interview);
  const currentCandidate = candidates.find(c => c.id === currentInterview.candidateId);
  const [isClicked, setIsClicked] = useState(false);

  const handleAvatarClick = () => {
    setIsClicked(true);
    setTimeout(() => setIsClicked(false), 600);
    
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
    <>
      <style>
        {`
          @keyframes float {
            0%, 100% {
              transform: translateY(0px);
            }
            50% {
              transform: translateY(-10px);
            }
          }

          @keyframes pulse {
            0%, 100% {
              box-shadow: 0 0 0 0 rgba(0, 188, 242, 0.7);
            }
            50% {
              box-shadow: 0 0 0 20px rgba(0, 188, 242, 0);
            }
          }

          @keyframes ripple {
            0% {
              transform: scale(1);
              opacity: 0.6;
            }
            100% {
              transform: scale(1.5);
              opacity: 0;
            }
          }

          @keyframes rotate {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }

          @keyframes click-bounce {
            0%, 100% {
              transform: scale(1);
            }
            50% {
              transform: scale(0.85);
            }
          }

          .chatbot-container {
            position: fixed;
            bottom: 30px;
            right: 30px;
            cursor: pointer;
            z-index: 1000;
          }

          .chatbot-avatar-wrapper {
            position: relative;
            display: inline-block;
            animation: float 3s ease-in-out infinite;
          }

          .chatbot-avatar-wrapper:hover .avatar-main {
            transform: scale(1.1);
          }

          .avatar-main {
            transition: transform 0.3s ease;
            animation: pulse 2s infinite;
          }

          .avatar-main.clicked {
            animation: click-bounce 0.6s ease;
          }

          .ripple-effect {
            position: absolute;
            top: 50%;
            left: 50%;
            width: 64px;
            height: 64px;
            margin: -32px 0 0 -32px;
            border-radius: 50%;
            border: 2px solid #00bcf2;
            animation: ripple 1.5s infinite;
          }

          .ripple-effect:nth-child(2) {
            animation-delay: 0.5s;
          }

          .ripple-effect:nth-child(3) {
            animation-delay: 1s;
          }

          .rotating-border {
            position: absolute;
            top: -4px;
            left: -4px;
            width: 72px;
            height: 72px;
            border-radius: 50%;
            border: 2px solid transparent;
            border-top-color: #00bcf2;
            border-right-color: #00bcf2;
            animation: rotate 2s linear infinite;
          }

          .glow-effect {
            position: absolute;
            top: 50%;
            left: 50%;
            width: 80px;
            height: 80px;
            margin: -40px 0 0 -40px;
            border-radius: 50%;
            background: radial-gradient(circle, rgba(0, 188, 242, 0.3) 0%, rgba(0, 188, 242, 0) 70%);
            animation: pulse 2s infinite;
          }
        `}
      </style>

      <div className="chatbot-container" onClick={handleAvatarClick}>
        <Tooltip title="Click me for a greeting!" placement="left">
          <div className="chatbot-avatar-wrapper">
            {/* Glow Effect */}
            <div className="glow-effect" />
            
            {/* Ripple Effects */}
            <div className="ripple-effect" />
            <div className="ripple-effect" />
            <div className="ripple-effect" />
            
            {/* Rotating Border */}
            <div className="rotating-border" />
            
            {/* Main Avatar */}
            <Avatar 
              size={64} 
              icon={<RobotOutlined />} 
              className={`avatar-main ${isClicked ? 'clicked' : ''}`}
              style={{ 
                backgroundColor: '#00bcf2', 
                boxShadow: '0 4px 20px rgba(0, 188, 242, 0.5)',
                position: 'relative',
                zIndex: 2
              }}
            />
          </div>
        </Tooltip>
      </div>
    </>
  );
}

export default ChatbotAvatar;