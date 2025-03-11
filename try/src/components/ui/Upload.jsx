import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import { UploadCloud, Loader2 } from "lucide-react";

const Upload = () => {
    const [imageUrl, setImageUrl] = useState(""); // Store uploaded image URL
    const [loading, setLoading] = useState(false); // Loader state
    const fileInputRef = useRef(null); // Ref for file input

    const handleFileUpload = async (e) => {
        const image = e.target.files[0];
        if (!image) return;

        setLoading(true); // Show loader
        const formData = new FormData();
        formData.append("file", image);
        formData.append("upload_preset", "inventory");

        try {
            const res = await fetch(
                `https://api.cloudinary.com/v1_1/dxiudkpjv/image/upload`,
                { method: "POST", body: formData }
            );
            const data = await res.json();
            setImageUrl(data.secure_url);
            console.log("Uploaded Image URL:", data.secure_url);

            // Clear file input
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        } catch (err) {
            console.error("Upload error:", err);
        } finally {
            setLoading(false); // Hide loader
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="bg-white shadow-md rounded-lg p-6 w-full max-w-md text-center"
            >
                <h2 className="text-xl font-semibold mb-4 text-gray-700 flex items-center justify-center gap-2">
                    <UploadCloud className="w-6 h-6 text-blue-500" />
                    Upload Image
                </h2>

                {/* File Input */}
                <label className="cursor-pointer bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition flex items-center gap-2">
                    Choose File
                    <input
                        type="file"
                        onChange={handleFileUpload}
                        className="hidden"
                        ref={fileInputRef}
                    />
                </label>

                {/* Loader */}
                {loading && (
                    <div className="mt-4 flex justify-center">
                        <Loader2 className="animate-spin w-6 h-6 text-blue-500" />
                    </div>
                )}

                {/* Uploaded Image */}
                {imageUrl && !loading && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="mt-4"
                    >
                        <p className="text-gray-600">Uploaded Image:</p>
                        <img
                            src={imageUrl}
                            alt="Uploaded"
                            className="mt-2 rounded-lg shadow-md w-full h-48 object-cover"
                        />
                    </motion.div>
                )}
            </motion.div>
        </div>
    );
};

export default Upload;
