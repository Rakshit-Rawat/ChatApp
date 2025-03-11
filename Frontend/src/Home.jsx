import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

// Grayscale color palette
const COLORS = {
  black: "#000000",
  dimGray: "#66666E",
  taupeGray: "#9999A1",
  platinum: "#E6E6E9",
  antiFlashWhite: "#F4F4F6"
};

// Constants array for tech stack cards
const TECH_STACK = [
  { name: "HTML5", icon: "../src/assets/HTML5.svg" },
  { name: "CSS3", icon: "../src/assets/CSS3.svg" },
  { name: "JavaScript", icon: "../src/assets/JavaScript.svg" },
  { name: "TailwindCSS", icon: "../src/assets/Tailwind CSS.svg" },
  { name: "Vite.js", icon: "../src/assets/Vite.js.svg" },
  { name: "React", icon: "../src/assets/React.svg" },
  { name: "Node.js", icon: "../src/assets/Node.js.svg" },
  { name: "MongoDB", icon: "../src/assets/MongoDB.svg" },
  { name: "Express", icon: "../src/assets/Express.svg" },
  { name: "Socket.io", icon: "../src/assets/Socket.io.svg" },
  { name: "Framer Motion", icon: "../src/assets/framer-motion.svg" },
  { name: "shadcn/ui", icon: "../src/assets/shadcn.svg" },
];

const Home = () => {
  const navigate = useNavigate();
  const cardsContainerRef = useRef(null);
  const cardsRef = useRef([]);

  // Handle mouse move to update gradient
  const handleMouseMove = (event) => {
    const container = cardsContainerRef.current;
    if (!container) return;

    const containerRect = container.getBoundingClientRect();
    
    cardsRef.current.forEach(card => {
      if (!card) return;
      
      const cardRect = card.getBoundingClientRect();
      
      // Calculate position relative to the card
      const x = event.clientX - cardRect.left;
      const y = event.clientY - cardRect.top;
      
      // Apply the gradient
      card.style.background = `radial-gradient(960px circle at ${x}px ${y}px, rgba(106,0,255,.9), transparent 15%)`;
    });
  };

  // Add custom card style class for hover effects
  const cardStyle = {
    position: 'relative',
    transition: 'all 0.15s',
    borderRadius: '8px',
    background: 'none'
  };

  const cardContentStyle = {
    backgroundColor: '#13161c',
    borderRadius: 'inherit',
    transition: 'all 0.25s',
    height: 'calc(100% - 2px)',
    width: 'calc(100% - 2px)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'between'
  };

  // Add card hover effect with framer-motion
  const cardHoverVariants = {
    initial: { scale: 1 },
    hover: { scale: 0.98 }
  };

  return (
    <div className="font-sans">
      <section className="min-h-screen flex flex-col items-center p-4 pb-16 bg-gray-950">
        {/* Logo and Title positioned higher */}
        <div className="flex items-center justify-center mt-14 mb-14">
          <img
            src='../src/assets/logo.svg'
            alt="Chat App Logo"
            className="w-16 h-16 mr-4"
          />
        </div>

        {/* Tech Stack */}
        <div className="w-full max-w-6xl">
          <h2 className="text-2xl font-semibold text-center mb-6" style={{ color: COLORS.platinum }}>
            Tech Stack
          </h2>
          
          {/* Cards container with mouse event */}
          <div 
            ref={cardsContainerRef} 
            onMouseMove={handleMouseMove}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-7"
          >
            {TECH_STACK.map((tech, index) => (
              <motion.div
                key={index}
                ref={el => cardsRef.current[index] = el}
                style={cardStyle}
                variants={cardHoverVariants}
                initial="initial"
                whileHover="hover"
                className="h-40"
              >
                <div style={cardContentStyle}>
                  <div className="flex-grow flex items-center justify-center">
                    <img src={tech.icon} alt={tech.name} className="h-20 object-contain" />
                  </div>
                  <div className="mt-3 text-sm font-medium mb-3" style={{ color: COLORS.antiFlashWhite }}>
                    {tech.name}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          
          <div className='flex justify-center relative top-7'>
            <motion.button
              className="relative text-2xl text-gray-100 bg-black px-12 py-4 rounded-lg border-none shadow-[0px_1px_2px_0px_rgba(255,255,255,0.1)_inset,0px_-1px_2px_0px_rgba(255,255,255,0.1)_inset] hover:text-cyan-500"
              style={{ translateZ: 100 }}
              whileHover={{
                rotateX: 20,
                rotateY: 30,
                boxShadow: "0px 30px 40px cyan",
              }}
              onClick={() => navigate('/register')}
            >
              Try Out
              <span className="absolute left-0 right-0 bottom-px h-0.5 mx-auto bg-gradient-to-r from-transparent via-cyan-500 to-transparent"></span>
              <motion.span
                className="absolute left-0 right-0 bottom-px h-1 mx-auto w-3/4 bg-gradient-to-r from-transparent via-cyan-500 to-transparent blur opacity-0"
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              ></motion.span>
            </motion.button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;