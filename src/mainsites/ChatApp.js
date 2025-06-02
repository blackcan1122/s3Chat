// src/ChatApp.jsx
import { useEffect, useRef, useState } from "react";

export default function ChatApp() {
  const wsRef = useRef(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8000/ws/chat");
    wsRef.current = ws;
    ws.onopen = () => {
      console.log("Authentication initialized");
      ws.send("MARCEL");
    }
    ws.onmessage = (evt) =>
      setMessages((prev) => 
        {
          console.log(...prev);
          return [...prev, evt.data];
        });

    return () => ws.close();
  }, []);

  const send = () => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(text);
      setText("");
    }
  };

  return (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
    <div className="ChatWindow"> 
      <ul>{messages.map((m, i) => <li key={i}>{m}</li>)}</ul>
    </div>
    <input value={text} onChange={(e) => setText(e.target.value)} />
    <button onClick={send}>Send</button>
  </div>
);
}
