import React from 'react';
import ReactDOM from 'react-dom/client';
import GamePantheon from './GamePantheon';
import './index.css';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <GamePantheon />
  </React.StrictMode>
); 