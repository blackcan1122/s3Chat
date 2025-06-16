// src/ChatApp.jsx
import { useEffect, useState, useRef } from "react";
import { useBackend } from "../contexts/BackendContext";
import getCookie from "../contexts/BackendContext";
import Friendlist from "../components/online_list";

export default function ChatApp() {
  const [messages, setMessages] = useState([]);
  const [text, setText]       = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

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
      setMessages(prev => {
        if (document.hidden) {
          setUnreadCount(prevCount => prevCount + 1);
        }
        return [...prev, evt.data];
      });
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

  const send = () => {
    const ws = BackendConnection.current;
    if (ws?.readyState === WebSocket.OPEN && text.trim() !== "") {
      ws.send(text);
      setText("");
    }
  };

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

    {/* ▸ wrapper keeps chat centred; `show-sidebar` slides the drawer in */}
    <div className={`ChatWithSidebar ${sidebarOpen ? "show-sidebar" : ""}`}>
      <Friendlist />

      {/* Chat history */}
      <div className="ChatWindow" ref={chatWindowRef}>
        <ul>
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
        </div>

        <div className="footer-buttons">
          <button onClick={DeinitializeBackend}>LogOut</button>
        </div>
      </div>
    </div>
  </>
);
}
