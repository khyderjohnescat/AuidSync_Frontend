/* eslint-disable no-unused-vars */
import { useState, useEffect, useMemo } from "react";
import { FaSearch, FaShoppingCart, FaTrash } from "react-icons/fa";
import axiosInstance from "../../context/axiosInstance";

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

  const totalPrice = useMemo(
    () =>
      cart.reduce(
        (total, item) => total + Number(item.price) * item.quantity,
        0
      ),
    [cart]
  );

  const discountAmount = useMemo(() => {
    if (discountType === "percentage") {
      return totalPrice * (discountValue / 100);
    } else if (discountType === "fixed") {
      return Math.min(discountValue, totalPrice);
    }
    return 0;
  }, [discountType, discountValue, totalPrice]);

  const finalPrice = useMemo(
    () => totalPrice - discountAmount,
    [totalPrice, discountAmount]
  );

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

    if (!paymentMethod) {
      alert("Please select a payment method.");
      return;
    }

    const confirmCheckout = window.confirm(
      "Are you sure you want to place the order?"
    );
    if (!confirmCheckout) return;

    setLoading(true);

    try {
      const payload = {
        order_type: "dine-in",
        customer_name: `${user.first_name} ${user.last_name}`,
        discount_type: discountType || "none",
        discount_value: Number(discountValue) || 0,
        payment_method: paymentMethod,
        amount_paid: Number(amountPaid) || 0,
      };

      const response = await axiosInstance.post("/cart/checkout", payload);

      if (response.status === 201 || response.status === 200) {
        alert("Order placed successfully!");
        fetchCart(); // Refresh the cart after checkout
        fetchProducts(); // Refresh product stock after checkout
        setAmountPaid(0);
        setDiscountType("none");
        setDiscountValue(0);
      } else {
        alert("Checkout failed: " + response.data.message);
      }
    } catch (error) {
      console.error("Error during checkout:", error);
      alert(
        `Checkout failed: ${error.response?.data?.message || error.message}`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-3 gap-6 h-screen p-6 bg-gray-950 text-white">
      {/* ✅ Product List */}
      <div className="col-span-2 flex flex-col bg-gray-900 p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-4">Order Menu</h2>

        {isLoading && <p className="text-gray-400">Loading...</p>}
        {error && <p className="text-red-500">{error}</p>}

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

        {/* ✅ Product Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="bg-gray-800 rounded-lg p-4 shadow-md flex flex-col items-center justify-between"
            >
              <img
                src={product.image}
                alt={product.name}
                className="w-32 h-32 object-cover rounded-md mb-3"
              />
              <h3 className="font-bold text-center mt-2">{product.name}</h3>

              <span className="text-gray-400 text-sm mb-1">
                {categories.find((cat) => cat.id === product.category_id)
                  ?.name || "No Category"}
              </span>

              <span className="text-xl font-bold text-green-400 mt-1">
                ₱{Number(product.price).toFixed(2)}
              </span>

              <button
                className="bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-md px-4 py-2 mt-3 w-full"
                onClick={() => addToCart(product.id, 1)}
              >
                <FaShoppingCart className="inline mr-2" />
                Add to Cart
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ✅ Cart */}
      <div className="col-span-1 bg-gray-900 p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-4">Cart</h2>
        {cart.length === 0 ? (
          <p className="text-gray-400">Your cart is empty.</p>
        ) : (
          <>
            {/* ✅ Cart Items */}
            <ul className="space-y-2">
              {cart.map((item) => (
                <li
                  key={item.id}
                  className="flex justify-between items-center bg-gray-700 p-2 rounded"
                >
                  <span>
                    {item.product?.name} x {item.quantity}
                  </span>
                  <span>₱{(item.price * item.quantity).toFixed(2)}</span>
                  <button onClick={() => removeFromCart(item.id)}>
                    <FaTrash className="text-red-500" />
                  </button>
                </li>
              ))}
            </ul>

            {/* ✅ Summary */}
            <div className="mt-4 space-y-2">
              {/* Discount Input */}
              <div className="flex items-center gap-2">
                <select
                  className="bg-gray-700 text-white p-2 rounded w-1/3"
                  value={discountType}
                  onChange={(e) => setDiscountType(e.target.value)}
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

              {/* Total, Discount, and Final Price */}
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
            {/* ✅ Customer Name */}
            <div className="mt-4">
              <input
                type="text"
                placeholder="Customer Name (Optional)"
                className="bg-gray-700 text-white w-full p-2 rounded"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
              />
            </div>

            {/* ✅ Payment Method */}
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

            {/* ✅ Amount Paid */}
            <div className="mt-2">
              <input
                type="number"
                placeholder="Amount Paid"
                className="bg-gray-700 text-white w-full p-2 rounded"
                value={amountPaid}
                onChange={(e) => setAmountPaid(e.target.value)}
              />
            </div>

            {/* ✅ Display Change */}
            <div className="flex justify-between mt-2 text-gray-400">
              <span>Change:</span>
              <span>{change >= 0 ? `₱${change.toFixed(2)}` : "-"}</span>
            </div>

            {/* ✅ Checkout Button */}
            <button
              className={`bg-green-600 px-4 py-2 rounded mt-4 w-full ${
                !canCheckout
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-green-500"
              }`}
              onClick={checkout}
              disabled={!canCheckout}
            >
              Place Order - ₱{finalPrice.toFixed(2)}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default POS;
