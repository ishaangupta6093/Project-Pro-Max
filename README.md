# 🍽️ ProofPlate — Real-Time Kitchen Trust

## 🧠 Overview

With the rapid rise of cloud kitchens, food preparation has become invisible to consumers. While ratings reflect taste and delivery experience, they fail to provide insight into hygiene and safety.

**ProofPlate bridges this gap by introducing real-time, verifiable proof of kitchen hygiene.**

---

## 🚨 Problem Statement

Cloud kitchens operate behind closed doors, making it difficult for consumers to assess hygiene conditions.  

- Ratings are often misleading  
- Complaints are delayed and inconsistent  
- No real-time visibility into kitchen practices  

👉 This creates a **critical trust gap in food safety**

---

## 💡 Our Solution

ProofPlate replaces blind trust with **live, transparent, and verifiable hygiene proof**.

Instead of relying on static reviews, it introduces:
- Real-time kitchen verification  
- Community-driven validation  
- Dynamic hygiene scoring  

---

## ✨ Key Features

- 📸 **Live Kitchen Proof**  
  Real-time, timestamped front & kitchen images  

- 👀 **Community Verification**  
  Users vote on cleanliness (clean / unhygienic)  

- 📊 **Dynamic Hygiene Score**  
  Based on:
  - Community votes  
  - Recency of proof  
  - Kitchen self-check  

- ⏱️ **Recency Indicator**  
  Shows how recently the kitchen was verified  

- 📋 **Quick Checklist**  
  One-tap hygiene inputs for staff  

- 🔍 **Transparent Scoring**  
  Clear breakdown of how scores are calculated  

---

## 🏗️ Tech Stack

### 💻 Frontend
- HTML5, CSS3  
- Vanilla JavaScript  
- Responsive UI with role-based interface (Customer / Cloud Kitchen)  
- Local state management using browser storage  

### ⚙️ Backend
- Node.js, Express.js  
- REST APIs for verification, voting, and scoring logic  
- Multer (for image uploads)  
- CORS (for client-server communication)  

### 🗄️ Data Layer
- JSON-based storage (`db.json`)  
- Stores restaurants, complaints, votes, and verification data  

### 🧠 System Flow
- Frontend interacts with backend via APIs  
- Backend handles:
  - Time-bound verification  
  - User inputs and votes  
  - Dynamic hygiene score calculation  

---
## ⚙️ How It Works

1. 🍳 Kitchen captures real-time images  
2. 📤 Images uploaded to Firebase  
3. 📋 Checklist submitted  
4. 🧮 Score calculated dynamically  
5. 👀 Users view proof and vote  
6. 🔄 Score updates in real-time  

---

## 📸 Demo Flow

1. Open kitchen dashboard  
2. Capture front + kitchen images  
3. Submit proof  
4. View updated hygiene score  
5. User validates via voting  

---

## 🧮 Scoring System

Score = (0.6 × Community) + (0.25 × Recency) + (0.15 × Checklist)

---


- Community → User votes  
- Recency → Last verification time  
- Checklist → Self-reported hygiene  

---

## 🎯 Why ProofPlate?

- Moves from **reviews → real proof**  
- Encourages **continuous hygiene compliance**  
- Builds **consumer trust instantly**  
- Designed for **fast-paced kitchen environments**  

---

## 🚀 Future Scope

- AI-assisted hygiene detection  
- Integration with delivery platforms  
- Verified kitchen badges  
- Automated compliance alerts  

---
