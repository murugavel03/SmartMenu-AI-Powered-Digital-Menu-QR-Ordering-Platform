"use client";
import { useState, useRef, useCallback } from "react";
import { Search, MapPin, Clock, ShoppingCart, X, Minus, Plus, Flame, Leaf, Star } from "lucide-react";
import { toast } from "sonner";
import { cn, formatCurrency } from "@/lib/utils";
import type { CartItem, RestaurantData, MenuItemData } from "@/types";
import CartProvider from "./CartProvider";
import { useCart } from "@/hooks/useCart";

interface Props {
  restaurant: RestaurantData;
  tableId?: string;
}

export default function CustomerMenuClient({ restaurant, tableId }: Props) {
  return (
    <CartProvider>
      <MenuContent restaurant={restaurant} tableId={tableId} />
    </CartProvider>
  );
}

function MenuContent({ restaurant, tableId }: Props) {
  const { items: cartItems, addItem, itemCount, subtotal } = useCart();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState(restaurant.categories[0]?.id || "");
  const [selectedItem, setSelectedItem] = useState<MenuItemData | null>(null);
  const [showCart, setShowCart] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState<string | null>(null);
  const categoryRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const primaryColor = restaurant.settings?.primaryColor || "#f97316";

  const allItems = restaurant.categories.flatMap(c => c.menuItems);
  const filteredCategories = search
    ? [{
        id: "search",
        name: "Search Results",
        menuItems: allItems.filter(item =>
          item.name.toLowerCase().includes(search.toLowerCase()) ||
          (item.description || "").toLowerCase().includes(search.toLowerCase())
        ),
        description: null,
        image: null,
        sortOrder: 0,
        isActive: true,
      }]
    : restaurant.categories;

  function scrollToCategory(catId: string) {
    setActiveCategory(catId);
    const el = categoryRefs.current[catId];
    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY - 140;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  }

  if (orderPlaced) {
    return <OrderConfirmation orderId={orderPlaced} restaurant={restaurant} tableId={tableId} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Restaurant Header */}
      <div className="relative" style={{ background: `linear-gradient(135deg, ${primaryColor}15, ${primaryColor}05)` }}>
        {restaurant.coverImage && (
          <div className="h-44 overflow-hidden">
            <img src={restaurant.coverImage} alt={restaurant.name} className="w-full h-full object-cover opacity-30" />
          </div>
        )}
        <div className="px-4 pt-6 pb-4">
          <div className="flex items-start gap-4">
            {restaurant.logo ? (
              <img src={restaurant.logo} alt="Logo" className="w-16 h-16 rounded-2xl object-cover border-2 border-white shadow-md flex-shrink-0" />
            ) : (
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0 shadow-md"
                style={{ backgroundColor: `${primaryColor}20` }}
              >
                🍽️
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold text-gray-900 truncate">{restaurant.name}</h1>
              {restaurant.description && (
                <p className="text-gray-600 text-sm mt-0.5 line-clamp-2">{restaurant.description}</p>
              )}
              <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                {restaurant.address && (
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{restaurant.city || restaurant.address}</span>
                )}
                <span className={cn("flex items-center gap-1 font-semibold", restaurant.isOpen ? "text-green-600" : "text-red-600")}>
                  <Clock className="w-3 h-3" />
                  {restaurant.isOpen ? "Open Now" : "Closed"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Table info */}
        {tableId && (
          <div className="mx-4 mb-4 bg-orange-50 border border-orange-200 rounded-xl px-4 py-2.5 flex items-center gap-2">
            <span className="text-orange-500">📍</span>
            <p className="text-sm font-medium text-orange-900">
              You are ordering from a table
            </p>
          </div>
        )}
      </div>

      {/* Search */}
      <div className="sticky top-0 z-30 bg-white border-b border-gray-200 px-4 py-3 shadow-sm">
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search food..."
            className="w-full pl-9 pr-4 py-2.5 bg-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 text-gray-900"
            style={{ "--tw-ring-color": primaryColor } as React.CSSProperties}
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Category tabs */}
        {!search && (
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {restaurant.categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => scrollToCategory(cat.id)}
                className={cn(
                  "flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all",
                  activeCategory === cat.id
                    ? "text-white shadow-sm"
                    : "text-gray-600 bg-gray-100 hover:bg-gray-200"
                )}
                style={activeCategory === cat.id ? { backgroundColor: primaryColor } : {}}
              >
                {cat.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Menu */}
      <div className="px-4 py-4 space-y-8 pb-32">
        {filteredCategories.map(category => (
          <div key={category.id} ref={el => { categoryRefs.current[category.id] = el; }}>
            <h2 className="text-lg font-bold text-gray-900 mb-3">{category.name}</h2>
            <div className="space-y-3">
              {category.menuItems.map(item => (
                <MenuItemCard
                  key={item.id}
                  item={item}
                  primaryColor={primaryColor}
                  currencySymbol={restaurant.settings?.currencySymbol || "Rs."}
                  onSelect={() => setSelectedItem(item)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Cart Button */}
      {itemCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 z-30">
          <button
            onClick={() => setShowCart(true)}
            className="w-full text-white font-bold py-4 rounded-2xl shadow-lg flex items-center justify-between px-5 transition-all hover:opacity-90 active:scale-98"
            style={{ backgroundColor: primaryColor }}
          >
            <span className="bg-white/20 rounded-xl px-2.5 py-1 text-sm font-bold">{itemCount}</span>
            <span>View Cart</span>
            <span>{formatCurrency(subtotal, restaurant.settings?.currencySymbol)}</span>
          </button>
        </div>
      )}

      {/* Item Detail Modal */}
      {selectedItem && (
        <ItemModal
          item={selectedItem}
          primaryColor={primaryColor}
          currencySymbol={restaurant.settings?.currencySymbol || "Rs."}
          onClose={() => setSelectedItem(null)}
          onAdd={(cartItem) => {
            addItem(cartItem);
            setSelectedItem(null);
            toast.success(`${cartItem.name} added to cart`);
          }}
        />
      )}

      {/* Cart Drawer */}
      {showCart && (
        <CartDrawer
          restaurant={restaurant}
          tableId={tableId}
          onClose={() => setShowCart(false)}
          onOrderPlaced={setOrderPlaced}
        />
      )}
    </div>
  );
}

function MenuItemCard({ item, primaryColor, currencySymbol, onSelect }: {
  item: MenuItemData;
  primaryColor: string;
  currencySymbol: string;
  onSelect: () => void;
}) {
  return (
    <div
      className={cn(
        "bg-white rounded-2xl shadow-sm border border-gray-100 flex gap-3 overflow-hidden cursor-pointer hover:shadow-md transition-shadow",
        !item.isAvailable && "opacity-60"
      )}
      onClick={item.isAvailable ? onSelect : undefined}
    >
      {/* Image */}
      <div className="w-28 h-28 flex-shrink-0">
        {item.image ? (
          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center text-4xl">
            {item.isVegetarian ? "🥗" : "🍗"}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 py-3 pr-3 flex flex-col justify-between min-w-0">
        <div>
          <div className="flex items-center gap-1.5">
            <span className={cn("w-3 h-3 rounded-sm border-2 flex-shrink-0", item.isVegetarian ? "border-green-600" : "border-red-600")}>
              <span className={cn("w-1.5 h-1.5 rounded-sm block m-auto mt-0.5", item.isVegetarian ? "bg-green-600" : "bg-red-600")} />
            </span>
            {item.isFeatured && <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />}
            {item.isPopular && <span className="text-[10px] bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded font-bold">POPULAR</span>}
          </div>
          <p className="font-bold text-gray-900 mt-1 text-sm leading-tight line-clamp-2">{item.name}</p>
          {item.description && <p className="text-xs text-gray-500 mt-1 line-clamp-2">{item.description}</p>}
        </div>

        <div className="flex items-center justify-between mt-2">
          <div>
            <span className="font-bold text-gray-900 text-sm">{currencySymbol}{item.price}</span>
            {item.discountPrice && (
              <span className="text-xs text-gray-400 line-through ml-1">{currencySymbol}{item.discountPrice}</span>
            )}
          </div>
          <button
            style={{ backgroundColor: item.isAvailable ? primaryColor : "#d1d5db" }}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-white font-bold text-lg transition-all hover:opacity-90 active:scale-90 flex-shrink-0"
            onClick={e => { e.stopPropagation(); item.isAvailable && onSelect(); }}
          >
            +
          </button>
        </div>

        {!item.isAvailable && <p className="text-xs text-red-500 font-medium mt-1">Currently unavailable</p>}
      </div>
    </div>
  );
}

function ItemModal({ item, primaryColor, currencySymbol, onClose, onAdd }: {
  item: MenuItemData;
  primaryColor: string;
  currencySymbol: string;
  onClose: () => void;
  onAdd: (cartItem: CartItem) => void;
}) {
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState(
    item.variants.find(v => v.isDefault) || item.variants[0] || null
  );
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const [instructions, setInstructions] = useState("");

  const basePrice = selectedVariant?.price ?? item.price;
  const addonTotal = item.addons.filter(a => selectedAddons.includes(a.id)).reduce((s, a) => s + a.price, 0);
  const unitPrice = basePrice + addonTotal;
  const total = unitPrice * quantity;

  function toggleAddon(addonId: string) {
    setSelectedAddons(prev =>
      prev.includes(addonId) ? prev.filter(id => id !== addonId) : [...prev, addonId]
    );
  }

  function handleAdd() {
    const cartItem: CartItem = {
      id: `${item.id}-${Date.now()}`,
      menuItemId: item.id,
      name: item.name,
      price: unitPrice,
      quantity,
      image: item.image || undefined,
      selectedVariant: selectedVariant || undefined,
      selectedAddons: item.addons.filter(a => selectedAddons.includes(a.id)).map(a => ({ id: a.id, name: a.name, price: a.price })),
      instructions: instructions || undefined,
    };
    onAdd(cartItem);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60" />
      <div
        className="relative w-full max-w-lg bg-white rounded-t-3xl max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Image */}
        <div className="h-56 relative overflow-hidden rounded-t-3xl">
          {item.image ? (
            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center text-7xl">
              {item.isVegetarian ? "🥗" : "🍗"}
            </div>
          )}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="absolute top-4 left-4 flex gap-2">
            <span className={cn("w-5 h-5 rounded-sm border-2 bg-white flex items-center justify-center", item.isVegetarian ? "border-green-600" : "border-red-600")}>
              <span className={cn("w-2.5 h-2.5 rounded-sm", item.isVegetarian ? "bg-green-600" : "bg-red-600")} />
            </span>
          </div>
        </div>

        <div className="p-5 space-y-5">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{item.name}</h2>
            {item.description && <p className="text-gray-600 text-sm mt-1">{item.description}</p>}
            <p className="text-2xl font-bold mt-2" style={{ color: primaryColor }}>{currencySymbol}{unitPrice.toFixed(0)}</p>
          </div>

          {/* Variants */}
          {item.variants.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Choose Size</h3>
              <div className="flex flex-wrap gap-2">
                {item.variants.map(v => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVariant(v)}
                    className={cn(
                      "px-4 py-2 rounded-xl border text-sm font-medium transition-all",
                      selectedVariant?.id === v.id ? "border-2 text-white" : "border-gray-200 text-gray-700 hover:border-gray-300"
                    )}
                    style={selectedVariant?.id === v.id ? { borderColor: primaryColor, backgroundColor: primaryColor } : {}}
                  >
                    {v.name} • {currencySymbol}{v.price}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Addons */}
          {item.addons.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Customizations</h3>
              <div className="space-y-2">
                {item.addons.map(addon => (
                  <label
                    key={addon.id}
                    className={cn(
                      "flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all",
                      selectedAddons.includes(addon.id) ? "border-2" : "border-gray-200 hover:border-gray-300"
                    )}
                    style={selectedAddons.includes(addon.id) ? { borderColor: primaryColor, backgroundColor: `${primaryColor}08` } : {}}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={selectedAddons.includes(addon.id)}
                        onChange={() => toggleAddon(addon.id)}
                        className="w-4 h-4"
                      />
                      <span className="text-sm font-medium text-gray-800">{addon.name}</span>
                    </div>
                    {addon.price > 0 && (
                      <span className="text-sm font-semibold text-gray-600">+{currencySymbol}{addon.price}</span>
                    )}
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Instructions */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Special Instructions</h3>
            <textarea
              value={instructions}
              onChange={e => setInstructions(e.target.value)}
              placeholder="Any special requests? (optional)"
              rows={2}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none resize-none text-gray-800"
            />
          </div>

          {/* Quantity & Add */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 border border-gray-200 rounded-xl p-1">
              <button
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
              >
                <Minus className="w-3 h-3" />
              </button>
              <span className="font-bold text-gray-900 w-6 text-center">{quantity}</span>
              <button
                onClick={() => setQuantity(q => q + 1)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white transition-colors"
                style={{ backgroundColor: primaryColor }}
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
            <button
              onClick={handleAdd}
              className="flex-1 text-white font-bold py-3.5 rounded-2xl transition-all hover:opacity-90 active:scale-98"
              style={{ backgroundColor: primaryColor }}
            >
              Add to Cart • {currencySymbol}{total.toFixed(0)}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function CartDrawer({ restaurant, tableId, onClose, onOrderPlaced }: {
  restaurant: RestaurantData;
  tableId?: string;
  onClose: () => void;
  onOrderPlaced: (orderId: string) => void;
}) {
  const { items, removeItem, updateQuantity, clearCart, subtotal } = useCart();
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [instructions, setInstructions] = useState("");
  const [placing, setPlacing] = useState(false);
  const currencySymbol = restaurant.settings?.currencySymbol || "Rs.";
  const taxRate = (restaurant.settings?.taxPercentage || 0) / 100;
  const taxAmount = subtotal * taxRate;
  const total = subtotal + taxAmount;

  async function placeOrder() {
    if (items.length === 0) return;
    setPlacing(true);
    try {
      const orderItems = items.map(item => ({
        menuItemId: item.menuItemId,
        variantId: item.selectedVariant?.id,
        quantity: item.quantity,
        selectedAddons: item.selectedAddons.map(a => a.id),
        instructions: item.instructions,
      }));

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          restaurantId: restaurant.id,
          tableId,
          customerName: customerName || undefined,
          customerPhone: customerPhone || undefined,
          specialInstructions: instructions || undefined,
          items: orderItems,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error || "Failed to place order");
        return;
      }

      const data = await res.json();
      clearCart();
      onOrderPlaced(data.order.id);
    } finally {
      setPlacing(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60" />
      <div
        className="relative w-full max-w-lg bg-white rounded-t-3xl max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-5">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold text-gray-900">Your Cart</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>

          {tableId && (
            <div className="bg-orange-50 border border-orange-200 rounded-xl px-4 py-2.5 mb-4 text-sm font-medium text-orange-900">
              📍 Ordering for table
            </div>
          )}

          {/* Cart items */}
          <div className="space-y-3 mb-5">
            {items.map(item => (
              <div key={item.id} className="flex gap-3 bg-gray-50 rounded-xl p-3">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-sm">{item.name}</p>
                  {item.selectedVariant && (
                    <p className="text-xs text-gray-500">{item.selectedVariant.name}</p>
                  )}
                  {item.selectedAddons.length > 0 && (
                    <p className="text-xs text-gray-500">{item.selectedAddons.map(a => a.name).join(", ")}</p>
                  )}
                  <p className="text-sm font-bold text-gray-900 mt-1">{currencySymbol}{(item.price * item.quantity).toFixed(0)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-6 h-6 rounded-lg bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-gray-700 transition-colors">
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-4 text-center font-bold text-sm">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-6 h-6 rounded-lg bg-orange-500 flex items-center justify-center text-white transition-colors">
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Customer info */}
          <div className="space-y-3 mb-5">
            <input
              value={customerName}
              onChange={e => setCustomerName(e.target.value)}
              placeholder="Your name (optional)"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <input
              value={customerPhone}
              onChange={e => setCustomerPhone(e.target.value)}
              placeholder="Phone number (optional)"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <textarea
              value={instructions}
              onChange={e => setInstructions(e.target.value)}
              placeholder="Special instructions for the kitchen..."
              rows={2}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none resize-none"
            />
          </div>

          {/* Totals */}
          <div className="space-y-2 mb-5 p-4 bg-gray-50 rounded-xl">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Subtotal</span>
              <span>{currencySymbol}{subtotal.toFixed(2)}</span>
            </div>
            {taxAmount > 0 && (
              <div className="flex justify-between text-sm text-gray-600">
                <span>Tax ({restaurant.settings?.taxPercentage}%)</span>
                <span>{currencySymbol}{taxAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-gray-900 pt-2 border-t border-gray-200">
              <span>Total</span>
              <span>{currencySymbol}{total.toFixed(2)}</span>
            </div>
          </div>

          <button
            onClick={placeOrder}
            disabled={placing || items.length === 0}
            className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-bold py-4 rounded-2xl transition-all text-lg"
          >
            {placing ? "Placing Order..." : `Place Order • ${currencySymbol}${total.toFixed(0)}`}
          </button>
        </div>
      </div>
    </div>
  );
}

function OrderConfirmation({ orderId, restaurant, tableId }: {
  orderId: string;
  restaurant: RestaurantData;
  tableId?: string;
}) {
  const primaryColor = restaurant.settings?.primaryColor || "#f97316";
  const estimatedTime = restaurant.settings?.estimatedPrepTime || 20;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gray-50">
      <div className="w-full max-w-sm text-center">
        <div
          className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 text-5xl shadow-lg"
          style={{ backgroundColor: `${primaryColor}20` }}
        >
          🎉
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Order Confirmed!</h2>
        {tableId && <p className="text-gray-600 mb-2">Your order has been sent to the kitchen</p>}
        <p className="text-sm text-gray-500 font-mono mb-6">#{orderId.slice(-8).toUpperCase()}</p>

        <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-6">
          <p className="text-sm text-gray-500 mb-1">Estimated time</p>
          <p className="text-3xl font-bold" style={{ color: primaryColor }}>{estimatedTime}–{estimatedTime + 5} min</p>
        </div>

        <a
          href={`/order/${orderId}`}
          className="w-full text-white font-bold py-4 rounded-2xl block text-center transition-opacity hover:opacity-90"
          style={{ backgroundColor: primaryColor }}
        >
          Track Order
        </a>
      </div>
    </div>
  );
}
