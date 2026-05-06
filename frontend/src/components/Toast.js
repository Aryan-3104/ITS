import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';

const icons = {
  success: <CheckCircle className="text-[--accent-green] flex-shrink-0" size={20} />,
  error: <XCircle className="text-[--accent-red] flex-shrink-0" size={20} />,
  info: <Info className="text-[--accent-blue] flex-shrink-0" size={20} />,
};

const toastStyles = {
  success: 'bg-[--accent-green]/10 border-[--accent-green]/50',
  error: 'bg-[--accent-red]/10 border-[--accent-red]/50',
  info: 'bg-[--accent-blue]/10 border-[--accent-blue]/50',
};

const Toast = ({ message, type = 'info', onClose }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (message) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        if(onClose) onClose();
      }, 3500);
      return () => clearTimeout(timer);
    } else {
      setVisible(false);
    }
  }, [message, onClose]);

  if (!visible || !message) return null;

  return (
    <div
      className={`fixed top-24 right-8 z-50 flex items-center gap-3 p-4 rounded-lg border shadow-lg
        ${toastStyles[type]}
        transition-all duration-300 transform
        ${visible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none'}`}
    >
      {icons[type]}
      <p className="text-sm font-medium text-[--text-primary] flex-1">{message}</p>
      <button 
        onClick={() => { 
          setVisible(false); 
          if(onClose) onClose(); 
        }} 
        className="text-[--text-muted] hover:text-[--text-primary] flex-shrink-0"
      >
        <X size={18} />
      </button>
    </div>
  );
};

export default Toast;
