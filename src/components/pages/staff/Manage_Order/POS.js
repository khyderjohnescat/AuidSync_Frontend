/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import { useState, useEffect, useMemo } from "react";
import { FaSearch, FaShoppingCart, FaTrash, FaTag, FaPlus, FaMinus } from "react-icons/fa";
import axiosInstance from "../../../../context/axiosInstance";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Swal from "sweetalert2";

// Utility function to sanitize input (prevents XSS)
const sanitizeInput = (input) => {
  return input.replace(/[<>{}]/g, "");
};

// Utility function to validate discount
const validateDiscount = (type, value, totalPrice) => {
  if (!type || !value || value <= 0) return { valid: true, amount: 0 };
  if (type === "percentage") {
    if (value > 100) return { valid: false, error: "Percentage discount cannot exceed 100%" };
    return { valid: true, amount: (totalPrice * value) / 100 };
  }
  if (type === "fixed") {
    if (value > totalPrice) return { valid: false, error: "Fixed discount cannot exceed total price" };
    return { valid: true, amount: value };
  }
  return { valid: false, error: "Invalid discount type" };
};

// Utility function to validate customer name
const validateCustomerName = (name) => {
  const maxLength = 50;
  const regex = /^[a-zA-Z0-9\s]*$/;
  if (name.length > maxLength) return { valid: false, error: `Name cannot exceed ${maxLength} characters` };
  if (!regex.test(name)) return { valid: false, error: "Name can only contain letters, numbers, and spaces" };
  return { valid: true };
};

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
  const [amountPaid, setAmountPaid] = useState("");
  const [discountType, setDiscountType] = useState(null);
  const [discountValue, setDiscountValue] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [quantities, setQuantities] = useState({}); // Track quantities for each product
  const [orderType, setOrderType] = useState("dine-in"); // New state for dine-in/take-out

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
      const price = activeDiscount
        ? activeDiscount.discountedPrice
        : Number(item.price);
      return total + price * item.quantity;
    }, 0);
  }, [cart]);

  const discountValidation = useMemo(() => {
    return validateDiscount(discountType, Number(discountValue), totalPrice);
  }, [discountType, discountValue, totalPrice]);

  const discountAmount = discountValidation.valid ? discountValidation.amount : 0;
  const finalPrice = Math.max(0, totalPrice - discountAmount);

  const customerNameValidation = useMemo(() => {
    return validateCustomerName(customerName);
  }, [customerName]);

  const validateAmountPaid = () => {
    if (amountPaid === "" || Number(amountPaid) < 0) {
      return { valid: false, error: "Amount paid cannot be negative" };
    }
    if (paymentMethod === "cash" && Number(amountPaid) < finalPrice) {
      return { valid: false, error: "Amount paid is insufficient" };
    }
    return { valid: true };
  };
  const amountPaidValidation = useMemo(() => validateAmountPaid(), [amountPaid, paymentMethod, finalPrice]);

  const change = useMemo(() => {
    const result = Number(amountPaid) - finalPrice;
    return isNaN(result) || result < 0 ? 0 : result;
  }, [amountPaid, finalPrice]);

  const canCheckout = useMemo(() => {
    return (
      cart.length > 0 &&
      discountValidation.valid &&
      customerNameValidation.valid &&
      amountPaidValidation.valid &&
      !loading
    );
  }, [cart, discountValidation, customerNameValidation, amountPaidValidation, loading]);

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
      const filteredProducts = data.filter((product) => product.deleted_at === null);
      setProducts(filteredProducts);
      // Initialize quantities for each product
      setQuantities(
        filteredProducts.reduce((acc, product) => ({
          ...acc,
          [product.id]: 1,
        }), {})
      );
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
    // Use 1 if quantity is undefined, empty, or invalid
    const effectiveQuantity = quantity && !isNaN(quantity) && quantity > 0 ? quantity : 1;
    if (!productId || effectiveQuantity <= 0) return;

    const payload = {
      userId: user.id,
      products: [{ productId, quantity: effectiveQuantity }],
    };

    try {
      await axiosInstance.post("/cart/add", payload);
      fetchCart();
      // Reset quantity for the product after adding to cart
      setQuantities((prev) => ({ ...prev, [productId]: 1 }));
    } catch (error) {
      console.error("Error adding to cart:", error.message);
      toast.error("Failed to add to cart", { position: "top-center", autoClose: 3000 });
    }
  };

  const handleQuantityChange = (productId, value) => {
    setQuantities((prev) => {
      const product = products.find((p) => p.id === productId);
      let newQty;
      if (typeof value === "number") {
        // Handle button clicks (increment/decrement)
        const currentQty = prev[productId] && !isNaN(prev[productId]) ? prev[productId] : 1;
        newQty = Math.max(1, Math.min(currentQty + value, product.quantity));
      } else {
        // Handle direct input
        if (value === "") {
          newQty = ""; // Allow empty input
        } else {
          const parsedValue = parseInt(value, 10);
          newQty = isNaN(parsedValue) || parsedValue < 1 ? "" : Math.min(parsedValue, product.quantity);
        }
      }
      return { ...prev, [productId]: newQty };
    });
  };

  const handleQuantityFocus = (event) => {
    event.target.select(); // Select entire value on focus
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

  const handleDiscountChange = (value) => {
    const numValue = Number(value);
    if (discountType === "percentage" && numValue > 100) {
      setErrors({ ...errors, discount: "Percentage discount cannot exceed 100%" });
      return;
    }
    if (discountType === "fixed" && numValue > totalPrice) {
      setErrors({ ...errors, discount: "Fixed discount cannot exceed total price" });
      return;
    }
    setDiscountValue(value);
    setErrors({ ...errors, discount: "" });
  };

  const checkout = async () => {
    const newErrors = {};
    if (!discountValidation.valid) newErrors.discount = discountValidation.error;
    if (!customerNameValidation.valid) newErrors.customerName = customerNameValidation.error;
    if (!amountPaidValidation.valid) newErrors.amountPaid = amountPaidValidation.error;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (!paymentMethod) {
      toast.error("Please select a payment method.");
      return;
    }

    const nameToSave = sanitizeInput(customerName.trim()) || "None";

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
        order_type: orderType,
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
        setAmountPaid("");
        setDiscountType(null);
        setDiscountValue("");
        setCustomerName("");
        setErrors({});
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
    <>
      <style>
        {`
          html, body {
            background-color: #0f172a; /* Matches bg-gray-950 */
            margin: 0;
            padding: 0;
            height: 100vh;
            overflow: hidden; /* Prevent entire page scrolling */
          }
          #root {
            height: 100vh;
            overflow: hidden;
          }
          /* Hide spinners for quantity input */
          input.quantity-input::-webkit-inner-spin-button,
          input.quantity-input::-webkit-outer-spin-button {
            -webkit-appearance: none;
            margin: 0;
          }
          input.quantity-input {
            -moz-appearance: textfield; /* Firefox */
          }
        `}
      </style>
      <div className="flex h-screen bg-gray-950 text-white">
        {/* Left Side: Product List (Scrollable) */}
        <div className="flex-1 flex flex-col bg-gray-900 p-5 overflow-hidden">
          <h2 className="text-2xl font-bold mb-4">Order Menu</h2>

          {/* Search and Filter */}
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="relative w-full">
              <FaSearch className="absolute left-3 top-2.5 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                className="w-full bg-gray-800 rounded-lg pl-10 p-2 outline-none text-white"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select
              className="bg-gray-800 p-2 rounded-lg w-full md:w-auto text-white"
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

          {/* Product Grid (Scrollable) */}
          <div className="flex-1 overflow-y-auto">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredProducts.map((product) => {
                const activeDiscount = getActiveDiscount(product);
                const displayPrice = activeDiscount
                  ? activeDiscount.discountedPrice
                  : Number(product.price);
                const isOutOfStock = product.quantity === 0;
                const isAvailable = product.is_active && !isOutOfStock;

                return (
                  <div
                    key={product.id}
                    className="bg-gray-800 rounded-xl p-5 shadow-lg flex flex-col items-center justify-between relative border border-gray-700 hover:bg-gray-700 hover:border-blue-500 hover:shadow-xl"
                  >
                    {activeDiscount && (
                      <span className="absolute top-3 right-3 bg-purple-500 text-white text-xs px-2 py-1 rounded-full flex items-center">
                        <FaTag className="mr-1" />
                        {activeDiscount.type === "fixed"
                          ? `₱${activeDiscount.value}`
                          : `${activeDiscount.value}%`}
                      </span>
                    )}
                    <img
                      src={getImageUrl(product.image)}
                      alt={product.name}
                      className="w-36 h-36 object-cover rounded-lg mb-4"
                      onError={(e) => {
                        e.target.src = "https://placehold.co/150";
                      }}
                    />
                    <h3 className="font-semibold text-lg text-center text-white mb-2">{product.name}</h3>
                    <span className="text-gray-400 text-sm mb-2">
                      {categories.find((cat) => cat.id === product.category_id)
                        ?.name || "No Category"}
                    </span>
                    <span className="text-xl font-bold text-green-400 mb-3">
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
                    {isAvailable && (
                      <div className="flex items-center mb-3">
                        <button
                          className="bg-gray-700 text-white p-2 rounded-l-md hover:bg-gray-600 disabled:opacity-50"
                          onClick={() => handleQuantityChange(product.id, -1)}
                          disabled={(quantities[product.id] || 1) <= 1}
                        >
                          <FaMinus />
                        </button>
                        <input
                          type="number"
                          className="quantity-input w-16 text-center bg-gray-800 text-white py-2 px-2 mx-1 rounded"
                          value={quantities[product.id] !== undefined ? quantities[product.id] : ""}
                          onChange={(e) => handleQuantityChange(product.id, e.target.value)}
                          onFocus={handleQuantityFocus}
                          min="1"
                          max={product.quantity}
                          step="1"
                          placeholder="1"
                        />
                        <button
                          className="bg-gray-700 text-white p-2 rounded-r-md hover:bg-gray-600 disabled:opacity-50"
                          onClick={() => handleQuantityChange(product.id, 1)}
                          disabled={(quantities[product.id] || 1) >= product.quantity}
                        >
                          <FaPlus />
                        </button>
                      </div>
                    )}
                    <button
                      className={`rounded-md px-4 py-2 w-full font-semibold text-white ${
                        isAvailable
                          ? "bg-blue-600 hover:bg-blue-500"
                          : "bg-gray-600 cursor-not-allowed"
                      }`}
                      onClick={() => isAvailable && addToCart(product.id, quantities[product.id])}
                      disabled={!isAvailable}
                    >
                      {isAvailable ? (
                        <>
                          <FaShoppingCart className="inline mr-2" />
                          Add to Cart
                        </>
                      ) : isOutOfStock ? (
                        "Out of Stock"
                      ) : (
                        "Product Unavailable"
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Side: Cart (Static with Scrollable Cart Items) */}
        <div className="w-1/3 flex flex-col bg-gray-900 p-6">
          <h2 className="text-2xl font-bold mb-4">Cart</h2>

          {/* Dine-In or Take-Out Option */}
          <div className="mb-4">
            <select
              className="bg-gray-800 py-2 px-3 rounded-lg w-full text-white"
              value={orderType}
              onChange={(e) => setOrderType(e.target.value)}
            >
              <option value="dine-in">Dine-In</option>
              <option value="take-out">Take-Out</option>
            </select>
          </div>

          {/* Cart Items (Scrollable) */}
          <div className="flex-1 overflow-y-auto mb-4">
            {cart.length === 0 ? (
              <p className="text-gray-400 text-center py-4">Your cart is empty.</p>
            ) : (
              <div className="space-y-2">
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
                      className="flex items-center justify-between bg-gray-700 py-2 px-3 rounded"
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
            )}
          </div>

          {/* Summary + Checkout (Static) */}
          <div>
            {/* Discount Inputs */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <select
                  className="bg-gray-700 text-white py-2 px-3 rounded w-full"
                  value={discountType || "none"}
                  onChange={(e) => {
                    setDiscountType(e.target.value === "none" ? null : e.target.value);
                    setDiscountValue("");
                    setErrors({ ...errors, discount: "" });
                  }}
                  disabled={cart.length === 0}
                >
                  <option value="none">No Discount</option>
                  <option value="percentage">% (Percentage)</option>
                  <option value="fixed">₱ (Fixed Amount)</option>
                </select>
                {discountType && (
                  <input
                    type="number"
                    placeholder="Discount Value"
                    className="bg-gray-700 text-white py-2 px-3 rounded w-full"
                    value={discountValue}
                    onChange={(e) => handleDiscountChange(e.target.value)}
                    min="0"
                    max={discountType === "percentage" ? "100" : totalPrice}
                    step={discountType === "percentage" ? "1" : "0.01"}
                    disabled={cart.length === 0}
                  />
                )}
              </div>
              {discountType && errors.discount && (
                <p className="text-red-500 text-sm">{errors.discount}</p>
              )}

              {/* Summary */}
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
                className="bg-gray-700 text-white w-full py-2 px-3 rounded"
                value={customerName}
                onChange={(e) => {
                  setCustomerName(e.target.value);
                  setErrors({ ...errors, customerName: "" });
                }}
                maxLength={50}
              />
              {errors.customerName && (
                <p className="text-red-500 text-sm">{errors.customerName}</p>
              )}
            </div>

            {/* Payment Method */}
            <div className="mt-4">
              <select
                className="bg-gray-700 text-white w-full py-2 px-3 rounded"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
              >
                <option value="cash">Cash</option>
                <option value="card">Card</option>
              </select>
            </div>

            {/* Amount Paid */}
            <div className="mt-4">
              <input
                type="number"
                placeholder="Amount Paid"
                className="bg-gray-700 text-white w-full py-2 px-3 rounded"
                value={amountPaid}
                onChange={(e) => {
                  setAmountPaid(e.target.value);
                  setErrors({ ...errors, amountPaid: "" });
                }}
                min="0"
                step="0.01"
                disabled={cart.length === 0}
              />
              {errors.amountPaid && (
                <p className="text-red-500 text-sm">{errors.amountPaid}</p>
              )}
            </div>

            {/* Display Change */}
            <div className="flex justify-between mt-4 text-gray-400">
              <span>Change:</span>
              <span>{change >= 0 ? `₱${change.toFixed(2)}` : "-"}</span>
            </div>

            {/* Checkout Button */}
            <button
              className={`bg-green-600 px-4 py-2 rounded mt-4 w-full ${
                !canCheckout || loading
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-green-500"
              }`}
              onClick={checkout}
              disabled={!canCheckout || loading}
            >
              {loading
                ? "Processing..."
                : `Place Order - ₱${finalPrice.toFixed(2)}`}
            </button>
          </div>

          <ToastContainer />
        </div>
      </div>
    </>
  );
};

export default POS;