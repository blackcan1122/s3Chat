import React, {useState, useEffect, useRef} from "react";
import { useBackend } from "../contexts/BackendContext";
import { useUserData } from "../contexts/userContext";



function Friendlist({onSelectCallback}){
    const { BackendConnection } = useBackend();
    const [userList, setUserList] = useState([]);
    const [error, setError] = useState(null);
    const [initialized, setInitialized] = useState(false)
    const {userData} = useUserData();
    const [selectedIndex, setSelectedIndex] = useState(null);


    const fetchFriends = async () => {
        try {              
            if (userData.role == true) {
                const response = await fetch('/api/all_users', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.REACT_APP_API_TOKEN}`
                },
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            setUserList(data);

            }
            else{
                const response = await fetch('/api/users', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            setUserList(data);

            }
            
            
        } 
        catch (err) {
            console.error('Error fetching friends:', err);
            setError(err.message);
        }
    };

    useEffect(() => {
    
    if (initialized == false)
    {
        fetchFriends();
        setInitialized(true);
    }

    const interval = setInterval(() => {
        fetchFriends();
    }, 30000);

    return () => clearInterval(interval);
}, []);


    if (error) return <div>Error: {error}</div>;

    const onListClick = (friend, index) =>{
        if (userData.name == friend.username){
            return;
        }
        onSelectCallback(friend.username)
        setSelectedIndex(index);
    };
    
    const admin_panel = (friend) => {
        if (userData.role === true) {
            return (
                <>
                    <span> - {friend.is_approved ? "✅" : "❌"}</span>
                    <br />
                    {!friend.is_approved && (
                        <button
                            className="Admin-Button"
                            onClick={async () => {
                                await fetch('/api/approve_user', {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/json',
                                        'authorization': `Bearer ${process.env.REACT_APP_API_TOKEN}`
                                    },
                                    body: JSON.stringify({ username: friend.username })
                                });
                                fetchFriends();
                            }}
                        >
                            Approve
                        </button>
                    )}
                     {friend.is_approved && (
                        <button
                            className="Admin-Button"
                            onClick={
                                async () => {
                                await fetch('/api/reject_user', {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/json',
                                        'authorization': `Bearer ${process.env.REACT_APP_API_TOKEN}`
                                    },
                                    body: JSON.stringify({ username: friend.username })
                                });
                                fetchFriends();
                            }}
                        >
                            Reject
                        </button>
                    )}
                    <button
                        className="Admin-Button"
                        onClick={
                                async () => {
                                await fetch('/api/delete', {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/json',
                                        'authorization': `Bearer ${process.env.REACT_APP_API_TOKEN}`
                                    },
                                    body: JSON.stringify({ username: friend.username })
                                });
                                fetchFriends();
                            }}
                    >
                        Delete
                    </button>
                    <button
                        className="Admin-Button"
                        onClick={
                                async () => {
                                await fetch('/api/force_logout', {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/json',
                                        'authorization': `Bearer ${process.env.REACT_APP_API_TOKEN}`
                                    },
                                    body: JSON.stringify({ username: friend.username })
                                });
                                fetchFriends();
                            }}
                    >
                        Logout
                    </button>
                </>
            );
        }
        return null;
    };

    return (
        <div className="FriendList">
            <h3>Online Users</h3>
            <ul>
                {userList.map((friend, index) => (
                    <li key={index}>
                        <div
                            onClick={() => onListClick(friend, index)}
                            className={`List-Entry${index === selectedIndex ? ' selected' : ''}${friend.username === userData.name ? ' self' : ''}`}
                        >
                            <span className="username">{friend.username} - </span>
                            <span className={`status ${friend.is_online ? 'online' : 'offline'}`}>
                                {friend.is_online ? "Online" : "Offline"}
                            </span>
                            {admin_panel(friend)}
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default Friendlist;