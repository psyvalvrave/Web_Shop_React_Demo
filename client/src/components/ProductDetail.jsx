import React, { useEffect, useState } from 'react';
import { useParams, useOutletContext  } from 'react-router-dom';
import { useAuthToken } from "../AuthTokenContext";
import '../style/style.css'; 
import '../style/comment.css'; 

function ProductDetail() {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [comments, setComments] = useState([]);
    const [commentText, setCommentText] = useState('');
    const [editedCommentText, setEditedCommentText] = useState('');
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [showCommentForm, setShowCommentForm] = useState(false);
    const [loading, setLoading] = useState(true);
    const { accessToken } = useAuthToken();
    const [userId, setUserId] = useState(null);  // State to store the current user's ID
    const { addToCart } = useOutletContext();

    useEffect(() => {
        const fetchProductDetails = async () => {
            try {
                const productResponse = await fetch(`${process.env.REACT_APP_API_URL}/products/${id}`);
                const productData = await productResponse.json();
                const commentsResponse = await fetch(`${process.env.REACT_APP_API_URL}/products/${id}/comments`);
                const commentsData = await commentsResponse.json();

                if (productResponse.ok) {
                    setProduct(productData);
                } else {
                    throw new Error(productData.message || "Error fetching product details");
                }
                if (commentsResponse.ok) {
                    setComments(commentsData);
                } else {
                    throw new Error(commentsData.message || "Error fetching comments");
                }

                if (accessToken) {
                    const userDetails = await fetch(`${process.env.REACT_APP_API_URL}/user-details`, {
                        headers: {
                            Authorization: `Bearer ${accessToken}`,
                        },
                    });
                    const userData = await userDetails.json();
                    setUserId(userData.id);
                }
            } catch (error) {
                console.error('Fetch error:', error);
            }
            setLoading(false);
        };

        fetchProductDetails();
    }, [id, accessToken]);

    const handleCommentSubmit = async (e) => {
        e.preventDefault(); 
        if (!commentText.trim()) return;
    
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/products/${id}/comments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                },
                body: JSON.stringify({ content: commentText })
            });
    
            const data = await response.json(); 
    
            if (!response.ok) {
                const errorMessage = data.message || "Failed to post comment";
                console.error('Error posting comment:', errorMessage);
                alert(errorMessage); 
                return; 
            }
    
            await fetchComments();
            setComments([...comments, data]);
            setCommentText('');
            setShowCommentForm(false);
        } catch (error) {
            console.error('Network error or no response from server:', error);
            alert('Network error or no response from server'); 
        }
    };
    
    

    const startEdit = (comment) => {
        if (userId !== comment.userId) {
            alert("You can only edit your own comments.");
        } else {
            setEditingCommentId(comment.id);
            setEditedCommentText(comment.content);
        }
    };

    const cancelEdit = () => {
        setEditingCommentId(null);
        setEditedCommentText('');
    };
    
    const saveEdit = async (e, id) => {
        e.preventDefault();
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/comments/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                },
                body: JSON.stringify({ content: editedCommentText })
            });

            if (response.ok) {
                const updatedComment = await response.json();
                setComments(comments.map(comment => comment.id === id ? updatedComment : comment));
                setEditingCommentId(null);
                setEditedCommentText('');
                fetchComments(); 
            } else {
                throw new Error("Failed to update comment");
            }
        } catch (error) {
            console.error('Error updating comment:', error);
        }
    };

    const deleteComment = async (id, commentUserId) => {
        if (userId !== commentUserId) {
            alert("You can only delete your own comments.");
        } else {
            try {
                const response = await fetch(`${process.env.REACT_APP_API_URL}/comments/${id}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                    },
                });
    
                if (response.ok) {
                    setComments(comments.filter(comment => comment.id !== id));
                    fetchComments();
                } else {
                    throw new Error("Failed to delete comment");
                }
            } catch (error) {
                console.error('Error deleting comment:', error);
            }
        }
    };

    const fetchComments = async () => {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/products/${id}/comments`);
        const data = await response.json();
        if (response.ok) {
            setComments(data);
        } else {
            console.error("Failed to fetch comments");
        }
    };
    

    if (loading) {
        return <p>Loading...</p>;
    }

    return product ? (
        <div>
            <h1>{product.name}</h1>
            <p>${product.price}</p>
            <img src={product.imageUrl || 'https://upload.wikimedia.org/wikipedia/commons/6/65/No-Image-Placeholder.svg'} 
                 alt={product.name}  />
            {accessToken ? (
                <div>
                    <button onClick={() => setShowCommentForm(!showCommentForm)}>
                        {showCommentForm ? 'Cancel' : 'Add Comment'}
                    </button>
                    <button onClick={() => addToCart(product, 1)}>Add to Cart</button>
                    {showCommentForm && (
                        <form onSubmit={handleCommentSubmit}>
                            <input
                                type="text"
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                                placeholder="Write a comment..."
                                required
                            />
                            <button type="submit">Post Comment</button>
                        </form>
                    )}
                </div>
            ) : (
                <p>You must be logged in to post comments.</p>
            )}
            <h2>Comments:</h2>
            {comments.length > 0 ? (
                <ul className="comment_list">
                    {comments.map(comment => (
                        <li className="comment" key={comment.id}>
                            {editingCommentId === comment.id ? (
                                <>
                                    <input
                                        type="text"
                                        value={editedCommentText}
                                        onChange={(e) => setEditedCommentText(e.target.value)}
                                    />
                                    <button onClick={(e) => saveEdit(e, comment.id)}>Save</button>
                                    <button onClick={() => cancelEdit()}>Cancel</button>
                                </>
                            ) : (
                                <>
                                    <span>{comment.content}</span> - <em>{comment.user?.name || "Unknown User"}</em>

                                    {userId === comment.userId && (
                                        <>
                                            <button onClick={() => startEdit(comment)}>Edit</button>
                                            <button onClick={() => deleteComment(comment.id, comment.userId)}>Delete</button>
                                        </>
                                    )}
                                </>
                            )}
                        </li>
                    ))}
                </ul>
            ) : <p>No comments yet.</p>}
            
        </div>
        
    ) : <p>Product not found.</p>;
}

export default ProductDetail;
