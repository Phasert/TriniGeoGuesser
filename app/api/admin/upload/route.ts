import { db } from '@/lib/firestore'
import { collection, addDoc } from 'firebase/firestore'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, info, hint, lat, lng, imageUrl, difficulty } = body

    if (!name || !info || !lat || !lng || !imageUrl || !difficulty) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const data: any = {
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
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
