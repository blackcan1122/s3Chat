import React, {useState, useEffect, useRef} from "react";
import { useBackend } from "../contexts/BackendContext";
import { useUserData } from "../contexts/userContext";




function Friendlist(){
    const { BackendConnection } = useBackend();
    const [userList, setUserList] = useState([]);
    const [error, setError] = useState(null);
    const [initialized, setInitialized] = useState(false)
    const {userData} = useUserData();

    useEffect(() => {
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

    const approval_state = (friend) => {
        if(userData.role == true){
            return(
                <>
                <span>{String(friend.is_approved)}</span>
                </>
            )
        }
    }

    return (
        <div className="FriendList">
            <h3>Online Users</h3>
            <ul>
                {userList.map((friend, index) => (
                    <li key={index}>
                        <div className="List-Entry">
                            <span className="username">{friend.username} - </span>
                            <span className={`status ${friend.is_online ? 'online' : 'offline'}`}>
                                {friend.is_online ? "Online" : "Offline"}
                            </span>
                            - {approval_state(friend)}
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default Friendlist;