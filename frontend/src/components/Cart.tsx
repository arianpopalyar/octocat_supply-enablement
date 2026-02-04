import { useCart } from "../context/CartContext";
import { useTheme } from "../context/ThemeContext";
import { Link } from "react-router-dom";

export default function Cart() {
  const { items, removeFromCart, updateQuantity, clearCart, getTotalPrice } =
    useCart();
  const { darkMode } = useTheme();

  const handleQuantityChange = (productId: number, change: number) => {
    const item = items.find((i) => i.productId === productId);
    if (item) {
      const newQuantity = item.quantity + change;
      updateQuantity(productId, newQuantity);
    }
  };

  if (items.length === 0) {
    return (
      <div
        className={`min-h-screen ${darkMode ? "bg-dark" : "bg-gray-100"} pt-20 px-4 transition-colors duration-300`}
      >
        <div className="max-w-4xl mx-auto py-8">
          <h1
            className={`text-3xl font-bold mb-8 ${darkMode ? "text-light" : "text-gray-900"}`}
          >
            Shopping Cart
          </h1>
          <div
            className={`${darkMode ? "bg-dark-lighter" : "bg-white"} rounded-lg shadow-md p-8 text-center transition-colors duration-300`}
          >
            <svg
              className={`mx-auto h-24 w-24 ${darkMode ? "text-gray-600" : "text-gray-400"} mb-4`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
            <h2
              className={`text-2xl font-semibold mb-2 ${darkMode ? "text-light" : "text-gray-900"}`}
            >
              Your cart is empty
            </h2>
            <p
              className={`mb-6 ${darkMode ? "text-gray-400" : "text-gray-600"}`}
            >
              Add some products to get started!
            </p>
            <Link
              to="/products"
              className="inline-block bg-primary hover:bg-accent text-white px-6 py-3 rounded-md font-medium transition-colors"
            >
              Browse Products
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen ${darkMode ? "bg-dark" : "bg-gray-100"} pt-20 px-4 transition-colors duration-300`}
    >
      <div className="max-w-4xl mx-auto py-8">
        <div className="flex justify-between items-center mb-8">
          <h1
            className={`text-3xl font-bold ${darkMode ? "text-light" : "text-gray-900"}`}
          >
            Shopping Cart
          </h1>
          <button
            onClick={clearCart}
            className={`${darkMode ? "text-gray-400 hover:text-red-400" : "text-gray-600 hover:text-red-600"} text-sm font-medium transition-colors`}
          >
            Clear Cart
          </button>
        </div>

        <div className="space-y-4 mb-8">
          {items.map((item) => (
            <div
              key={item.productId}
              className={`${darkMode ? "bg-dark-lighter" : "bg-white"} rounded-lg shadow-md p-6 transition-colors duration-300`}
            >
              <div className="flex items-center gap-6">
                <img
                  src={`/${item.imgName}`}
                  alt={item.name}
                  className="w-24 h-24 object-cover rounded-md"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/copilot.png";
                  }}
                />
                <div className="flex-grow">
                  <h3
                    className={`text-lg font-semibold mb-1 ${darkMode ? "text-light" : "text-gray-900"}`}
                  >
                    {item.name}
                  </h3>
                  <p
                    className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"} mb-2`}
                  >
                    SKU: {item.sku}
                  </p>
                  <p
                    className={`text-lg font-bold ${darkMode ? "text-primary" : "text-primary"}`}
                  >
                    ${item.price.toFixed(2)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleQuantityChange(item.productId, -1)}
                    className={`${darkMode ? "bg-dark text-light hover:bg-primary" : "bg-gray-200 text-gray-700 hover:bg-primary hover:text-white"} w-8 h-8 rounded-full flex items-center justify-center transition-colors`}
                    aria-label="Decrease quantity"
                  >
                    -
                  </button>
                  <span
                    className={`w-12 text-center font-semibold ${darkMode ? "text-light" : "text-gray-900"}`}
                  >
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => handleQuantityChange(item.productId, 1)}
                    className={`${darkMode ? "bg-dark text-light hover:bg-primary" : "bg-gray-200 text-gray-700 hover:bg-primary hover:text-white"} w-8 h-8 rounded-full flex items-center justify-center transition-colors`}
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>
                <div className="text-right min-w-[100px]">
                  <p
                    className={`text-xl font-bold ${darkMode ? "text-light" : "text-gray-900"}`}
                  >
                    ${(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
                <button
                  onClick={() => removeFromCart(item.productId)}
                  className={`${darkMode ? "text-gray-400 hover:text-red-400" : "text-gray-600 hover:text-red-600"} transition-colors`}
                  aria-label="Remove item"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>

        <div
          className={`${darkMode ? "bg-dark-lighter" : "bg-white"} rounded-lg shadow-md p-6 transition-colors duration-300`}
        >
          <div className="flex justify-between items-center mb-4">
            <span
              className={`text-xl font-semibold ${darkMode ? "text-light" : "text-gray-900"}`}
            >
              Total:
            </span>
            <span className={`text-2xl font-bold text-primary`}>
              ${getTotalPrice().toFixed(2)}
            </span>
          </div>
          <button className="w-full bg-primary hover:bg-accent text-white py-3 rounded-md font-medium transition-colors">
            Proceed to Checkout
          </button>
          <Link
            to="/products"
            className={`block text-center mt-4 ${darkMode ? "text-gray-400 hover:text-primary" : "text-gray-600 hover:text-primary"} transition-colors`}
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
