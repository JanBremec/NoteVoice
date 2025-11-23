
import os
import shutil
from rag import FaissRAG

def test_persistence():
    db_path = "debug_rag.db"
    index_path = "debug_faiss.index"
    
    # Clean up previous run
    if os.path.exists(db_path):
        os.remove(db_path)
    if os.path.exists(index_path):
        os.remove(index_path)
        
    print("--- Initializing RAG (First Run) ---")
    rag = FaissRAG(db_path=db_path, index_path=index_path)
    
    # Create a dummy file
    with open("test_doc.txt", "w", encoding="utf-8") as f:
        f.write("This is a test document for persistence debugging. It contains unique keywords like XYLOPHONE and ZEBRA.")
        
    print("--- Adding File ---")
    ids = rag.add_files(["test_doc.txt"], metadata={"subject": "DEBUG"})
    print(f"Added document IDs: {ids}")
    
    print("--- Searching (Memory) ---")
    results = rag.search_similarity("XYLOPHONE", k=1)
    print(f"Search results: {results}")
    
    if not results:
        print("ERROR: Search failed immediately after adding!")
    
    print("--- Saving and Closing ---")
    rag.save()
    rag.close()
    
    print("--- Re-initializing RAG (Second Run) ---")
    rag2 = FaissRAG(db_path=db_path, index_path=index_path)
    
    print("--- Searching (Disk Reload) ---")
    results2 = rag2.search_similarity("XYLOPHONE", k=1)
    print(f"Search results after reload: {results2}")
    
    if results2:
        print("SUCCESS: Persistence works!")
    else:
        print("FAILURE: Could not find document after reload.")
        
    rag2.close()
    
    # Cleanup
    if os.path.exists("test_doc.txt"):
        os.remove("test_doc.txt")

if __name__ == "__main__":
    test_persistence()
