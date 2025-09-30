import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Upload, Typography, Spin, App as AntApp } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import mammoth from 'mammoth';
import * as pdfjsLib from 'pdfjs-dist';
import { extractDetailsFromText, extractSkillsFromText } from '/src/api/gemini.js';
import { addCandidate } from '/src/app/interviewSlice.js';

pdfjsLib.GlobalWorkerOptions.workerSrc = `/pdf.worker.min.js`;

const { Dragger } = Upload;
const { Title, Text } = Typography;

function ResumeUploader() {
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const { message } = AntApp.useApp();
  const selectedModel = useSelector((state) => state.interview.selectedModel);

  const processFileText = async (text, fileName, fileData) => {
    const extractedDetails = await extractDetailsFromText(text, selectedModel);
    const extractedSkills = await extractSkillsFromText(text, selectedModel);

    if (!extractedDetails) {
      message.error('AI could not extract basic details from the resume.');
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
    } finally {
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
    <div style={{ textAlign: 'center', padding: '50px 0' }}>
      <Title level={2}>Upload Your Resume</Title>
      <Text type="secondary">Please provide your resume in PDF or DOCX format.</Text>
      <div style={{ maxWidth: '600px', margin: '30px auto' }}>
        <Spin spinning={loading} tip="Analyzing Resume...">
          <Dragger {...props}>
            <p className="ant-upload-drag-icon"><InboxOutlined /></p>
            <p className="ant-upload-text">Click or drag file to this area</p>
          </Dragger>
        </Spin>
      </div>
    </div>
  );
}

export default ResumeUploader;