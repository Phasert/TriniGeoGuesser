import { auth, db } from '@/lib/firestore'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const { email, password } = await req.json()

  try {
    const userCred = await signInWithEmailAndPassword(auth, email, password)

    const user = userCred.user

    if (!user.emailVerified) {
      return NextResponse.json({ error: 'Email not verified.' }, { status: 401 })
    }

    const userDocRef = doc(db, 'users', user.uid)
    const userDocSnap = await getDoc(userDocRef)

    if (!userDocSnap.exists()) {
      return NextResponse.json({ error: 'User profile not found.' }, { status: 404 })
    }

    await updateDoc(userDocRef, {
      verified: true
    })

    const userData = userDocSnap.data()

    return NextResponse.json({
      message: 'Login successful.',
      user: {
        uid: user.uid,
        email: user.email,
        username: userData.username,
        score: userData.score || 0,
        emailVerified: user.emailVerified,
      },
    })
  } catch (err: unknown) {
    if (err instanceof Error) {
      return NextResponse.json({ error: err.message }, { status: 500 })
    } else {
      return NextResponse.json({ error: 'Unknown error occurred' }, { status: 500 })
    }
  }
}