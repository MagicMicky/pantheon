import React from 'react';
import ReactDOM from 'react-dom/client';
import GamePantheon from './GamePantheon';
import { PantheonProvider } from './contexts/PantheonContext';
import './index.css';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <PantheonProvider>
      <GamePantheon />
    </PantheonProvider>
  </React.StrictMode>
); 