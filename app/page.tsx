"use client";

import { useState, useEffect, useRef } from "react";

export default function ChatBox() {
  const [messages, setMessages] = useState([
    { text: "Hi there!", sender: "bot" },
  ]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      audioRef.current = new Audio("/notify.mp3");
    }
  }, []);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isSending) return;

    setIsSending(true);
    const userMessage = { text: input, sender: "user" };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    try {
      const response = await fetch("/api/proxy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });

      const data = await response.json();

      if (data.output) {
        const botResponse = { text: data.output, sender: "bot" };
        setMessages((prev) => [...prev, botResponse]);

        if (audioRef.current) {
          audioRef.current.play().catch((err) => {
            console.warn("Audio playback failed:", err);
          });
        }
      } else {
        console.error("API response did not contain expected 'output'");
      }
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsSending(false);
      setIsTyping(false);
    }
  };

  return (
    <div className="min-h-screen flex lg:flex-row flex-col bg-gray-100">

      {/* Chat Panel */}
      <div className="lg:w-1/3 w-full p-4 flex flex-col h-screen">
        <div className="flex flex-col h-full border rounded-2xl shadow-lg bg-white p-4">

          {/* Messages */}
          <div className="flex flex-col gap-2 overflow-y-auto flex-1 p-2" style={{ scrollbarWidth: "thin" }}>
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`p-2 rounded-lg max-w-xs ${
                  msg.sender === "user"
                    ? "self-end bg-blue-500 text-white"
                    : "self-start text-white bg-gray-800"
                }`}
              >
                {msg.text}
              </div>
            ))}
            {isTyping && (
              <div className="self-start text-gray-500 text-sm animate-pulse">
                Typing...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="pt-2 border-t mt-2">
            <div className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Type a message..."
                className="flex-1 p-2 border text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isSending}
              />
              <button
                onClick={handleSend}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg disabled:opacity-50"
                disabled={isSending}
              >
                {isSending ? "..." : "Send"}
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
