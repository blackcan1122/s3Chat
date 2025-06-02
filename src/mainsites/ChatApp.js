// src/ChatApp.jsx
import { useEffect, useState } from "react";
import { useBackend } from "../contexts/BackendContext";
import getCookie from "../contexts/BackendContext";

export default function ChatApp() {
  const [messages, setMessages] = useState([]);
  const [text, setText]       = useState("");

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
      setText("");
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div className="ChatWindow">
        <ul>
          {messages.map((m, i) => <li key={i}>{m}</li>)}
        </ul>
      </div>

      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type a message…"
      />
      <button onClick={send}>Send</button>
      <button onClick={DeinitializeBackend}>LogOut</button>
    </div>
  );
}
