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

      if (msg.type == "message") {
        let formattedMessage = `${msg.username}: ${msg.data}`;
        setMessages(prev => {
          if (document.hidden) {
            playNotificationSound();
            setUnreadCount(prevCount => prevCount + 1);
          }
          return [...prev, formattedMessage];
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
  }, [connected, BackendConnection]);

    useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
  }

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
  }

  const onGoToEmojiPage = (number) => {
    setPage(number);
  }

  const load_old_msg = () => {
    async function get_old_msg() {
      const response = await fetch('/api/get_old_msg', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'authorization': `Bearer ${process.env.REACT_APP_API_TOKEN}`
      },
      body: JSON.stringify({ oldest_message: oldMessages[0] })
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
    
  }

  function playNotificationSound() {
    const audio = new Audio(`/audio/noti.mp3`);
    audio.play();
  }


  const send = () => {
    const ws = BackendConnection.current;
    if (ws?.readyState === WebSocket.OPEN && text.trim() !== "") {
      UpdateTime(Date.now());
      ws.send(text);
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
      <Friendlist />

      {/* Chat history */}
      <div className="ChatWindow" ref={chatWindowRef}>
        <button onClick={load_old_msg}>show more</button>
        <ul>
          {oldMessages.map((m, i) => (
            <li key={i}>{m}</li>
          ))}
          {messages.map((m, i) => (
            <li key={i}>{m}</li>
          ))}
        </ul>
      </div>

      {/* Sticky footer */}
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
