import React, { useState, useEffect, useRef } from "react";
import { useTheme } from "../hooks/useTheme";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import toast, { Toaster } from "react-hot-toast";
import "../styles/home.css";

const SUGGESTIONS = [
  {
    icon: "💡",
    text: "Explain a concept",
    desc: "Break down complex topics simply",
  },
  { icon: "✍️", text: "Help me write", desc: "Drafts, emails, essays & more" },
  {
    icon: "🧠",
    text: "Brainstorm ideas",
    desc: "Creative thinking & planning",
  },
  { icon: "🐛", text: "Debug my code", desc: "Find and fix issues fast" },
];

const BASE_URL = "https://chatgpt-pro.onrender.com";

export default function Home({ user, setUser }) {
  const [chats, setChats] = useState([]);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [activeChatId, setActiveChatId] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [overlayClass, setOverlayClass] = useState("");
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);
  const [chatsLoading, setChatsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [renamingChatId, setRenamingChatId] = useState(null);
  const [renameValue, setRenameValue] = useState("");
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [systemPrompt, setSystemPrompt] = useState("");
  const [showSystemPrompt, setShowSystemPrompt] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const socketRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const renameInputRef = useRef(null);
  const abortRef = useRef(false);

  useEffect(() => {
    socketRef.current = io(BASE_URL, { withCredentials: true });
    socketRef.current.on("connect_error", (err) => {
      if (err.message.includes("Authentication")) navigate("/login");
    });
    socketRef.current.on("ai-response", ({ content }) => {
      if (abortRef.current) {
        abortRef.current = false;
        return;
      }
      setIsAiTyping(false);
      setMessages((prev) => [
        ...prev,
        { role: "model", content, _id: Date.now(), createdAt: new Date() },
      ]);
    });
    return () => socketRef.current?.disconnect();
  }, []);

  useEffect(() => {
    setChatsLoading(true);
    axios
      .get(`${BASE_URL}/api/chat`, { withCredentials: true })
      .then((res) => setChats(res.data.chats || []))
      .catch((err) => {
        if (err.response?.status === 401) navigate("/login");
      })
      .finally(() => setChatsLoading(false));
  }, []);

  useEffect(() => {
    if (!messagesContainerRef.current) return;
    messagesContainerRef.current.scrollTop =
      messagesContainerRef.current.scrollHeight;
  }, [messages]);

  useEffect(() => {
    if (renamingChatId && renameInputRef.current) {
      renameInputRef.current.focus();
      renameInputRef.current.select();
    }
  }, [renamingChatId]);

  const handleScroll = () => {
    const el = messagesContainerRef.current;
    if (!el) return;
    const isNearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 100;
    setShowScrollBtn(!isNearBottom);
  };

  const scrollToBottom = () => {
    if (!messagesContainerRef.current) return;
    messagesContainerRef.current.scrollTo({
      top: messagesContainerRef.current.scrollHeight,
      behavior: "smooth",
    });
  };

  const handleThemeToggle = () => {
    const goingTo = theme === "dark" ? "light" : "dark";
    setOverlayClass(`sweeping-to-${goingTo}`);
    setTimeout(() => {
      toggleTheme();
    }, 150);
    setTimeout(() => {
      setOverlayClass("");
    }, 400);
  };

  const handleLogout = async () => {
    try {
      await axios.post(
        `${BASE_URL}/api/auth/logout`,
        {},
        { withCredentials: true },
      );
      setUser(null);
      navigate("/login");
    } catch (err) {
      toast.error("Logout failed");
    }
  };

  const refreshChats = async () => {
    const res = await axios.get(`${BASE_URL}/api/chat`, {
      withCredentials: true,
    });
    setChats(res.data.chats || []);
  };

  const handleNewChat = async () => {
    try {
      const res = await axios.post(
        `${BASE_URL}/api/chat`,
        { title: "New Chat" },
        { withCredentials: true },
      );
      const newChat = res.data.chat;
      await refreshChats();
      setActiveChatId(newChat._id);
      setMessages([]);
    } catch (err) {
      if (err.response?.status === 401) navigate("/login");
      toast.error("Failed to create chat");
    }
  };

  const handleSelectChat = async (chatId) => {
    if (chatId === activeChatId) return;
    setActiveChatId(chatId);
    setChatLoading(true);
    try {
      const res = await axios.get(`${BASE_URL}/api/chat/${chatId}/messages`, {
        withCredentials: true,
      });
      setMessages(res.data.messages || []);
    } catch (err) {
      setMessages([]);
      toast.error("Failed to load messages");
    } finally {
      setChatLoading(false);
    }
  };

  const handleDeleteChat = async (e, chatId) => {
    e.stopPropagation();
    try {
      await axios.delete(`${BASE_URL}/api/chat/${chatId}`, {
        withCredentials: true,
      });
      setChats((prev) => prev.filter((c) => c._id !== chatId));
      if (activeChatId === chatId) {
        setActiveChatId(null);
        setMessages([]);
      }
      toast.success("Chat deleted");
    } catch (err) {
      toast.error("Failed to delete chat");
    }
  };

  const handlePinChat = async (e, chatId) => {
    e.stopPropagation();
    try {
      const res = await axios.patch(
        `${BASE_URL}/api/chat/${chatId}/pin`,
        {},
        { withCredentials: true },
      );
      setChats((prev) =>
        prev
          .map((c) =>
            c._id === chatId ? { ...c, pinned: res.data.chat.pinned } : c,
          )
          .sort(
            (a, b) =>
              b.pinned - a.pinned ||
              new Date(b.lastActivity) - new Date(a.lastActivity),
          ),
      );
      toast.success(res.data.chat.pinned ? "Chat pinned" : "Chat unpinned");
    } catch (err) {
      toast.error("Failed to pin chat");
    }
  };

  const handleStartRename = (e, chat) => {
    e.stopPropagation();
    setRenamingChatId(chat._id);
    setRenameValue(chat.title);
  };

  const handleRenameSubmit = async (chatId) => {
    if (!renameValue.trim()) {
      setRenamingChatId(null);
      return;
    }
    try {
      await axios.patch(
        `${BASE_URL}/api/chat/${chatId}/rename`,
        { title: renameValue },
        { withCredentials: true },
      );
      setChats((prev) =>
        prev.map((c) => (c._id === chatId ? { ...c, title: renameValue } : c)),
      );
      toast.success("Chat renamed");
    } catch (err) {
      toast.error("Failed to rename chat");
    } finally {
      setRenamingChatId(null);
    }
  };

  const handleCopyMessage = (content) => {
    navigator.clipboard
      .writeText(content)
      .then(() => {
        toast.success("Copied to clipboard");
      })
      .catch(() => {
        toast.error("Failed to copy");
      });
  };

  const handleStopResponse = () => {
    abortRef.current = true;
    setIsAiTyping(false);
    toast("Response stopped", { icon: "⏹️" });
  };

  const handleRegenerate = async () => {
    if (!activeChatId || isAiTyping) return;
    const lastUserMsg = [...messages].reverse().find((m) => m.role === "user");
    if (!lastUserMsg) return;
    setMessages((prev) => {
      const reversed = [...prev].map((m, i) => ({ ...m, i })).reverse();
      const lastModel = reversed.find((m) => m.role === "model");
      if (lastModel) return prev.filter((_, i) => i !== lastModel.i);
      return prev;
    });
    setIsAiTyping(true);
    toast("Regenerating response...", { icon: "🔄" });
    socketRef.current.emit("ai-message", {
      chat: activeChatId,
      content: lastUserMsg.content,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    let chatId = activeChatId;
    if (!chatId) {
      try {
        const res = await axios.post(
          `${BASE_URL}/api/chat`,
          { title: message.slice(0, 40) },
          { withCredentials: true },
        );
        const newChat = res.data.chat;
        await refreshChats();
        setActiveChatId(newChat._id);
        chatId = newChat._id;
      } catch (err) {
        if (err.response?.status === 401) navigate("/login");
        toast.error("Failed to create chat");
        return;
      }
    }
    const userMessage = {
      role: "user",
      content: message,
      _id: Date.now(),
      createdAt: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setMessage("");
    setIsAiTyping(true);
    abortRef.current = false;
    socketRef.current.emit("ai-message", {
      chat: chatId,
      content: message,
      systemPrompt: systemPrompt || null,
    });
  };

  const handleSuggestion = (text) => setMessage(text);

  const formatTime = (date) => {
    if (!date) return "";
    return new Date(date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const pinnedChats = chats.filter(
    (c) =>
      c.pinned && c.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );
  const recentChats = chats.filter(
    (c) =>
      !c.pinned && c.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );
  const showWelcome = messages.length === 0 && !chatLoading;
  const lastModelMessage = [...messages]
    .reverse()
    .find((m) => m.role === "model");

  return (
    <div className="home-container">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 2500,
          style: {
            background: "rgba(20, 18, 50, 0.95)",
            color: "rgba(255,255,255,0.9)",
            border: "1px solid rgba(99,102,241,0.3)",
            borderRadius: "12px",
            backdropFilter: "blur(20px)",
            fontSize: "0.85rem",
          },
          success: { iconTheme: { primary: "#10b981", secondary: "white" } },
          error: { iconTheme: { primary: "#ef4444", secondary: "white" } },
        }}
      />

      {overlayClass && <div className={`theme-overlay ${overlayClass}`} />}

      {/* Settings Modal */}
      {showSettings && (
        <SettingsModal
          user={user}
          setUser={setUser}
          onClose={() => setShowSettings(false)}
          BASE_URL={BASE_URL}
        />
      )}

      {/* Sidebar */}
      <div className={`sidebar ${sidebarCollapsed ? "collapsed" : ""}`}>
        <div className="sidebar-header">
          {!sidebarCollapsed && <span className="sidebar-title">Chats</span>}

          {/* Desktop collapse button */}
          <button
            className="btn-sidebar-toggle desktop-only"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            title={sidebarCollapsed ? "Expand" : "Collapse"}
          >
            {sidebarCollapsed ? "»" : "«"}
          </button>

          {/* Mobile close button */}
          <button
            className="btn-sidebar-toggle mobile-only"
            onClick={() => setSidebarCollapsed(true)}
          >
            ☰
          </button>
        </div>

        <button
          className="btn-new-chat"
          onClick={handleNewChat}
          title="New Chat"
        >
          <span>+</span>
          {!sidebarCollapsed && <span className="btn-label">New Chat</span>}
        </button>

        {!sidebarCollapsed && (
          <>
            <div className="search-wrapper">
              <svg
                className="search-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                width="14"
                height="14"
              >
                <circle cx="11" cy="11" r="8" strokeWidth="2" />
                <line
                  x1="21"
                  y1="21"
                  x2="16.65"
                  y2="16.65"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
              <input
                type="text"
                className="search-input"
                placeholder="Search chats..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  className="search-clear"
                  onClick={() => setSearchQuery("")}
                >
                  ×
                </button>
              )}
            </div>

            <div className="chats-list">
              {chatsLoading ? (
                <>
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="chat-item-skeleton">
                      <div className="skeleton-icon" />
                      <div className="skeleton-info">
                        <div className="skeleton-title" />
                        <div className="skeleton-date" />
                      </div>
                    </div>
                  ))}
                </>
              ) : chats.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon">💬</div>
                  <p className="empty-message">
                    No chats yet.
                    <br />
                    Start a new conversation!
                  </p>
                </div>
              ) : (
                <>
                  {pinnedChats.length > 0 && (
                    <>
                      <div className="chats-section-header">
                        <span className="chats-section-label">📌 Pinned</span>
                        <span className="chats-section-count">
                          {pinnedChats.length}
                        </span>
                      </div>
                      {pinnedChats.map((chat) => (
                        <ChatItem
                          key={chat._id}
                          chat={chat}
                          activeChatId={activeChatId}
                          renamingChatId={renamingChatId}
                          renameValue={renameValue}
                          renameInputRef={renameInputRef}
                          setRenameValue={setRenameValue}
                          onSelect={handleSelectChat}
                          onDelete={handleDeleteChat}
                          onPin={handlePinChat}
                          onStartRename={handleStartRename}
                          onRenameSubmit={handleRenameSubmit}
                          setRenamingChatId={setRenamingChatId}
                        />
                      ))}
                    </>
                  )}
                  {recentChats.length > 0 && (
                    <>
                      <div className="chats-section-header">
                        <span className="chats-section-label">Recent</span>
                        <span className="chats-section-count">
                          {recentChats.length}
                        </span>
                      </div>
                      {recentChats.map((chat) => (
                        <ChatItem
                          key={chat._id}
                          chat={chat}
                          activeChatId={activeChatId}
                          renamingChatId={renamingChatId}
                          renameValue={renameValue}
                          renameInputRef={renameInputRef}
                          setRenameValue={setRenameValue}
                          onSelect={handleSelectChat}
                          onDelete={handleDeleteChat}
                          onPin={handlePinChat}
                          onStartRename={handleStartRename}
                          onRenameSubmit={handleRenameSubmit}
                          setRenamingChatId={setRenamingChatId}
                        />
                      ))}
                    </>
                  )}
                  {searchQuery &&
                    pinnedChats.length === 0 &&
                    recentChats.length === 0 && (
                      <div className="empty-state">
                        <div className="empty-state-icon">🔍</div>
                        <p className="empty-message">
                          No chats found for "{searchQuery}"
                        </p>
                      </div>
                    )}
                </>
              )}
            </div>
          </>
        )}
      </div>

      {/* Main Content */}
      <div className="main-content">
        {/* Header */}
        <div className="chat-header">
          <button
            className="btn-sidebar-toggle mobile-only"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          >
            ☰
          </button>
          <div className="chat-header-icon">✨</div>
          <div className="chat-header-text">
            <h1>ChatGPT Pro</h1>
            <p>
              <span className="status-dot" />
              Powered by Gemini AI
            </p>
          </div>
          <div className="header-actions">
            <button
              className="btn-theme-toggle"
              onClick={handleThemeToggle}
              title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            >
              {theme === "dark" ? (
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  width="18"
                  height="18"
                >
                  <circle cx="12" cy="12" r="5" strokeWidth="2" />
                  <line
                    x1="12"
                    y1="1"
                    x2="12"
                    y2="3"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <line
                    x1="12"
                    y1="21"
                    x2="12"
                    y2="23"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <line
                    x1="4.22"
                    y1="4.22"
                    x2="5.64"
                    y2="5.64"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <line
                    x1="18.36"
                    y1="18.36"
                    x2="19.78"
                    y2="19.78"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <line
                    x1="1"
                    y1="12"
                    x2="3"
                    y2="12"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <line
                    x1="21"
                    y1="12"
                    x2="23"
                    y2="12"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <line
                    x1="4.22"
                    y1="19.78"
                    x2="5.64"
                    y2="18.36"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <line
                    x1="18.36"
                    y1="5.64"
                    x2="19.78"
                    y2="4.22"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              ) : (
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  width="18"
                  height="18"
                >
                  <path
                    d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </button>
            <div className="header-user">
              <div className="user-avatar">
                {user?.fullName?.firstName?.[0]?.toUpperCase()}
                {user?.fullName?.lastName?.[0]?.toUpperCase()}
              </div>
              <div className="user-dropdown">
                <div className="user-dropdown-info">
                  <span className="user-dropdown-name">
                    {user?.fullName?.firstName} {user?.fullName?.lastName}
                  </span>
                  <span className="user-dropdown-email">{user?.email}</span>
                </div>
                <button
                  className="btn-dropdown-item"
                  onClick={() => setShowSettings(true)}
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    width="14"
                    height="14"
                  >
                    <circle cx="12" cy="12" r="3" strokeWidth="2" />
                    <path
                      d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"
                      strokeWidth="2"
                    />
                  </svg>
                  Settings
                </button>
                <button
                  className="btn-dropdown-item"
                  onClick={() => setShowSystemPrompt(true)}
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    width="14"
                    height="14"
                  >
                    <path
                      d="M12 20h9"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  System Prompt
                </button>
                <div className="dropdown-divider" />
                <button className="btn-logout" onClick={handleLogout}>
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    width="14"
                    height="14"
                  >
                    <path
                      d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <polyline
                      points="16 17 21 12 16 7"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <line
                      x1="21"
                      y1="12"
                      x2="9"
                      y2="12"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* System Prompt Bar */}
        {showSystemPrompt && (
          <div className="system-prompt-bar">
            <span className="system-prompt-label">🧠 System Prompt</span>
            <input
              className="system-prompt-input"
              placeholder="e.g. You are a helpful coding assistant who only answers programming questions..."
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
            />
            <button
              className="btn-system-prompt-clear"
              onClick={() => {
                setSystemPrompt("");
                setShowSystemPrompt(false);
              }}
            >
              ×
            </button>
          </div>
        )}

        {/* Messages or Welcome Screen */}
        {chatLoading ? (
          <div className="chat-messages" />
        ) : showWelcome ? (
          <div className="welcome-screen">
            <div className="welcome-logo">🤖</div>
            <div className="welcome-title-wrapper">
              <h2 className="welcome-title">
                Welcome to{" "}
                <span className="welcome-title-brand">ChatGPT Pro</span>
              </h2>
            </div>
            <p className="welcome-subtitle">
              Your AI-powered assistant. Ask me anything — I'm here to help you
              think, create, and solve problems.
            </p>
            <div className="suggestion-grid">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s.text}
                  className="suggestion-card"
                  onClick={() => handleSuggestion(s.text)}
                >
                  <span className="suggestion-icon">{s.icon}</span>
                  <span className="suggestion-text">{s.text}</span>
                  <span className="suggestion-desc">{s.desc}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div
            className="chat-messages"
            ref={messagesContainerRef}
            onScroll={handleScroll}
          >
            {messages.map((msg) => (
              <div key={msg._id} className={`message-bubble ${msg.role}`}>
                <div className="message-content">
                  {msg.role === "model" ? (
                    <MarkdownMessage content={msg.content} />
                  ) : (
                    msg.content
                  )}
                </div>
                <div className="message-footer">
                  {msg.createdAt && (
                    <span className="message-time">
                      {formatTime(msg.createdAt)}
                    </span>
                  )}
                  <button
                    className="btn-copy-message"
                    onClick={() => handleCopyMessage(msg.content)}
                    title="Copy message"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      width="12"
                      height="12"
                    >
                      <rect
                        x="9"
                        y="9"
                        width="13"
                        height="13"
                        rx="2"
                        ry="2"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
            {isAiTyping && (
              <div className="message-bubble model">
                <div className="message-content typing-indicator">
                  <span />
                  <span />
                  <span />
                </div>
              </div>
            )}
            {showScrollBtn && (
              <button className="btn-scroll-bottom" onClick={scrollToBottom}>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  width="16"
                  height="16"
                >
                  <polyline
                    points="6 9 12 15 18 9"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            )}
          </div>
        )}

        {/* Regenerate / Stop buttons */}
        {!showWelcome && (
          <div className="regenerate-wrapper">
            {isAiTyping ? (
              <button className="btn-stop" onClick={handleStopResponse}>
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  width="12"
                  height="12"
                >
                  <rect x="6" y="6" width="12" height="12" rx="2" />
                </svg>
                Stop generating
              </button>
            ) : lastModelMessage ? (
              <button className="btn-regenerate" onClick={handleRegenerate}>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  width="14"
                  height="14"
                >
                  <polyline
                    points="1 4 1 10 7 10"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M3.51 15a9 9 0 1 0 .49-3.5"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Regenerate response
              </button>
            ) : null}
          </div>
        )}

        {/* Input */}
        <div className="chat-input">
          <div className="chat-input-wrapper">
            <input
              type="text"
              placeholder="Ask me anything..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit(e)}
            />
            <button
              className="btn-send"
              onClick={handleSubmit}
              disabled={!message.trim() || isAiTyping}
            >
              ➤
            </button>
          </div>
          <p className="input-hint">
            ChatGPT Pro can make mistakes. Consider checking important
            information.
          </p>
        </div>
      </div>
    </div>
  );
}

// ===== SETTINGS MODAL =====
function SettingsModal({ user, setUser, onClose, BASE_URL }) {
  const [form, setForm] = useState({
    firstName: user?.fullName?.firstName || "",
    lastName: user?.fullName?.lastName || "",
    email: user?.email || "",
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!form.firstName.trim()) newErrors.firstName = "First name is required";
    if (!form.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!form.email.trim()) newErrors.email = "Email is required";
    if (form.newPassword && form.newPassword !== form.confirmNewPassword) {
      newErrors.confirmNewPassword = "Passwords do not match";
    }
    if (form.newPassword && !form.currentPassword) {
      newErrors.currentPassword =
        "Current password is required to set a new password";
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const res = await axios.patch(
        `${BASE_URL}/api/auth/settings`,
        {
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          currentPassword: form.currentPassword || undefined,
          newPassword: form.newPassword || undefined,
        },
        { withCredentials: true },
      );
      setUser(res.data.user);
      toast.success("Settings saved!");
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save settings");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Settings</h2>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="modal-section-title">Profile</div>

          <div className="modal-row">
            <div className="modal-form-group">
              <label>First Name</label>
              <input
                name="firstName"
                value={form.firstName}
                onChange={handleChange}
                placeholder="John"
              />
              {errors.firstName && (
                <span className="modal-error">{errors.firstName}</span>
              )}
            </div>
            <div className="modal-form-group">
              <label>Last Name</label>
              <input
                name="lastName"
                value={form.lastName}
                onChange={handleChange}
                placeholder="Doe"
              />
              {errors.lastName && (
                <span className="modal-error">{errors.lastName}</span>
              )}
            </div>
          </div>

          <div className="modal-form-group">
            <label>Email</label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
            />
            {errors.email && (
              <span className="modal-error">{errors.email}</span>
            )}
          </div>

          <div className="modal-section-title" style={{ marginTop: "20px" }}>
            Change Password
          </div>
          <p className="modal-section-hint">
            Leave blank to keep your current password
          </p>

          <div className="modal-form-group">
            <label>Current Password</label>
            <input
              name="currentPassword"
              type="password"
              value={form.currentPassword}
              onChange={handleChange}
              placeholder="••••••••"
            />
            {errors.currentPassword && (
              <span className="modal-error">{errors.currentPassword}</span>
            )}
          </div>

          <div className="modal-row">
            <div className="modal-form-group">
              <label>New Password</label>
              <input
                name="newPassword"
                type="password"
                value={form.newPassword}
                onChange={handleChange}
                placeholder="••••••••"
              />
            </div>
            <div className="modal-form-group">
              <label>Confirm New Password</label>
              <input
                name="confirmNewPassword"
                type="password"
                value={form.confirmNewPassword}
                onChange={handleChange}
                placeholder="••••••••"
              />
              {errors.confirmNewPassword && (
                <span className="modal-error">{errors.confirmNewPassword}</span>
              )}
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn-modal-cancel"
              onClick={onClose}
            >
              Cancel
            </button>
            <button type="submit" className="btn-modal-save" disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ===== MARKDOWN MESSAGE =====
function MarkdownMessage({ content }) {
  return (
    <ReactMarkdown
      components={{
        code({ node, inline, className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || "");
          return !inline && match ? (
            <SyntaxHighlighter
              style={oneDark}
              language={match[1]}
              PreTag="div"
              customStyle={{
                borderRadius: "10px",
                fontSize: "0.85rem",
                margin: "8px 0",
              }}
              {...props}
            >
              {String(children).replace(/\n$/, "")}
            </SyntaxHighlighter>
          ) : (
            <code className="inline-code" {...props}>
              {children}
            </code>
          );
        },
      }}
    >
      {content}
    </ReactMarkdown>
  );
}

// ===== CHAT ITEM COMPONENT =====
function ChatItem({
  chat,
  activeChatId,
  renamingChatId,
  renameValue,
  renameInputRef,
  setRenameValue,
  onSelect,
  onDelete,
  onPin,
  onStartRename,
  onRenameSubmit,
  setRenamingChatId,
}) {
  return (
    <div
      className={`chat-item ${activeChatId === chat._id ? "active" : ""} ${chat.pinned ? "pinned" : ""}`}
      onClick={() => onSelect(chat._id)}
    >
      <div className="chat-item-icon">{chat.pinned ? "📌" : "💬"}</div>
      <div className="chat-item-info">
        {renamingChatId === chat._id ? (
          <input
            ref={renameInputRef}
            className="rename-input"
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            onBlur={() => onRenameSubmit(chat._id)}
            onKeyDown={(e) => {
              if (e.key === "Enter") onRenameSubmit(chat._id);
              if (e.key === "Escape") setRenamingChatId(null);
            }}
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <p className="chat-item-title">{chat.title}</p>
        )}
        <span className="chat-item-date">
          {new Date(chat.lastActivity).toLocaleDateString()}
        </span>
      </div>
      <div className="chat-item-actions">
        <button
          className="btn-chat-action"
          onClick={(e) => onPin(e, chat._id)}
          title={chat.pinned ? "Unpin" : "Pin"}
        >
          <svg
            viewBox="0 0 24 24"
            fill={chat.pinned ? "currentColor" : "none"}
            stroke="currentColor"
            width="12"
            height="12"
          >
            <path
              d="M12 2l2.4 6.4L21 9.2l-5 4.8 1.2 6.8L12 17.6l-5.2 3.2 1.2-6.8-5-4.8 6.6-.8z"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <button
          className="btn-chat-action"
          onClick={(e) => onStartRename(e, chat)}
          title="Rename"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            width="12"
            height="12"
          >
            <path
              d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <button
          className="btn-chat-action delete"
          onClick={(e) => onDelete(e, chat._id)}
          title="Delete"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            width="12"
            height="12"
          >
            <polyline
              points="3 6 5 6 21 6"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M19 6l-1 14H6L5 6"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M10 11v6M14 11v6M9 6V4h6v2"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
