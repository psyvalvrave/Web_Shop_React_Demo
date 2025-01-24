import React from 'react';
import * as ReactDOMClient from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AppLayout from "./components/AppLayout";
import NotFound from "./components/NotFound";
import Profile from './components/Profile';
import Home from "./components/Home";
import VerifyUser from "./components/VerifyUser";
import ProductList from './components/ProductList';  
import AddProduct from './components/AddProduct';  
import ProductDetail from './components/ProductDetail'; 
import ShoppingCart from './components/ShoppingCart'; 
import Checkout from './components/Checkout'; 
import { Auth0Provider, useAuth0 } from "@auth0/auth0-react";
import { AuthTokenProvider } from "./AuthTokenContext";
import './style/style.css';

const container = document.getElementById("root");
const root = ReactDOMClient.createRoot(container);

const requestedScopes = ["profile", "email"];

function RequireAuth({ children }) {
  const { isAuthenticated, isLoading } = useAuth0();

  if (!isLoading && !isAuthenticated) {
    alert("You need to log in to view this page."); 
    return <Navigate to="/" replace />;
  }

  return children;
}


root.render(
  <React.StrictMode>
    <Auth0Provider
      domain={process.env.REACT_APP_AUTH0_DOMAIN}
      clientId={process.env.REACT_APP_AUTH0_CLIENT_ID}
      authorizationParams={{
        redirect_uri: `${window.location.origin}/verify-user`,
        audience: process.env.REACT_APP_AUTH0_AUDIENCE,
        scope: requestedScopes.join(" "),
      }}
    >
      <AuthTokenProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/verify-user" element={<VerifyUser />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/app" element={<AppLayout />}>
              <Route path="profile" element={<RequireAuth><Profile /></RequireAuth>} />
              <Route path="cart" element={<ShoppingCart />}>
                <Route index element={<ProductList />} />
                <Route path="products/:id" element={<ProductDetail />} />
              </Route>
              <Route path="/app/add-product" element={<RequireAuth><AddProduct /></RequireAuth>} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthTokenProvider>
    </Auth0Provider>
  </React.StrictMode>
);



