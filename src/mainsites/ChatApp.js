// src/ChatApp.jsx
import { useEffect, useState, useRef } from "react";
import { useBackend } from "../contexts/BackendContext";
import getCookie from "../contexts/BackendContext";

export default function ChatApp() {
  const [messages, setMessages] = useState([]);
  const [text, setText]       = useState("");

  const taRef = useRef(null);

    const resizeTextarea = () => {
    if (!taRef.current) return;
    taRef.current.style.height = "auto";
    taRef.current.style.height = `${taRef.current.scrollHeight}px`;
  };

  useEffect(resizeTextarea, [text]);


  const { BackendConnection, connected, DeinitializeBackend } = useBackend();

  useEffect(() => {
    if (!connected) return;

    const ws       = BackendConnection.current;
    const handler  = (evt) =>
      setMessages(prev => [...prev, evt.data]);

    ws.addEventListener("message", handler);

    return () => ws.removeEventListener("message", handler);
  }, [connected, BackendConnection]);


  const send = () => {
    const ws = BackendConnection.current;
    if (ws?.readyState === WebSocket.OPEN && text.trim() !== "") {
      ws.send(text);
      setText("");          // triggers the effect above → textarea shrinks
    }
  };

  return (
    <>
      {/* Chat history */}
      <div className="ChatWindow">
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
    </>
  );
}
