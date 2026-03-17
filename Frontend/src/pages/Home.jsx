import React, { useState, useEffect } from 'react';
import { useTheme } from '../hooks/useTheme';
import '../styles/home.css';

const SUGGESTIONS = [
  { icon: '💡', text: 'Explain a concept', desc: 'Break down complex topics simply' },
  { icon: '✍️', text: 'Help me write', desc: 'Drafts, emails, essays & more' },
  { icon: '🧠', text: 'Brainstorm ideas', desc: 'Creative thinking & planning' },
  { icon: '🐛', text: 'Debug my code', desc: 'Find and fix issues fast' },
];

export default function Home() {
  const [chats, setChats] = useState([]);
  const [message, setMessage] = useState('');
  const [activeChatId, setActiveChatId] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [overlayClass, setOverlayClass] = useState('');
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {}, []);

  const handleThemeToggle = () => {
    // Step 1 — show overlay with destination theme colour
    const goingTo = theme === 'dark' ? 'light' : 'dark';
    setOverlayClass(`sweeping-to-${goingTo}`);

    // Step 2 — switch theme at peak opacity (halfway through)
    setTimeout(() => {
      toggleTheme();
    }, 150);

    // Step 3 — remove overlay after animation finishes
    setTimeout(() => {
      setOverlayClass('');
    }, 400);
  };

  const handleNewChat = () => console.log('Creating new chat...');
  const handleSelectChat = (chatId) => setActiveChatId(chatId);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    console.log('Sending:', message);
    setMessage('');
  };

  const handleSuggestion = (text) => setMessage(text);

  return (
    <div className="home-container">

      {/* Full page theme transition overlay */}
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
                <span className="chats-section-label">Recent</span>
                {chats.map((chat) => (
                  <div
                    key={chat.id}
                    className={`chat-item ${activeChatId === chat.id ? 'active' : ''}`}
                    onClick={() => handleSelectChat(chat.id)}
                  >
                    <p>{chat.title}</p>
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

        {/* Messages */}
        <div className="chat-messages">
          <div className="welcome-screen">
            <div className="welcome-logo">🤖</div>
            <h2 className="welcome-title">Welcome to ChatGPT Pro</h2>
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
        </div>

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
            <button className="btn-send" onClick={handleSubmit} disabled={!message.trim()}>
              ➤
            </button>
          </div>
          <p className="input-hint">ChatGPT Pro can make mistakes. Consider checking important information.</p>
        </div>

      </div>
    </div>
  );
}