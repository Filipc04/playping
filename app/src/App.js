import './App.css';
import { collection, addDoc, query, orderBy, onSnapshot, doc, updateDoc, increment } from "firebase/firestore";
import { db } from "./firebase";
import React, { useState, useEffect, useRef } from "react";
import { serverTimestamp } from 'firebase/firestore';

function App() {
  const [showForm, setShowForm] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [userVotes, setUserVotes] = useState({});
  const latestTimestampRef = useRef(null);

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
        createdAt: serverTimestamp(),
        title: formData.title
      });

      setFormData({ title: "", name: "", time: "", game: "", other: "" });
      setShowForm(false);

      // NOTE: We do NOT need to manually call fetchSessions anymore!
      // The onSnapshot listener will pick up the change automatically.
    } catch (error) {
      console.error("Error adding session: ", error);
    }
  };

  // Real-time listener for sessions
  useEffect(() => {
    const sessionsCol = collection(db, "sessions");
    const sessionsQuery = query(sessionsCol, orderBy("createdAt", "desc"));
  
    const unsubscribe = onSnapshot(sessionsQuery, (snapshot) => {
      const sessionsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
  
      setSessions(sessionsData);
  
      const latestSession = sessionsData[0];
      if (latestSession) {
        const createdAtTimestamp = latestSession.createdAt;
        let createdAt = 0;
  
        if (createdAtTimestamp) {
          if (typeof createdAtTimestamp.toMillis === 'function') {
            createdAt = createdAtTimestamp.toMillis();
          } else {
            createdAt = new Date(createdAtTimestamp).getTime();
          }
        } else {
          createdAt = Date.now();
        }
  
        // Only notify if we have a previous timestamp and this is newer
        if (latestTimestampRef.current && createdAt > latestTimestampRef.current) {
          if (window?.electronAPI?.sendNotification) {
            window.electronAPI.sendNotification(`New session: ${latestSession.title}`);
          }
        }
  
        // Update ref to current latest timestamp
        latestTimestampRef.current = createdAt;
      }
    });
  
    return () => unsubscribe();
  }, []);
  

  const handleVote = async (sessionId, voteType) => {
    const previousVote = userVotes[sessionId];

    if (previousVote === voteType) {
      return;
    }

    const sessionRef = doc(db, "sessions", sessionId);

    const updates = {};
    if (previousVote) {
      updates[previousVote] = increment(-1);
    }
    updates[voteType] = increment(1);

    try {
      await updateDoc(sessionRef, updates);

      setUserVotes({
        ...userVotes,
        [sessionId]: voteType
      });
    } catch (error) {
      console.error("Error updating vote: ", error);
    }
  };

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
          
            {/* Removed old Name display */}
          
            <p><strong>When:</strong> {session.scheduledAt}</p>
            <p><strong>Game:</strong> {session.game}</p>
          
            {session["other-text"] && session["other-text"].trim() !== "" && (
              <p><strong>Other:</strong> {session["other-text"]}</p>
            )}
          
            <div className="posted-info">
              Posted by <strong>{session.host}</strong> at {formatTimestamp(session.createdAt)}
            </div>
          
            {/* ...rest stays the same */}
            <div className="session-buttons">
              <button
                className={`session-button-left ${userVotes[session.id] === 'accepted' ? 'voted' : ''}`}
                onClick={() => handleVote(session.id, 'accepted')}
              >
                I'll be there!
              </button>
              <button
                className={`session-button-right ${userVotes[session.id] === 'declined' ? 'voted' : ''}`}
                onClick={() => handleVote(session.id, 'declined')}
              >
                I can't
              </button>
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

function formatTimestamp(timestamp) {
  if (!timestamp) return '';
  // If it's Firestore Timestamp object, use toDate()
  const dateObj = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return dateObj.toLocaleString(); // e.g. "7/14/2025, 3:30:00 PM"
}


export default App;
