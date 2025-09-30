import React from 'react';
import { useSelector } from 'react-redux';
import { Avatar } from 'antd';
import IdleAvatar from '/src/assets/avatar-idle.gif';
import SpeakingAvatar from '/src/assets/avatar-speaking.gif';

function AI_Avatar() {
  const isAiSpeaking = useSelector((state) => state.interview.currentInterview.isAiSpeaking);

  const avatarSrc = isAiSpeaking ? SpeakingAvatar : IdleAvatar;

  return (
    <div style={{ textAlign: 'center', marginBottom: '20px' }}>
      <Avatar 
        size={128} 
        src={avatarSrc} 
        style={{ border: '3px solid #00bcf2' }}
      />
    </div>
  );
}

export default AI_Avatar;