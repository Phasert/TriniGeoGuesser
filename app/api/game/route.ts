import { NextRequest, NextResponse } from 'next/server'
import { collection, getDocs, serverTimestamp, query, where, updateDoc, doc, setDoc } from 'firebase/firestore'
import { db } from '@/lib/firestore'

export async function POST(req: NextRequest) {
  try {
    const { type, mode, guess, actual, score, username, exclude } = await req.json()

    if (type === 'fetch') {
      if (!mode) {
        return NextResponse.json({ error: 'Missing mode' }, { status: 400 })
      }

      const snapshot = await getDocs(collection(db, `locations_${mode}`))
      let docs = snapshot.docs.map((doc) => {
        const data = doc.data()
        return { ...data, id: doc.id }
      })
      
     
      if (exclude && Array.isArray(exclude) && exclude.length > 0) {
        docs = docs.filter(doc => !exclude.includes(doc.id))
      }
      
      
      if (docs.length === 0) {
        return NextResponse.json({ error: 'No more unique locations available' }, { status: 404 })
      }

      const random = docs[Math.floor(Math.random() * docs.length)]
      return NextResponse.json({ location: random })
    }

    if (type === 'distance') {
      if (!guess || !actual) {
        return NextResponse.json({ error: 'Missing coordinates' }, { status: 400 })
      }

      const dist = haversineDistance(
        guess.lat,
        guess.lng,
        actual.lat,
        actual.lng
      )

      return NextResponse.json({ distance: dist })
    }

    if (type === 'saveScore') {
      if (!mode || score === undefined || !username) {
        return NextResponse.json({ error: 'Missing required data' }, { status: 400 })
      }

     
      const userScoreQuery = query(
        collection(db, `scores_${mode}`),
        where('username', '==', username)
      )
      
      const userScoreSnapshot = await getDocs(userScoreQuery)
      
      if (userScoreSnapshot.empty) {
        await setDoc(doc(collection(db, `scores_${mode}`), username), {
          username,
          score,
          timestamp: serverTimestamp()
        })
        return NextResponse.json({ success: true, message: 'Score saved' })
      } else {
       
        const existingDoc = userScoreSnapshot.docs[0]
        const existingScore = existingDoc.data().score || 0
        
        if (score > existingScore) {
          await updateDoc(existingDoc.ref, {
            score,
            timestamp: serverTimestamp()
          })
          return NextResponse.json({ success: true, message: 'High score updated' })
        } else {
          return NextResponse.json({ success: true, message: 'No update needed' })
        }
      }
    }

    return NextResponse.json({ error: 'Invalid request type' }, { status: 400 })
  } catch (err: unknown) {
    if (err instanceof Error) {
      return NextResponse.json({ error: err.message }, { status: 500 })
    } else {
      return NextResponse.json({ error: 'Unknown error occurred' }, { status: 500 })
    }
  }
}

function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}
