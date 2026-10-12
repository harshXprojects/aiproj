import { useEffect, useRef, useState } from "react";

type Message = {
  role: "user" | "assistant";
  content: string;
};

function App() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  const sendMessage = async () => {
    if (!message.trim() || loading) return;

    const userMessage = message.trim();

    setMessages((previous) => [
      ...previous,
      {
        role: "user",
        content: userMessage,
      },
    ]);

    setMessage("");
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Something went wrong");
      }

      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          content: data.response,
        },
      ]);
    } catch (error) {
      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          content:
            error instanceof Error
              ? `Error: ${error.message}`
              : "Something went wrong",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLTextAreaElement>
  ) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className={`app ${darkMode ? "dark" : "light"}`}>
      <header className="header">
        <div>
          <h1>AI Assistant</h1>
          <span>Powered by Ollama</span>
        </div>

        <button
          className="theme-button"
          onClick={() => setDarkMode((previous) => !previous)}
        >
          {darkMode ? "☀️ Light" : "🌙 Dark"}
        </button>
      </header>

      <main className="chat-container">
        {messages.length === 0 && (
          <div className="welcome">
            <h2>How can I help you?</h2>
            <p>Ask me anything.</p>
          </div>
        )}

        {messages.map((msg, index) => (
          <div
            key={index}
            className={`message ${
              msg.role === "user"
                ? "user-message"
                : "assistant-message"
            }`}
          >
            <div className="message-role">
              {msg.role === "user" ? "You" : "AI"}
            </div>

            <div className="message-content">
              {msg.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="message assistant-message">
            <div className="message-role">AI</div>
            <div className="message-content">
              Thinking...
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </main>

      <footer className="input-container">
        <textarea
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask something..."
          rows={1}
          disabled={loading}
        />

        <button
          onClick={sendMessage}
          disabled={loading || !message.trim()}
        >
          {loading ? "..." : "Send"}
        </button>
      </footer>
    </div>
  );
}

export default App;