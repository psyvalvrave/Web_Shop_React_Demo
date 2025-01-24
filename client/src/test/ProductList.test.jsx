import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import ProductList from '../components/ProductList';



global.fetch = jest.fn();
const mockAddToCart = jest.fn();

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useOutletContext: () => ({ addToCart: mockAddToCart }),
}));

describe('ProductList Component Tests', () => {
    beforeEach(() => {
        fetch.mockClear();
        mockAddToCart.mockClear();
        fetch.mockResolvedValue({
            ok: true,
            json: () => Promise.resolve([
                { id: 1, name: 'Product A', price: 20, category:"", imageUrl: 'http://example.com/product_a.jpg' },
                { id: 2, name: 'Product B', price: 30, category:"", imageUrl: 'http://example.com/product_b.jpg' }
            ])
        });
    });

    test('fetches products and renders them', async () => {
        render(<ProductList />, { wrapper: Router });

        // Wait for products to be fetched and rendered
        await waitFor(() => {
            expect(screen.getByText('Product A')).toBeInTheDocument();
            expect(screen.getByText('$20')).toBeInTheDocument();
            expect(screen.getByText('Product B')).toBeInTheDocument();
            expect(screen.getByText('$30')).toBeInTheDocument();
        });
    });

    test('filters products based on search term', async () => {
        render(<ProductList />, { wrapper: Router });
        const searchInput = screen.getByPlaceholderText('Search products...');

        // Search for 'Product B'
        fireEvent.change(searchInput, { target: { value: 'Product B' } });
        await waitFor(() => {
            expect(screen.queryByText('Product A')).not.toBeInTheDocument();
            expect(screen.getByText('Product B')).toBeInTheDocument();
        });
    });

    test('displays an error when fetching products fails', async () => {
        fetch.mockRejectedValueOnce(new Error('Failed to fetch products'));
        render(<ProductList />, { wrapper: Router });

        await waitFor(() => {
            expect(screen.getByText('Error: Failed to fetch products')).toBeInTheDocument();
        });
    });

    test('adds a product to the cart', async () => {
        render(<ProductList />, { wrapper: Router });
        const addToCartButton = await screen.findByTestId('add-to-cart-1');

        fireEvent.click(addToCartButton);
        expect(mockAddToCart).toHaveBeenCalledWith({
            id: 1,
            name: 'Product A',
            price: 20,
            category:"",
            imageUrl: 'http://example.com/product_a.jpg'
        }, 1);
    });
});
