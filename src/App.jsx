import './styles/App.css'
import { PenLine, BookOpen, CalendarDays, Menu, X } from 'lucide-react'
import {useState} from 'react'


function loadDraft() {
    const savedDraft = localStorage.getItem('dearFutureMeDraft')

    if (!savedDraft) {
        return {
            text: '',
            deliveryDate: '',
        }
    }

    try {
        const parsedDraft = JSON.parse(savedDraft)

        if (parsedDraft && typeof parsedDraft === 'object') {
            return {
                text: parsedDraft.text ?? '',
                deliveryDate: parsedDraft.deliveryDate ?? '',
            }
        }
    } catch {
        // The saved value was plain text from our earlier version.
    }

    // Keep any draft saved before we introduced the object format.
    return {
        text: savedDraft,
        deliveryDate: '',
    }
}


function App() {
    const[menuOpen, setMenuOpen] = useState(false)

    const [initialDraft] = useState(loadDraft)

    const [letterText, setLetterText] = useState(initialDraft.text)

    const [deliveryDate, setDeliveryDate] = useState(
        initialDraft.deliveryDate
    )

    const [draftSaved, setDraftSaved] = useState(
        () => localStorage.getItem('dearFutureMeDraft') !== null
    )

    return (
      <div className="app-layout">
          <aside className={`sidebar ${menuOpen ? 'sidebar-open' : ''}`}>
              <div className="sidebar-brand">
                  Dear Future Me
              </div>


              <nav className="sidebar-nav">
                  <ul>
                      <li>
                          <button
                              type="button"
                              className="nav-item active"
                              onClick={() => setMenuOpen(false)}
                          >
                              <PenLine />
                              <span>Write a Letter</span>
                          </button>
                      </li>

                      <li>
                          <button
                              type="button"
                              className="nav-item"
                              onClick={() => setMenuOpen(false)}
                          >
                              <BookOpen />
                              <span>My Letters</span>
                          </button>
                      </li>

                      <li>
                          <button
                              type="button"
                              className="nav-item"
                              onClick={() => setMenuOpen(false)}
                          >
                              <CalendarDays />
                              <span>Upcoming Letters</span>
                          </button>
                      </li>
                  </ul>
              </nav>

          </aside>
          <main className="workspace">
              <button
                  type="button"
                  className="mobile-menu-toggle"
                  aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
                  aria-expanded={menuOpen}
                  onClick={() => setMenuOpen(!menuOpen)}
                  >
                  {menuOpen ? <X /> : <Menu />}
              </button>
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
                          value={letterText}
                          onChange={(event) => {
                              setLetterText(event.target.value)
                              setDraftSaved(false)
                          }}
                      />
                  </div>

                  <div className="letter-card-footer">
                      <span className="writing-note">
                          Your thoughts, your own little time capsule.
                      </span>
                      <span className="draft-indicator"> {draftSaved ? 'Draft saved' : 'Unsaved changes'}</span>
                  </div>
                  <div className = "letter-actions">
                      <div className = "delivery-date">
                          <label htmlFor="delivery-date"> When should this letter find you?</label>
                          <input
                              id = "delivery-date"
                              type="date"
                              min={new Date().toISOString().split('T')[0]}
                              value={deliveryDate}
                              onChange={(event) => {
                                  setDeliveryDate(event.target.value)
                                  setDraftSaved(false)
                              }}
                          />
                      </div>
                      <div className="action-buttons">
                          <button type="button" className="save-button"
                                  onClick={() => {
                                      const draft = {
                                          text: letterText,
                                          deliveryDate: deliveryDate,
                                          updatedAt: new Date().toISOString(),
                                      }

                                      localStorage.setItem(
                                          'dearFutureMeDraft',
                                          JSON.stringify(draft)
                                      )

                                      setDraftSaved(true)
                                  }}
                          >
                              Save Draft
                          </button>
                          <button type="button" className="schedule-button">
                              Schedule Letter
                          </button>
                      </div>
                  </div>
              </section>
          </main>
      </div>
  );
}

export default App;
