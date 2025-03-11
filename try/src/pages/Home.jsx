import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import Button from "../components/ui/Button";
import { Box, BarChart, Settings } from "lucide-react";
import { motion } from "framer-motion";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { app } from "../firebase";
import Header from "../components/ui/Header";

const API_BASE_URL = "http://localhost:5000/api";

// Features array
const features = [
  {
    icon: Box,
    title: "AI-Powered Tracking",
    description: "Monitor stock levels with automated, AI-driven insights."
  },
  {
    icon: BarChart,
    title: "Smart Analytics",
    description: "Leverage data analytics for optimized inventory forecasting."
  },
  {
    icon: Settings,
    title: "Custom Automation",
    description: "Personalize workflows to fit your business seamlessly."
  }
];

export default function HomePage() {
  const navigate = useNavigate();
  const auth = getAuth(app);
  const provider = new GoogleAuthProvider();
  const [user, setUser] = useState(null);

  //  Fetch User Data
  const fetchUser = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/auth/user`, {
        withCredentials: true, // Ensures cookies are sent
      });
      setUser(response.data.user);
    } catch (err) {
      if (err.response && err.response.status === 401) {
        console.log("User not authenticated");
        setUser(null); // Ensure user state is cleared
      
      } else {
        console.error("Error fetching user:", err);
      }
    }
  };
  
  useEffect(() => {
    fetchUser();
  }, []);

  //  Handle Google Sign-In
  const handleSignup = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Send user data to backend
      const response = await axios.post(`${API_BASE_URL}/auth/google`, {
        uid: user.uid,
        name: user.displayName,
        email: user.email,
        photo: user.photoURL
      }, { withCredentials: true });

      if (response.status === 200) {
        fetchUser();
        navigate("/dashboard");
      } else {
        alert("Authentication failed! Please try again.");
      }
    } catch (error) {
      console.error("Sign-in error:", error);
      alert("Authentication failed!");
    }
  };

  return (
<>
    <Header />

    <div className="min-h-screen bg-gray-900 text-gray-100">
      {/* Hero Section */}
      <section className="text-center py-24 px-6 bg-gray-800 shadow-xl border-b border-gray-700">
        <motion.h1
          className="text-5xl font-extrabold mb-6 text-gray-100"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          Smart Inventory Management
        </motion.h1>
        <motion.p
          className="text-lg text-gray-400 mb-8"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          Experience seamless stock tracking with real-time insights.
        </motion.p>
        {user ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <Button
              onClick={() => navigate("/dashboard")}
              className="bg-green-600 text-white px-8 py-3 rounded-lg shadow-lg hover:bg-green-500 transition-transform transform hover:scale-105"
            >
              Go to Dashboard
            </Button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <Button
              onClick={handleSignup}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg shadow-lg hover:bg-blue-500 transition-transform transform hover:scale-105"
            >
              Get Started with Google
            </Button>
          </motion.div>
        )}
      </section>

      {/* Features Section */}
      <section className="py-16 px-10 grid md:grid-cols-3 gap-8">
        {features.map((feature, index) => (
          <motion.div
            key={index}
            className="p-8 bg-gray-800 rounded-lg shadow-md text-center border border-gray-700 hover:shadow-lg transform hover:scale-105 transition"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.2, duration: 0.6 }}
          >
            <feature.icon className="w-14 h-14 text-blue-400 mx-auto mb-5 animate-fade" />
            <h3 className="text-2xl font-semibold text-white mb-3">{feature.title}</h3>
            <p className="text-gray-400">{feature.description}</p>
          </motion.div>
        ))}
      </section>

      {/* CTA Section */}
      <motion.section
        className="text-center py-16 bg-blue-700 text-white shadow-lg"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.6 }}
      >
        <h2 className="text-4xl font-bold mb-6">Revolutionize Your Inventory Today</h2>
        <h1 className="text-3xl ">Happy Management</h1>
      </motion.section>

      {/* Footer */}
      <footer className="text-center py-6 text-gray-400 border-t border-gray-700">
        &copy; 2025 Inventory App. All rights reserved.
      </footer>
    </div>
    </>
  );
}
