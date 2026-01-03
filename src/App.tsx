import React from 'react';
import MultiBotLayout from './components/MultiBotLayout';
import Layout from './components/Layout';
import MetricsBar from './components/MetricsBar';
import ConfigPanel from './components/ConfigPanel';
import OrderBook from './components/OrderBook';
import ActivityLog from './components/ActivityLog';

const DashboardContent: React.FC = () => {
  return (
    <Layout>
      {/* Top Metrics Bar - Compact horizontal summary */}
      <MetricsBar />

      {/* Main Content Grid - OrderBook as focus */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 340px',
        gap: '16px',
        marginTop: '16px'
      }}>
        {/* Left: Order Book (main focus) */}
        <OrderBook />

        {/* Right: Config + Activity stacked */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          <ConfigPanel />
          <ActivityLog />
        </div>
      </div>
    </Layout>
  );
};

const App: React.FC = () => {
  return (
    <MultiBotLayout>
      <DashboardContent />
    </MultiBotLayout>
  );
};

export default App;
