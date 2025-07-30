import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const jobs = await prisma.videoJob.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ jobs });
  } catch (error) {
    console.error('Error fetching video jobs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch video jobs' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { taskId, youtubeUrl, title } = body;

    if (!taskId || !youtubeUrl) {
      return NextResponse.json(
        { error: 'taskId and youtubeUrl are required' },
        { status: 400 }
      );
    }

    const job = await prisma.videoJob.create({
      data: {
        userId: session.user.id,
        taskId,
        youtubeUrl,
        title,
        status: 'QUEUED',
        progress: 0,
        statusMessage: 'Task queued for processing',
      },
    });

    return NextResponse.json({ job });
  } catch (error) {
    console.error('Error creating video job:', error);
    return NextResponse.json(
      { error: 'Failed to create video job' },
      { status: 500 }
    );
  }
}
