/**
 * Example usage of the Toast notification system
 * 
 * This file demonstrates how to use the toast system in your components.
 * You can delete this file after reviewing the examples.
 */

import React from 'react';
import { useToast } from '../hooks/useToast';

const ToastExamples: React.FC = () => {
  const { success, error, warning, info, showToast } = useToast();

  const handleSuccess = () => {
    success('Operation completed successfully!');
  };

  const handleError = () => {
    error('Something went wrong. Please try again.');
  };

  const handleWarning = () => {
    warning('This action cannot be undone.');
  };

  const handleInfo = () => {
    info('New features are available. Check them out!');
  };

  const handleCustomToast = () => {
    showToast({
      type: 'success',
      title: 'Custom Toast',
      message: 'This is a custom toast with an action button',
      duration: 10000, // 10 seconds
      action: {
        label: 'View Details',
        onClick: () => {
          console.log('Action clicked!');
        },
      },
    });
  };

  const handleLongMessage = () => {
    success(
      'This is a very long message that will wrap properly in the toast notification. The toast system handles long messages gracefully.',
      'Long Message Example'
    );
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Toast Notification Examples</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '300px' }}>
        <button onClick={handleSuccess}>Show Success Toast</button>
        <button onClick={handleError}>Show Error Toast</button>
        <button onClick={handleWarning}>Show Warning Toast</button>
        <button onClick={handleInfo}>Show Info Toast</button>
        <button onClick={handleCustomToast}>Show Custom Toast with Action</button>
        <button onClick={handleLongMessage}>Show Long Message</button>
      </div>
    </div>
  );
};

export default ToastExamples;
