
import os
import shutil
from rag import FaissRAG

def test_upload_logic():
    # Setup
    db_path = "faiss_rag.db"
    index_path = "faiss.index"
    
    rag = FaissRAG(db_path=db_path, index_path=index_path)
    
    # Create dummy file mimicking the user's file
    filename = "antigravity.txt"
    content = "This is the antigravity text content. It should be indexed and searchable."
    with open(filename, "w", encoding="utf-8") as f:
        f.write(content)
        
    # Mimic main.py logic
    temp_paths = []
    try:
        # In main.py:
        # temp_path = f"temp_{file.filename}"
        # with open(temp_path, "wb") as buffer:
        #     shutil.copyfileobj(file.file, buffer)
        
        temp_path = f"temp_{filename}"
        shutil.copy(filename, temp_path)
        temp_paths.append(temp_path)
        
        print(f"--- Adding {temp_path} to RAG ---")
        ids = rag.add_files(temp_paths, metadata={"subject": "Physics"})
        print(f"Returned IDs: {ids}")
        
        if not ids:
            print("FAILURE: No IDs returned!")
        else:
            print("SUCCESS: IDs returned.")
            
        # Check search
        print("--- Verifying Search (Subject=Physics) ---")
        results = rag.search_similarity("antigravity", k=5, subject="Physics")
        print(f"Results: {results}")
        
        if any(r['id'] in ids for r in results):
            print("SUCCESS: Found new document with subject filter.")
        else:
            print("FAILURE: Not found with subject filter.")
            
        print("--- Verifying Search (Global, k=100) ---")
        results_global = rag.search_similarity("antigravity", k=100)
        found_rank = -1
        for i, r in enumerate(results_global):
            if r['id'] in ids:
                found_rank = i
                break
        print(f"New document rank in global search: {found_rank}")
            
    except Exception as e:
        print(f"EXCEPTION: {e}")
    finally:
        # Cleanup
        if os.path.exists(temp_path):
            os.remove(temp_path)
        if os.path.exists(filename):
            os.remove(filename)
            
    rag.close()

if __name__ == "__main__":
    test_upload_logic()
