import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  // --- STATE FOR ADDING A BOOK ---
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [publishYear, setPublishYear] = useState('');

  // --- STATE FOR DISPLAYING THE BOOK INVENTORY ---
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // --- STATE FOR EDITING A BOOK ---
  const [editingId, setEditingId] = useState(null); 
  const [editTitle, setEditTitle] = useState('');
  const [editAuthor, setEditAuthor] = useState('');
  const [editPublishYear, setEditPublishYear] = useState('');

  // Function to fetch books from MongoDB
  const fetchBooks = () => {
    axios.get('http://localhost:5000/api/books')
      .then((response) => {
        setBooks(response.data.data || response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching books:", error);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const handleSaveBook = () => {
    const data = { title, author, publishYear };
    
    axios.post('http://localhost:5000/api/books', data)
      .then(() => {
        alert("Success! Book added to the Library Database.");
        setTitle(''); 
        setAuthor(''); 
        setPublishYear('');
        fetchBooks();
      })
      .catch((error) => {
        console.error(error);
        alert("Error: Something went wrong while connecting to the server.");
      });
  };

  const handleDeleteBook = (id) => {
    if (window.confirm("Are you sure you want to delete this book?")) {
      axios.delete(`http://localhost:5000/api/books/${id}`)
        .then(() => {
          fetchBooks();
        })
        .catch((error) => {
          console.error("Error deleting book:", error);
          alert("Error: Could not delete the book.");
        });
    }
  };
  const startEditing = (book) => {
    setEditingId(book._id);
    // 👇 This checks for both 'title' and 'name' so the input box isn't empty!
    setEditTitle(book.title || book.name || ''); 
    setEditAuthor(book.author || '');
    setEditPublishYear(book.publishYear || '');
  };

  
  const handleUpdateBook = (id) => {
    const updatedData = { title: editTitle, author: editAuthor, publishYear: editPublishYear };

    axios.put(`http://localhost:5000/api/books/${id}`, updatedData)
      .then(() => {
        setEditingId(null); 
        fetchBooks(); 
      })
      .catch((error) => {
        console.error("Error updating book:", error);
        alert("Error: Could not update book details.");
      });
  };

  // Filter books based on Search
  const filteredBooks = books.filter((book) => {
    const matchesTitle = book.title?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesAuthor = book.author?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTitle || matchesAuthor;
  });

  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif', backgroundColor: '#121214', minHeight: '100vh', color: 'white' }}>
      
      {/* SECTION 1: ADMIN PANEL FORM */}
      <div>
        <h1>📚 Library Admin Panel</h1>
        <p style={{ color: '#aaa' }}>Enter book details below to add them to the database.</p>
        
        <div style={{ display: 'flex', flexDirection: 'column', width: '350px', gap: '15px', marginTop: '20px' }}>
          <input 
            style={{ padding: '10px', borderRadius: '5px', border: '1px solid #333', backgroundColor: '#222', color: 'white' }}
            type='text' 
            placeholder='Book Title' 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
          />
          <input 
            style={{ padding: '10px', borderRadius: '5px', border: '1px solid #333', backgroundColor: '#222', color: 'white' }}
            type='text' 
            placeholder='Author' 
            value={author} 
            onChange={(e) => setAuthor(e.target.value)} 
          />
          <input 
            style={{ padding: '10px', borderRadius: '5px', border: '1px solid #333', backgroundColor: '#222', color: 'white' }}
            type='number' 
            placeholder='Publish Year' 
            value={publishYear} 
            onChange={(e) => setPublishYear(e.target.value)} 
          />
          <button 
            onClick={handleSaveBook} 
            style={{ padding: '12px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            Add Book to Database
          </button>
        </div>
      </div>

      <hr style={{ border: '1px solid #333', margin: '50px 0' }} />

      {/* SECTION 2: LIVE INVENTORY DISPLAY */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
          <h2>Current Library Inventory</h2>
          
          <input 
            type="text"
            placeholder="🔍 Search by title or author..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ padding: '10px 15px', width: '300px', borderRadius: '20px', border: '1px solid #444', backgroundColor: '#222', color: 'white', fontSize: '14px' }}
          />
        </div>
        
        {loading ? (
          <p style={{ color: '#aaa' }}>Loading books from database...</p>
        ) : !Array.isArray(books) ? (
          <p style={{ color: '#aaa' }}>Error: Received invalid data format from backend.</p>
        ) : filteredBooks.length === 0 ? (
          <p style={{ color: '#aaa' }}>No matching books found.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
            {filteredBooks.map((book) => (
              <div 
                key={book._id} 
                style={{ 
                  background: '#1e1e24', 
                  padding: '20px', 
                  borderRadius: '8px', 
                  border: '1px solid #333',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                {editingId === book._id ? (
                  /* IF IN EDIT MODE: SHOW INPUT BOXES */
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <input 
                      style={{ padding: '6px', borderRadius: '4px', border: '1px solid #555', backgroundColor: '#333', color: 'white' }}
                      type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} 
                    />
                    <input 
                      style={{ padding: '6px', borderRadius: '4px', border: '1px solid #555', backgroundColor: '#333', color: 'white' }}
                      type="text" value={editAuthor} onChange={(e) => setEditAuthor(e.target.value)} 
                    />
                    <input 
                      style={{ padding: '6px', borderRadius: '4px', border: '1px solid #555', backgroundColor: '#333', color: 'white' }}
                      type="number" value={editPublishYear} onChange={(e) => setEditPublishYear(e.target.value)} 
                    />
                    <div style={{ display: 'flex', gap: '10px', marginTop: '5px' }}>
                      <button onClick={() => handleUpdateBook(book._id)} style={{ flex: 1, padding: '6px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Save</button>
                      <button onClick={() => setEditingId(null)} style={{ flex: 1, padding: '6px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  /* IF NOT IN EDIT MODE: SHOW NORMAL TEXT */
                  <>
                    <div>
                      
                      <h3 style={{ margin: '0 0 10px 0', color: '#007bff' }}>{book.title || book.name || "Untitled Book"}</h3>
                      <p style={{ margin: '5px 0', color: '#ccc' }}><strong>Author:</strong> {book.author}</p>
                      <p style={{ margin: '5px 0', color: '#888' }}><strong>Published:</strong> {book.publishYear || 'N/A'}</p>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                      <button 
                        onClick={() => startEditing(book)}
                        style={{ flex: 1, padding: '8px', backgroundColor: '#ffc107', color: '#121214', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDeleteBook(book._id)}
                        style={{ flex: 1, padding: '8px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                      >
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}

export default App;