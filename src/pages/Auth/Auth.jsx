import React, { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { message } from 'antd'
import { FaArrowRight, FaEnvelope, FaLock } from 'react-icons/fa6'
import { FcGoogle } from 'react-icons/fc'
import { useAuth } from '../../context/AuthContext.jsx'
import './style.scss'

const Auth = () => {
    const [mode, setMode] = useState('login')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [googleSubmitting, setGoogleSubmitting] = useState(false)
    const [messageApi, contextHolder] = message.useMessage()
    const { signIn, signUp, signInWithGoogle, user, loading } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()

    const fromLocation = location.state?.from
    const fromPath = fromLocation ? `${fromLocation.pathname}${fromLocation.search || ''}` : '/app'

    const getAuthErrorMessage = (error) => {
        const code = error?.code || ''

        switch (code) {
            case 'auth/invalid-email':
                return 'That email address does not look valid.'
            case 'auth/user-not-found':
            case 'auth/wrong-password':
            case 'auth/invalid-credential':
                return 'Email or password is incorrect.'
            case 'auth/email-already-in-use':
                return 'That email is already in use. Try logging in instead.'
            case 'auth/weak-password':
                return 'Please choose a stronger password.'
            case 'auth/popup-closed-by-user':
                return 'Google sign-in was closed before it finished.'
            case 'auth/popup-blocked':
                return 'Your browser blocked the Google sign-in popup.'
            case 'auth/account-exists-with-different-credential':
                return 'That email already has another sign-in method.'
            case 'auth/network-request-failed':
                return 'Network error. Check your connection and try again.'
            case 'auth/too-many-requests':
                return 'Too many attempts. Please wait and try again.'
            case 'auth/operation-not-allowed':
                return 'This sign-in method is not enabled yet.'
            default:
                return mode === 'login'
                    ? 'Could not sign you in. Check your details and try again.'
                    : 'Could not create your account right now. Please try again.'
        }
    }

    useEffect(() => {
        if (!loading && user) {
            navigate(fromPath, { replace: true })
        }
    }, [loading, navigate, fromPath, user])

    const handleSubmit = async (event) => {
        event.preventDefault()

        if (mode === 'signup' && password !== confirmPassword) {
            messageApi.open({ type: 'error', content: 'Passwords do not match.' })
            return
        }

        try {
            setSubmitting(true)
            if (mode === 'login') {
                await signIn(email, password)
            } else {
                await signUp(email, password)
            }
            messageApi.open({ type: 'success', content: mode === 'login' ? 'Welcome back.' : 'Account created.' })
            navigate(fromPath, { replace: true })
        } catch (error) {
            messageApi.open({
                type: 'error',
                content: getAuthErrorMessage(error),
            })
        } finally {
            setSubmitting(false)
        }
    }

    const handleGoogleSignIn = async () => {
        try {
            setGoogleSubmitting(true)
            await signInWithGoogle()
            messageApi.open({ type: 'success', content: 'Signed in with Google.' })
            navigate(fromPath, { replace: true })
        } catch (error) {
            messageApi.open({
                type: 'error',
                content: getAuthErrorMessage(error),
            })
        } finally {
            setGoogleSubmitting(false)
        }
    }

    return (
        <div className="auth-page">
            {contextHolder}
            <div className="auth-shell">
                <div className="auth-intro">
                    <p className="eyebrow">Firebase auth</p>
                    <h1>Sign in to manage secure shares.</h1>
                    <p>
                        Use your email to unlock the protected app area, create new share links, and manage private files and notes.
                    </p>
                    <div className="auth-points">
                        <span>Email/password login</span>
                        <span>Protected app route</span>
                        <span>Session persistence</span>
                    </div>
                </div>

                <form className="auth-card" onSubmit={handleSubmit}>
                    <div className="auth-toggle">
                        <button
                            type="button"
                            className={mode === 'login' ? 'active' : ''}
                            onClick={() => setMode('login')}
                        >
                            Log in
                        </button>
                        <button
                            type="button"
                            className={mode === 'signup' ? 'active' : ''}
                            onClick={() => setMode('signup')}
                        >
                            Sign up
                        </button>
                    </div>

                    <div className="auth-divider">
                        <span>or</span>
                    </div>

                    <button
                        type="button"
                        className="google-auth-btn"
                        onClick={handleGoogleSignIn}
                        disabled={submitting || googleSubmitting}
                    >
                        <FcGoogle />
                        {googleSubmitting ? 'Connecting...' : 'Continue with Google'}
                    </button>

                    <div className="auth-field">
                        <label htmlFor="email">
                            <FaEnvelope />
                            Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            autoComplete="email"
                            required
                        />
                    </div>

                    <div className="auth-field">
                        <label htmlFor="password">
                            <FaLock />
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                            required
                        />
                    </div>

                    {mode === 'signup' && (
                        <div className="auth-field">
                            <label htmlFor="confirmPassword">
                                <FaLock />
                                Confirm password
                            </label>
                            <input
                                id="confirmPassword"
                                type="password"
                                placeholder="Repeat your password"
                                value={confirmPassword}
                                onChange={(event) => setConfirmPassword(event.target.value)}
                                autoComplete="new-password"
                                required
                            />
                        </div>
                    )}

                    <button className="auth-submit" type="submit" disabled={submitting}>
                        {submitting ? 'Working...' : mode === 'login' ? 'Sign in' : 'Create account'}
                        <FaArrowRight />
                    </button>

                    <p className="auth-footnote">
                        {mode === 'login' ? 'Need an account?' : 'Already have one?'}{' '}
                        <button type="button" onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}>
                            {mode === 'login' ? 'Create one' : 'Log in'}
                        </button>
                    </p>

                    <p className="auth-backlink">
                        <Link to="/">Back to landing</Link>
                    </p>
                </form>
            </div>
        </div>
    )
}

export default Auth
