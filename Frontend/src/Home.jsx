import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

// Grayscale color palette
const COLORS = {
  black: "#000000",
  dimGray: "#66666E",
  taupeGray: "#9999A1",
  platinum: "#E6E6E9",
  antiFlashWhite: "#F4F4F6",
  accent: "#1AB7EA", // Blue accent from your SVG
};

// Constants array for tech stack cards
const TECH_STACK = [
  { name: "HTML5", icon: "/assets/HTML5.svg" },
  { name: "CSS3", icon: "/assets/CSS3.svg" },
  { name: "JavaScript", icon: "/assets/JavaScript.svg" },
  { name: "TailwindCSS", icon: "/assets/Tailwind CSS.svg" },
  { name: "Vite.js", icon: "/assets/Vite.js.svg" },
  { name: "React", icon: "/assets/React.svg" },
  { name: "Node.js", icon: "/assets/Node.js.svg" },
  { name: "MongoDB", icon: "/assets/MongoDB.svg" },
  { name: "Express", icon: "/assets/Express.svg" },
  { name: "Socket.io", icon: "/assets/Socket.io.svg" },
  { name: "Framer Motion", icon: "/assets/framer-motion.svg" },
  { name: "shadcn/ui", icon: "/assets/shadcn.svg" },
];

const Home = () => {
  const navigate = useNavigate();
  const cardsContainerRef = useRef(null);
  const cardsRef = useRef([]);
  const [showText, setShowText] = useState(false);

  // Trigger the text reveal after SVG animation
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowText(true);
    }, 4000); // 4 seconds for the full SVG animation cycle

    return () => clearTimeout(timer);
  }, []);

  // Handle mouse move to update gradient
  const handleMouseMove = (event) => {
    const container = cardsContainerRef.current;
    if (!container) return;

    cardsRef.current.forEach((card) => {
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
    position: "relative",
    transition: "all 0.15s",
    borderRadius: "8px",
    background: "none",
  };

  const cardContentStyle = {
    backgroundColor: "#13161c",
    borderRadius: "inherit",
    transition: "all 0.25s",
    height: "calc(100% - 2px)",
    width: "calc(100% - 2px)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "between",
  };

  // Add card hover effect with framer-motion
  const cardHoverVariants = {
    initial: { scale: 1 },
    hover: { scale: 0.98 },
  };

  // SVG animation variants
  const pathVariants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: {
      pathLength: 1,
      opacity: 1,
      transition: {
        duration: 2.5,
        ease: "easeInOut",
      },
    },
    exit: {
      pathLength: 0,
      opacity: 0,
      transition: {
        duration: 1.5,
        ease: "easeInOut",
      },
    },
  };

  const svgVariants = {
    hidden: { scale: 0 },
    visible: {
      scale: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
    exit: {
      scale: 0,
      transition: {
        duration: 0.4,
        ease: "easeIn",
        delay: 0.3, // Start scaling down after path starts disappearing
      },
    },
  };

  const textVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.2,
        ease: "easeOut",
        staggerChildren: 0.2,
      },
    },
  };

  // Modified line variants for first heading
  const firstLineVariants = {
    hidden: { opacity: 0, x: -100 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.3,
        ease: "easeOut",
      },
    },
  };

  // Modified line variants for second heading
  const secondLineVariants = {
    hidden: { opacity: 0, x: 100 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.4,
        ease: "easeOut",
      },
    },
  };

  return (
    <div className="font-sans">
      <section className="min-h-screen flex flex-col items-center p-4 pb-16 bg-gray-950">
        {/* Logo and Title positioned higher */}
        <div className="flex items-center justify-center  h-32">
          <AnimatePresence mode="wait">
            {!showText ? (
              <motion.svg
                key="logo"
                version="1.1"
                xmlns="http://www.w3.org/2000/svg"
                width="100px"
                height="100px"
                viewBox="0 0 512 512"
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={svgVariants}
              >
                <motion.path
                  fill="none"
                  stroke="#1AB7EA"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M406.832,355.254C335.223,437.988,276.129,480,231.242,480
                  c-46.305,0-90.398-74.402-115.102-194.09c-13.039-63.145-23.656-86.176-28.719-94.215c-0.539,0.305-0.969,0.539-1.438,0.773
                  l-0.031-0.07c-2.211,1.125-4.664,1.828-7.32,1.828c-8.898,0-16.133-7.211-16.133-16.125c0-5.508,2.781-10.352,7-13.258v-0.023
                  c0.039-0.016,0.055-0.031,0.086-0.055c0.039-0.016,0.078-0.047,0.094-0.07c6.422-4.641,13.422-8.266,21.172-8.266
                  c22.633,0,39.875,36.719,57.633,122.746c23.859,115.594,62.758,167.578,82.758,167.578c19.641,0,65.34-14.703,150.668-113.266
                  c22.766-26.297,97.839-117.243,97.839-192.876c0-36.922-9.542-76.394-63.745-76.394l-3.171-0.052
                  c-67.938,0-96.423,44.615-108.063,74.482c0,0.094,0.078,0.07,0,0.234c-0.328,0.875-0.516,1.844-0.516,2.852
                  c0,4.414,3.594,7.984,8,7.984c0.406,0,0.812-0.125,1.203-0.18c3.75-0.844,6.875-1.398,8.609-1.398c0.359,0,0.828-0.039,1.406-0.055
                  c1.281-0.07,2.953-0.141,4.859-0.141c22.266,0,35.031,12.156,35.031,33.383c0,32.828-46.859,112.77-69.141,130.863
                  c-4,3.266-8.297,4.906-12.766,4.906c-19.875,0-36.723-33.969-50.059-100.965c-1.828-9.133-3.367-20.688-5.016-32.922
                  c-6.695-49.797-17.297-119.242-50.375-119.242c-32.039,0-82.867,42.445-116.391,75.617l-0.109-0.109
                  c-2.945,2.938-7.016,4.75-11.5,4.75c-8.969,0-16.25-7.281-16.25-16.25c0-4.484,1.828-8.539,4.766-11.484
                  C68.906,83.359,125.758,32,173.422,32c65.961,0,77.836,88.336,85.695,146.781c1.559,11.695,3.059,22.727,4.668,30.836
                  c6.453,32.469,13.75,54.34,19.266,66.34c19.5-25.082,47.266-78.824,47.266-94.629c0-0.055,0-0.094,0-0.141
                  c-0.531-0.039-1.219-0.078-1.984-0.078c-1.266,0-2.359,0.078-3.219,0.109c-0.594,0.039-1.141,0.055-1.625,0.07
                  c-0.938,0.164-2.391,0.508-4.125,0.914c-0.188,0.039-0.297,0.055-0.484,0.094c-2.766,0.609-5.656,0.93-8.609,0.93
                  c-22.109,0-40.016-17.898-40.016-40c0-4.219,0.719-8.258,1.938-12.094C288.395,86.461,329.707,32,412.91,32
                  C458.113,32,512,50.711,512,139.852C512,168.086,501.754,245.602,406.832,355.254L406.832,355.254z M16.008,191.984
                  c-8.828,0-16.008-7.18-16.008-16c0-8.844,7.18-16.008,16.008-16.008c8.844,0,16,7.164,16,16.008
                  C32.008,184.805,24.852,191.984,16.008,191.984L16.008,191.984z"
                  variants={pathVariants}
                />
              </motion.svg>
            ) : (
              <motion.div
                key="text"
                className="text-center"
                variants={textVariants}
                initial="hidden"
                animate="visible"
              >
                <motion.div
                  className="text-5xl pb-2 font-bold text-blue-400"
                  variants={firstLineVariants}
                >
                  Real Time Messaging
                </motion.div>
                <motion.div
                  className="text-3xl text-gray-300"
                  variants={secondLineVariants}
                >
                  & Communication
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Tech Stack */}
        <div className="w-full max-w-6xl mt-10">
          <h2
            className="text-2xl font-semibold text-center mb-6"
            style={{ color: COLORS.platinum }}
          >
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
                ref={(el) => (cardsRef.current[index] = el)}
                style={cardStyle}
                variants={cardHoverVariants}
                initial="initial"
                whileHover="hover"
                className="h-40"
              >
                <div style={cardContentStyle}>
                  <div className="flex-grow flex items-center justify-center">
                    <img
                      src={tech.icon}
                      alt={tech.name}
                      className="h-20 object-contain"
                    />
                  </div>
                  <div
                    className="mt-3 text-sm font-medium mb-3"
                    style={{ color: COLORS.antiFlashWhite }}
                  >
                    {tech.name}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="flex justify-center relative top-7">
            <motion.button
              className="relative text-2xl text-gray-100 bg-black px-12 py-4 rounded-lg border-none shadow-[0px_1px_2px_0px_rgba(255,255,255,0.1)_inset,0px_-1px_2px_0px_rgba(255,255,255,0.1)_inset] hover:text-cyan-500"
              style={{ translateZ: 100 }}
              whileHover={{
                rotateX: 20,
                rotateY: 30,
                boxShadow: "0px 30px 40px cyan",
              }}
              onClick={() => navigate("/register")}
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
