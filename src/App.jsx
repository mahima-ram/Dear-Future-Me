import './styles/App.css'
import { PenLine, BookOpen, CalendarDays } from 'lucide-react'

function App() {
  return (
      <div className = "app-layout">
          <aside className="sidebar">
              <div className="sidebar-brand">
                  Dear Future Me
              </div>

              <nav className="sidebar-nav">
                  <ul>
                      <li className="nav-item active">
                          <PenLine />
                          <span>Write a Letter</span>
                      </li>

                      <li className="nav-item">
                          <BookOpen />
                          <span>My Letters</span>
                      </li>

                      <li className="nav-item">
                          <CalendarDays />
                          <span>Upcoming Letters</span>
                      </li>
                  </ul>
              </nav>
          </aside>
          <main className="workspace">
              <header className="welcome-section">
                  <p className="welcome-eyebrow">A MOMENT FOR YOURSELF</p>
                  <h1>Good evening.</h1>
                  <p className="welcome-subtitle">
                      Take a moment to write to the person you're becoming.
                  </p>
              </header>

              <section className="letter-card">
                  <div className="letter-card-header">
                      <span className="letter-label">A LETTER TO MY FUTURE SELF</span>
                      <span className="letter-date">November 23, 2026</span>
                  </div>

                  <div className="letter-content">
                      <p className="letter-greeting">Dear Future Me,</p>

                      <textarea
                          className="letter-input"
                          placeholder="What's on your mind today? Write about your hopes, your dreams, the little things you don't want to forget..."
                      />
                  </div>

                  <div className="letter-card-footer">
                      <span className="writing-note">Your thoughts, your own little time capsule.</span>
                      <span className="draft-indicator">New letter</span>
                  </div>
              </section>
          </main>
      </div>
  );
}

export default App;
