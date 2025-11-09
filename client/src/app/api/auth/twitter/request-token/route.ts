import OAuth from "oauth-1.0a"
import crypto from "crypto"
import axios from "axios"
import { auth } from "@/auth"
import { NextResponse } from "next/server"

const oauth = new OAuth({
    consumer: {
        key: process.env.TWITTER_CONSUMER_KEY as string,
        secret: process.env.TWITTER_CONSUMER_SECRET as string,
    },
    signature_method: "HMAC-SHA1",
    hash_function(base_string, key) {
        return crypto.createHmac("sha1", key).update(base_string).digest("base64")
    },
})

export async function GET() {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const requestData = {
        url: "https://api.twitter.com/oauth/request_token",
        method: "POST",
        data: { oauth_callback: `${process.env.NEXTAUTH_URL}/api/auth/twitter/callback?loggedUserId=${session?.user.id}` },
    }

    try {
        const headers = oauth.toHeader(oauth.authorize(requestData));
        const response = await axios.post(requestData.url, null, {
            headers: {
                Authorization: headers.Authorization,
            }
        })

        const { oauth_token } = Object.fromEntries(new URLSearchParams(response.data))
        return NextResponse.json({ oauth_token },{
            status: 200,
        })

    } catch (error: any) {
        console.error("Error details:", error)
        return NextResponse.json({
            error: "Failed to get request token",
            details: "Callback URL not approved. Please check your Twitter Developer App settings.",
        },{status: 500})
    }
}