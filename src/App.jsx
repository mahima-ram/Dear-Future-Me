import './styles/App.css'
import { PenLine, BookOpen, CalendarDays, Menu, X, LockKeyhole} from 'lucide-react'
import {useState, useEffect} from 'react'
import { supabase } from './lib/supabase'
import Auth from './pages/Auth'

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

    const [isEnvelopeOpening, setIsEnvelopeOpening] = useState(false)

    const today = new Date()

    const [session, setSession] = useState(null)
    const [authLoading, setAuthLoading] = useState(true)
    const [isPasswordRecovery, setIsPasswordRecovery] = useState(false)

    const todayString = [
        today.getFullYear(),
        String(today.getMonth() + 1).padStart(2, '0'),
        String(today.getDate()).padStart(2, '0'),
    ].join('-')

    useEffect(() => {
        // Check whether a user is already signed in
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session)
            setAuthLoading(false)
        })

        // Listen for login and logout events
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((event, session) => {
            setSession(session)
            setAuthLoading(false)

            if (event === 'PASSWORD_RECOVERY') {
                setIsPasswordRecovery(true)
            }
        })

        // Clean up the listener when the component unmounts
        return () => subscription.unsubscribe()
    }, [])

    async function testSupabaseConnection() {
        const { data, error } = await supabase
            .from('letters')
            .select('*')

        if (error) {
            console.error('Supabase connection error:', error.message)
            return
        }

        console.log('Supabase connected successfully!', data)
    }

    async function handleSignOut() {
        const { error } = await supabase.auth.signOut()

        if (error) {
            console.error('Error signing out:', error.message)
        }
    }

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


    function handleScheduleLetter() {
        if (!letterText.trim()) {
            alert('Please write your letter before scheduling it.')
            return
        }

        if (!deliveryDate) {
            alert('Please choose a delivery date.')
            return
        }

        if (deliveryDate < todayString) {
            alert('Please choose today or a future date.')
            return
        }

        const now = new Date().toISOString()

        const existingLetter = letters.find(
            (letter) => letter.id === activeLetterId
        )

        const scheduledLetter = {
            id: activeLetterId,
            text: letterText,
            deliveryDate: deliveryDate,
            createdAt: existingLetter?.createdAt ?? now,
            updatedAt: now,
            status: 'scheduled',
        }

        const nextLetters = existingLetter
            ? letters.map((letter) =>
                letter.id === activeLetterId
                    ? scheduledLetter
                    : letter
            )
            : [...letters, scheduledLetter]

        setLetters(nextLetters)

        localStorage.setItem(
            'dearFutureMeLetters',
            JSON.stringify(nextLetters)
        )

        setDraftSaved(true)
        setCurrentPage('letters')
    }



    function handleNewLetter() {
        const newId = crypto.randomUUID()

        setActiveLetterId(newId)
        setLetterText('')
        setDeliveryDate('')
        setDraftSaved(false)
    }

    function handlePreviewLetter(letter) {
        setActiveLetterId(letter.id)
        setCurrentPage('preview')
    }

    function handleEditLetter(letter) {
        setActiveLetterId(letter.id)
        setLetterText(letter.text)
        setDeliveryDate(letter.deliveryDate)
        setDraftSaved(true)
        setCurrentPage('write')
    }

    function handleTryOpenLetter() {
        if (
            activeLetter?.deliveryDate &&
            activeLetter.deliveryDate > todayString
        ) {
            setCurrentPage('warning')
        } else {
            revealLetter()
        }
    }

    function revealLetter() {
        setIsEnvelopeOpening(true)

        setTimeout(() => {
            setCurrentPage('read')
            setIsEnvelopeOpening(false)
        }, 1400)
    }

    if (authLoading) {
        return <p>Loading...</p>
    }

    if (isPasswordRecovery) {
        return (
            <Auth
                mode="reset"
                onPasswordResetComplete={() => setIsPasswordRecovery(false)}
            />
        )
    }

    if (!session) {
        return <Auth />
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
                          <button onClick={testSupabaseConnection}>
                              Test Supabase Connection
                          </button>
                      </li>
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

              <div className="sidebar-footer">
                  <button
                      className="sign-out-button"
                      onClick={handleSignOut}
                  >
                      Sign Out
                  </button>
              </div>

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
                              <button type="button" className="schedule-button" onClick={handleScheduleLetter}>
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
                              {letters.map((letter) => {
                                  const isScheduled = letter.status === 'scheduled'
                                  return (
                                      <article className="saved-letter-card" key={letter.id}>
                                          <div className="saved-letter-info">
                                              <h3>
                                                  {isScheduled
                                                      ? 'Sealed letter'
                                                      : letter.text.trim()
                                                          ? letter.text.slice(0, 45)
                                                          : 'Untitled letter'}
                                              </h3>

                                              {isScheduled ? (
                                                  <div className="sealed-letter-preview">
                                                      <LockKeyhole size={18} />
                                                      <p>Letter sealed until its delivery date</p>
                                                  </div>
                                              ) : (
                                                  <p className="letter-preview-text">
                                                      {letter.text.slice(0, 100)}
                                                  </p>
                                              )}

                                              <span>
                                    {letter.deliveryDate
                                        ? `Opens on ${letter.deliveryDate}`
                                        : 'No delivery date selected'}
                                </span>
                                          </div>

                                          <button
                                              type="button"
                                              className="save-button"
                                              onClick={() => {
                                                  if (isScheduled) {
                                                      handlePreviewLetter(letter)
                                                  } else {
                                                      handleEditLetter(letter)
                                                  }
                                              }}
                                          >
                                              {isScheduled ? 'View Letter' : 'Edit Draft'}
                                          </button>
                                      </article>
                                    )
                                })}
                          </div>
                      )}
                  </section>
              )}


              {currentPage === 'preview' && activeLetter && (
                  <section className="letter-preview">
                      <p className="welcome-eyebrow">A MESSAGE FROM YOUR PAST SELF</p>

                      <h1>A letter is waiting for you.</h1>

                      <p className="welcome-subtitle">
                          Take a moment. Something you once wanted to remember
                          is waiting here.
                      </p>

                      <div className={`envelope ${isEnvelopeOpening ? 'is-opening' : ''}`}>
                          <div className="envelope-flap"></div>
                          <div className="envelope-seal">D</div>
                      </div>

                      <p className="preview-date">
                          {activeLetter.deliveryDate
                              ? `Written for ${activeLetter.deliveryDate}`
                              : 'A letter without a scheduled date'}
                      </p>

                      <button
                          type="button"
                          className="schedule-button"
                          onClick={handleTryOpenLetter}
                          disabled={isEnvelopeOpening}
                      >
                          Open Letter
                      </button>

                      <button
                          type="button"
                          className="back-button"
                          onClick={() => setCurrentPage('letters')}
                      >
                          Back to My Letters
                      </button>
                  </section>
              )}


              {currentPage === 'warning' && activeLetter && (
                  <section className="early-warning">
                      <p className="welcome-eyebrow">A LITTLE REMINDER</p>

                      <h1>You're opening this one early.</h1>

                      <p className="welcome-subtitle">
                          You promised yourself you'd wait until{' '}
                          {activeLetter.deliveryDate}.
                      </p>

                      <div className="warning-card">
                          <p>
                              Your past self left this letter for a reason.
                              Are you sure you're ready to hear what they had to say?
                          </p>
                      </div>

                      <button
                          type="button"
                          className="schedule-button"
                          onClick={() => setCurrentPage('read')}
                      >
                          Open it anyway
                      </button>

                      <button
                          type="button"
                          className="back-button"
                          onClick={() => setCurrentPage('letters')}
                      >
                          I'll wait until the right day
                      </button>
                  </section>
              )}


              {currentPage === 'read' && activeLetter && (
                  <section className="reading-screen">
                      <p className="welcome-eyebrow">A LETTER TO YOUR FUTURE SELF</p>

                      <div className="reading-paper">
                          <p className="letter-greeting">Dear Future Me,</p>

                          <p className="reading-text">
                              {activeLetter.text}
                          </p>

                          <p className="reading-signoff">
                              With love, your past self.
                          </p>
                      </div>

                      <button
                          type="button"
                          className="save-button"
                          onClick={() => handleEditLetter(activeLetter)}
                      >
                          Edit Letter
                      </button>

                      <button
                          type="button"
                          className="back-button"
                          onClick={() => setCurrentPage('letters')}
                      >
                          Back to My Letters
                      </button>
                  </section>
              )}


          </main>
      </div>
  );
}

export default App;
