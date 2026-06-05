import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { MissionProvider } from './context/MissionProvider';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MissionProvider>
      <App />
    </MissionProvider>
  </StrictMode>,
);
