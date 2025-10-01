import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Upload, Typography, Spin, App as AntApp, Modal } from 'antd';
import { InboxOutlined, LoadingOutlined, CheckCircleOutlined } from '@ant-design/icons';
import mammoth from 'mammoth';
import * as pdfjsLib from 'pdfjs-dist';
import { extractDetailsFromText, extractSkillsFromText } from '/src/api/gemini.js';
import { addCandidate } from '/src/app/interviewSlice.js';

pdfjsLib.GlobalWorkerOptions.workerSrc = `/pdf.worker.min.js`;

const { Dragger } = Upload;
const { Title, Text } = Typography;

function ResumeUploader() {
  const [loading, setLoading] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [candidateName, setCandidateName] = useState('');
  const dispatch = useDispatch();
  const { message } = AntApp.useApp();
  const selectedModel = useSelector((state) => state.interview.selectedModel);

  const processFileText = async (text, fileName, fileData) => {
    try {
      const extractedDetails = await extractDetailsFromText(text, selectedModel);
      const extractedSkills = await extractSkillsFromText(text, selectedModel);
      
      if (!extractedDetails) {
        message.error('AI failed to extract details. Please check your API key or try a different AI model from the dashboard.');
        setLoading(false);
        return;
      }

      const newCandidate = {
        ...extractedDetails,
        id: Date.now(),
        skills: extractedSkills,
        resumeText: text, 
        resumeFile: fileData,
      };
      
      dispatch(addCandidate(newCandidate));
      message.success(`${fileName} processed successfully.`);
      
      // Show welcome splash
      setCandidateName(extractedDetails.name || 'User');
      setShowWelcome(true);
      
      // Auto close splash after 3 seconds
      setTimeout(() => {
        setShowWelcome(false);
      }, 3000);
      
    } catch (error) {
        message.error('An unexpected error occurred during AI processing.');
        console.error("AI Processing Error:", error);
    } finally {
        setLoading(false);
    }
  };

  const handleFileChange = async (file) => {
    setLoading(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const fileData = { type: file.type, data: reader.result };
        let fullText = '';

        if (file.type === 'application/pdf') {
          const typedArray = new Uint8Array(arrayBuffer);
          const pdf = await pdfjsLib.getDocument(typedArray).promise;
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            fullText += textContent.items.map((s) => s.str).join(' ');
          }
        } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || file.type === 'application/msword') {
          const result = await mammoth.extractRawText({ arrayBuffer });
          fullText = result.value;
        } else {
          message.error('Unsupported file type. Please upload a PDF or DOCX file.');
          setLoading(false);
          return;
        }
        
        await processFileText(fullText, file.name, fileData);
      };
    } catch (error) {
      message.error('Failed to read or process the file.');
      console.error('File processing error:', error);
      setLoading(false);
    }
  };

  const props = {
    name: 'file',
    multiple: false,
    accept: ".pdf,.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    beforeUpload: (file) => {
      handleFileChange(file);
      return false;
    },
    showUploadList: false,
  };

  return (
    <>
      <div style={{ textAlign: 'center', padding: '50px 0' }}>
        <Title level={2}>Upload Your Resume</Title>
        <Text type="secondary">Please provide your resume in PDF or DOCX format.</Text>
        <div style={{ maxWidth: '600px', margin: '30px auto' }}>
          <Dragger {...props} disabled={loading}>
            {loading ? (
              <>
                <p className="ant-upload-drag-icon">
                  <Spin indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} />
                </p>
                <p className="ant-upload-text" style={{fontSize: '18px', color: '#1677ff'}}>Analyzing Resume...</p>
                <p className="ant-upload-hint">Please wait while the AI processes your document.</p>
              </>
            ) : (
              <>
                <p className="ant-upload-drag-icon">
                  <InboxOutlined />
                </p>
                <p className="ant-upload-text">Click or drag file to this area to upload</p>
                <p className="ant-upload-hint">
                  Your resume will be processed to extract your contact details and skills.
                </p>
              </>
            )}
          </Dragger>
        </div>
      </div>

      {/* Welcome Splash Modal */}
      <Modal
        open={showWelcome}
        footer={null}
        closable={false}
        centered
        width={500}
        styles={{
          body: {
            padding: '60px 40px',
            textAlign: 'center',
          }
        }}
      >
        <CheckCircleOutlined style={{ fontSize: 72, color: '#52c41a', marginBottom: 24 }} />
        <Title level={2} style={{ marginBottom: 16 }}>
          Welcome, {candidateName}!
        </Title>
        <Text style={{ fontSize: 16, color: '#666' }}>
          Your resume has been successfully processed. Get ready to begin your interview!
        </Text>
      </Modal>
    </>
  );
}

export default ResumeUploader;