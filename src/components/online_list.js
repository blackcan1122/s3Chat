import React, {useState, useEffect, useRef} from "react";
import { useBackend } from "../contexts/BackendContext";
import { useUserData } from "../contexts/userContext";



function Friendlist({ onSelectCallback, unreadFriends }) {
    const { BackendConnection } = useBackend();
    const [userList, setUserList] = useState([]);
    const [groups, SetGroups] = useState([]);
    const [error, setError] = useState(null);
    const [initialized, setInitialized] = useState(false)
    const {userData} = useUserData();
    const [selectedIndex, setSelectedIndex] = useState(null);
    const [expandAdminIndex, setExpandAdminIndex] = useState(null);
    const [showGroups, setShowGroups] = useState(false);
    const [selectedGroup, setSelectedGroup] = useState();
    const [groupParticipants, setGroupParticipants] = useState([]);
    const [showInviteMenu, setShowInviteMenu] = useState(false);
    const [showKickMenu, setShowKickMenu] = useState(false);
    const [showCreateMenu, setShowCreateMenu] = useState(false);
    const [createGrpName, setCreateGrpName] = useState("");


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

    const get_participants_of_group = async (selectedGroup) => {
        const response = await fetch(`/api/get_participants${selectedGroup.id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'authorization': `Bearer ${process.env.REACT_APP_API_TOKEN}`
            }
        });

        if (response.ok) {
            const data = response.json();
            return data;

        } else {
            return null;
        }
    };

    const get_own_groups = async () => {
        const response = await fetch(`/api/get_groups${userData.name}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'authorization': `Bearer ${process.env.REACT_APP_API_TOKEN}`
            }
        });

        /*
        a group object would look like this:
        created_at: "2025-07-01 19:26:33"
        id: 7
        name: "Die geilen"
        creator: "1"
        type: "group"
        updated_at: "2025-07-01 19:26:33"
        */

        if (response.ok) {
            const data = await response.json();
            SetGroups(data);
        } else {
            console.error("Failed to fetch groups");
        }
    }
    
    useEffect(() => {
        const setowngroups = async () =>{
            await get_own_groups();
        };

        if (showGroups) {
            setowngroups();
        } else {
            SetGroups([]);
        }
    }, [showGroups, userData.name]);

    useEffect(() => {
        if (!selectedGroup || !selectedGroup.id) return;
        console.log(selectedGroup);
        const get_participants = async () => {
           const response = await get_participants_of_group(selectedGroup);
            if (response !== null) {

                setGroupParticipants(prev => {
                    const newParticipants = {
                        key: selectedGroup.id,
                        participants: response
                    };
                    const filtered = prev.filter(item => item.key !== selectedGroup.id);
                    return [...filtered, newParticipants];
                });
            } else {
                console.error("Failed to fetch groups");
            }
        };

        get_participants();
    }, [selectedGroup]);
    


    if (error) return <div>Error: {error}</div>;

    const onListClick = (friend, index) =>{

        if (userData.name == friend.username){
            return;
        }
        onSelectCallback(friend.username)
        setSelectedIndex(index);
    };

    const onGrpClick = (Group, index) =>{
        console.log(Group.name);
        onSelectCallback("", Group)
        setSelectedIndex(index);
    };
    
    const admin_panel = (friend) => {
        if (userData.role === true) {
            return (
                <div className="Admin-Panel-Shown">
                    <span>{friend.is_approved ? "Approved" : "Not Approved"}</span>
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
                </div>
            );
        }
        return null;
    };

    const InviteFriend = (group) => {

        const onlineUsers = userList.filter(user => user.username !== userData.name);

        const [selectedUser, setSelectedUser] = useState(onlineUsers.length > 0 ? onlineUsers[0].username : "");

        const inviteUser = async () => {
            const response = await fetch('/api/add_participant', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'authorization': `Bearer ${process.env.REACT_APP_API_TOKEN}`
            },
            body: JSON.stringify({ user: selectedUser, group_id: group.group.id })
            });

            if (response.ok){
                const updatedParticipants = await get_participants_of_group(group.group);
                setGroupParticipants(prev => {
                    const newParticipants = {
                        key: group.group.id,
                        participants: updatedParticipants
                    };
                    const filtered = prev.filter(item => item.key !== group.group.id);
                    return [...filtered, newParticipants];
                });
            }
        };

        return (
            <div
            onClick={e => {
                e.stopPropagation();
            }}
            >
            <select
                className="select-box"
                value={selectedUser}
                onChange={e => {
                    setSelectedUser(e.target.value);
                }}
            >
                {onlineUsers.map((user, idx) => (
                    <option key={idx} value={user.id}>
                        {user.username}
                    </option>
                ))}
            </select>
            <button className="smaller_btn" onClick={inviteUser}>invite</button>
            </div>
        );
    }

    const KickParticipant = (group) => {
        const onlineUsers = userList.filter(user => user.username !== userData.name);

        const [selectedUser, setSelectedUser] = useState(onlineUsers.length > 0 ? onlineUsers[0].username : "");

        const kickUser = async () => {
            const response = await fetch('/api/remove_participant', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'authorization': `Bearer ${process.env.REACT_APP_API_TOKEN}`
                },
                body: JSON.stringify({ user: selectedUser, group_id: group.group.id })
            });

            if (response.ok){
                // Refetch participants after kicking
                const updatedParticipants = await get_participants_of_group(group.group);
                setGroupParticipants(prev => {
                    const newParticipants = {
                        key: group.group.id,
                        participants: updatedParticipants
                    };
                    const filtered = prev.filter(item => item.key !== group.group.id);
                    return [...filtered, newParticipants];
                });
            }
        };

        return (
            <div
                onClick={e => {
                    e.stopPropagation();
                }}
            >
                <select
                    className="select-box"
                    value={selectedUser}
                    onChange={e => {
                        setSelectedUser(e.target.value);
                    }}
                >
                    {onlineUsers.map((user, idx) => (
                        <option key={idx} value={user.id}>
                            {user.username}
                        </option>
                    ))}
                </select>
                <button className="smaller_btn" onClick={kickUser}>Kick</button>
            </div>
        );
    }

    const CreateGroup = () => {

        const create = async () =>{
            if (!createGrpName || createGrpName.length === 0 || createGrpName.length > 24){
                alert("Group Name either empty or Too Long")
                return;
            }

            const response = await fetch('/api/create_group', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'authorization': `Bearer ${process.env.REACT_APP_API_TOKEN}`
            },
            body: JSON.stringify({ creator: userData.id, group_name: createGrpName })
            });

            if (response.ok){
                await get_own_groups();
            }
        }

        return (
            <div
            onClick={e => {
                e.stopPropagation();
            }}
            >
            <input className="group_btn" onChange={e => {setCreateGrpName(e.target.value)}} placeholder="GroupName"></input>
            <button onClick={create} className="smaller_btn" >Create</button>
            </div>
        );
    }

    const group_panel = (group) => {
        let isAdmin = false;
        if (group.creator == userData.id){
            isAdmin = true;
        }

        const AdminMenu = () => {
            return(
            <>
                <button className="group_btn" onClick={() => {
                    setShowInviteMenu(prev => !prev);
                }}>Invite Friend</button>

                {showInviteMenu ? <InviteFriend group={group} /> : ''}

                <button className="group_btn" onClick={() => {
                    setShowKickMenu(prev => !prev);
                }}>Kick Participant</button>

                {showKickMenu ? <KickParticipant group={group} /> : ''}

            </>
            )

        }

        const leave_grp = async () =>{
            const response = await fetch('/api/remove_participant', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'authorization': `Bearer ${process.env.REACT_APP_API_TOKEN}`
                },
                body: JSON.stringify({ user: userData.name, group_id: group.id })
            });

            if (response.ok){
                // Refetch participants after kicking
                const updatedParticipants = await get_participants_of_group(group);
                setGroupParticipants(prev => {
                    const newParticipants = {
                        key: group.id,
                        participants: updatedParticipants
                    };
                    const filtered = prev.filter(item => item.key !== group.id);
                    return [...filtered, newParticipants];
                });
            }
        }

        const ParticipantMenu = () =>{
            return(
                <>
                <button className="group_btn" onClick={leave_grp}>
                    Leave
                </button>
                </>
            )
        }

        return(
            groupParticipants.filter(participants => participants.key === group.id)
                .map((participants, idx) => (
                    <React.Fragment key={idx}>
                        <ul>
                            {participants.participants.map((participant, pidx) => {
                                const user = userList.find(u => u.username === participant.username);
                                const isOnline = user ? user.is_online : false;
                                return (
                                    <li key={pidx}>
                                        {participant.username} -
                                        <span className={`status ${isOnline ? 'online' : 'offline'}`}>
                                            {isOnline ? " Online " : " Offline "}
                                        </span>
                                    </li>
                                );
                            })}
                        </ul>
                        {isAdmin ? AdminMenu() : ParticipantMenu() }
                    </React.Fragment>
                ))
        )
    };

    const amountUnread = (username) => {
        return unreadFriends.filter(name => name === username).length;
    } 

    const createUnreadMsg = (username) =>{
        let amount = amountUnread(username);
        if (amount > 0){
            return(
                <div className="amount-unread">
                <span>{amount}</span>
                </div>
            )
        }

    }

    const groups_tab = () => {
        return (
            <div className="FriendList">
                <h3><span>Your Groups</span></h3>
                <button className="smaller_btn" onClick={() => setShowCreateMenu(prev => !prev)}>Create Group</button>
                {showCreateMenu ? CreateGroup() : ''}
                <ul>
                    {groups.map((group, index) => (
                        <li key={index}>
                            <div
                                onClick={() => onGrpClick(group, index)}
                                className={`List-Entry${index === selectedIndex ? ' selected' : ''}${group.username === userData.name ? ' self' : ''}${unreadFriends.includes(group.name) ? ' unread' : ''}`}
                            >
                                <span className="Group">{group.name}</span>
                                {createUnreadMsg(group.name)}
                                <div
                                    className="expand"
                                    onClick={e => {
                                        e.stopPropagation();
                                        if (expandAdminIndex === index) {
                                            setExpandAdminIndex(null);
                                        } else {
                                            setExpandAdminIndex(index);
                                            setSelectedGroup(group);
                                        }
                                    }}
                                />
                                {expandAdminIndex === index ? group_panel(group) : ''}
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        );
    };

    const online_users = () => {
        return(
        <div className="FriendList">
                    <h3>Online Users</h3>
                    <ul>
                        {userList.map((friend, index) => (
                            <li key={index}>
                                <div
                                    onClick={() => onListClick(friend, index)}
                                    className={`List-Entry${index === selectedIndex ? ' selected' : ''}${friend.username === userData.name ? ' self' : ''}${unreadFriends.includes(friend.username) ? ' unread' : ''}`}
                                >
                                    <span className="username">{friend.username} - </span>
                                    <span className={`status ${friend.is_online ? 'online' : 'offline'}`}>
                                        {friend.is_online ? "Online " : "Offline "}
                                    </span>
                                    {createUnreadMsg(friend.username)}
                                    {userData.role === true && (
                                        <div className="expand" onClick={(e) => {
                                            e.stopPropagation();
                                            setExpandAdminIndex(expandAdminIndex === index ? null : index);
                                        }}>   
                                        </div>
                                    )}
                                    {expandAdminIndex === index ? admin_panel(friend) : ''}
                                </div>
                            </li>
                        ))}
                    </ul>
            </div>
        )
    };

    /*
    <button className="full-sized" onClick={() => {
                if (showGroups)
                {
                    setShowGroups(false);
                }
                else
                {
                    setShowGroups(true);
                }
            }}>
                    {showGroups ? "Show Online Users" : "Show Groups"}
                </button>
    */

    return (
        <div className="sidebar">
            <div className="button-wrap">
                <div onClick={()=>{setShowGroups(false)}} className={`left${showGroups === false ? ' active' : ''}`}><span className="friends-menu-btn">Friends</span></div>
                <div onClick={()=>{setShowGroups(true)}} className={`right${showGroups === true ? ' active' : ''}`}><span className="group-menu-btn">Groups</span></div>
            </div>
                
                
                {(() => {
                    if (showGroups === false){
                        return(
                            online_users()
                        )
                    }
                    else{
                        return(
                            groups_tab()
                        )
                    }
                })()}
        </div>
    );
}

export default Friendlist;