/* eslint-disable no-unused-vars */
import { useState, useEffect, useMemo } from "react";
import { FaSearch, FaShoppingCart, FaTrash, FaTag } from "react-icons/fa";
import axiosInstance from "../../context/axiosInstance";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Swal from "sweetalert2";

const POS = () => {
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [amountPaid, setAmountPaid] = useState(0);
  const [discountType, setDiscountType] = useState(null);
  const [discountValue, setDiscountValue] = useState(0);
  const [customerName, setCustomerName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUser();
    fetchProducts();
    fetchCategories();
    fetchCart();
  }, []);

  // Helper function to find active discount and calculate discounted price
  const getActiveDiscount = (product) => {
    if (!product.discounts || !Array.isArray(product.discounts)) return null;

    const now = new Date();
    const activeDiscount = product.discounts.find((discount) => {
      const startDate = new Date(discount.start_date);
      const endDate = discount.end_date ? new Date(discount.end_date) : null;
      return startDate <= now && (!endDate || endDate >= now);
    });

    if (!activeDiscount) return null;

    const price = Number(product.price);
    const discountValue = Number(activeDiscount.value);
    let discountedPrice;

    if (activeDiscount.type === "fixed") {
      discountedPrice = price - discountValue;
    } else if (activeDiscount.type === "percentage") {
      discountedPrice = price * (1 - discountValue / 100);
    }

    return {
      ...activeDiscount,
      discountedPrice: discountedPrice >= 0 ? discountedPrice : 0,
    };
  };

  const totalPrice = useMemo(() => {
    return cart.reduce((total, item) => {
      const activeDiscount = getActiveDiscount(item.product);
      const price = activeDiscount ? activeDiscount.discountedPrice : Number(item.price);
      return total + price * item.quantity;
    }, 0);
  }, [cart]);

  const discountAmount = useMemo(() => {
    if (discountType === "percentage") {
      return totalPrice * (discountValue / 100);
    } else if (discountType === "fixed") {
      return Math.min(discountValue, totalPrice);
    }
    return 0;
  }, [discountType, discountValue, totalPrice]);

  const finalPrice = useMemo(() => totalPrice - discountAmount, [totalPrice, discountAmount]);

  const change = useMemo(() => {
    const result = amountPaid - finalPrice;
    return isNaN(result) || result < 0 ? 0 : result;
  }, [amountPaid, finalPrice]);

  const canCheckout = useMemo(() => {
    return amountPaid >= finalPrice && finalPrice > 0;
  }, [amountPaid, finalPrice]);

  const fetchUser = () => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser && storedUser.id) {
      setUser(storedUser);
    } else {
      console.error("No user found. Please log in.");
    }
  };

  const fetchProducts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data } = await axiosInstance.get("/products");
      setProducts(data.filter((product) => product.deleted_at === null));
    } catch (err) {
      setError("Failed to fetch products");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data } = await axiosInstance.get("/products/categories");
      setCategories(data);
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  const fetchCart = async () => {
    try {
      const { data } = await axiosInstance.get("/cart");
      setCart(data);
    } catch (err) {
      console.error("Error fetching cart:", err);
    }
  };

  const filteredProducts = useMemo(() => {
    return products.filter(
      (p) =>
        (selectedCategory === "All" ||
          p.category_id === Number(selectedCategory)) &&
        p.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [products, selectedCategory, search]);

  const addToCart = async (productId, quantity) => {
    if (!user || typeof user.id !== "number") return;
    if (!productId || !quantity || quantity <= 0) return;

    const payload = {
      userId: user.id,
      products: [{ productId, quantity }],
    };

    try {
      await axiosInstance.post("/cart/add", payload);
      fetchCart();
    } catch (error) {
      console.error("Error adding to cart:", error.message);
    }
  };

  const removeFromCart = async (id) => {
    try {
      await axiosInstance.delete(`/cart/remove/${id}`);
      fetchCart();
      fetchProducts();
    } catch (err) {
      console.error("Error removing from cart:", err);
    }
  };

  const checkout = async () => {
    if (!canCheckout) return;

    const nameToSave = customerName.trim() || "None";

    if (!paymentMethod) {
      toast.error("Please select a payment method.");
      return;
    }

    const result = await Swal.fire({
      title: "Confirm Checkout",
      text: "Are you sure you want to place the order?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, place order",
    });

    if (!result.isConfirmed) return;

    setLoading(true);

    try {
      const payload = {
        order_type: "dine-in",
        customer_name: nameToSave,
        discount_type: discountType || "none",
        discount_value: Number(discountValue) || 0,
        payment_method: paymentMethod,
        amount_paid: Number(amountPaid) || 0,
      };

      const response = await axiosInstance.post("/cart/checkout", payload);

      if (response.status === 201 || response.status === 200) {
        toast.success("Order placed successfully!");
        fetchCart();
        fetchProducts();
        setAmountPaid(0);
        setDiscountType("none");
        setDiscountValue(0);
      } else {
        toast.error(`Checkout failed: ${response.data.message}`);
      }
    } catch (error) {
      console.error("Error during checkout:", error);
      toast.error(
        `Checkout failed: ${error.response?.data?.message || error.message}`
      );
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (image) => {
    if (!image) return "https://placehold.co/150";
    return image.startsWith("http") ? image : `http://localhost:5050${image}`;
  };

  return (
    <div className="grid grid-cols-3 bg-gray-800 gap-2 flex flex-col h-screen p-2 bg-gray-950 text-white">
      {/* Product List */}
      <div className="col-span-2 flex flex-col min-h-full bg-gray-900 p-5 rounded-lg shadow-lg h-auto">
        <h2 className="text-2xl font-bold mb-4">Order Menu</h2>

        <div className="flex gap-4 mb-4">
          <div className="relative w-full">
            <FaSearch className="absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              className="w-full bg-gray-800 rounded-lg pl-10 p-2 outline-none"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="bg-gray-800 p-2 rounded-lg"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="All">All</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id.toString()}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
        {/* Scrollable container */}
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-3 lg:grid-cols-4 gap-3">
            {filteredProducts.map((product) => {
              const activeDiscount = getActiveDiscount(product);
              const displayPrice = activeDiscount
                ? activeDiscount.discountedPrice
                : Number(product.price);

              return (
                <div
                  key={product.id}
                  className="bg-gray-800 rounded-lg p-4 shadow-md flex flex-col items-center justify-between relative"
                >
                  {activeDiscount && (
                    <span className="absolute top-2 right-2 bg-purple-500 text-white text-xs px-2 py-1 rounded flex items-center">
                    <FaTag className="mr-1" /> 
                    Discount: {activeDiscount.type === "fixed" ? `₱${activeDiscount.value}` : `${activeDiscount.value}%`}
                  </span>
                  )}
                  <img
                    src={getImageUrl(product.image)}
                    alt={product.name}
                    className="w-32 h-32 object-cover rounded-md mb-3"
                    onError={(e) => {
                      e.target.src = "https://placehold.co/150";
                    }}
                  />
                  <h3 className="font-bold text-center mt-2">{product.name}</h3>
                  <span className="text-gray-400 text-sm mb-1">
                    {categories.find((cat) => cat.id === product.category_id)?.name || "No Category"}
                  </span>
                  <span className="text-xl font-bold text-green-400 mt-1">
                    {activeDiscount ? (
                      <>
                        <span className="line-through text-gray-500 mr-2">
                          ₱{Number(product.price).toFixed(2)}
                        </span>
                        ₱{Number(displayPrice).toFixed(2)}
                      </>
                    ) : (
                      `₱${Number(displayPrice).toFixed(2)}`
                    )}
                  </span>
                  <button
                    className="bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-md px-4 py-2 mt-3 w-full"
                    onClick={() => addToCart(product.id, 1)}
                  >
                    <FaShoppingCart className="inline mr-2" />
                    Add to Cart
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Cart */}
      <div className="col-span-1 bg-gray-900 p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-4">Cart</h2>
        {cart.length === 0 ? (
          <p className="text-gray-400">Your cart is empty.</p>
        ) : (
          <>
            {/* Grouped Cart Items */}
            <div className="max-h-64 overflow-y-auto space-y-2 mb-4">
              {Object.values(
                cart.reduce((acc, item) => {
                  if (acc[item.product?.id]) {
                    acc[item.product?.id].quantity += item.quantity;
                  } else {
                    acc[item.product?.id] = { ...item };
                  }
                  return acc;
                }, {})
              ).map((item) => {
                const activeDiscount = getActiveDiscount(item.product);
                const displayPrice = activeDiscount
                  ? activeDiscount.discountedPrice
                  : Number(item.price);

                return (
                  <div
                    key={item.id}
                    className="flex items-center justify-between bg-gray-700 p-2 rounded"
                  >
                    <div className="flex-1 truncate">
                      {item.product?.name} x{item.quantity}
                      {activeDiscount && (
                        <span className="ml-2 text-purple-400 text-xs">
                          (Discounted)
                        </span>
                      )}
                    </div>
                    <div className="w-24 text-right">
                      ₱{(displayPrice * item.quantity).toFixed(2)}
                    </div>
                    <div className="w-8 flex justify-end">
                      <button onClick={() => removeFromCart(item.id)}>
                        <FaTrash className="text-red-500" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Summary */}
            <div className="mt-4 space-y-2">
              <div className="flex items-center gap-2">
                <select
                  className="bg-gray-700 text-white p-2 rounded w-1/3"
                  value={discountType || "none"}
                  onChange={(e) => setDiscountType(e.target.value === "none" ? null : e.target.value)}
                >
                  <option value="none">No Discount</option>
                  <option value="percentage">% (Percentage)</option>
                  <option value="fixed">₱ (Fixed Amount)</option>
                </select>
                <input
                  type="number"
                  placeholder="Discount Value"
                  className="bg-gray-700 text-white p-2 rounded w-2/3"
                  value={discountValue}
                  onChange={(e) => setDiscountValue(e.target.value)}
                />
              </div>

              <div className="flex justify-between text-gray-400">
                <span>Total:</span>
                <span>₱{totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Discount:</span>
                <span>-₱{discountAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold">
                <span>Final Price:</span>
                <span>₱{finalPrice.toFixed(2)}</span>
              </div>
            </div>

            {/* Customer Name */}
            <div className="mt-4">
              <input
                type="text"
                placeholder="Customer Name (Optional)"
                className="bg-gray-700 text-white w-full p-2 rounded"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
              />
            </div>

            {/* Payment Method */}
            <div className="mt-4">
              <select
                className="bg-gray-700 text-white w-full p-2 rounded"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
              >
                <option value="cash">Cash</option>
                <option value="card">Card</option>
              </select>
            </div>

            {/* Amount Paid */}
            <div className="mt-2">
              <input
                type="number"
                placeholder="Amount Paid"
                className="bg-gray-700 text-white w-full p-2 rounded"
                value={amountPaid}
                onChange={(e) => setAmountPaid(e.target.value)}
              />
            </div>

            {/* Display Change */}
            <div className="flex justify-between mt-2 text-gray-400">
              <span>Change:</span>
              <span>{change >= 0 ? `₱${change.toFixed(2)}` : "-"}</span>
            </div>

            {/* Checkout Button */}
            <button
              className={`bg-green-600 px-4 py-2 rounded mt-4 w-full ${!canCheckout || loading
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-green-500"
                }`}
              onClick={checkout}
              disabled={!canCheckout || loading}
            >
              {loading ? "Processing..." : `Place Order - ₱${finalPrice.toFixed(2)}`}
            </button>
          </>
        )}
      </div>
      <ToastContainer />
    </div>
  );
};

export default POS;