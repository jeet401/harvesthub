import { motion } from "framer-motion";

const BlurText = ({ text, className, delay = 0 }) => {
  const words = text.split(" ");

  const container = {
    hidden: { opacity: 1 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: delay,
      },
    },
  };

  const child = {
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.1, 0.25, 1],
      },
    },
    hidden: {
      opacity: 0.3,
      y: 20,
      scale: 0.8,
    },
  };

  return (
    <motion.h1
      className={`${className} bg-gradient-to-r from-emerald-800 via-green-700 to-teal-600 bg-clip-text text-transparent`}
      variants={container}
      initial="hidden"
      animate="visible"
    >
      {words.map((word, index) => (
        <motion.span
          variants={child}
          key={index}
          className="inline-block mr-1"
          style={{ 
            willChange: 'transform, opacity',
          }}
        >
          {word}
        </motion.span>
      ))}
    </motion.h1>
  );
};

export default BlurText;