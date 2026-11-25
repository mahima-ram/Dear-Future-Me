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

function loadLetters() {
    const savedLetters = localStorage.getItem('dearFutureMeLetters')

    if (savedLetters) {
        try {
            const parsedLetters = JSON.parse(savedLetters)

            if (Array.isArray(parsedLetters)) {
                return parsedLetters
            }
        } catch {
            // We'll try to recover the previous draft below.
        }
    }

    // Recover the single draft saved by our earlier version.
    const oldDraft = localStorage.getItem('dearFutureMeDraft')

    if (!oldDraft) {
        return []
    }

    try {
        const parsedDraft = JSON.parse(oldDraft)

        if (parsedDraft && typeof parsedDraft === 'object') {
            return [{
                id: crypto.randomUUID(),
                text: parsedDraft.text ?? '',
                deliveryDate: parsedDraft.deliveryDate ?? '',
                createdAt: parsedDraft.updatedAt ?? new Date().toISOString(),
                updatedAt: parsedDraft.updatedAt ?? new Date().toISOString(),
                status: 'draft',
            }]
        }
    } catch {
        // The old value may have been plain text.
    }

    return [{
        id: crypto.randomUUID(),
        text: oldDraft,
        deliveryDate: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'draft',
    }]
}

function App() {
    const[menuOpen, setMenuOpen] = useState(false)

    const [currentPage, setCurrentPage] = useState('write')

    const [letters, setLetters] = useState(loadLetters)

    const [activeLetterId, setActiveLetterId] = useState(
        () => letters[0]?.id ?? crypto.randomUUID()
    )

    const activeLetter = letters.find(
        (letter) => letter.id === activeLetterId
    )

    const [letterText, setLetterText] = useState(
        () => activeLetter?.text ?? ''
    )

    const [deliveryDate, setDeliveryDate] = useState(
        () => activeLetter?.deliveryDate ?? ''
    )

    const [draftSaved, setDraftSaved] = useState(
        Boolean(activeLetter)
    )

    function handleSaveDraft() {
        const now = new Date().toISOString()

        const existingLetter = letters.find(
            (letter) => letter.id === activeLetterId
        )

        const updatedLetter = {
            id: activeLetterId,
            text: letterText,
            deliveryDate: deliveryDate,
            createdAt: existingLetter?.createdAt ?? now,
            updatedAt: now,
            status: 'draft',
        }

        const nextLetters = existingLetter
            ? letters.map((letter) =>
                letter.id === activeLetterId
                    ? updatedLetter
                    : letter
            )
            : [...letters, updatedLetter]

        setLetters(nextLetters)

        localStorage.setItem(
            'dearFutureMeLetters',
            JSON.stringify(nextLetters)
        )

        setDraftSaved(true)
    }


    function handleNewLetter() {
        const newId = crypto.randomUUID()

        setActiveLetterId(newId)
        setLetterText('')
        setDeliveryDate('')
        setDraftSaved(false)
    }


    function handleOpenLetter(letter) {
        setActiveLetterId(letter.id)
        setLetterText(letter.text)
        setDeliveryDate(letter.deliveryDate)
        setDraftSaved(true)
        setCurrentPage('write')
    }

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
                              className={`nav-item ${currentPage === 'write' ? 'active' : ''}`}
                              onClick={() => {
                                  setCurrentPage('write')
                                  setMenuOpen(false)
                              }}
                          >
                              <PenLine />
                              <span>Write a Letter</span>
                          </button>
                      </li>

                      <li>
                          <button
                              type="button"
                              className={`nav-item ${currentPage === 'letters' ? 'active' : ''}`}
                              onClick={() => {
                                  setCurrentPage('letters')
                                  setMenuOpen(false)
                              }}
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
              {currentPage === 'write' && (
                  <>
                  <header className="welcome-section">
                      <p className="welcome-eyebrow">A MOMENT FOR YOURSELF</p>
                      <h1>Good evening.</h1>
                      <p className="welcome-subtitle">
                          Take a moment to write to the person you're becoming.
                      </p>
                      <button type="button" className="save-button" onClick={handleNewLetter}>
                          + New Letter
                      </button>

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
                              <button type="button" className="save-button" onClick={handleSaveDraft}>
                                  Save Draft
                              </button>
                              <button type="button" className="schedule-button">
                                  Schedule Letter
                              </button>
                          </div>
                      </div>
                  </section>
                  </>
              )}

              {currentPage === 'letters' && (
                  <section className="my-letters-section">
                      <header className="welcome-section">
                          <p className="welcome-eyebrow">YOUR PERSONAL COLLECTION</p>
                          <h1>My Letters</h1>
                          <p className="welcome-subtitle">
                              All the thoughts you've saved for your future self.
                          </p>
                      </header>

                      <div className="letters-list-header">
                          <h2>Your saved letters</h2>
                          <span>{letters.length} letters</span>
                      </div>

                      {letters.length === 0 ? (
                          <p className="empty-letters">
                              You haven't saved any letters yet. Start writing your first one!
                          </p>
                      ) : (
                          <div className="letters-list">
                              {letters.map((letter) => (
                                  <article className="saved-letter-card" key={letter.id}>
                                      <div className="saved-letter-info">
                                          <h3>
                                              {letter.text.trim()
                                                  ? letter.text.slice(0, 45)
                                                  : 'Untitled letter'}
                                          </h3>

                                          <p>
                                              {letter.text.trim()
                                                  ? letter.text.slice(0, 100)
                                                  : 'This letter is still waiting for your words.'}
                                          </p>

                                          <span>
                                {letter.deliveryDate
                                    ? `Opens on ${letter.deliveryDate}`
                                    : 'No delivery date selected'}
                            </span>
                                      </div>

                                      <button
                                          type="button"
                                          className="save-button"
                                          onClick={() => handleOpenLetter(letter)}
                                      >
                                          Open Letter
                                      </button>
                                  </article>
                              ))}
                          </div>
                      )}
                  </section>
              )}

          </main>
      </div>
  );
}

export default App;
