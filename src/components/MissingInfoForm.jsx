import React from 'react';
import { useDispatch } from 'react-redux';
import { Form, Input, Button, Card, Typography, Alert } from 'antd';
import { updateCandidateDetails } from '/src/app/interviewSlice.js';

const { Title, Text } = Typography;

function MissingInfoForm({ candidate }) {
  const dispatch = useDispatch();
  const [form] = Form.useForm();

  const onFinish = (values) => {
    const updatedDetails = { ...candidate, ...values };
    dispatch(updateCandidateDetails(updatedDetails));
  };

  form.setFieldsValue({
    name: candidate.name,
    email: candidate.email,
    phone: candidate.phone,
  });

  const missingFields = [];
  if (!candidate.name) missingFields.push('Name');
  if (!candidate.email) missingFields.push('Email');
  if (!candidate.phone) missingFields.push('Phone Number');

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', paddingTop: '50px' }}>
      <Card style={{ width: 400 }}>
        <Title level={4}>A Few More Details</Title>
        <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
          We missed some information from your resume. Please fill it in to continue.
        </Text>
        
        {missingFields.length > 0 && (
          <Alert
            message="Missing Information"
            description={`We couldn't extract the following from your resume: ${missingFields.join(', ')}. Please provide them below.`}
            type="warning"
            showIcon
            style={{ marginBottom: 24 }}
          />
        )}

        <Form form={form} layout="vertical" onFinish={onFinish} initialValues={candidate}>
          {!candidate.name && (
            <Form.Item name="name" label="Full Name" rules={[{ required: true, message: 'Please enter your full name' }]}>
              <Input />
            </Form.Item>
          )}
          {!candidate.email && (
            <Form.Item name="email" label="Email Address" rules={[{ required: true, type: 'email', message: 'Please enter a valid email' }]}>
              <Input />
            </Form.Item>
          )}
          {!candidate.phone && (
            <Form.Item name="phone" label="Phone Number" rules={[{ required: true, message: 'Please enter your phone number' }]}>
              <Input />
            </Form.Item>
          )}
          <Form.Item>
            <Button type="primary" htmlType="submit" block>Continue to Interview</Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}

export default MissingInfoForm;