import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

export async function POST(request) {
  try {
    console.log('Starting analysis...')

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" })

    const formData = await request.formData()
    const video = formData.get('video')
    const shotTypeInput = formData.get('shotType') || 'open_play'
    const distanceInput = formData.get('distance') || 'inside_box'
    const outcomeInput = formData.get('outcome') || 'unknown'

const outcomeLabels = {
  goal_top_corner: 'GOAL - ball went into the top corner',
  goal_bottom_corner: 'GOAL - ball went into the bottom corner',
  goal_center: 'GOAL - ball went through the center of the goal',
  saved: 'SAVED - goalkeeper saved the shot',
  post_bar: 'HIT THE POST OR BAR',
  missed_wide: 'MISSED - went wide of the goal',
  missed_high: 'MISSED - went over the bar'
}

const shotTypeLabels = {
  open_play: 'open play',
  free_kick: 'free kick with a wall',
  penalty: 'penalty kick',
  volley: 'volley',
  header: 'header',
  long_range: 'long range shot'
}

const distanceLabels = {
  inside_box: 'inside the penalty box (0-18 yards)',
  edge_box: 'edge of the box (18-25 yards)',
  long_range: 'long range (25+ yards)'
}

    if (!video) {
      return NextResponse.json(
        { error: 'No video provided' },
        { status: 400 }
      )
    }

    console.log('Analyzing video:', video.name, 'Type:', video.type)

    // Convert video to base64 to send to Gemini
    const bytes = await video.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64Video = buffer.toString('base64')

    console.log('Video converted to base64, size:', buffer.length, 'bytes')

    const prompt = `You are a UEFA-licensed professional coach analyzing real match or training footage.

CONTEXT PROVIDED BY USER (treat this as fact):
- Shot type: ${shotTypeLabels[shotTypeInput]}
- Distance: ${distanceLabels[distanceInput]}
- Shot outcome: ${outcomeLabels[outcomeInput]}

IMPORTANT: The accuracy score MUST reflect the outcome. 
If the shot was a GOAL top corner, accuracy must be 17-20.
If the shot was SAVED easily, accuracy should be 8-12.
If the shot MISSED wide or high, accuracy should be 4-9.

Use this context when analyzing. Do not contradict it.

STEP 1 - Observe carefully:
- What type of shot is this? (free kick, open play, volley, penalty etc.)
- Is this a professional, amateur, or youth player?
- What is the distance and angle from goal?
- Is there a wall, defenders, or pressure?
- Watch the full run-up, body shape, contact, and ball flight

STEP 2 - Score honestly based on what you see:
If the player appears professional or elite, scores should reflect that (75-95).
If the player appears amateur, scores should reflect that (40-70).
If the technique is genuinely world class, score accordingly (90+).

Rubric (0-20 each):
- Power: hip rotation, leg speed, contact point, follow-through
- Accuracy: trajectory, placement, keeper difficulty, margin for error
- Body Positioning: balance, lean, stride timing, center of gravity
- Foot Technique: ankle lock, contact surface, plant-foot placement
- Shot Difficulty: distance, angle, pressure, wall, defender proximity

Reference points:
- Ronaldo/Messi free kick = 92-97
- Good Premier League player free kick = 82-90
- Good amateur = 55-70
- Beginner = 30-50

Return ONLY valid JSON:
{
  "score": <total 0-100>,
  "shotType": "<specific description e.g. 'curled free kick over wall from 25 yards'>",
  "rubric": {
    "power": <0-20>,
    "accuracy": <0-20>,
    "bodyPositioning": <0-20>,
    "footTechnique": <0-20>,
    "shotDifficulty": <0-20>
  },
  "strengths": ["specific observed strength 1", "specific observed strength 2", "specific observed strength 3"],
  "improvements": ["specific correction 1", "specific correction 2", "specific correction 3"]
}`

    const result = await model.generateContent([
      {
        inlineData: {
          mimeType: video.type || 'video/mp4',
          data: base64Video
        }
      },
      { text: prompt }
    ])

    const responseText = result.response.text().trim()
    
    console.log('=== RAW RESPONSE ===')
    console.log(responseText)
    console.log('=== END RESPONSE ===')
    
    let jsonText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const analysis = JSON.parse(jsonText)

    return NextResponse.json(analysis)

  } catch (error) {
    console.error('=== ERROR ===')
    console.error('Error message:', error.message)
    console.error('=== END ERROR ===')
    
    return NextResponse.json({
      score: 0,
      shotType: "Analysis failed",
      rubric: {
        power: 0,
        accuracy: 0,
        bodyPositioning: 0,
        footTechnique: 0,
        shotDifficulty: 0
      },
      strengths: ["Could not analyze video"],
      improvements: ["Please try uploading again"]
    })
  }
}