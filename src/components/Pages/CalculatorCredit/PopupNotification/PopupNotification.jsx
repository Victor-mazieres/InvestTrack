import React, { useEffect } from 'react';

const PopupNotification = ({ message, type = 'success', duration = 30000, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      if (onClose) onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  let bgClass = 'bg-greenLight';
  let progressColor = 'bg-white';
  if (type === 'error') {
    bgClass = 'bg-red-700';
    progressColor = 'bg-red-500';
  } else if (type === 'info') {
    bgClass = 'bg-blue-700';
    progressColor = 'bg-blue-500';
  }

  return (
    <>
      <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 max-w-xl rounded-3xl shadow-2xl text-primary ${bgClass} whitespace-nowrap overflow-hidden`}>
        <div className="p-4 pb-3">{message}</div>
        <div className="w-full h-1.5">
          <div
            className={`h-full ${progressColor}`}
            style={{ animation: `progress ${duration}ms linear forwards` }}
          ></div>
        </div>
      </div>
      <style>{`
        @keyframes progress {
          from { transform: scaleX(1); transform-origin: left center; }
          to { transform: scaleX(0); transform-origin: left center; }
        }
      `}</style>
    </>
  );
};

export default PopupNotification;