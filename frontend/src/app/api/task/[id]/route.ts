import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const job = await prisma.videoJob.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    return NextResponse.json({ job });
  } catch (error) {
    console.error('Error fetching video job:', error);
    return NextResponse.json(
      { error: 'Failed to fetch video job' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { 
      status, 
      progress, 
      statusMessage, 
      errorMessage, 
      clipsData, 
      s3Urls,
      completedAt 
    } = body;

    const job = await prisma.videoJob.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    const updatedJob = await prisma.videoJob.update({
      where: { id: params.id },
      data: {
        ...(status && { status }),
        ...(progress !== undefined && { progress }),
        ...(statusMessage && { statusMessage }),
        ...(errorMessage && { errorMessage }),
        ...(clipsData && { clipsData }),
        ...(s3Urls && { s3Urls }),
        ...(completedAt && { completedAt: new Date(completedAt) }),
      },
    });

    return NextResponse.json({ job: updatedJob });
  } catch (error) {
    console.error('Error updating video job:', error);
    return NextResponse.json(
      { error: 'Failed to update video job' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const job = await prisma.videoJob.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    await prisma.videoJob.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting video job:', error);
    return NextResponse.json(
      { error: 'Failed to delete video job' },
      { status: 500 }
    );
  }
}
