import React from 'react';
import { useParams, Link } from "react-router-dom";

export default function LoopRooms() {
  const { topic } = useParams();

  return (
    <main style={{ 
      backgroundColor: '#EFF9FF', 
      minHeight: '100vh', 
      padding: '20px', // Reduced padding for mobile
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Back button */}
      <Link to="/dashboard" style={{ 
        color: '#105554', 
        fontWeight: 'bold', 
        textDecoration: 'none',
        fontSize: '1rem' 
      }}>
        ← Back to Dashboard
      </Link>

      <div style={{ 
        marginTop: '60px', 
        maxWidth: '100%', // Ensures it doesn't push off screen
        wordBreak: 'break-word' // Forces long words to wrap
      }}>
        
        <h2 style={{ 
          color: '#105554', 
          /* clamp(minimum, preferred, maximum) */
          fontSize: 'clamp(1.5rem, 5vw, 2rem)', 
          fontWeight: '300',
          marginBottom: '10px'
        }}>
          Active Loop:
        </h2>

        <p style={{ 
          color: '#105554', 
          /* This makes the big text scale down automatically on phones */
          fontSize: 'clamp(1.8rem, 8vw, 3.5rem)', 
          fontWeight: 'bold',
          lineHeight: '1.2', // Space between lines
          marginTop: '0'
        }}>
          {topic ? decodeURIComponent(topic) : "No topic selected"}
        </p>
        
      </div>
    </main>
  );
}