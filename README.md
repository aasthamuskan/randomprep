# 🚀 RandomPrep - AI-Powered Technical Interview Preparation Platform

RandomPrep is a futuristic, interactive, subject-wise technical preparation platform designed to help software engineers, computer science students, and interview candidates master core technical subjects and crack high-paying tech interviews.

---

## 📌 Table of Contents
- [🎯 What is RandomPrep? (App Kya Hai?)](#-what-is-randomprep-app-kya-hai)
- [❓ Why Was RandomPrep Created? (Kiu Hai?)](#-why-was-randomprep-created-kiu-hai)
- [🌟 Key Features & Highlights (Kaisa Hai?)](#-key-features--highlights-kaisa-hai)
- [📚 Supported Technical Subjects (14 Core Subjects)](#-supported-technical-subjects-14-core-subjects)
- [🏗️ System Architecture & Tech Stack](#%EF%B8%8F-system-architecture--tech-stack)
- [🚀 Quick Start & Installation Guide](#-quick-start--installation-guide)
- [📡 API Documentation](#-api-documentation)
- [🤝 Contributing & License](#-contributing--license)

---

## 🎯 What is RandomPrep? (App Kya Hai?)

**RandomPrep** is a full-stack web application designed for comprehensive, subject-oriented technical interview preparation. Instead of forcing users into generic day-by-day practice schedules, RandomPrep organizes technical curriculum into **14 deep, subject-specific modules** covering both computer science fundamentals and modern enterprise software engineering.

Users can practice real interview questions, type or dictate answers using built-in **speech recognition**, simulate timed interview pressure with **holographic countdown timers**, and analyze performance history.

---

## ❓ Why Was RandomPrep Created? (Kiu Hai?)

1. **Eliminate Superficial Day-Based Roadmaps**: Traditional interview prep tools often dump random daily questions without structured subject hierarchy. RandomPrep categorizes questions strictly by subject and subtopic.
2. **Comprehensive Core CS & Enterprise Coverage**: Candidates often struggle with low-level concepts (Pointers, Memory, OS, Computer Networks) alongside high-level architectures (System Design, Microservices, Distributed Systems, Software Engineering). RandomPrep bridges this exact gap.
3. **Interactive & Realistic Interview Practice**: Offers voice-to-text dictation, answer evaluation, STAR-method guidance, and practice history tracking.
4. **Zero-Dependency Resilience**: The backend is engineered with a hybrid data pipeline that loads rich local JSON curriculum datasets seamlessly even when a local database server (MongoDB) is offline.

---

## 🌟 Key Features & Highlights (Kaisa Hai?)

- 💎 **Sci-Fi Glassmorphic UI**: High-tech holographic design system built with React, Tailwind CSS, and ambient particle effects.
- 🎯 **14 Subject Modules**: Deep subtopic breakdown across programming languages, CS core, system design, and web stacks.
- 🎙️ **Voice Answer Input**: Built-in Web Speech API integration for dictating verbal interview answers.
- ⏱️ **Holographic Interview Timer**: Real-time countdown timer with visual status indicators.
- 📝 **STAR Method Guidelines**: Built-in tips for structuring behavioral and technical answers using Situation, Task, Action, Result.
- 📊 **Progress & History Tracking**: Stores practice sessions and evaluates performance over time.
- ⚡ **Offline-Ready Fallback**: Backend automatically serves local JSON seed files when MongoDB daemon is disconnected.

---

## 📚 Supported Technical Subjects (14 Core Subjects)

1. **Computer Networks**: Network Fundamentals (IP/MAC, Subnetting, CIDR, ARP), Routing & Switching (Store-and-Forward vs Cut-Through, Distance-Vector, Loop Prevention), Transport & Application Layer (TCP 3-Way Handshake, SYN Flood, Flow vs Congestion Control).
2. **Distributed Systems**: Architecture & Models (CAP Theorem), Communication & RPC (gRPC, Protobuf, Execution Semantics), Synchronization & Coordination (Lamport & Vector Clocks, Raft Consensus), Consistency & Replication (Quorum Math $R + W > N$, CRDTs).
3. **Software Engineering**: OOP Core Principles (SOLID, Composition over Inheritance), SDLC (Agile, Waterfall, V-Model, Technical Debt), Software Design & Code Quality (Cohesion, Coupling, Cyclomatic Complexity), Testing & Maintenance (Testing Pyramid, Mutation Testing).
4. **Frontend & Web Technologies**: CSS (Box Model, Flexbox, Grid), Tailwind CSS (Utility-First, JIT Purging), JavaScript (DOM, Event Delegation, Async/Virtual DOM), Next.js Framework (SSR, SSG, ISR, App Router).
5. **Node.js & Backend**: Architecture & Event Loop (V8, Libuv phases, microtasks), Streams & Buffers (Piping, Backpressure), Cluster & Child Processes (Multi-Core Scaling, Worker processes).
6. **Data Structures & Algorithms (DSA)**: 10 paradigms covering Arrays, Binary Search, Sorting & Divide-and-Conquer, Two Pointers & Sliding Window, Recursion & Backtracking, Greedy Algorithms, Dynamic Programming (DP), Trees/BST, Hashing, and Graphs/Dijkstra.
7. **Database & SQL**: Database Design & Normalization (1NF-4NF/BCNF), Transactions & ACID (2PL, MVCC), Storage & Indexing (B+ Trees), DDL/DML/DCL/TCL, Advanced SQL (Window Functions, EXPLAIN Plans).
8. **Operating Systems**: Process Management & Scheduling, Virtual Memory & Demand Paging, Synchronization & Mutexes/Semaphores, File & I/O Systems.
9. **C Language**: Constructs, Operators, Pointers, DMA, Strings, Structs/Unions.
10. **C++**: OOPs, Memory Management, STL, Exception Handling, Templates, Design Patterns.
11. **Python**: Core Constructs, Data Types, OOPs, Comprehensions, Generators, Decorators.
12. **Java**: Core Syntax, I/O, Collections, Multithreading, ConcurrentHashMap, Locks.
13. **Microservices Architecture**: Saga Pattern, Circuit Breaker, Service Discovery, Event-Driven Architecture, API Gateway.
14. **System Design (HLD/LLD)**: High-Level Design (Sharding, Load Balancing), Low-Level Design, Design Patterns.

---

## 🏗️ System Architecture & Tech Stack

### Frontend
- **Framework**: React 18 (Vite)
- **Styling**: Tailwind CSS (Glassmorphism & Neon Cyan/Purple Design System)
- **Icons & UI**: Lucide React, Custom Holographic Controls

### Backend
- **Runtime**: Node.js & Express.js
- **Database**: MongoDB (Mongoose ORM) + Local JSON Dataset Fallback Engine
- **REST APIs**: Modular Controllers and Routes (`questionController.js`, `practiceController.js`)

---

## 🚀 Quick Start & Installation Guide

### Prerequisites
- [Node.js](https://nodejs.org/) (v16+ recommended)
- [Git](https://git-scm.com/)

### 1. Clone the Repository
```bash
git clone https://github.com/aasthamuskan/randomprep.git
cd randomprep
```

### 2. Install Dependencies

**Root dependencies:**
```bash
npm install
```

**Client dependencies:**
```bash
cd client
npm install
cd ..
```

**Server dependencies:**
```bash
cd server
npm install
cd ..
```

### 3. Run Development Servers
Start both client and server concurrently from the root directory:
```bash
npm run dev
```

- **Frontend Application**: `http://localhost:5173`
- **Backend API Server**: `http://localhost:5000`

---

## 📡 API Documentation

### Subjects & Curriculum
- `GET /api/questions/subjects` - Returns all 14 technical subjects with question counts and subtopic breakdowns.
- `GET /api/questions?subject=<SubjectName>` - Retrieves questions for a specific subject.

### Practice Sessions
- `POST /api/practice/submit` - Submits an answer for evaluation and saves history.
- `GET /api/practice/history` - Retrieves user practice session history.

---

## 🤝 Contributing & License

Contributions, issues, and feature requests are welcome!
Fell free to check the [GitHub Repository](https://github.com/aasthamuskan/randomprep).

Designed with ❤️ for tech interview success.
