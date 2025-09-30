import React from 'react';
import { Card, Statistic, Space, Typography } from 'antd';

const { Text } = Typography;

function StatCard({ icon, title, value, color }) {
  const IconComponent = icon;

  return (
    <Card variant="borderless" style={{ boxShadow: '0 2px 8px rgba(0, 0, 0, 0.09)' }}>
      <Space align="center" size="large">
        <div style={{ 
          fontSize: '24px', 
          backgroundColor: `${color}20`,
          color: color, 
          padding: '12px',
          borderRadius: '50%'
        }}>
          <IconComponent />
        </div>
        <div>
          <Text type="secondary">{title}</Text>
          <Statistic value={value} valueStyle={{ fontSize: '24px', fontWeight: 500 }} />
        </div>
      </Space>
    </Card>
  );
}

export default StatCard;