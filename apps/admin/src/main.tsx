import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { StyleProvider } from '@ant-design/cssinjs';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import App from './App';
import './index.css';

const basename = import.meta.env.BASE_URL.replace(/\/$/, '') || '/admin';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <StyleProvider layer>
      <ConfigProvider
        locale={zhCN}
        theme={{
          token: { colorPrimary: '#0a0a0a', borderRadius: 8, colorBorder: '#d4d4d8' },
          components: {
            Select: {
              optionSelectedBg: '#f4f4f5',
              optionSelectedColor: '#18181b',
              optionActiveBg: '#fafafa',
              hoverBorderColor: '#a1a1aa',
              activeBorderColor: '#0a0a0a',
            },
          },
        }}
      >
        <BrowserRouter basename={basename}>
          <App />
        </BrowserRouter>
      </ConfigProvider>
    </StyleProvider>
  </StrictMode>
);
