import { auth, db } from '@/lib/firestore'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { collection, query, where, getDocs, updateDoc, doc, getDoc } from 'firebase/firestore'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const { username, password } = await req.json()

  try {
    
    const usersRef = collection(db, 'users')
    const q = query(usersRef, where('username', '==', username))
    const snapshot = await getDocs(q)

    if (snapshot.empty) {
      return NextResponse.json({ error: 'This account does not exist.' }, { status: 404 })
    }

    const userDoc = snapshot.docs[0]
    const userData = userDoc.data()
    const email = userData.email

    const userCred = await signInWithEmailAndPassword(auth, email, password)
    const user = userCred.user

    await user.reload()

    if (!user.emailVerified) {
      return NextResponse.json({ error: 'Email not verified.' }, { status: 401 })
    }

    
    const userDocRef = doc(db, 'users', user.uid)
    await updateDoc(userDocRef, { verified: true })
    

    const updatedUserDoc = await getDoc(userDocRef)
    const updatedUserData = updatedUserDoc.data()

    const responseUser = {
      uid: user.uid,
      email: user.email,
      username: userData.username,
      score: userData.score || 0,
      emailVerified: user.emailVerified,
      isAdmin: updatedUserData?.isAdmin === true
    }
    
    return NextResponse.json({
      message: 'Login successful.',
      user: responseUser
    })

  } catch (err: unknown) {
    if (err instanceof Error) {
      if (err.message.includes('auth/wrong-password')) {
        return NextResponse.json({ error: 'Incorrect password.' }, { status: 401 })
      }
    }
    return NextResponse.json({ error: 'Login failed' }, { status: 500 })
  }
}