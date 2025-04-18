import { NextRequest, NextResponse } from 'next/server'
import { collection, getDocs, orderBy, query, limit } from 'firebase/firestore'
import { db } from '@/lib/firestore'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const mode = searchParams.get('mode')
    const limitParam = searchParams.get('limit') || '50'

    
    if (!mode || !['easy', 'medium', 'hard'].includes(mode)) {
      return NextResponse.json(
        { error: 'Invalid mode. Use easy, medium, or hard.' }, 
        { status: 400 }
      )
    }


    const leaderboardRef = collection(db, `scores_${mode}`)
    const leaderboardQuery = query(
      leaderboardRef,
      orderBy('score', 'desc'),
      limit(parseInt(limitParam))
    )
    
    const snapshot = await getDocs(leaderboardQuery)
    const leaders = snapshot.docs.map((doc, index) => {
      const data = doc.data()
      return {
        username: data.username,
        score: data.score,
        rank: index + 1,
        timestamp: data.timestamp ? data.timestamp.toDate().toISOString() : null
      }
    })
    
    return NextResponse.json({ leaders })
  } catch (err: unknown) {
    console.error('Leaderboard API error:', err)
    if (err instanceof Error) {
      return NextResponse.json({ error: err.message }, { status: 500 })
    } else {
      return NextResponse.json({ error: 'Unknown error occurred' }, { status: 500 })
    }
  }
}