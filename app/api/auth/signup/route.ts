import { auth,db } from '@/lib/firestore'
import { doc, setDoc } from 'firebase/firestore'
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const { email, password, username } = await req.json()

  try {
    const userCred = await createUserWithEmailAndPassword(auth, email, password)

    await sendEmailVerification(userCred.user)

    await setDoc(doc(db, 'users', userCred.user.uid), {
      uid: userCred.user.uid,
      email,
      username,
      createdAt: new Date().toISOString(),
      score: 0,
      verified: false
    })
    console.log('[SIGNUP]', email, password, username)


    return NextResponse.json({
      message: 'User created. Verification email sent.',
      user: {
        uid: userCred.user.uid,
        email,
        username,
        emailVerified: userCred.user.emailVerified,
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