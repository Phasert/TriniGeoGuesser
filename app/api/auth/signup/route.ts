import { auth, db } from '@/lib/firestore'
import { doc, setDoc, collection, query, where, getDocs } from 'firebase/firestore'
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const { email, password, username } = await req.json()

  try {
    
    const emailQuery = query(
      collection(db, 'users'),
      where('email', '==', email)
    )
    const emailSnapshot = await getDocs(emailQuery)

    if (!email || emailSnapshot.size > 0) {
      return NextResponse.json(
        { error: 'Email already in use.' },
        { status: 400 }
      )
    }
    const usernameQuery = query(
      collection(db, 'users'),
      where('username', '==', username)
    )
    const usernameSnapshot = await getDocs(usernameQuery)

    if (!username || usernameSnapshot.size > 0) {
      return NextResponse.json(
        { error: 'Username already taken.' },
        { status: 400 }
      )
    }


    const userCred = await createUserWithEmailAndPassword(auth, email, password)


    await sendEmailVerification(userCred.user)

  
    await setDoc(doc(db, 'users', userCred.user.uid), {
      uid: userCred.user.uid,
      email,
      username,
      createdAt: new Date().toISOString(),
      score: 0,
      verified: false,
      isAdmin: false,
    })

    return NextResponse.json({
      message: 'User created. Verification email sent.',
      user: {
        uid: userCred.user.uid,
        email,
        username,
        emailVerified: userCred.user.emailVerified,
        isAdmin: false,
      },
    })
  } catch (err: unknown) {
    if (
      typeof err === 'object' &&
      err !== null &&
      'message' in err &&
      typeof err.message === 'string'
    ) {
      let message = 'An error occurred.'
  
      if (err.message.includes('email-already-in-use')) {
        message = 'Email already in use.'
      } else if (err.message.includes('invalid-email')) {
        message = 'Invalid email address.'
      } else if (err.message.includes('weak-password')) {
        message = 'Password should be at least 6 characters.'
      } 
  
      return NextResponse.json({ error: message }, { status: 400 })
    }
  
    return NextResponse.json(
      { error: 'Unknown error occurred' },
      { status: 500 }
    )
  }
}