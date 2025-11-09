import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { Client } from "@upstash/qstash";

export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { title, url, mediaKey } = await request.json();

        if (!title && !url && !mediaKey) {
            return NextResponse.json(
                { error: "Please enter some text or upload an image" },
                { status: 400 }
            );
        }

        const qstashClient = new Client({
            token: process.env.QSTASH_TOKEN!,
        });

        const URL = process.env.NEXTAUTH_URL;
        if (!URL) {
            return NextResponse.json({ error: "Invalid URL" }, { status: 500 });
        }

        const post = await prisma.post.create({
            data: {
                userId: session.user.id,
                mediaKey,
                status: "PENDING",
                text: title,
                url,
            },
        });


        const jobData = {
            userId: session.user.id,
            mediaKey,
            url,
            title,
            postId: post.id
        };

        const publish = await qstashClient.publishJSON({
            url: `${URL}/api/post/process`,
            body: jobData,
            retries: 2
        })

        return NextResponse.json({ results: post }, { status: 201 });
    } catch (error) {
        console.error("CreatePost Error:", error);
        return NextResponse.json(
            { error: "An unexpected error occurred. Please try again." },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    try {
        const session = await auth()
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

    } catch (error: any) {
        console.error("GetPosts Error:", error);
        return NextResponse.json(
            { error: "An unexpected error occurred" },
            { status: 500 }
        );
    }
}