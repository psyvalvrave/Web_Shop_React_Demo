import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useNavigate } from "react-router-dom";
import '../style/style.css'; 
import '../style/home.css'; 

function Home() {
  const navigate = useNavigate();
  const { isAuthenticated, loginWithRedirect } = useAuth0();

  const handleLogin = (event) => {
    event.preventDefault();
    loginWithRedirect();
  };

  const handleRegister = (event) => {
    event.preventDefault();
    loginWithRedirect({
      screen_hint: 'signup'
    });
  };

  return (
    <div>
      <h1>My Shop</h1>
      <div>
        {!isAuthenticated ? (
          <>
            <button className="btn-primary" onClick={handleLogin}>
              Login
            </button>
            <button className="btn-primary" onClick={handleRegister}>
              Register
            </button>
            <button className="btn-primary" onClick={() => navigate("/app")}>
              Enter Product List
            </button>
          </>
        ) : (
          <button className="btn-primary" onClick={() => navigate("/app")}>
            Enter Product List
          </button>
        )}
      </div>
    </div>
  );
}

export default Home;
