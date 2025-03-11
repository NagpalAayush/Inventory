import Button from "./Button";
import {  Menu } from "lucide-react";
import { motion } from "framer-motion";

export default function Header() {
  return (
    <div className="mb-20 bg-gray-900 text-gray-100">
      {/* Header */}
      <motion.header 
        className="flex justify-between items-center px-10 py-4 bg-gray-800 shadow-md border-b border-gray-700 fixed top-0 w-full z-50"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-2xl font-bold text-white">Inventory Pro</h1>
        <nav className="hidden md:flex space-x-6">
          <a href="#" className="text-gray-300 hover:text-white transition">Home</a>
          <a href="#" className="text-gray-300 hover:text-white transition">Features</a>
          <a href="#" className="text-gray-300 hover:text-white transition">Pricing</a>
          <a href="#" className="text-gray-300 hover:text-white transition">Contact</a>
        </nav>
        <Button className="bg-blue-600 text-white px-6 py-2 rounded-lg shadow-md hover:bg-blue-500 transition hidden md:block">
          Get Started
        </Button>
        <Menu className="md:hidden w-6 h-6 text-white cursor-pointer" />
      </motion.header>
      </div>
      )
      };

      