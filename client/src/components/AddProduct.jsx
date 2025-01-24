import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../style/style.css';

function AddProduct() {
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [description, setDescription] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [category, setCategory] = useState('A');
    const navigate = useNavigate();

    const handleSubmit = (event) => {
        event.preventDefault();
        const currentTime = new Date().toISOString();
        const productData = {
            name, price, description, imageUrl, category,
            createTime: currentTime,  // Set at creation
            updateTime: currentTime  // Set at creation and should be updated on modification
        };

        fetch(process.env.REACT_APP_API_URL + '/products', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(productData)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to create product');
            }
            return response.json();
        })
        .then(data => {
            alert('Product added successfully!');
            navigate('/app/cart');
        })
        .catch(error => {
            alert(error.message);
        });
    };

    return (
        <form onSubmit={handleSubmit} className="add-product-form">
            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Product Name" required />
            <input type="text" value={price} onChange={e => setPrice(e.target.value)} placeholder="Price" required />
            <div className="category-select">
                <label htmlFor="product-category">Category: </label>
                <select 
                    id="product-category"
                    value={category} 
                    onChange={e => setCategory(e.target.value)} 
                    required
                >
                    <option value="">Select a Category</option>
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                </select>
            </div>

            <input type="text" value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="Image URL" />
            <button type="submit">Add Product</button>
        </form>
    );
}

export default AddProduct;
