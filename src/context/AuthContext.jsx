import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react'
import {
    auth,
    googleProvider,
    createUserWithEmailAndPassword,
    onAuthStateChanged,
    signInWithPopup,
    signInWithEmailAndPassword,
    signOut,
} from '../config/firebaseConfig.js'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser)
            setLoading(false)
        })

        return unsubscribe
    }, [])

    const signUp = useCallback((email, password) => createUserWithEmailAndPassword(auth, email, password), [])
    const signIn = useCallback((email, password) => signInWithEmailAndPassword(auth, email, password), [])
    const signInWithGoogle = useCallback(() => signInWithPopup(auth, googleProvider), [])
    const logOut = useCallback(() => signOut(auth), [])

    const value = useMemo(() => ({
        user,
        loading,
        signUp,
        signIn,
        signInWithGoogle,
        signOut: logOut,
    }), [user, loading, signUp, signIn, signInWithGoogle, logOut])

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
