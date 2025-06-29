// src/ChatApp.jsx
import { useEffect, useState, useRef } from "react";
import { useBackend } from "../contexts/BackendContext";
import getCookie from "../contexts/BackendContext";
import Friendlist from "../components/online_list";
import { useUserData } from "../contexts/userContext";
import EmojiDrawer from "../components/emoji_drawer";

export default function ChatApp() {
  const [messages, setMessages] = useState([]);
  const [text, setText]       = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const {userData, UpdateTime} = useUserData();
  const [isEmojiDrawerOpen, setIsEmojiDrawerOpen] = useState(false);
  const allEmojisRef = useRef([]);

  // older msg
  const [oldMessages, setOldMessages] = useState([]);

  // room states
  const [currentRoom, setCurrentRoom] = useState(null);
  const [isInRoom, setisInRoom] = useState(false);
  const [etablishedRooms, setEtablishedRooms] = useState([])
  const [selectedFriend, setSelectedFriend] = useState("");


  // Emojis

  const [emojiList, setEmojiList] = useState([]);
  const [page, setPage] = useState(0);
  const pageSize = 57;

  const originalTitle = useRef(document.title);
  const blinkInterval = useRef(null);

  const taRef = useRef(null);
  const chatWindowRef = useRef(null);


  const resizeTextarea = () => {
    if (!taRef.current) return;
    taRef.current.style.height = "auto";
    taRef.current.style.height = `${taRef.current.scrollHeight}px`;
  };

  const scrollToBottom = () => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  };

  useEffect(resizeTextarea, [text]);


  const { BackendConnection, connected, DeinitializeBackend } = useBackend();

  // subscribe to receving a message event
  useEffect(() => {
    if (!connected) return;

    const ws = BackendConnection.current;
    const handler = (evt) => {
      /*
      Message Example:
      {"type": "message",
       "data": "sdfsdf",
       "username": "Blackcan"}


      Backend Response:
      {type: "cmd",
       data: "logout"}


      */
      let msg;
      try {
        msg = JSON.parse(evt.data);
      } catch (e) {
        console.error("Failed to parse message:", evt.data);
      return;
      }

      /*
        a message object from the frontend would look something like this:
        message_data = {
            "type": "message",
            "data": {
                "msg": "Hello, how are you?"
            },
            "from": "alice",           # sender's username
            "room_id": 1,               # recipient's username or group id
            "chat_type": "direct"      # or "group"
        }

      */
      if (msg.type == "message") {
        setMessages(prev => {
          if (document.hidden || msg.room_id != currentRoom) {
            playNotificationSound();
            setUnreadCount(prevCount => prevCount + 1);
            return[...prev];
          }
          return (
            [...prev, msg]
          )
        });
      }
      else if (msg.type == "cmd") {
        if (msg.data === "rejected") {
          alert("You have been kicked from the chat.");
          DeinitializeBackend();
          return;
        }
      }

      else if (msg.type == "cmd") {
        if (msg.data === "logout") {
          alert("You have been logged out.");
          DeinitializeBackend();
          return;
        }
      }

      else {
        console.error("Unknown message type:", evt.type);
      }
    };

    ws.addEventListener("message", handler);

    return () => ws.removeEventListener("message", handler);
  }, [connected, BackendConnection, currentRoom]);

  // scroll to bottom when a new message arrives
    useEffect(() => {
      scrollToBottom();
  }, [messages]);

  // sets title and stuff for inactivity
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        setUnreadCount(0);
        document.title = originalTitle.current;
        if (blinkInterval.current) {
          clearInterval(blinkInterval.current);
          blinkInterval.current = null;
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // updates unreadCount for inactivity
  useEffect(() => {
    if (unreadCount > 0 && document.hidden) {
      if (!blinkInterval.current) {
        blinkInterval.current = setInterval(() => {
          document.title = document.title === originalTitle.current 
            ? `(${unreadCount}) New messages!` 
            : originalTitle.current;
        }, 1000);
      } else {
        document.title = `(${unreadCount}) New messages!`;
      }
    }
  }, [unreadCount]);

  // timer effect for checking for inactivity
  useEffect(() => {
    const AutoLogOutTimer = setInterval(() => {
      if (connected) {
        console.log("Checking for inactivity...");
        let time = userData.last_message_sent - Date.now() - 60 * 1000;
        if (userData.last_message_sent < Date.now() - 60 * 60 * 1000) {
          console.log("Auto-logout due to inactivity");
          DeinitializeBackend();
        }
      }
    }, 60 * 1000);
    return () => clearInterval(AutoLogOutTimer);
  }, [userData.last_message_sent, connected]);

  useEffect(() => {
    const fetchEmojis = async () => {
      try {
        const response = await fetch(`/assets/json/emojiraw.json`);
        const data = await response.json();
        const emojis = data.emojis || [];
        setEmojiList(emojis);
        
        const maxPages = Math.ceil(emojis.length / pageSize);
        allEmojisRef.current = [];
        
        for (let i = 0; i < maxPages; i++) {
          const start = i * pageSize;
          const end = start + pageSize;
          // Pre-process emojis if they need conversion from unicode codes
          const pageEmojis = emojis.slice(start, end).map(emoji => {
            // If emoji is a unicode code point (like "1F600"), convert it
            if (typeof emoji === 'string' && emoji.match(/^[0-9A-F]+$/i)) {
              return String.fromCodePoint(parseInt(emoji, 16));
            }
            return emoji;
          });
          allEmojisRef.current[i] = pageEmojis;
        }

      } catch (error) {
        console.error("Error loading emojis:", error);
      }
    };
    load_old_msg();
    fetchEmojis();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [oldMessages])


  const getEmojiPage = () => {
    return allEmojisRef.current[page] || [];
  };

  const onNextEmojiPage = () => {
    const end = emojiList.length / pageSize
    setPage(prev => {
      if (prev + 1 > end)
      {
        return prev;
      }
      else
      {
        return prev + 1
      }
      
    });
  };

  const onPrevEmojiPage = () => {
    setPage(prev => {
      if (prev === 0)
      {
        return 0;
      }
      else{
        return prev -1;
      }
      
    });
  };

  const onGoToEmojiPage = (number) => {
    setPage(number);
  };

  const load_old_msg = () => {
    async function get_old_msg() {
      const response = await fetch('/api/get_old_msg', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'authorization': `Bearer ${process.env.REACT_APP_API_TOKEN}`
      },
      body: JSON.stringify({ room_id: currentRoom ,oldest_message: oldMessages[0] })
      });

      if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data)) {
        setOldMessages(prev => [...data, ...prev]);
      }
      } else {
      console.error("Failed to fetch old messages");
      }
    }

    get_old_msg();
    
  };

  function playNotificationSound() {
    const audio = new Audio(`/audio/noti.mp3`);
    audio.play();
  };


  const send = () => {
    const ws = BackendConnection.current;
    if (ws?.readyState === WebSocket.OPEN && text.trim() !== "") {
      UpdateTime(Date.now());
      const payload = {
        type: "message",
        data: {
                  msg: text
        },
        from: userData.name, 
        room_id: currentRoom,            
        chat_type: "direct"   
      } 
      ws.send(JSON.stringify(payload));
      setText("");
    }
  };

  const OpenEmojiDrawer = () => {

    setIsEmojiDrawerOpen(prev => {
      if (prev)
      {
        return false;
      }
      else{
        return true;
      }
    });
  };

  const onNewFriendSelected = (selectedFriend) => {
    setMessages([]);
    setSelectedFriend(selectedFriend)
    setisInRoom(true);
    async function get_old_msg() {
      const response = await fetch(`/api/get_room`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'authorization': `Bearer ${process.env.REACT_APP_API_TOKEN}`
        },
        body: JSON.stringify({ 
          user_a: userData.name,
          user_b: selectedFriend
        })
      });

      if (response.ok) {
        const response_data = await response.json();
        setCurrentRoom(response_data["room_id"]);
        setEtablishedRooms(prev => {
          return [...prev, { friend: selectedFriend, roomID: response_data }];
        });
        setOldMessages(response_data["old_messages"] || []);
      } else {
        console.error("Failed to fetch old messages");
      }
    }
    get_old_msg();
  };

  function renderMessages() {
  if (!isInRoom) {
    return <li>Please select a chat to view messages.</li>;
  }

  const allMsgs = [...oldMessages, ...messages];
  
  return allMsgs.map((m, i) => {
    const msgObj = typeof m === "string" ? JSON.parse(m) : m;

    return (
      <li key={msgObj.id || `${msgObj.from || msgObj.username}-${i}`}>
        <strong className="accent sender">{msgObj["from"]}<br /></strong> {typeof msgObj["data"] === "object" ? msgObj["data"].msg : msgObj["data"]}
      </li>
    );
  });
}

return (
  <>
    {/* ▸ hamburger – visible only on narrow screens via CSS */}
    <button
      className="SidebarToggle"
      aria-label="Toggle friend-list"
      onClick={() => setSidebarOpen((open) => !open)}
    >
      <span />   {/* the icon bars are drawn in CSS */}
    </button>

    <div className="footer-buttons">
          <button onClick={DeinitializeBackend}>LogOut</button>
          <span>
            <p>You're Logged in As:</p>{userData.name}
          </span>
    </div>

    {/* ▸ wrapper keeps chat centred; `show-sidebar` slides the drawer in */}
    <div className={`ChatWithSidebar ${sidebarOpen ? "show-sidebar" : ""}`}>
      <Friendlist onSelectCallback={onNewFriendSelected} />
      <div className="Active-Chat">
        <span>You Chat With: <strong className="accent sender">{selectedFriend}</strong></span>
      </div>
      {/* Chat history */}
      <div className="ChatWindow" ref={chatWindowRef}>
        <button onClick={load_old_msg}>show more</button>
        <ul>
         {renderMessages()}
        </ul>
      </div>
      <div className="message-input-wrapper">
        <div className="input-row">
          <textarea
            ref={taRef}
            rows={1}
            value={text}
            placeholder="Type a message…"
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
          />
          <button onClick={send}>Send</button>
          <button onClick={OpenEmojiDrawer}>😀</button>
        </div>
      </div>
    </div>
    {isEmojiDrawerOpen && (
       <div className={`emoji-drawer ${isEmojiDrawerOpen ? "open" : ""}`}>
      <EmojiDrawer
        isOpen={isEmojiDrawerOpen}
        onEmojiSelect={(emoji) => {
          setText((prev) => prev + emoji);
          resizeTextarea();
        }}
        slicedEmojiList={getEmojiPage()}
        onNext={onNextEmojiPage}
        OnPrevious={onPrevEmojiPage}
        currentPage={page}
        maxPages = {emojiList.length / pageSize}
        onSpecific={onGoToEmojiPage}
      />
      </div>
      )}
  </>
);
}
