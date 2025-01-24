import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ShoppingCart from '../components/ShoppingCart';

describe('ShoppingCart Component Tests', () => {  
        const initialItems = [
            { id: 1, name: 'Product A', price: 10, quantity: 1 }
        ];

    beforeEach(() => {
        window.alert = jest.fn();
        render(<ShoppingCart initialItems={initialItems} />);
    });

    test('displays initial empty state', () => {
        expect(screen.getByText('Total:')).toBeInTheDocument();
        expect(screen.getByText('$ 0.00')).toBeInTheDocument();
    });

    test('handles empty cart functionality', () => {
        
        fireEvent.click(screen.getByText('Empty Cart'));
        expect(screen.getByText('$ 0.00')).toBeInTheDocument();
    });

    test('checkouts correctly', () => {
        
        fireEvent.click(screen.getByText('Checkout'));
        
        expect(window.alert).toHaveBeenCalledWith('Please Add Items First');
    });

});

