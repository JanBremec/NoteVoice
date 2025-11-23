import os
import shutil
from fastapi.testclient import TestClient
from main import app, rag

client = TestClient(app)

def test_gemini_upload():
    # Create a dummy file
    filename = "test_physics_new.txt"
    content = "Quantum mechanics is a fundamental theory in physics that provides a description of the physical properties of nature at the scale of atoms and subatomic particles."
    with open(filename, "w") as f:
        f.write(content)
    
    try:
        # Upload the file without subject
        with open(filename, "rb") as f:
            response = client.post(
                "/upload",
                files={"files": (filename, f, "text/plain")}
            )
        
        print("Response status:", response.status_code)
        print("Response json:", response.json())
        
        assert response.status_code == 200
        data = response.json()
        assert "Successfully processed" in data["message"]
        assert len(data["details"]) == 1
        metadata = data["details"][0]["metadata"]
        print("Generated Metadata:", metadata)
        
        assert "title" in metadata
        assert "subject" in metadata
        
        # Verify it's in RAG
        docs = rag.list_documents()
        print("All docs in RAG:", docs)
        found = False
        for doc in docs:
            if doc["filename"] == filename:
                found = True
                print("Document found in RAG:", doc)
                assert doc["subject"] == metadata["subject"]
                break
        assert found
        
    finally:
        if os.path.exists(filename):
            os.remove(filename)

if __name__ == "__main__":
    test_gemini_upload()
