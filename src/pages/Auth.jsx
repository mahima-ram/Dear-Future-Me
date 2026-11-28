import { useState } from 'react'
import { supabase } from '../lib/supabase'
import '../styles/Auth.css'

function Auth({ mode: initialMode = 'signup', onPasswordResetComplete,}) {
    const [mode, setMode] = useState(initialMode)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [message, setMessage] = useState('')
    const [loading, setLoading] = useState(false)
    const [confirmPassword, setConfirmPassword] = useState('')

    async function handleAuth(event) {
        event.preventDefault()
        setLoading(true)
        setMessage('')

        try {
            let result

            if (mode === 'signup') {
                result = await supabase.auth.signUp({
                    email,
                    password,
                })
            } else if (mode === 'login') {
                result = await supabase.auth.signInWithPassword({
                    email,
                    password,
                })
            } else if (mode === 'forgot') {
                result = await supabase.auth.resetPasswordForEmail(email, {
                    redirectTo: `${window.location.origin}/`,
                })
            }

            if (result.error) {
                setMessage(result.error.message)
            } else if (mode === 'signup') {
                setMessage('Account created! Please check your email to confirm your account.')
            } else if (mode === 'login') {
                setMessage('Successfully signed in!')
            } else {
                setMessage('If an account exists for this email, you will receive a password reset link.')
            }
        } catch (error) {
            setMessage('Something went wrong. Please try again.')
            console.error('Authentication error:', error)
        } finally {
            setLoading(false)
        }
    }

    function changeMode(newMode) {
        setMode(newMode)
        setMessage('')
        setPassword('')
    }

    async function handlePasswordReset(event) {
        event.preventDefault()
        setMessage('')

        if (password !== confirmPassword) {
            setMessage('Your passwords do not match.')
            return
        }

        if (password.length < 6) {
            setMessage('Your password must be at least 6 characters.')
            return
        }

        setLoading(true)

        const { error } = await supabase.auth.updateUser({
            password,
        })

        if (error) {
            setMessage(error.message)
        } else {
            setMessage('Your password has been updated successfully!')
            setPassword('')
            setConfirmPassword('')
            onPasswordResetComplete?.()
        }

        setLoading(false)
    }

    return (
        <main className="auth-page">
            <section className="auth-card">
                <p className="auth-brand">Dear Future Me</p>

                <div className="auth-heading">
                    <h1>
                        {mode === 'signup'
                            ? 'A letter to your future self.'
                            : mode === 'login'
                                ? 'Welcome back.'
                                : 'Forgot your password?'}
                    </h1>

                    <p>
                        {mode === 'signup'
                            ? 'Create a little space for the thoughts you want to revisit.'
                            : mode === 'login'
                                ? 'Your letters are waiting for you.'
                                : 'Enter your email and we’ll send you a link to reset your password.'}
                    </p>
                </div>

                <form className="auth-form" onSubmit={mode === 'reset' ? handlePasswordReset : handleAuth}>
                    <label htmlFor="auth-email">Email address</label>
                    <input
                        id="auth-email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        autoComplete="email"
                        required
                    />

                    {mode !== 'forgot' && (
                        <>
                            <label htmlFor="auth-password">
                                {mode === 'reset' ? 'New password' : 'Password'}
                            </label>
                            <input
                                id="auth-password"
                                type="password"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                autoComplete={mode === 'reset' ? 'new-password' : mode === 'signup' ? 'new-password' : 'current-password'}
                                minLength={6}
                                required
                            />

                            {mode === 'reset' && (
                                <>
                                    <label htmlFor="confirm-password">Confirm new password</label>
                                    <input
                                        id="confirm-password"
                                        type="password"
                                        placeholder="Enter your new password again"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        autoComplete="new-password"
                                        minLength={6}
                                        required
                                    />
                                </>
                            )}
                        </>
                    )}

                    {mode === 'login' && (
                        <button
                            className="auth-text-button forgot-link"
                            type="button"
                            onClick={() => changeMode('forgot')}
                        >
                            Forgot password?
                        </button>
                    )}

                    <button
                        className="auth-submit"
                        type="submit"
                        disabled={loading}
                    >
                        {loading
                            ? 'Please wait...'
                            : mode === 'signup'
                                ? 'Create Account'
                                : mode === 'login'
                                    ? 'Sign In'
                                    : mode === 'forgot'
                                        ? 'Send Reset Link'
                                        : 'Update Password'}
                    </button>
                </form>

                {message && (
                    <p className="auth-message" role="status">
                        {message}
                    </p>
                )}

                <div className="auth-switch">
                    {mode === 'signup' ? (
                        <p>
                            Already have an account?{' '}
                            <button
                                className="auth-text-button"
                                type="button"
                                onClick={() => changeMode('login')}
                            >
                                Sign in
                            </button>
                        </p>
                    ) : mode === 'login' ? (
                        <p>
                            New here?{' '}
                            <button
                                className="auth-text-button"
                                type="button"
                                onClick={() => changeMode('signup')}
                            >
                                Create an account
                            </button>
                        </p>
                    ) : (
                        <button
                            className="auth-text-button"
                            type="button"
                            onClick={() => changeMode('login')}
                        >
                            ← Back to sign in
                        </button>
                    )}
                </div>

                <p className="auth-footer">
                    A little note to the person you’re becoming.
                </p>
            </section>
        </main>
    )
}

export default Auth
