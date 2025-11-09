import OAuth from "oauth-1.0a"
import crypto from "crypto"
import { NextResponse } from "next/server"
import axios from "axios"
import { prisma } from "@/lib/prisma"

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

export async function POST(request: Request) {
    try {
        const { oauth_token, oauth_verifier, loggedUserId } = await request.json()

        if (!oauth_token || !oauth_verifier || !loggedUserId) {
            return NextResponse.json({ error: "Missing required parameters" }, { status: 400 })
        }

        const requestData = {
            url: "https://api.twitter.com/oauth/access_token",
            method: "POST",
            data: { oauth_token, oauth_verifier },
        }

        const headers = oauth.toHeader(oauth.authorize(requestData))
        if (!headers) {
            return NextResponse.json({ error: "Failed to generate OAuth headers" }, { status: 500 })
        }

        const response = await axios.post(requestData.url, null, {
            headers: {
                ...headers,
                "Content-Type": "application/x-www-form-urlencoded",
            },
            params: {
                oauth_verifier,
                oauth_token,
            },
        })

        const {
            oauth_token: accessToken,
            oauth_token_secret: accessTokenSecret,
            user_id,
            screen_name,
        } = Object.fromEntries(new URLSearchParams(response.data))

        if (!accessToken || !accessTokenSecret || !user_id) {
            return NextResponse.json({ error: "Failed to retrieve access token" }, { status: 500 })
        }

        const existingUser = await prisma.user.findUnique({
            where: { id: loggedUserId },
            include: { accounts: true },
        })

        if (!existingUser) {
            return NextResponse.json({ error: "User not found" }, { status: 404 })
        }

        const existingUserTwitterAccount = existingUser.accounts.find((account) => account.provider === "twitter")
        if (existingUserTwitterAccount) {
            await prisma.account.update({
                where: {
                    provider_providerAccountId: {
                        provider: "twitter",
                        providerAccountId: existingUserTwitterAccount.providerAccountId,
                    },
                },
                data: {
                    access_token : accessToken,
                    refresh_token: accessTokenSecret,
                },
            })
        } else {
            await prisma.account.create({
                data: {
                    provider: "twitter",
                    providerAccountId: user_id,
                    userId: loggedUserId,
                    access_token: accessToken,
                    refresh_token: accessTokenSecret,
                    scope: "tweet.read tweet.write users.read offline.access",
                    type: "oauth:1.0a",
                },
            })
        }

        return NextResponse.json(
            {
                success: true,
                message: "Twitter account linked successfully",
            },
            { status: 200 },
        )
    } catch (error) {
        console.error("Error in Twitter Access Token: ", error)
        if (axios.isAxiosError(error)) {
            return NextResponse.json(
                { error: `Twitter API error: ${error.response?.data || error.message}` },
                { status: error.response?.status || 500 },
            )
        }
        return NextResponse.json({ error: "Failed to get access token and save user data" }, { status: 500 })
    }
}
