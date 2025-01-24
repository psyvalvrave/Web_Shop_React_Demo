import React, { useEffect, useState } from 'react';
import { Link, useOutletContext, useNavigate  } from 'react-router-dom';
import '../style/style.css';

function ProductList() {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');  
    const { addToCart } = useOutletContext();

    useEffect(() => {
        const apiUrl = process.env.REACT_APP_API_URL + '/products';
        fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(setProducts)
        .catch(error => {
            console.error('Failed to fetch products:', error);
            setError('Failed to fetch products');
        });
    }, []);
    //handle search function to filter the result
    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value.toLowerCase());
    };

    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm)
    );

    return (
        <div className="product_list">
            <button onClick={() => navigate('/app/add-product')}>Add New Product</button>
            <input
                type="text"
                placeholder="Search products..."
                onChange={handleSearchChange}
                value={searchTerm}
                className="search-box"
            />
            {error && <p>Error: {error}</p>}
            {filteredProducts.map(product => (
                <div className="product_item" key={product.id}>
                    <h2><Link to={`products/${product.id}`}>{product.name}</Link></h2>
                    <p>${product.price}</p>
                    <img src={product.imageUrl || 'https://upload.wikimedia.org/wikipedia/commons/6/65/No-Image-Placeholder.svg'}
                         alt={product.name} />
                    <button onClick={() => addToCart(product, 1)} data-testid={`add-to-cart-${product.id}`}>Add to Cart</button>
                </div>
            ))}
        </div>
    );
}

export default ProductList;
