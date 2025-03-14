import { useState, useEffect, useMemo } from "react";
import { FaSearch, FaShoppingCart, FaTrash } from "react-icons/fa";

const POS = () => {
    const [search, setSearch] = useState("");
    const [cart, setCart] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProducts = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await fetch("http://localhost:5000/api/products");
                if (!response.ok) {
                    throw new Error("Failed to fetch products");
                }
                const data = await response.json();
                setProducts(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        const fetchCategories = async () => {
            try {
                const response = await fetch("http://localhost:5000/api/products/categories");
                if (!response.ok) throw new Error("Failed to fetch categories");

                const data = await response.json();
                setCategories(data);
            } catch (err) {
                console.error(err);
            }
        };

        fetchProducts();
        fetchCategories();
    }, []);

    const filteredProducts = useMemo(() => {
        return products.filter((p) =>
            (selectedCategory === "All" || p.category_id === Number(selectedCategory)) &&
            p.name.toLowerCase().includes(search.toLowerCase())
        );
    }, [products, selectedCategory, search]);

    const addToCart = (product) => {
        setCart((prevCart) => {
            const existingItem = prevCart.find((item) => item.id === product.id);
            if (existingItem) {
                return prevCart.map((item) =>
                    item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
                );
            } else {
                return [...prevCart, { ...product, quantity: 1 }];
            }
        });
    };

    const removeFromCart = (id) => {
        setCart((prevCart) => prevCart.filter((item) => item.id !== id));
    };

    const totalPrice = useMemo(
        () => cart.reduce((total, item) => total + Number(item.price) * item.quantity, 0).toFixed(2),
        [cart]
    );

    return (
        <div className="flex h-screen p-6 text-white">
            {/* Left Section - Product List */}
            <div className="w-2/3 p-4 bg-gray-900 rounded-l-lg flex flex-col">
                <h2 className="text-2xl font-bold mb-4">Order Menu</h2>

                {isLoading && <p>Loading...</p>}
                {error && <p className="text-red-500">{error}</p>}

                {/* Search & Filter */}
                <div className="flex gap-4 mb-4">
                    <div className="flex items-center bg-gray-800 p-2 rounded flex-1">
                        <FaSearch className="text-gray-400 mx-2" />
                        <input
                            type="text"
                            placeholder="Search products..."
                            className="bg-transparent outline-none text-white w-full"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <select
                        className="bg-gray-800 p-2 rounded text-white"
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                    >
                        <option value="All">All</option>
                        {categories.map((cat) => (
                            <option key={cat.id} value={cat.id.toString()}>{cat.name}</option>
                        ))}
                    </select>
                </div>

                {/* Product Grid */}
                {!isLoading && !error && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 overflow-y-auto" style={{ maxHeight: "500px" }}>
                        {filteredProducts.length > 0 ? (
                            filteredProducts.map((product) => (
                                <div key={product.id} className="bg-gray-800 p-4 rounded text-center flex flex-col items-center">
                                    <img src={product.image} alt={product.name} className="w-32 h-32 object-cover rounded mb-2" />
                                    <h3 className="text-lg font-bold">{product.name}</h3>
                                    <p className="text-sm">{product.description}</p>
                                    <p className="text-lg font-semibold">₱{Number(product.price).toFixed(2)}</p>
                                    <button
                                        className="mt-2 bg-blue-600 px-4 py-2 rounded hover:bg-blue-500"
                                        onClick={() => addToCart(product)}
                                    >
                                        <FaShoppingCart className="inline mr-2" /> Add to Cart
                                    </button>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-400">No products found.</p>
                        )}
                    </div>
                )}
            </div>

            {/* Right Section - Cart */}
            <div className="w-1/3 p-4 bg-gray-800 rounded-r-lg flex flex-col">
                <h2 className="text-2xl font-bold mb-4">Cart</h2>
                {cart.length === 0 ? (
                    <p className="text-gray-400">Your cart is empty.</p>
                ) : (
                    <ul className="space-y-2">
                        {cart.map((item) => (
                            <li key={item.id} className="flex justify-between items-center bg-gray-700 p-2 rounded">
                                <span>{item.name} x {item.quantity}</span>
                                <span>${(item.price * item.quantity).toFixed(2)}</span>
                                <button
                                    className="text-red-500"
                                    onClick={() => removeFromCart(item.id)}
                                >
                                    <FaTrash />
                                </button>
                            </li>
                        ))}
                    </ul>
                )}

                {/* Total Price */}
                <div className="mt-4 border-t border-gray-600 pt-2">
                    <h3 className="text-lg font-semibold">Total: ${totalPrice}</h3>
                    <button className="w-full bg-green-600 p-2 rounded mt-2 hover:bg-green-500">
                        Checkout
                    </button>
                </div>
            </div>
        </div>
    );
};

export default POS;
