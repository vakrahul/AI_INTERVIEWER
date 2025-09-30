import React, { useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Table, Typography, Input, Select, Button, Space, Card, Row, Col, Empty, Modal, Tag, List, Avatar, Tabs, Alert } from 'antd';
import { UserOutlined, RobotOutlined, CheckCircleOutlined, ClockCircleOutlined, StarOutlined, PlusOutlined } from '@ant-design/icons';
import { Document, Page, pdfjs } from 'react-pdf';
import StatCard from '/src/components/StatCard.jsx';
import { resetCurrentInterview, setSelectedModel } from '/src/app/interviewSlice.js';

// This line is crucial for the PDF viewer in the modal to work correctly.
// It assumes you have pdf.worker.min.js in your /public folder.
pdfjs.GlobalWorkerOptions.workerSrc = `/pdf.worker.min.js`;

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;
const { TabPane } = Tabs;

function InterviewerPage() {
  const { candidates, selectedModel } = useSelector((state) => state.interview);
  const dispatch = useDispatch();
  const [searchTerm, setSearchTerm] = useState('');
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [numPages, setNumPages] = useState(null);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  const handleShowDetails = (candidate) => {
    setSelectedCandidate(candidate);
    setDetailsVisible(true);
  };

  const handleCloseDetails = () => {
    setDetailsVisible(false);
    setSelectedCandidate(null);
  };
  
  const handleReset = () => {
    dispatch(resetCurrentInterview());
  };

  const handleModelChange = (value) => {
    dispatch(setSelectedModel(value));
  };

  const columns = [
    { title: 'Candidate Name', dataIndex: 'name', key: 'name' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'Final Score', dataIndex: 'finalScore', key: 'finalScore', render: (score) => score !== undefined ? `${score} / 100` : 'Pending', sorter: (a, b) => (a.finalScore ?? 0) - (b.finalScore ?? 0) },
    { title: 'Status', dataIndex: 'status', key: 'status' },
  ];

  const filteredCandidates = useMemo(() => {
    return candidates.filter(c => (c.name || '').toLowerCase().includes(searchTerm.toLowerCase()));
  }, [candidates, searchTerm]);

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Row justify="space-between" align="middle">
        <Col><Title level={3}>Interviewer Dashboard</Title></Col>
        <Col>
          <Space>
            <Select value={selectedModel} onChange={handleModelChange} style={{ width: 200 }}>
              <Option value="gemini-pro">Gemini Pro (Stable)</Option>
              <Option value="gemini-1.5-flash-latest">Gemini 1.5 Flash (Fast)</Option>
              <Option value="gemini-1.5-pro-latest">Gemini 1.5 Pro (Advanced)</Option>
                <Option value="gemini-2.5-flash">Gemini 2.5 Flash (Fast)</Option>
                <Option value="gemini-2.5-pro">Gemini 2.5 Pro (Advanced)</Option>
            </Select>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleReset}>Start New Interview</Button>
          </Space>
        </Col>
      </Row>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={12} lg={6}><StatCard icon={UserOutlined} title="Total Candidates" value={candidates.length} color="#1890ff" /></Col>
        <Col xs={24} sm={12} md={12} lg={6}><StatCard icon={CheckCircleOutlined} title="Completed" value={candidates.filter(c => c.summary).length} color="#52c41a" /></Col>
      </Row>
      <Card variant="borderless">
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <Row justify="space-between" align="middle">
            <Col><Text strong>Candidates ({filteredCandidates.length})</Text></Col>
            <Col><Search placeholder="Search by name" onChange={(e) => setSearchTerm(e.target.value)} style={{ width: 250 }} /></Col>
          </Row>
          <Table columns={columns} dataSource={filteredCandidates} rowKey="id" onRow={(record) => ({ onClick: () => handleShowDetails(record) })} rowClassName="clickable-row" />
        </Space>
      </Card>
      {selectedCandidate && (
        <Modal title={`Interview Details: ${selectedCandidate.name}`} open={detailsVisible} onCancel={handleCloseDetails} footer={null} width={1000}>
          <Tabs defaultActiveKey="1">
            <TabPane tab="Interview Transcript" key="1">
              <Title level={5}>Final Summary</Title>
              <Text>{selectedCandidate.summary || "Summary not yet generated."}</Text><br />
              <Tag color="blue" style={{ marginTop: '8px' }}>Final Score: {selectedCandidate.finalScore !== undefined ? `${selectedCandidate.finalScore} / 100` : "Pending"}</Tag>
              <hr style={{ margin: '16px 0' }} />
              <Title level={5}>Full Transcript</Title>
              <div style={{ maxHeight: '400px', overflowY: 'auto', background: '#222', padding: '16px', borderRadius: '8px' }}>
                <List dataSource={selectedCandidate.chatHistory} renderItem={(item) => (
                  <List.Item>
                    <List.Item.Meta avatar={item.author === 'ai' ? <Avatar icon={<RobotOutlined />} /> : <Avatar icon={<UserOutlined />} />} title={<span style={{ color: 'white' }}>{item.author === 'ai' ? 'CrispHire AI' : selectedCandidate.name}</span>} description={<div><p style={{ color: '#ccc', margin: 0, whiteSpace: 'pre-wrap' }}>{item.text}</p>{item.author === 'user' && item.feedback && (<div style={{ marginTop: '8px' }}><Tag color={item.score > 5 ? 'success' : 'error'}>Score: {item.score}/10</Tag><Text type="secondary">{item.feedback}</Text></div>)}</div>}/>
                  </List.Item>
                )}/>
              </div>
            </TabPane>
            <TabPane tab="Candidate Resume" key="2">
              <div style={{ height: '60vh', overflowY: 'auto', background: '#555', display: 'flex', justifyContent: 'center' }}>
                {selectedCandidate.resumeFile?.type === 'application/pdf' ? (
                  <div>
                    <Document file={selectedCandidate.resumeFile.data} onLoadSuccess={onDocumentLoadSuccess}>
                      {Array.from(new Array(numPages || 0), (el, index) => <Page key={`page_${index + 1}`} pageNumber={index + 1} renderTextLayer={false} renderAnnotationLayer={false} />)}
                    </Document>
                  </div>
                ) : ( <Alert message="Resume Preview" description="Live preview is only available for PDF files." type="info" showIcon style={{margin: '20px'}}/> )}
              </div>
            </TabPane>
          </Tabs>
        </Modal>
      )}
    </Space>
  );
}
export default InterviewerPage;