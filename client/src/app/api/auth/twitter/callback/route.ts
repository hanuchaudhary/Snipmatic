import axios from "axios"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const oauth_token = searchParams.get("oauth_token")
  const oauth_verifier = searchParams.get("oauth_verifier")
  const loggedUserId = searchParams.get("loggedUserId")

  console.log({
    oauth_token: oauth_token,
    oauth_verifier: oauth_verifier,
    searchParams: searchParams,
    loggedUserId: loggedUserId,
  })

  if (!oauth_token || !oauth_verifier) {
    return NextResponse.redirect(
      `${process.env.NEXTAUTH_URL}/error/authError?error=Missing oauth_token or oauth_verifier`,
    )
  }

  try {
    const response = await axios.post(`${process.env.NEXTAUTH_URL}/api/auth/twitter/access-token`, {
      oauth_token,
      oauth_verifier,
      loggedUserId
    })

    if (response.status !== 200) {
      throw new Error(`Failed to get access token. Status: ${response.status}`)
    }

    const data = response.data
    const cookieOptions = `HttpOnly; Path=/; Max-Age=${30 * 24 * 60 * 60}; SameSite=Lax`
    const cookie = `sessionToken=${data.sessionToken}; ${cookieOptions}`
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/dashboard`, {
      headers: {
        "Set-Cookie": cookie,
      },
    })
  } catch (error) {
    console.error("Error in callback:", error)
    if (axios.isAxiosError(error)) {
      console.error("Axios error details:", error.response?.data)
    }
    return NextResponse.redirect(
      `${process.env.NEXTAUTH_URL}/error/authError?error=${encodeURIComponent("Failed to complete authentication")}`,
    )
  }
}
