import React from 'react';
import { useSelector } from 'react-redux';
import { Layout, Tabs, ConfigProvider, theme, App as AntApp } from 'antd';
import IntervieweePage from './pages/IntervieweePage';
import InterviewerPage from './pages/InterviewerPage';
import ChatbotAvatar from './components/ChatbotAvatar';

const { Header, Content } = Layout;

const items = [
  {
    key: '1',
    label: 'Interviewee',
    children: <IntervieweePage />,
  },
  {
    key: '2',
    label: 'Interviewer Dashboard',
    children: <InterviewerPage />,
  },
];

function App() {
  const interviewStatus = useSelector((state) => state.interview.currentInterview?.status);

  // Use the simpler layout that always shows the tabs
  return (
    <ConfigProvider theme={{ algorithm: theme.darkAlgorithm }}>
      <AntApp>
        <Layout style={{ minHeight: '100vh' }}>
          <Header style={{ display: 'flex', alignItems: 'center' }}>
            <div className="logo" style={{ color: '#00bcf2', fontSize: '24px', fontWeight: 'bold' }}>
              CrispHire AI
            </div>
          </Header>
          <Content style={{ padding: '0 48px' }}>
            <div style={{ padding: 24, minHeight: 380, marginTop: '24px' }}>
              <Tabs defaultActiveKey="1" items={items} size="large" />
            </div>
          </Content>
          <ChatbotAvatar />
        </Layout>
      </AntApp>
    </ConfigProvider>
  );
}

export default App;