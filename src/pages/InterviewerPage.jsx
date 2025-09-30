import React, { useState, useMemo, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Table, Typography, Input, Select, Button, Space, Card, Row, Col, Empty, Modal, Tag, List, Avatar, Tabs, Alert, Badge, Divider } from 'antd';
import { UserOutlined, RobotOutlined, CheckCircleOutlined, ClockCircleOutlined, StarOutlined, PlusOutlined, FileTextOutlined, TrophyOutlined, SearchOutlined } from '@ant-design/icons';
import { Document, Page, pdfjs } from 'react-pdf';
import StatCard from '/src/components/StatCard.jsx';
import { resetCurrentInterview, setSelectedModel } from '/src/app/interviewSlice.js';

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
  const [showSplash, setShowSplash] = useState(false);
  const [pageLoaded, setPageLoaded] = useState(false);

  useEffect(() => {
    setPageLoaded(true);
  }, []);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  const handleShowDetails = (candidate) => {
    setShowSplash(true);
    setTimeout(() => {
      setSelectedCandidate(candidate);
      setDetailsVisible(true);
      setShowSplash(false);
    }, 800);
  };

  const handleCloseDetails = () => {
    setDetailsVisible(false);
    setSelectedCandidate(null);
    setNumPages(null);
  };
  
  const handleReset = () => {
    dispatch(resetCurrentInterview());
  };

  const handleModelChange = (value) => {
    dispatch(setSelectedModel(value));
  };

  const getStatusColor = (status) => {
    const colors = {
      'completed': 'success',
      'active': 'processing',
      'pending': 'warning',
      'details_missing': 'default'
    };
    return colors[status] || 'default';
  };

  const getScoreColor = (score) => {
    if (score >= 80) return '#52c41a';
    if (score >= 60) return '#faad14';
    return '#ff4d4f';
  };

  const columns = [
    { 
      title: 'Candidate Name', 
      dataIndex: 'name', 
      key: 'name',
      render: (name) => (
        <Space>
          <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#1890ff' }} />
          <Text strong>{name || 'N/A'}</Text>
        </Space>
      )
    },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { 
      title: 'Final Score', 
      dataIndex: 'finalScore', 
      key: 'finalScore', 
      render: (score) => score !== undefined ? (
        <Tag color={getScoreColor(score)} style={{ fontSize: '14px', padding: '4px 12px' }}>
          <TrophyOutlined /> {score} / 100
        </Tag>
      ) : (
        <Tag color="default">Pending</Tag>
      ),
      sorter: (a, b) => (a.finalScore ?? 0) - (b.finalScore ?? 0)
    },
    { 
      title: 'Status', 
      dataIndex: 'status', 
      key: 'status',
      render: (status) => (
        <Badge status={getStatusColor(status) === 'success' ? 'success' : getStatusColor(status) === 'processing' ? 'processing' : 'default'} text={status} />
      )
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Button type="link" icon={<FileTextOutlined />} onClick={(e) => { e.stopPropagation(); handleShowDetails(record); }}>
          View Details
        </Button>
      )
    }
  ];

  const filteredCandidates = useMemo(() => {
    return candidates.filter(c => (c.name || '').toLowerCase().includes(searchTerm.toLowerCase()));
  }, [candidates, searchTerm]);

  const completedCount = candidates.filter(c => c.summary).length;
  const avgScore = candidates.filter(c => c.finalScore).reduce((sum, c) => sum + c.finalScore, 0) / (candidates.filter(c => c.finalScore).length || 1);
  const [showModelAlert, setShowModelAlert] = useState(true);

  return (
    <>
      <style>
        {`
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes scaleIn {
            from {
              opacity: 0;
              transform: scale(0.95);
            }
            to {
              opacity: 1;
              transform: scale(1);
            }
          }
          @keyframes slideIn {
            from {
              opacity: 0;
              transform: translateX(-20px);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }
          @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
          }
          .clickable-row {
            cursor: pointer;
            transition: all 0.3s ease;
          }
          .clickable-row:hover {
            background-color: rgba(24, 144, 255, 0.1);
            transform: translateX(4px);
          }
          .stat-card-animated {
            animation: fadeInUp 0.6s ease-out;
          }
          .modal-content-animated {
            animation: scaleIn 0.5s ease-out;
          }
          .search-box:focus-within {
            transform: scale(1.02);
            transition: transform 0.2s ease;
          }
        `}
      </style>

      {showSplash && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
          animation: 'fadeIn 0.3s ease-out'
        }}>
          <div style={{
            fontSize: '64px',
            marginBottom: '24px',
            animation: 'pulse 1s ease-in-out infinite'
          }}>
            📄
          </div>
          <Title level={3} style={{ color: 'white', margin: 0 }}>
            Loading Candidate Profile...
          </Title>
        </div>
      )}

      <div style={{ 
        padding: '24px',
        animation: pageLoaded ? 'fadeIn 0.6s ease-out' : 'none'
      }}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          {showModelAlert && selectedModel !== 'gemini-2.5-flash' && (
            <Alert
              message="⚡ Recommendation: Use Gemini 2.5 Flash"
              description="For the best performance and faster response times, we recommend using Gemini 2.5 Flash model. It provides optimal balance between speed and quality for conducting interviews."
              type="info"
              showIcon
              closable
              onClose={() => setShowModelAlert(false)}
              action={
                <Button 
                  size="small" 
                  type="primary"
                  onClick={() => {
                    handleModelChange('gemini-2.5-flash');
                    setShowModelAlert(false);
                  }}
                  style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    border: 'none'
                  }}
                >
                  Switch Now
                </Button>
              }
              style={{
                animation: 'slideIn 0.6s ease-out',
                border: '1px solid #91d5ff',
                background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)'
              }}
            />
          )}
          
          <Row justify="space-between" align="middle" style={{ animation: 'slideIn 0.6s ease-out' }}>
            <Col>
              <Title level={2} style={{ margin: 0, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                🎯 Interviewer Dashboard
              </Title>
              <Text type="secondary">Manage and review all candidate interviews</Text>
            </Col>
            <Col>
              <Space>
                <Select 
                  value={selectedModel} 
                  onChange={handleModelChange} 
                  style={{ width: 220 }}
                  size="large"
                >
                  <Option value="gemini-pro">🤖 Gemini Pro (Stable)</Option>
                  <Option value="gemini-1.5-flash-latest">⚡ Gemini 1.5 Flash</Option>
                  <Option value="gemini-1.5-pro-latest">🚀 Gemini 1.5 Pro</Option>
                  <Option value="gemini-2.5-flash">⚡ Gemini 2.5 Flash</Option>
                  <Option value="gemini-2.5-pro">🚀 Gemini 2.5 Pro</Option>
                </Select>
                <Button 
                  type="primary" 
                  icon={<PlusOutlined />} 
                  onClick={handleReset}
                  size="large"
                  style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    border: 'none',
                    transition: 'transform 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                  Start New Interview
                </Button>
              </Space>
            </Col>
          </Row>

          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={12} lg={6} style={{ animation: 'fadeInUp 0.6s ease-out 0.1s backwards' }}>
              <StatCard icon={UserOutlined} title="Total Candidates" value={candidates.length} color="#1890ff" />
            </Col>
            <Col xs={24} sm={12} md={12} lg={6} style={{ animation: 'fadeInUp 0.6s ease-out 0.2s backwards' }}>
              <StatCard icon={CheckCircleOutlined} title="Completed" value={completedCount} color="#52c41a" />
            </Col>
            <Col xs={24} sm={12} md={12} lg={6} style={{ animation: 'fadeInUp 0.6s ease-out 0.3s backwards' }}>
              <StatCard icon={ClockCircleOutlined} title="In Progress" value={candidates.length - completedCount} color="#faad14" />
            </Col>
            <Col xs={24} sm={12} md={12} lg={6} style={{ animation: 'fadeInUp 0.6s ease-out 0.4s backwards' }}>
              <StatCard icon={StarOutlined} title="Avg Score" value={avgScore.toFixed(1)} color="#722ed1" />
            </Col>
          </Row>

          <Card 
            bordered={false}
            style={{ 
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              animation: 'fadeInUp 0.6s ease-out 0.5s backwards'
            }}
          >
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <Row justify="space-between" align="middle">
                <Col>
                  <Title level={4} style={{ margin: 0 }}>
                    Candidates ({filteredCandidates.length})
                  </Title>
                </Col>
                <Col>
                  <Search 
                    placeholder="Search candidates..." 
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ width: 300 }}
                    size="large"
                    prefix={<SearchOutlined />}
                    className="search-box"
                  />
                </Col>
              </Row>
              
              <Table 
                columns={columns} 
                dataSource={filteredCandidates} 
                rowKey="id" 
                onRow={(record) => ({ 
                  onClick: () => handleShowDetails(record)
                })} 
                rowClassName="clickable-row"
                pagination={{ 
                  pageSize: 10,
                  showSizeChanger: true,
                  showTotal: (total) => `Total ${total} candidates`
                }}
                locale={{
                  emptyText: (
                    <Empty
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                      description="No candidates found"
                    />
                  )
                }}
              />
            </Space>
          </Card>
        </Space>
      </div>

      {selectedCandidate && (
        <Modal 
          title={
            <Space style={{ width: '100%', justifyContent: 'space-between' }}>
              <Space>
                <Avatar size={40} icon={<UserOutlined />} style={{ backgroundColor: '#1890ff' }} />
                <div>
                  <Title level={4} style={{ margin: 0 }}>{selectedCandidate.name}</Title>
                  <Text type="secondary">{selectedCandidate.email}</Text>
                </div>
              </Space>
              {selectedCandidate.finalScore !== undefined && (
                <Tag color={getScoreColor(selectedCandidate.finalScore)} style={{ fontSize: '16px', padding: '6px 16px' }}>
                  <TrophyOutlined /> {selectedCandidate.finalScore} / 100
                </Tag>
              )}
            </Space>
          }
          open={detailsVisible} 
          onCancel={handleCloseDetails} 
          footer={null} 
          width={1200}
          style={{ top: 20 }}
          className="modal-content-animated"
        >
          <Tabs defaultActiveKey="1" size="large">
            <TabPane tab={<span><RobotOutlined /> Interview Transcript</span>} key="1">
              <Space direction="vertical" size="large" style={{ width: '100%' }}>
                {selectedCandidate.summary && (
                  <Card 
                    style={{ 
                      background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
                      border: '1px solid rgba(102, 126, 234, 0.3)'
                    }}
                  >
                    <Title level={5} style={{ marginTop: 0 }}>
                      <StarOutlined /> Final Summary
                    </Title>
                    <Text>{selectedCandidate.summary}</Text>
                  </Card>
                )}
                
                <Divider>Full Transcript</Divider>
                
                <div style={{ 
                  maxHeight: '500px', 
                  overflowY: 'auto', 
                  background: '#1a1a1a', 
                  padding: '20px', 
                  borderRadius: '12px',
                  border: '1px solid #333'
                }}>
                  <List 
                    dataSource={selectedCandidate.chatHistory} 
                    renderItem={(item, index) => (
                      <List.Item style={{ 
                        borderBottom: '1px solid #333',
                        animation: `fadeInUp 0.4s ease-out ${index * 0.05}s backwards`
                      }}>
                        <List.Item.Meta 
                          avatar={
                            item.author === 'ai' 
                              ? <Avatar icon={<RobotOutlined />} style={{ backgroundColor: '#722ed1' }} /> 
                              : <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#1890ff' }} />
                          } 
                          title={
                            <span style={{ color: 'white', fontSize: '15px' }}>
                              {item.author === 'ai' ? '🤖 CrispHire AI' : `👤 ${selectedCandidate.name}`}
                            </span>
                          } 
                          description={
                            <div>
                              <p style={{ color: '#ccc', margin: '8px 0', whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
                                {item.text}
                              </p>
                              {item.author === 'user' && item.feedback && (
                                <div style={{ 
                                  marginTop: '12px', 
                                  padding: '12px',
                                  background: 'rgba(255,255,255,0.05)',
                                  borderRadius: '8px',
                                  borderLeft: `4px solid ${item.score > 5 ? '#52c41a' : '#ff4d4f'}`
                                }}>
                                  <Space direction="vertical" size="small">
                                    <Tag color={item.score > 5 ? 'success' : 'error'} style={{ fontSize: '13px' }}>
                                      Score: {item.score}/10
                                    </Tag>
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
                </div>
              </Space>
            </TabPane>
            
            <TabPane tab={<span><FileTextOutlined /> Candidate Resume</span>} key="2">
              <div style={{ 
                minHeight: '60vh', 
                overflowY: 'auto', 
                background: '#f5f5f5', 
                display: 'flex', 
                justifyContent: 'center',
                padding: '20px',
                borderRadius: '12px'
              }}>
                {selectedCandidate.resumeFile?.type === 'application/pdf' ? (
                  <div style={{ animation: 'scaleIn 0.5s ease-out' }}>
                    <Document 
                      file={selectedCandidate.resumeFile.data} 
                      onLoadSuccess={onDocumentLoadSuccess}
                      loading={
                        <div style={{ textAlign: 'center', padding: '40px' }}>
                          <div style={{ fontSize: '48px', animation: 'pulse 1s ease-in-out infinite' }}>📄</div>
                          <Text>Loading resume...</Text>
                        </div>
                      }
                    >
                      {Array.from(new Array(numPages || 0), (el, index) => (
                        <Page 
                          key={`page_${index + 1}`} 
                          pageNumber={index + 1} 
                          renderTextLayer={false} 
                          renderAnnotationLayer={false}
                          style={{ marginBottom: '20px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                        />
                      ))}
                    </Document>
                  </div>
                ) : (
                  <Alert 
                    message="Resume Preview" 
                    description="Live preview is only available for PDF files." 
                    type="info" 
                    showIcon 
                    style={{ margin: '20px', maxWidth: '500px' }}
                  />
                )}
              </div>
            </TabPane>
          </Tabs>
        </Modal>
      )}
    </>
  );
}

export default InterviewerPage;