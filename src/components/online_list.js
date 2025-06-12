import React, {useState, useEffect, useRef} from "react";
import { useBackend } from "../contexts/BackendContext";




function Friendlist(){
    const { BackendConnection } = useBackend();
    const [userData, setUserData] = useState([]);
    const [error, setError] = useState(null);
    const [initialized, setInitialized] = useState(false)

    useEffect(() => {
        const fetchFriends = async () => {
            try {
                console.log('Try to get friends');
                
                const response = await fetch('/api/users', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
                
                console.log('Response status:', response.status);
                console.log('Response headers:', response.headers);
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const data = await response.json();
                console.log('Parsed data:', data);
                setUserData(data);
                
            } 
            catch (err) {
                console.error('Error fetching friends:', err);
                setError(err.message);
            }
        };
    
    if (initialized == false)
    {
        fetchFriends();
        setInitialized(true);
    }

    const interval = setInterval(() => {
        fetchFriends();
    }, 30000);

    // Cleanup function to clear interval when component unmounts
    return () => clearInterval(interval);
}, []);


    if (error) return <div>Error: {error}</div>;

    return (
        <div className="FriendList">
            <h3>Online Users</h3>
            <ul>
                {userData.map((friend, index) => (
                    <li key={index}>
                        <span className="username">{friend.username} - </span>
                        <span className={`status ${friend.is_online ? 'online' : 'offline'}`}>
                            {friend.is_online ? "Online" : "Offline"}
                        </span>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default Friendlist;