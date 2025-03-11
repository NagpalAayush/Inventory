import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { PlusCircle, Trash2, UploadCloud, Loader2, LogOut } from "lucide-react";
import axios from "axios";

export default function Dashboard() {
  const navigate = useNavigate();
  const [inventory, setInventory] = useState([]);
  const [user, setUser] = useState({});
  const [newItem, setNewItem] = useState({
    itemName: "",
    quantity: "",
    price: "",
    category: "",
    imageUrl: "",
    userId: user._id
  });

  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  

  // Fetch user data and securing the route
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/auth/user", {
          method: "GET",
          credentials: "include",
        });

        if(response.status == 401){
          navigate("/")
        }else if (!response.ok) {
          throw new Error("Failed to fetch user");
        }

        const data = await response.json();
        setUser(data);
      } catch (error) {
        console.error("Error fetching user:", error);
        setUser(null);
      }
    };

    fetchUser();
  }, []);

  // Fetch inventory created by this user
  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/inventory/${user._id}`, {
          method: "GET",
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("Failed to fetch inventory");
        }

        const data = await response.json();

        // Filter items created by this user
        const userInventory = data.filter((item) => item.userId === user._id);
        setInventory(userInventory);
      } catch (error) {
        console.error("Error fetching inventory:", error);
      }
    };

    if (user._id) {
      fetchInventory();
    }
  }, [user._id]); // Runs when the user data is fetched

  const handleAddItem = async () => {
    if (!newItem.itemName || !newItem.quantity || !newItem.price || !newItem.imageUrl) {
      alert("Please fill all fields and upload an image.");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/inventory", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ ...newItem, userId: user._id }), // Attach user ID
      });

      if (!response.ok) {
        throw new Error("Failed to add item");
      }

      const data = await response.json();
      setInventory((prev) => [...prev, data.newItem]);
      setNewItem({ itemName: "", quantity: "", price: "", category: "", description: "", imageUrl: "" });
    } catch (err) {
      console.error("Error adding item:", err);
    }
  };

  const handleDeleteItem = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/api/inventory/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to delete item");
      }

      setInventory((prev) => prev.filter((item) => item._id !== id));
    } catch (err) {
      console.error("Error deleting item:", err);
    }
  };

  //handle sold
  const handleItemSold = async (id, soldQty) => {
    try {
      soldQty = parseInt(soldQty, 10);
      if (isNaN(soldQty) || soldQty <= 0) return;

      // Find the item
      const item = inventory.find((item) => item._id === id);
      if (!item || soldQty > item.quantity) return;

      // Update the quantity in the backend
      const response = await fetch(`http://localhost:5000/api/inventory/${id}/sell`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ quantity: item.quantity - soldQty }),
      });

      if (!response.ok) {
        throw new Error("Failed to update item quantity");
      }

      // Update the state in real time
      setInventory((prev) =>
        prev
          .map((invItem) =>
            invItem._id === id
              ? { ...invItem, quantity: invItem.quantity - soldQty, soldQty: "" }
              : invItem
          )
          .filter((invItem) => invItem.quantity > 0) // Remove if quantity is 0
      );
    } catch (err) {
      console.error("Error updating item quantity:", err);
    }
  };



  //file upload
  const handleFileUpload = async (e) => {
    const image = e.target.files[0];
    if (!image) return;

    setLoading(true);
    const formData = new FormData();
    formData.append("file", image);
    formData.append("upload_preset", "inventory");

    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/dxiudkpjv/image/upload`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      setNewItem((prev) => ({ ...prev, imageUrl: data.secure_url }));

      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      console.error("Upload error:", err);
    } finally {
      setLoading(false);
      alert("Image Uploaded Successfully")
    }
  };
 async function handleLogout(){
    fetch('http://localhost:5000/logout', {
      method: 'POST',
      credentials: 'include', // Important to send cookies with the request
    })
      .then((res) => res.json())
      .then((data) => console.log(data))
      .catch((err) => console.error(err));
    
      navigate("/");
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-6">
      {/* Header */}
      <header className="flex justify-between items-center bg-gray-800 p-4 rounded-lg shadow-md mb-6">
        <div className="flex items-center gap-4">
          <img
            src={user?.photo}
            alt="Profile"
            className="w-10 h-10 rounded-full"
          />
          <span className="text-lg font-semibold">{user?.name || "User"}</span>
        </div>
        <button
          onClick={handleLogout}
          className="bg-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-red-500 transition"
        >
          <LogOut size={18} /> Logout
        </button>
      </header>

      {/* Add Inventory Item */}
      <motion.div
        className="bg-gray-800 p-6 rounded-lg shadow-md mb-6"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
      >
        <h3 className="text-xl font-semibold mb-4">Add New Item</h3>
        <div className="grid grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Item Name"
            value={newItem.itemName}
            onChange={(e) => setNewItem((prev) => ({ ...prev, itemName: e.target.value }))}
            className="p-2 rounded bg-gray-700 text-white"
          />
          <input
            type="number"
            placeholder="Quantity"
            value={newItem.quantity}
            onChange={(e) => setNewItem((prev) => ({ ...prev, quantity: e.target.value }))}
            className="p-2 rounded bg-gray-700 text-white"
          />
          <input
            type="number"
            placeholder="Price"
            value={newItem.price}
            onChange={(e) => setNewItem((prev) => ({ ...prev, price: e.target.value }))}
            className="p-2 rounded bg-gray-700 text-white"
          />
          <input
            type="text"
            placeholder="Category"
            value={newItem.category}
            onChange={(e) => setNewItem((prev) => ({ ...prev, category: e.target.value }))}
            className="p-2 rounded bg-gray-700 text-white"
          />

          <label className="cursor-pointer bg-blue-500 text-white px-4 py-2 rounded-lg justify-center hover:bg-blue-600 transition flex items-center gap-2">
            <UploadCloud size={18} /> Upload Image
            <input type="file" onChange={handleFileUpload} className="hidden" ref={fileInputRef} />
          </label>

          <button
            onClick={handleAddItem}
            className="bg-green-900 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:opacity-70 transition"
          >
            {loading ? <Loader2 className="animate-spin w-full text-center h-6 text-blue-500 " /> : <span className="flex gap-2 items-center w-full justify-center "> <PlusCircle size={18} /> Add Item </span>}
          </button>
        </div>
      </motion.div>
      {/* Inventory List */}
      <div className="bg-gray-800 p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold mb-4">Your Inventory</h3>
        <div className="grid grid-cols-2 gap-4">
          {inventory.length === 0 ? (
            <p>No items found.</p>
          ) : (
            inventory.map((item) => (
              <div
                key={item._id}
                className="bg-gray-700 p-4 rounded-lg shadow-md flex items-center gap-4"
              >
                {/* Item Image */}
                <img
                  src={item.imageUrl || "https://via.placeholder.com/80"}
                  alt={item.itemName}
                  className="w-16 h-16 object-cover rounded-lg"
                />

                {/* Item Details */}
                <div className="flex-1">
                  <h4 className="text-lg font-semibold text-white">Item Name : {item.itemName}</h4>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-green-400 font-semibold">Price :  ₹{(item.price).toLocaleString('en-IN')}/Item</span>
                    


                  </div>
                </div>

                {/* quantity sold */}
                <div className="flex flex-col items-center">

                  <div className="flex items-center gap-2 ">
                    <input
                      type="number"
                      min="1"
                      max={item.quantity}
                      value={item.soldQty || ""}
                      onChange={(e) =>
                        setInventory((prev) =>
                          prev.map((invItem) =>
                            invItem._id === item._id ? { ...invItem, soldQty: e.target.value } : invItem
                          )
                        )
                      }
                      className="w-10rounded-lg border border-gray-400 focus:border-blue-500 focus:outline-none text-gray-800 bg-gray-100 text-center custom-input"
                      placeholder="Qty"
                      style={{padding : "3px" }}
                    />

                    <button
                      onClick={() => handleItemSold(item._id, item.soldQty)}
                      className="bg-yellow-500 text-white px-3 py-1 rounded-lg hover:bg-yellow-600 transition"
                      disabled={!item.soldQty || item.soldQty <= 0 || item.soldQty > item.quantity}
                    >
                      Update
                    </button>

                  </div>
                    <div className="flex gap-4 items-center justify-center mt-3">
                      <span className="text-gray-300 text-md">Qty: {(item.quantity)}</span>
                      <span className="text-gray-300 text-md">
                        Total Price : ₹{(item.quantity * item.price).toLocaleString('en-IN')}
                      </span>
                    </div>

                </div>



                {/* Delete Button */}
                <button
                  onClick={() => handleDeleteItem(item._id)}
                  className="text-red-500 hover:text-red-600 transition p-2 rounded-lg"
                >
                  <Trash2 size={20} />
                </button>
              </div>

            ))
          )}
        </div>
      </div>
    </div>
  );
}
