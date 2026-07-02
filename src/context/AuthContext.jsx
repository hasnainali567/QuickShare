import { createContext, useContext, useEffect, useMemo, useState } from 'react'
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

    const value = useMemo(() => {
        const signUp = (email, password) => createUserWithEmailAndPassword(auth, email, password)
        const signIn = (email, password) => signInWithEmailAndPassword(auth, email, password)
        const signInWithGoogle = () => signInWithPopup(auth, googleProvider)
        const logOut = () => signOut(auth)

        return {
            user,
            loading,
            signUp,
            signIn,
            signInWithGoogle,
            signOut: logOut,
        }
    }, [loading, user])

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
