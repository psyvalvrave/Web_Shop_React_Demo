import React, { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useAuthToken } from "../AuthTokenContext";
import '../style/style.css';

function Profile() {
    const { user, isAuthenticated, isLoading } = useAuth0();
    const [userData, setUserData] = useState(null);
    const [loadingUserData, setLoadingUserData] = useState(false);
    const { accessToken } = useAuthToken();
    const [editMode, setEditMode] = useState(false);
    const [newName, setNewName] = useState('');
    const [newEmail, setNewEmail] = useState('');
    const [feedback, setFeedback] = useState('');
    const [chartUrl, setChartUrl] = useState('');
    const [productNames, setProductNames] = useState([]);
    const [commentCounts, setCommentCounts] = useState([]);

    useEffect(() => {
        if (isAuthenticated && user.sub) {
            fetchUserData();
        }
    }, [isAuthenticated, user.sub, accessToken]);

    const fetchUserData = () => {
        setLoadingUserData(true);
        fetch(`${process.env.REACT_APP_API_URL}/user-details`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        })
        .then(response => response.json())
        .then(data => {
            setUserData(data);
            setNewName(data.name || user.name);
            setNewEmail(data.email || user.email);
            if (data.commentCounts.length > 0) {
                const names = data.commentCounts.map(item => item.productName);
                const counts = data.commentCounts.map(item => item.count);
                setProductNames(names);
                setCommentCounts(counts);
                fetchChartHtml(names, counts);
            }
            setLoadingUserData(false);
        })
        .catch(error => {
            console.error('There was a problem with fetching user details:', error);
            setLoadingUserData(false);
        });
    };

    const handleUpdateProfile = () => {
        setFeedback('Updating...');
        fetch(`${process.env.REACT_APP_API_URL}/user/${user.sub}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify({ name: newName, email: newEmail })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            setUserData(data);
            setFeedback('Profile updated successfully!');
            setEditMode(false);
        })
        .catch(error => {
            setFeedback('Failed to update profile.');
            console.error('There was a problem with updating the user profile:', error);
        });
    };

    const fetchChartHtml = async (productNames, commentCounts) => {
        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-rapidapi-key': 'ec62eeff2fmshc64f406709c5eaap19f807jsn23bf4f2a981f',
                'x-rapidapi-host': '24hourcharts.p.rapidapi.com'
            },
            body: JSON.stringify({
                type: 'bar',
                title: 'Comments by Product',
                labels: productNames,
                datasets: [{
                    label: 'Comment Count Base On Product',
                    values: commentCounts
                }]
            })
        };
    
        try {
            const response = await fetch('https://24hourcharts.p.rapidapi.com/v1/charts/html', options);
            const htmlContent = await response.text();
            const blob = new Blob([htmlContent], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            setChartUrl(url);
        } catch (error) {
            console.error('Failed to fetch chart:', error);
        }
    };

    if (isLoading || loadingUserData) {
        return <div>Loading...</div>;
    }

    if (!isAuthenticated) {
        return <div>Please log in</div>;
    }

    return (
        <div>
            {editMode ? (
                <>
                    <div>
                        <label htmlFor="nameInput">Name:</label>
                        <input id="nameInput" value={newName} onChange={e => setNewName(e.target.value)} />
                    </div>
                    <div>
                        <label htmlFor="emailInput">Email:</label>
                        <input id="emailInput" value={newEmail} onChange={e => setNewEmail(e.target.value)} />
                    </div>
                    <button onClick={handleUpdateProfile}>Save Changes</button>
                    <button onClick={() => setEditMode(false)}>Cancel</button>
                    <p>{feedback}</p>
                </>
            ) : (
                <>
                    <div><p>Name: {userData?.name || user.name}</p></div>
                    <div><img src={user.picture} width="70" alt="profile avatar" /></div>
                    <div><p>Email: {userData?.email || user.email}</p></div>
                    <div><p>Auth0Id: {user.sub}</p></div>
                    <div><p>Email verified: {user.email_verified?.toString()}</p></div>
                    <div>
                        <h2>Comments by Product:</h2>
                        {userData?.commentCounts?.length > 0 ? (
                            userData.commentCounts.map(({ productId, productName, count }) => (
                                <div key={productId}>
                                    <p>Product Name: {productName} - Comments: {count}</p>
                                </div>
                            ))
                        ) : (
                            <p>No comments yet.</p>
                        )}
                    </div>
                    {!isLoading && isAuthenticated && chartUrl && userData?.commentCounts?.length > 0 && (
                        <iframe src={chartUrl} title="Chart" style={{ width: '100%', height: '500px', border: 'none' }}></iframe>
                    )}
                    <button onClick={() => setEditMode(true)}>Edit Profile</button>
                    <p>{feedback}</p>
                </>
            )}
        </div>
    );
}

export default Profile;
