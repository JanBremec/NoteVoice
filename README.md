# 📚 NoteVoice: Democratizing Knowledge Access

> **Empowering visually impaired students with AI-driven, accessible document intelligence.**

![Python](https://img.shields.io/badge/Python-3.9%2B-blue?style=for-the-badge&logo=python)
![FastAPI](https://img.shields.io/badge/FastAPI-0.95%2B-009688?style=for-the-badge&logo=fastapi)
![Gemini](https://img.shields.io/badge/AI-Gemini%202.5%20Flash-8E75B2?style=for-the-badge&logo=google)
![FAISS](https://img.shields.io/badge/Vector%20DB-FAISS-005A9C?style=for-the-badge)

## 🌍 Societal Impact

In an increasingly digital educational landscape, accessibility remains a critical barrier. **NoteVoice** bridges this gap by transforming static educational materials—PDFs, slides, and lectures—into an interactive, voice-first knowledge base.

By leveraging advanced Retrieval-Augmented Generation (RAG), we enable blind and visually impaired users to "converse" with their study materials. This isn't just a screen reader; it's an **intelligent study partner** that understands context, summarizes complex topics, and delivers answers optimized for auditory comprehension.

## 🚀 Technical Complexity

NoteVoice implements a production-grade **Hybrid RAG Pipeline** designed for accuracy, speed, and relevance.

### 🧠 Hybrid Search Architecture
Unlike standard RAG implementations that rely solely on vector similarity, our engine utilizes a **Hybrid Search** mechanism to ensure no detail is lost:

1.  **Dense Retrieval (Semantic)**: Uses `sentence-transformers` (all-MiniLM-L6-v2) and **FAISS** to capture the *meaning* and conceptual relationships behind the user's query.
2.  **Sparse Retrieval (Keyword)**: Implements **SQLite FTS5** to catch exact keyword matches, crucial for specific terminology often found in academic texts.
3.  **Reciprocal Rank Fusion**: Results from both streams are normalized and fused using a weighted scoring algorithm (`alpha * semantic + (1-alpha) * keyword`), ensuring the most relevant context reaches the LLM.

### 🤖 Gemini 2.5 Flash Integration
We leverage Google's **Gemini 2.5 Flash** for its speed and reasoning capabilities:
- **Metadata Extraction**: Automatically analyzes uploaded documents to generate descriptive titles and subject categorizations.
- **TTS-Optimized Synthesis**: The model is prompted to generate answers specifically structured for Text-to-Speech engines—concise, clear, and free of unpronounceable formatting.

## 🛠️ Getting Started

### Prerequisites
- Python 3.9+
- A Google Cloud API Key for Gemini

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/JanBremec/NoteVoice.git
    cd NoteVoice
    ```

2.  **Install dependencies**
    ```bash
    pip install -r requirements.txt
    ```

3.  **Configure API Key**
    Open `main.py` and set your `API_KEY` (or better, use an environment variable).

### Usage

1.  **Start the Server**
    ```bash
    python -m uvicorn main:app --reload
    ```
    The API will launch at `http://127.0.0.1:8000`.

2.  **Access the Interface**
    Open `index.html` in your browser (or navigate to `http://localhost:8000` if serving statically).

3.  **Upload & Ask**
    - Upload your study materials (PDF, PPTX, etc.).
    - Ask questions like "What is the main concept of the lecture?"
    - Listen to the AI-generated response.

## 🧩 Tech Stack

- **Backend**: FastAPI, Uvicorn
- **AI & LLM**: Google Gemini 2.5 Flash, LangChain (concepts)
- **Vector Store**: FAISS (Facebook AI Similarity Search)
- **Database**: SQLite (with FTS5)
- **NLP**: Sentence-Transformers, NumPy
- **Document Processing**: `pdfplumber`, `python-docx`, `python-pptx`

---

*Built with ❤️ for a more accessible future.*
