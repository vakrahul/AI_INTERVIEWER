import React from 'react';
import { Card, Statistic, Space, Typography } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';

const { Text } = Typography;

function StatCard({ icon, title, value, color, trend, trendValue, suffix, prefix }) {
  const IconComponent = icon;

  return (
    <Card 
      bordered={false}
      style={{ 
        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03), 0 1px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px 0 rgba(0, 0, 0, 0.02)',
        borderRadius: '12px',
        background: '#ffffff',
        transition: 'all 0.3s ease',
        cursor: 'default',
        overflow: 'hidden',
        position: 'relative'
      }}
      bodyStyle={{ padding: '24px' }}
      hoverable
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = '0 4px 12px 0 rgba(0, 0, 0, 0.08), 0 2px 6px 0 rgba(0, 0, 0, 0.04)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 1px 2px 0 rgba(0, 0, 0, 0.03), 0 1px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px 0 rgba(0, 0, 0, 0.02)';
      }}
    >
      {/* Decorative gradient background */}
      <div style={{
        position: 'absolute',
        top: 0,
        right: 0,
        width: '120px',
        height: '120px',
        background: `linear-gradient(135deg, ${color}15 0%, ${color}05 100%)`,
        borderRadius: '0 12px 0 100%',
        opacity: 0.6
      }} />

      <Space direction="vertical" size={12} style={{ width: '100%', position: 'relative', zIndex: 1 }}>
        {/* Icon and Title Row */}
        <Space align="center" style={{ width: '100%', justifyContent: 'space-between' }}>
          <Space align="center" size={12}>
            <div style={{ 
              fontSize: '20px', 
              background: `linear-gradient(135deg, ${color}20 0%, ${color}10 100%)`,
              color: color, 
              padding: '10px',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '44px',
              height: '44px',
              boxShadow: `0 2px 8px ${color}20`
            }}>
              <IconComponent />
            </div>
            <Text 
              type="secondary" 
              style={{ 
                fontSize: '14px', 
                fontWeight: 500,
                color: '#64748b',
                letterSpacing: '0.3px'
              }}
            >
              {title}
            </Text>
          </Space>

          {/* Trend Indicator */}
          {trend && trendValue && (
            <Space size={4} style={{
              padding: '4px 8px',
              borderRadius: '6px',
              background: trend === 'up' ? '#f0fdf4' : '#fef2f2'
            }}>
              {trend === 'up' ? (
                <ArrowUpOutlined style={{ fontSize: '12px', color: '#10b981' }} />
              ) : (
                <ArrowDownOutlined style={{ fontSize: '12px', color: '#ef4444' }} />
              )}
              <Text style={{ 
                fontSize: '12px', 
                fontWeight: 600,
                color: trend === 'up' ? '#10b981' : '#ef4444'
              }}>
                {trendValue}
              </Text>
            </Space>
          )}
        </Space>

        {/* Value */}
        <Statistic 
          value={value} 
          prefix={prefix}
          suffix={suffix}
          valueStyle={{ 
            fontSize: '32px', 
            fontWeight: 700,
            color: '#0f172a',
            lineHeight: 1.2,
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
          }} 
        />
      </Space>
    </Card>
  );
}

export default StatCard;