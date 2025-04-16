import { NextRequest, NextResponse } from 'next/server'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firestore'

export async function POST(req: NextRequest) {
  try {
    const { type, mode, guess, actual } = await req.json()

    if (type === 'fetch') {
      if (!mode) {
        return NextResponse.json({ error: 'Missing mode' }, { status: 400 })
      }

      const snapshot = await getDocs(collection(db, `locations_${mode}`))
      const docs = snapshot.docs.map((doc) => doc.data())
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
