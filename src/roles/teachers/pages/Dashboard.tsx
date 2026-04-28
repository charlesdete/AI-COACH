import { Link } from "react-router-dom";

export default function Dashboard() {
  // 1. Define the options array
  const options = [
    "Connecting lessons to the Bible",
    "Managing student behavior",
    "Engaging students",
    "Checking if students understand",
    "Helping students struggling to learn",
    "Something Else?"
  ];

  // 2. You MUST have a 'return' statement
  return (
    <main style={{ backgroundColor: '#EFF9FF', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '60px' }}>
      <h1 style={{ color: '#105554', fontSize: '2rem', marginBottom: '40px' }}>
        What do you want to improve this week?
      </h1>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', width: '100%', maxWidth: '450px' }}>
        {options.map((item, index) => (
          <Link
            key={index}
            /* IMPORTANT: Use backticks ` ` here, not single quotes ' ' */
            to={`/loop/${encodeURIComponent(item)}`}
            style={{ 
              backgroundColor: '#DDEEEB', 
              borderRadius: '9999px',
              padding: '20px',
              textAlign: 'center',
              textDecoration: 'none',
              color: '#105554',
              fontWeight: '500',
              fontSize: '1.1rem',
              display: 'block'
            }}
          >
            {item}
          </Link>
        ))}
      </div>
    </main>
  );
}