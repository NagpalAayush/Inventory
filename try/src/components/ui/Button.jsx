import React from "react";
import { motion } from "framer-motion";

const Button = ({ variant = "primary", className = "", ...props }) => {
  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      className={`px-6 py-3 font-medium rounded-lg transition-all shadow-lg relative overflow-hidden 
        ${variant === "primary" ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-indigo-600 hover:to-blue-500" : 
        "bg-gradient-to-r from-gray-300 to-gray-500 text-gray-900 hover:from-gray-500 hover:to-gray-300"} 
        before:absolute before:top-0 before:left-0 before:w-full before:h-full before:bg-white/10 before:opacity-0 hover:before:opacity-20 
        active:shadow-inner ${className}`}
      {...props}
    />
  );
};

export default Button;
