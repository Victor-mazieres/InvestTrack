import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();

  const pages = ['/pea', '/immobilier'];
  const currentIndex = pages.indexOf(location.pathname);

  const handleSwipe = (dir) => {
    if (currentIndex === -1) return;
    let ni = currentIndex + dir;
    ni = Math.max(0, Math.min(pages.length - 1, ni));
    navigate(pages[ni]);
  };

  return (
    <nav className="bg-primary backdrop-blur-md p-4 fixed top-0 w-full z-20 flex justify-between items-center shadow-lg rounded-b-2xl">
      {/* Wrapper centré pour les onglets */}
      <div className="w-full max-w-md mx-auto">
        <motion.div
          className="flex justify-around text-white text-lg font-semibold relative px-6"
          drag={currentIndex !== -1 ? 'x' : false}
          dragListener={true}
          dragConstraints={{ left: -50, right: 50 }}
          onDragEnd={(e, info) => {
            if (info.offset.x > 50) handleSwipe(-1);
            if (info.offset.x < -50) handleSwipe(1);
          }}
          style={{ touchAction: 'none' }}
        >
          {/* Onglet PEA */}
          <div className="relative">
            <button
              className={`relative transition-transform duration-300 ${
                location.pathname === '/pea'
                  ? 'scale-110 font-bold text-white'
                  : 'scale-100 text-white/60'
              }`}
              onClick={() => navigate('/pea')}
              style={{ background: 'none', border: 'none', padding: 0 }}
            >
              PEA
            </button>
            {location.pathname === '/pea' && (
              <motion.div
                layoutId="underline"
                className="absolute left-0 right-0 mx-auto bottom-[-4px] h-[4px] bg-greenLight rounded-full"
                animate={{ width: '120%' }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
              />
            )}
          </div>

          {/* Séparateur */}
          <div className="h-6 w-[2px] bg-greenLight/50 mx-4" />

          {/* Onglet IMMOBILIER */}
          <div className="relative">
            <button
              className={`relative transition-transform duration-300 ${
                location.pathname === '/immobilier'
                  ? 'scale-110 font-bold text-white'
                  : 'scale-100 text-white/60'
              }`}
              onClick={() => navigate('/immobilier')}
              style={{ background: 'none', border: 'none', padding: 0 }}
            >
              IMMOBILIER
            </button>
            {location.pathname === '/immobilier' && (
              <motion.div
                layoutId="underline"
                className="absolute left-0 right-0 mx-auto bottom-[-4px] h-[4px] bg-greenLight rounded-full"
                animate={{ width: '120%' }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
              />
            )}
          </div>
        </motion.div>
      </div>
    </nav>
  );
}
