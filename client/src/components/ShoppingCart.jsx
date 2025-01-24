import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import '../style/style.css'; 

function ShoppingCart() {
    const [cartItems, setCartItems] = useState([]);

    const addToCart = (product, quantity) => {
        const exist = cartItems.find(item => item.id === product.id);
        if (exist) {
            setCartItems(
                cartItems.map(item =>
                    item.id === product.id ? { ...exist, quantity: exist.quantity + quantity } : item
                )
            );
        } else {
            setCartItems([...cartItems, { ...product, quantity }]);
        }
    };

    const removeFromCart = (product) => {
        setCartItems(cartItems.filter(item => item.id !== product.id));
    };

    const adjustQuantity = (product, quantity) => {
        setCartItems(
            cartItems.map(item =>
                item.id === product.id ? { ...item, quantity } : item
            )
        );
    };

    const emptyCart = () => {
        setCartItems([]);
    };

    const handleCheckout = () => {
        if (totalPrice>0){
        window.open('/checkout', '_blank');
        // checkout page
        }
        else{
            alert("Please Add Items First")
        }
    };

    const totalPrice = cartItems.reduce((acc, item) => acc + item.quantity * item.price, 0);

    return (
        <div>
            <div style={{ paddingBottom: '100px' }}> {}
                <Outlet context={{ addToCart, removeFromCart, cartItems }} />
            </div>
            <div className = "cart" style={{ position: 'fixed', bottom: 0, left: 0, right: 0, backgroundColor: 'lightgray' }}>
            <h2 >Shopping Cart</h2>
                {cartItems.map((item) => (
                    <div className = "cart_list" key={item.id}>
                        <h3>{item.name} - ${item.price} x {item.quantity}</h3>
                        <button onClick={() => adjustQuantity(item, item.quantity + 1)}>+</button>
                        <button onClick={() => adjustQuantity(item, item.quantity - 1)}>-</button>
                        <button onClick={() => removeFromCart(item)}>Remove</button>
                    </div>
                ))}
                <h3>Total: </h3><h3 style={{color: 'blue'}}>$ {totalPrice.toFixed(2)}</h3>
                <button onClick={handleCheckout}>Checkout</button>
                <button onClick={emptyCart}>Empty Cart</button>
            </div>
        </div>
    );
}

export default ShoppingCart;
