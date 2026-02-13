
import React from 'react';
import ReactDOM from 'react-dom/client';
// Use namespace import to resolve missing named exports in some environments
import * as ReactRouterDOM from 'react-router-dom';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

// Fallback to BrowserRouter if HashRouter is specifically missing, or use the namespace access
const Router = ReactRouterDOM.HashRouter || ReactRouterDOM.BrowserRouter;

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <Router>
      <App />
    </Router>
  </React.StrictMode>
);
