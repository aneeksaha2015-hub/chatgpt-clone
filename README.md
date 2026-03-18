# 🚀 ChatGPT Pro – Full Stack AI Chat Application

A modern, full-stack AI-powered chat application that delivers an intelligent and persistent conversational experience. Built with a scalable architecture, it integrates **LLM capabilities, vector search (RAG), and real-time chat management features**.

---

🔗 Live Demo:

👉 https://chatgpt-pro.onrender.com





🌐 Live Preview

Experience the application live here:

➡️ https://chatgpt-pro.onrender.com






🖥️ Demo Highlights

Real-time AI chat powered by Gemini

Persistent conversations with memory (RAG)

Chat management (Pin, Search, Delete, Rename)

Fully responsive UI (Mobile + Desktop)

## 🌟 Features

### 🤖 AI-Powered Conversations

* Generate intelligent responses using **Google Gemini API**
* Context-aware replies with conversational memory
* Fast and efficient response streaming

---

### 🧠 Memory System (RAG Architecture)

#### 🔹 Short-Term Memory

* Maintains current conversation context
* Ensures continuity within active chats

#### 🔹 Long-Term Memory (Vector Search)

* Uses **vector embeddings**
* Stored in **Pinecone vector database**
* Enables:

  * Context recall from past conversations
  * Semantic search across chats

---

### 💬 Chat Management System

* ➕ Create new chats
* 🗑️ Delete chats
* 📌 Pin important chats
* 🔍 Search chats (real-time filtering)
* ✏️ Rename chats
* 📋 Copy messages
* 🧾 Organized chat history (Pinned + Recent)

---

### ⚡ Real-Time Communication

* Powered by **Socket.IO**
* Instant message updates
* Smooth user experience

---

### 📱 Fully Responsive UI

* Optimized for:

  * Mobile devices
  * Tablets
  * Desktop
* Clean and modern interface inspired by ChatGPT

---

## 🏗️ Tech Stack

### Frontend

* **React.js**
* **Tailwind CSS** (partially)
* Custom CSS (advanced responsive design)
* Axios (API communication)

---

### Backend

* **Node.js**
* **Express.js**
* **Socket.IO** (real-time communication)
* JWT Authentication
* REST API architecture

---

### AI & Data Layer

* **Google Gemini API** (LLM)
* **Pinecone** (Vector Database)
* Embeddings for semantic search

---

### Database

* **MongoDB**
* Stores:

  * Users
  * Chats
  * Messages metadata

---

## 🧩 System Architecture

```
Client (React)
      ↓
Backend (Node + Express + Socket.IO)
      ↓
-----------------------------------------
| Gemini API (LLM)                     |
| Pinecone (Vector Memory / RAG)      |
| MongoDB (Persistent Data Storage)   |
-----------------------------------------
```

---

## ⚙️ Installation & Setup

### 1️⃣ Clone the repository

```bash
git clone https://github.com/your-username/chatgpt-clone.git
cd chatgpt-clone
```

---

### 2️⃣ Install dependencies

#### Backend

```bash
cd Backend
npm install
```

#### Frontend

```bash
cd ../frontend
npm install
```

---

### 3️⃣ Environment Variables

Create a `.env` file in the **Backend** folder:

```env
PORT=3000
MONGODB_URI=your_mongodb_connection
JWT_SECRET=your_secret

GEMINI_API_KEY=your_gemini_key

PINECONE_API_KEY=your_pinecone_key
PINECONE_ENV=your_env
PINECONE_INDEX=your_index_name
```

---

### 4️⃣ Run the app

#### Start backend

```bash
cd Backend
node server.js
```

#### Start frontend

```bash
cd frontend
npm run dev
```

---

## 🚀 Deployment

### Backend

* Deployed on **Render**

### Frontend

* Build using:

```bash
npm run build
```

* Serve via backend (`public` folder)

---

## 📂 Project Structure

```
CHATGPT-PRO/
│
├── Backend/
│   ├── src/
│   │   ├── routes/
│   │   ├── models/
│   │   ├── services/
│   │   ├── sockets/
│   │   └── db/
│   └── public/   (built frontend)
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   └── styles/
│
└── README.md
```

---

## 🧠 Key Concepts Used

* Retrieval-Augmented Generation (RAG)
* Vector Embeddings
* Semantic Search
* Real-Time Systems
* Scalable Full-Stack Architecture

---

## 🔒 Security Features

* JWT-based authentication
* Secure API routes
* Environment variable protection

---

## 📈 Future Improvements

* Voice input/output 🎤
* File upload & analysis 📄
* Multi-modal AI (images + text)
* Better chat categorization
* Cloud-based memory scaling

---

## 🤝 Contributing

Contributions are welcome!
Feel free to fork the repo and submit a pull request.

---


## 💡 Author

**Aneek Saha**

---

## ⭐ Final Note

This project demonstrates a **production-level AI chat system** integrating:

* LLM capabilities
* Vector databases
* Real-time communication
* Advanced UI/UX

Built with scalability, performance, and modern AI architecture in mind.

---
