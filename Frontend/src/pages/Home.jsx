import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../hooks/useTheme';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import axios from 'axios';
import '../styles/home.css';

const SUGGESTIONS = [
  { icon: '💡', text: 'Explain a concept', desc: 'Break down complex topics simply' },
  { icon: '✍️', text: 'Help me write', desc: 'Drafts, emails, essays & more' },
  { icon: '🧠', text: 'Brainstorm ideas', desc: 'Creative thinking & planning' },
  { icon: '🐛', text: 'Debug my code', desc: 'Find and fix issues fast' },
];

const BASE_URL = 'http://localhost:3000';

export default function Home() {
  const [chats, setChats] = useState([]);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [activeChatId, setActiveChatId] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [overlayClass, setOverlayClass] = useState('');
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const socketRef = useRef(null);
  const messagesContainerRef = useRef(null);

  useEffect(() => {
    socketRef.current = io(BASE_URL, { withCredentials: true });

    socketRef.current.on('connect_error', (err) => {
      console.error('Socket connection error:', err.message);
      if (err.message.includes('Authentication')) navigate('/login');
    });

    socketRef.current.on('ai-response', ({ content }) => {
      setIsAiTyping(false);
      setMessages((prev) => [
        ...prev,
        { role: 'model', content, _id: Date.now() },
      ]);
    });

    return () => socketRef.current?.disconnect();
  }, []);

  useEffect(() => {
    axios.get(`${BASE_URL}/api/chat`, { withCredentials: true })
      .then((res) => setChats(res.data.chats || []))
      .catch((err) => {
        if (err.response?.status === 401) navigate('/login');
      });
  }, []);

  useEffect(() => {
    if (!messagesContainerRef.current) return;
    messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
  }, [messages]);

  const handleThemeToggle = () => {
    const goingTo = theme === 'dark' ? 'light' : 'dark';
    setOverlayClass(`sweeping-to-${goingTo}`);
    setTimeout(() => { toggleTheme(); }, 150);
    setTimeout(() => { setOverlayClass(''); }, 400);
  };

  const handleNewChat = async () => {
    try {
      const res = await axios.post(
        `${BASE_URL}/api/chat`,
        { title: 'New Chat' },
        { withCredentials: true }
      );
      const newChat = res.data.chat;
      setChats((prev) => [newChat, ...prev]);
      setActiveChatId(newChat._id);
      setMessages([]);
    } catch (err) {
      if (err.response?.status === 401) navigate('/login');
      console.error('Failed to create chat:', err);
    }
  };

  const handleSelectChat = async (chatId) => {
    if (chatId === activeChatId) return;
    setActiveChatId(chatId);
    setChatLoading(true);
    try {
      const res = await axios.get(
        `${BASE_URL}/api/chat/${chatId}/messages`,
        { withCredentials: true }
      );
      setMessages(res.data.messages || []);
    } catch (err) {
      console.error('Failed to fetch messages:', err);
      setMessages([]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleDeleteChat = async (e, chatId) => {
    e.stopPropagation();
    try {
      await axios.delete(
        `${BASE_URL}/api/chat/${chatId}`,
        { withCredentials: true }
      );
      setChats((prev) => prev.filter((c) => c._id !== chatId));
      if (activeChatId === chatId) {
        setActiveChatId(null);
        setMessages([]);
      }
    } catch (err) {
      console.error('Failed to delete chat:', err);
    }
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
          { withCredentials: true }
        );
        const newChat = res.data.chat;
        setChats((prev) => [newChat, ...prev]);
        setActiveChatId(newChat._id);
        chatId = newChat._id;
      } catch (err) {
        if (err.response?.status === 401) navigate('/login');
        console.error('Failed to create chat:', err);
        return;
      }
    }

    const userMessage = { role: 'user', content: message, _id: Date.now() };
    setMessages((prev) => [...prev, userMessage]);
    setMessage('');
    setIsAiTyping(true);

    socketRef.current.emit('ai-message', {
      chat: chatId,
      content: message,
    });
  };

  const handleSuggestion = (text) => setMessage(text);
  const showWelcome = messages.length === 0 && !chatLoading;

  return (
    <div className="home-container">

      {overlayClass && <div className={`theme-overlay ${overlayClass}`} />}

      {/* Sidebar */}
      <div className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          {!sidebarCollapsed && <span className="sidebar-title">Chats</span>}
          <button
            className="btn-sidebar-toggle"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            title={sidebarCollapsed ? 'Expand' : 'Collapse'}
          >
            {sidebarCollapsed ? '»' : '«'}
          </button>
        </div>

        <button className="btn-new-chat" onClick={handleNewChat} title="New Chat">
          <span>+</span>
          {!sidebarCollapsed && <span className="btn-label">New Chat</span>}
        </button>

        {!sidebarCollapsed && (
          <div className="chats-list">
            {chats.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">💬</div>
                <p className="empty-message">No chats yet.<br />Start a new conversation!</p>
              </div>
            ) : (
              <>
                <div className="chats-section-header">
                  <span className="chats-section-label">Recent</span>
                  <span className="chats-section-count">{chats.length}</span>
                </div>
                {chats.map((chat) => (
                  <div
                    key={chat._id}
                    className={`chat-item ${activeChatId === chat._id ? 'active' : ''}`}
                    onClick={() => handleSelectChat(chat._id)}
                  >
                    <div className="chat-item-icon">💬</div>
                    <div className="chat-item-info">
                      <p className="chat-item-title">{chat.title}</p>
                      <span className="chat-item-date">
                        {new Date(chat.lastActivity).toLocaleDateString()}
                      </span>
                    </div>
                    <button
                      className="btn-delete-chat"
                      onClick={(e) => handleDeleteChat(e, chat._id)}
                      title="Delete chat"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="14" height="14">
                        <polyline points="3 6 5 6 21 6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M19 6l-1 14H6L5 6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M10 11v6" strokeWidth="2" strokeLinecap="round" />
                        <path d="M14 11v6" strokeWidth="2" strokeLinecap="round" />
                        <path d="M9 6V4h6v2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                  </div>
                ))}
              </>
            )}
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="main-content">

        {/* Header */}
        <div className="chat-header">
          <div className="chat-header-icon">✨</div>
          <div className="chat-header-text">
            <h1>ChatGPT Pro</h1>
            <p><span className="status-dot" />Powered by Gemini AI</p>
          </div>
          <button
            className="btn-theme-toggle"
            onClick={handleThemeToggle}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="18" height="18">
                <circle cx="12" cy="12" r="5" strokeWidth="2" />
                <line x1="12" y1="1" x2="12" y2="3" strokeWidth="2" strokeLinecap="round" />
                <line x1="12" y1="21" x2="12" y2="23" strokeWidth="2" strokeLinecap="round" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" strokeWidth="2" strokeLinecap="round" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" strokeWidth="2" strokeLinecap="round" />
                <line x1="1" y1="12" x2="3" y2="12" strokeWidth="2" strokeLinecap="round" />
                <line x1="21" y1="12" x2="23" y2="12" strokeWidth="2" strokeLinecap="round" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" strokeWidth="2" strokeLinecap="round" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" strokeWidth="2" strokeLinecap="round" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="18" height="18">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </button>
        </div>

        {/* Messages or Welcome Screen */}
        {chatLoading ? (
          <div className="chat-messages" />
        ) : showWelcome ? (
          <div className="welcome-screen">
            <div className="welcome-logo">🤖</div>
            <div className="welcome-title-wrapper">
              <h2 className="welcome-title">
                Welcome to <span className="welcome-title-brand">ChatGPT Pro</span>
              </h2>
            </div>
            <p className="welcome-subtitle">
              Your AI-powered assistant. Ask me anything — I'm here to help you think, create, and solve problems.
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
          <div className="chat-messages" ref={messagesContainerRef}>
            {messages.map((msg) => (
              <div key={msg._id} className={`message-bubble ${msg.role}`}>
                <div className="message-content">{msg.content}</div>
              </div>
            ))}
            {isAiTyping && (
              <div className="message-bubble model">
                <div className="message-content typing-indicator">
                  <span /><span /><span />
                </div>
              </div>
            )}
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
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit(e)}
            />
            <button className="btn-send" onClick={handleSubmit} disabled={!message.trim() || isAiTyping}>
              ➤
            </button>
          </div>
          <p className="input-hint">ChatGPT Pro can make mistakes. Consider checking important information.</p>
        </div>

      </div>
    </div>
  );
}