import logo from './logo.svg';
import './App.css';
import { collection, addDoc, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "./firebase"; // import your configured Firestore instance
import React, { useState, useEffect } from "react";


function App() {
  const [showForm, setShowForm] = useState(false);
  const [sessions, setSessions] = useState([]);

  const [formData, setFormData] = useState({
    title: '',
    name: '',
    time: '',
    game: '',
    other: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleCreateSession = () => {
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    try {
      await addDoc(collection(db, "sessions"), {
        accepted: 0,
        declined: 0,
        game: formData.game,
        host: formData.name,
        "other-text": formData.other,
        scheduledAt: formData.time,
        createdAt: new Date(),
        title: formData.title
      });
  
      setFormData({ title: "", name: "", time: "", game: "", other: "" });
      setShowForm(false);
  
      // Refresh sessions after adding new
      fetchSessions();
    } catch (error) {
      console.error("Error adding session: ", error);
    }
  };

  const fetchSessions = async () => {
    const sessionsCol = collection(db, "sessions");
    const sessionsQuery = query(sessionsCol, orderBy("createdAt", "desc"));
  
    const querySnapshot = await getDocs(sessionsQuery);
    const sessionsData = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  
    setSessions(sessionsData);
  };
  
  useEffect(() => {
    fetchSessions();
  }, []);
  
  

  return (
    <div className="app-container">
      <button
        className="create-session-button"
        onClick={() => setShowForm(!showForm)}
      >
        {showForm ? "Nevermind..." : "Create Session!"}
      </button>
  
      {!showForm && (
        <h1 className="app-title">PlayPing 🕭</h1>
      )}
  
      {showForm && (
        <form className="form" onSubmit={handleSubmit}>
          <input
            type="text"
            name="title"
            placeholder="Header/Title"
            value={formData.title}
            onChange={handleChange}
          />
          <input
            type="text"
            name="name"
            placeholder="Your Name"
            value={formData.name}
            onChange={handleChange}
          />
          <input
            type="text"
            name="time"
            placeholder="Session Time"
            value={formData.time}
            onChange={handleChange}
          />
          <input
            type="text"
            name="game"
            placeholder="Game to Play"
            value={formData.game}
            onChange={handleChange}
          />
          <input
            type="text"
            name="other"
            placeholder="Other"
            value={formData.other}
            onChange={handleChange}
          />
          <button type="submit">Create</button>
        </form>
      )}
  
      {!showForm && sessions.length > 0 && (
      <div className="sessions-container">
        {sessions.map((session) => (
          <div key={session.id} className="session-item">
            <h3>{session.title}</h3>
            <p><strong>Name:</strong> {session.host}</p>
            <p><strong>Time:</strong> {session.scheduledAt}</p>
            <p><strong>Game:</strong> {session.game}</p>
            <p><strong>Other:</strong> {session["other-text"]}</p>

            <div className="session-buttons">
              <button className="session-button-left">I'll be there!</button>
              <button className="session-button-right">I can't</button>
            </div>

            <div className="session-votes">
              <span className="vote-yes">✓ {session.accepted || 0}</span>
              <span className="vote-no">✗ {session.declined || 0}</span>
            </div>
          </div>
        ))}
      </div>
    )}

    </div>
  );
  
}


 



export default App;

