import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import './ConfirmModal.css';

const ConfirmModal = ({ isOpen, title, message, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div className="confirm-overlay" onClick={onCancel}>
      <div className="confirm-box fade-in" onClick={(e) => e.stopPropagation()}>
        <button className="confirm-close" onClick={onCancel}>
          <X size={18} />
        </button>
        <div className="confirm-icon-wrap">
          <AlertTriangle size={32} />
        </div>
        <h3 className="confirm-title">{title || 'Confirm Action'}</h3>
        <p className="confirm-message">{message || 'Are you sure you want to proceed?'}</p>
        <div className="confirm-actions">
          <button className="confirm-btn cancel" onClick={onCancel}>Cancel</button>
          <button className="confirm-btn proceed" onClick={onConfirm}>Yes, Proceed</button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
