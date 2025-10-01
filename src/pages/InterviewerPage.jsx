import React, { useState, useMemo, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Table, Typography, Input, Select, Button, Space, Card, Row, Col, Empty, Modal, Tag, List, Avatar, Tabs, Alert, message } from 'antd';
import { UserOutlined, RobotOutlined, CheckCircleOutlined, ClockCircleOutlined, StarOutlined, PlusOutlined, DownloadOutlined } from '@ant-design/icons';
import { Document, Page, pdfjs } from 'react-pdf';
import StatCard from '/src/components/StatCard.jsx';
import { resetCurrentInterview, setSelectedModel } from '/src/app/interviewSlice.js';

pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

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
  const [pdfError, setPdfError] = useState(null);

  // Welcome back message on component mount/refresh
  useEffect(() => {
    const hasVisited = sessionStorage.getItem('hasVisitedInterviewer');
    
    if (hasVisited) {
      message.success({
        content: 'Welcome back! 👋',
        duration: 3,
        style: {
          marginTop: '20vh',
        },
      });
    } else {
      sessionStorage.setItem('hasVisitedInterviewer', 'true');
    }
  }, []);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setPdfError(null);
  };

  const onDocumentLoadError = (error) => {
    console.error('PDF load error:', error);
    setPdfError('Failed to load PDF. The file may be corrupted or in an unsupported format.');
  };

  const handleShowDetails = (candidate) => {
    setSelectedCandidate(candidate);
    setDetailsVisible(true);
    setNumPages(null);
    setPdfError(null);
    
    console.log('Resume File:', candidate.resumeFile);
    console.log('Is File?', candidate.resumeFile instanceof File);
    console.log('File type:', candidate.resumeFile?.type);
    console.log('Has data?', candidate.resumeFile?.data);
  };

  const handleCloseDetails = () => {
    setDetailsVisible(false);
    setSelectedCandidate(null);
    setNumPages(null);
    setPdfError(null);
  };

  const handleDownloadResume = () => {
    if (!selectedCandidate?.resumeFile) return;
    
    try {
      let downloadUrl;
      let filename = `${selectedCandidate.name.replace(/\s+/g, '_')}_Resume.pdf`;
      
      if (selectedCandidate.resumeFile instanceof File) {
        downloadUrl = URL.createObjectURL(selectedCandidate.resumeFile);
      } else if (selectedCandidate.resumeFile instanceof Blob) {
        downloadUrl = URL.createObjectURL(selectedCandidate.resumeFile);
      } else if (selectedCandidate.resumeFile.data) {
        if (selectedCandidate.resumeFile.data instanceof File || selectedCandidate.resumeFile.data instanceof Blob) {
          downloadUrl = URL.createObjectURL(selectedCandidate.resumeFile.data);
        } else if (typeof selectedCandidate.resumeFile.data === 'string') {
          downloadUrl = selectedCandidate.resumeFile.data.startsWith('data:') 
            ? selectedCandidate.resumeFile.data 
            : `data:application/pdf;base64,${selectedCandidate.resumeFile.data}`;
        }
      } else if (typeof selectedCandidate.resumeFile === 'string') {
        downloadUrl = selectedCandidate.resumeFile;
      }
      
      if (downloadUrl) {
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Clean up object URL if we created one
        if (downloadUrl.startsWith('blob:')) {
          setTimeout(() => URL.revokeObjectURL(downloadUrl), 100);
        }
      }
    } catch (error) {
      console.error('Error downloading resume:', error);
    }
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

  const getPdfFile = (candidate) => {
    if (!candidate.resumeFile) return null;
    
    try {
      if (candidate.resumeFile instanceof File) {
        console.log('Using File object directly');
        return URL.createObjectURL(candidate.resumeFile);
      }
      
      if (candidate.resumeFile instanceof Blob) {
        console.log('Using Blob object');
        return URL.createObjectURL(candidate.resumeFile);
      }
      
      if (candidate.resumeFile.data) {
        if (candidate.resumeFile.data instanceof File || candidate.resumeFile.data instanceof Blob) {
          console.log('Using data.File/Blob');
          return URL.createObjectURL(candidate.resumeFile.data);
        }
        
        if (typeof candidate.resumeFile.data === 'string') {
          console.log('Using base64 string');
          if (candidate.resumeFile.data.startsWith('data:')) {
            return candidate.resumeFile.data;
          }
          return `data:application/pdf;base64,${candidate.resumeFile.data}`;
        }
      }
      
      if (typeof candidate.resumeFile === 'string') {
        console.log('Using URL string');
        return candidate.resumeFile;
      }
      
      console.error('Unknown resume file format:', candidate.resumeFile);
      return null;
    } catch (error) {
      console.error('Error processing resume file:', error);
      return null;
    }
  };

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
          <Tabs 
            defaultActiveKey="1"
            tabBarExtraContent={
              selectedCandidate.resumeFile && (
                <Button 
                  type="primary" 
                  icon={<DownloadOutlined />} 
                  onClick={handleDownloadResume}
                  size="small"
                >
                  Download Resume
                </Button>
              )
            }
          >
            <TabPane tab="Interview Transcript" key="1">
              <Title level={5}>Final Summary</Title>
              <Text>{selectedCandidate.summary || "Summary not yet generated."}</Text><br />
              <Tag color="blue" style={{ marginTop: '8px' }}>Final Score: {selectedCandidate.finalScore !== undefined ? `${selectedCandidate.finalScore} / 100` : "Pending"}</Tag>
              <hr style={{ margin: '16px 0' }} />
              <Title level={5}>Full Transcript</Title>
              <div style={{ maxHeight: '400px', overflowY: 'auto', background: '#222', padding: '16px', borderRadius: '8px' }}>
                <List dataSource={selectedCandidate.chatHistory} renderItem={(item) => (
                  <List.Item>
                    <List.Item.Meta 
                      avatar={item.author === 'ai' ? <Avatar icon={<RobotOutlined />} /> : <Avatar icon={<UserOutlined />} />} 
                      title={<span style={{ color: 'white' }}>{item.author === 'ai' ? 'CrispHire AI' : selectedCandidate.name}</span>} 
                      description={
                        <div>
                          <p style={{ color: '#ccc', margin: 0, whiteSpace: 'pre-wrap' }}>{item.text}</p>
                          {item.author === 'user' && item.feedback && (
                            <div style={{ marginTop: '8px' }}>
                              <Tag color={item.score > 5 ? 'success' : 'error'}>Score: {item.score}/10</Tag>
                              <Text type="secondary">{item.feedback}</Text>
                            </div>
                          )}
                        </div>
                      }
                    />
                  </List.Item>
                )}/>
              </div>
            </TabPane>
            <TabPane tab="Candidate Resume" key="2">
              <div style={{ height: '60vh', overflowY: 'auto', background: '#f5f5f5', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px' }}>
                {selectedCandidate.resumeFile ? (
                  <>
                    {pdfError ? (
                      <Alert 
                        message="PDF Loading Error" 
                        description={
                          <div>
                            <p>{pdfError}</p>
                            <p style={{ marginTop: '10px', fontSize: '12px' }}>
                              Debug Info: Check browser console for details.
                            </p>
                          </div>
                        }
                        type="error" 
                        showIcon 
                        style={{margin: '20px', maxWidth: '600px'}}
                      />
                    ) : (
                      <>
                        <Document 
                          file={getPdfFile(selectedCandidate)} 
                          onLoadSuccess={onDocumentLoadSuccess}
                          onLoadError={onDocumentLoadError}
                          options={{
                            cMapUrl: 'https://unpkg.com/pdfjs-dist@3.11.174/cmaps/',
                            cMapPacked: true,
                          }}
                          loading={
                            <div style={{ padding: '40px', textAlign: 'center' }}>
                              <Text>Loading PDF...</Text>
                            </div>
                          }
                        >
                          {Array.from(new Array(numPages || 0), (el, index) => (
                            <Page 
                              key={`page_${index + 1}`} 
                              pageNumber={index + 1} 
                              renderTextLayer={false} 
                              renderAnnotationLayer={false}
                              width={800}
                              style={{ marginBottom: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
                            />
                          ))}
                        </Document>
                        {numPages && (
                          <Text style={{ marginTop: '10px', color: '#666' }}>
                            Total Pages: {numPages}
                          </Text>
                        )}
                      </>
                    )}
                  </>
                ) : (
                  <Alert 
                    message="No Resume Uploaded" 
                    description="This candidate has not uploaded a resume yet." 
                    type="warning" 
                    showIcon 
                    style={{margin: '20px', maxWidth: '600px'}}
                  />
                )}
              </div>
            </TabPane>
          </Tabs>
        </Modal>
      )}
    </Space>
  );
}

export default InterviewerPage;