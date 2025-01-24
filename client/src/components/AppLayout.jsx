import '../style/style.css'; 
import { Outlet, Link } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";

export default function AppLayout() {
    const { user, isAuthenticated, isLoading, logout } = useAuth0();

    if (isLoading) {
        return <div className="loading">Loading...</div>;
    }

    return (
        <div className="app">
            <div className="title">
                <h1>My Shop</h1>
            </div>
            <div className="header">
                <nav className="menu">
                    <ul className="menu-list">
                        <li>
                            <p style={{color:"yellow"}}>My Shop</p>
                        </li>
                        <li>
                            <Link to="/app/Profile">Profile</Link>
                        </li>
                        <li>
                            <Link to="/app/cart">Products</Link>
                        </li>
                        {isAuthenticated && (
                            <li>
                                <button
                                    className="exit-button"
                                    style={{ height:"100%", width: "100%" }}
                                    onClick={() => logout({ returnTo: `${process.env.MY_ROOT}` })}
                                >
                                    LogOut
                                </button>
                            </li>
                        )}
                    </ul>
                </nav>
                <div className="welcome_line">Welcome, {user ? user.name : "temp_user"}</div>
            </div>
            <div className="content">
                <Outlet />
            </div>
        </div>
    );
}
