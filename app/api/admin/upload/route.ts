import { db } from '@/lib/firestore'
import { collection, addDoc } from 'firebase/firestore'
import { NextResponse } from 'next/server'
import { LocationData } from '@/lib/type'
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, info, hint, lat, lng, imageUrl, difficulty } = body

    if (!name || !info || !lat || !lng || !imageUrl || !difficulty) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const data: LocationData = {
      name,
      info,
      imageUrl,
      coordinates: {
        lat: parseFloat(lat),
        lng: parseFloat(lng),
      },
    }

    if (difficulty === 'easy' && hint) {
      data.hint = hint
    }

    await addDoc(collection(db, `locations_${difficulty}`), data)

    return NextResponse.json({ success: true, data })
  } catch (err: unknown) {
    if (err instanceof Error) {
      return NextResponse.json({ error: err.message }, { status: 500 })
    } else {
      return NextResponse.json({ error: 'Unknown error occurred' }, { status: 500 })
    }
  }
}
