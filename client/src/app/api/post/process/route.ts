import { NextRequest, NextResponse } from "next/server";
import { verifySignatureAppRouter } from "@upstash/qstash/nextjs";
import { Client } from "@upstash/qstash";
import { prisma } from "@/lib/prisma";
import { twitterPostPublish } from "@/lib/twitter";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";

const qstashClient = new Client({
    token: process.env.QSTASH_TOKEN!,
});

const s3Client = new S3Client({
    region: process.env.AWS_REGION!,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
});

async function getFromS3Bucket(key: string): Promise<Buffer> {
    const command = new GetObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET_NAME!,
        Key: key,
    });

    const response = await s3Client.send(command);
    
    if (!response.Body) {
        throw new Error("No data received from S3");
    }

    const chunks: Uint8Array[] = [];
    for await (const chunk of response.Body as any) {
        chunks.push(chunk);
    }

    return Buffer.concat(chunks);
}

async function handler(request: NextRequest) {
    const jobData = await request.json();

    if (!jobData) {
        return NextResponse.json(
            { error: "Invalid request data" },
            { status: 400 }
        );
    }

    const { userId, mediaKey, url, postId, title } = jobData;
    const userAccs = await prisma.user.findUnique({
        where: {
            id: userId
        }, select: {
            accounts: true
        }
    })

    try {
        const post = await prisma.post.findUnique({
            where: { id: postId },
        });

        if (!post) {
            throw new Error("Post not found.");
        }

        let mediaBuffer: Buffer
        try {
            mediaBuffer = await getFromS3Bucket(mediaKey);
        } catch (error) {
            throw new Error("Failed to retrieve media from S3");
        }

        const twitterAccount =
            userAccs?.accounts.find((acc: { provider: string }) => acc.provider === "twitter");

        if (!twitterAccount) {
            throw new Error("Twitter account not found.");
        }

        if (!twitterAccount.access_token || !twitterAccount.refresh_token) {
            throw new Error("Twitter access token not found.");
        }

        const postResponse = await twitterPostPublish(
            title,
            twitterAccount.access_token,
            twitterAccount.refresh_token,
            mediaBuffer
        );

        await prisma.post.update({
            where: { id: postId },
            data: {
                status: "SUCCESS",
            },
        });

        return NextResponse.json(
            { success: true, data: postResponse },
            { status: 200 }
        );
    } catch (error: any) {
        console.error("Job failed:", error);
        await prisma.post.update({
            where: { id: postId },
            data: {
                status: "FAILED",
            },
        });
        return NextResponse.json(
            { error: "Failed to process the post job." },
            { status: 500 }
        );
    }
}

export const POST = verifySignatureAppRouter(handler, {
    currentSigningKey: process.env.QSTASH_CURRENT_SIGNING_KEY,
    nextSigningKey: process.env.QSTASH_NEXT_SIGNING_KEY,
});