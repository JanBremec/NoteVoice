import os
import shutil
from typing import List, Optional
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.responses import JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from google import genai
import uvicorn

import json
from rag import FaissRAG, Extractor

# Initialize FastAPI
app = FastAPI(title="Blind/Visually Impaired RAG App")

# CORS (allow all for demo)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize RAG
# Ensure DB and Index exist or will be created
rag = FaissRAG(db_path="faiss_rag.db", index_path="faiss.index")

# Initialize Gemini Client
# HARDCODED API KEY AS PER USER'S EXISTING model.py - IN PRODUCTION USE ENV VARS
API_KEY = "YOUR_API_KEY"
client = genai.Client(api_key=API_KEY)

# Models
class QuestionRequest(BaseModel):
    question: str
    subject: Optional[str] = None

class LectureRequest(BaseModel):
    text: str
    title: str
    subject: str

# Routes

# Helper function for Gemini metadata generation
def generate_metadata_with_gemini(text: str, existing_subjects: List[str]) -> dict:
    prompt = f"""
    You are a helpful assistant. Analyze the following document text and generate a title and a subject for it.
    Extend your answer to further help student with learning and understanding. No more than 200 chars.
    
    Existing subjects: {", ".join(existing_subjects)}
    
    If the document fits well into one of the existing subjects, use that subject.
    Otherwise, create a new, concise subject name (e.g., "Biology", "History", "Physics").
    
    Return ONLY a JSON object with the following format:
    {{
        "title": "A descriptive title for the document",
        "subject": "The chosen subject"
    }}
    
    Document Text (first 2000 chars):
    {text[:2000]}
    """
    
    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt,
            config={'response_mime_type': 'application/json'}
        )
        return json.loads(response.text)
    except Exception as e:
        print(f"Error generating metadata with Gemini: {e}")
        # Fallback
        return {"title": "Untitled Document", "subject": "Uncategorized"}

@app.post("/upload")
async def upload_files(files: List[UploadFile] = File(...)):
    temp_paths = []
    processed_files = []
    print(files)
    try:
        existing_subjects = rag.get_subjects()
        
        for file in files:
            temp_path = f"temp_{file.filename}"
            with open(temp_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
            temp_paths.append(temp_path)
            
            # Extract text for Gemini
            try:
                text = Extractor.from_file(temp_path)
            except Exception as e:
                print(f"Extraction failed for {file.filename}: {e}")
                text = ""
            
            # Generate metadata
            metadata = generate_metadata_with_gemini(text, existing_subjects)
            metadata['filename'] = file.filename
            print(f"Generated metadata for {file.filename}: {metadata}")
            
            # Add to RAG with generated metadata
            rag.add_files([temp_path], metadata=metadata)
            processed_files.append({"filename": file.filename, "metadata": metadata})
            
            # Update existing subjects if a new one was created (optimization)
            if metadata['subject'] not in existing_subjects:
                existing_subjects.append(metadata['subject'])
        
        return {"message": f"Successfully processed {len(files)} files.", "details": processed_files}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        # Cleanup temp files
        for p in temp_paths:
            if os.path.exists(p):
                os.remove(p)

@app.post("/add_lecture")
async def add_lecture(lecture: LectureRequest):
    try:
        rag.add_text(lecture.text, metadata={"title": lecture.title, "type": "lecture", "subject": lecture.subject})
        return {"message": "Lecture saved successfully."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/documents")
async def list_documents(subject: Optional[str] = None):
    try:
        docs = rag.list_documents(subject)
        return docs
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/ask")
async def ask_question(req: QuestionRequest):
    try:
        # 1. Retrieve context from RAG
        import string; cleaned = req.question.translate(str.maketrans('', '', string.punctuation))
        results = rag.hybrid_search(cleaned, k=5, subject=req.subject)
        print(results)
        context_text = "\n\n".join([f"Source ({r['metadata'].get('title', 'doc')}): {r['content']}" for r in results])
        
        if not context_text:
            context_text = "No relevant documents found."

        # 2. Generate answer with Gemini
        prompt = f"""
        You are a helpful assistant for a blind or visually impaired user. You always answer in slovene
        Answer the user's question based ONLY on the provided context.
        Keep the answer concise, clear, and easy to understand when read aloud (TTS).
        Do not use any markdown formatting or code blocks, as they are hard to listen to.
        
        Context:
        {context_text}
        
        User Question:
        {req.question}
        """
        
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt,
        )
        
        answer = response.text
        
        return {
            "answer": answer,
            "context": results
        }
    except Exception as e:
        print(f"Error in /ask: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Serve static files (Frontend)
app.mount("/", StaticFiles(directory=".", html=True), name="static")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
