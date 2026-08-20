import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { WalletProvider } from './contexts/WalletContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider } from './contexts/LanguageContext';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <LanguageProvider>
          <WalletProvider>
            <App />
          </WalletProvider>
        </LanguageProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>,
);
