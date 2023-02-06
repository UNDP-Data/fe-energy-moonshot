import { Tabs } from 'antd';

export const TabsEl = () => (
  <div className='margin-bottom07'>
    <Tabs
      defaultActiveKey='1'
      className='undp-tabs'
      items={[
        {
          label: 'World Map',
          key: '1',
          children: <p>Content for Tab 1</p>,
        },
        {
          label: 'Country Profiles',
          key: '2',
          children: <p>Content for Tab 2</p>,
        },
      ]}
    />
  </div>
);