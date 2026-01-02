// app/api/reviews/vote/route.ts

import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { helpfulVoteSchema } from "@/lib/validations/review/review";

/**
 * POST /api/reviews/vote
 * Toggle helpful/not helpful vote on a review
 */
export async function POST(request: NextRequest) {
  try {
    // ============================================
    // 1. AUTHENTICATION CHECK
    // ============================================
    const user = await currentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized", message: "You must be signed in to vote" },
        { status: 401 }
      );
    }

    // ============================================
    // 2. PARSE AND VALIDATE REQUEST BODY
    // ============================================
    const body = await request.json();
    const validation = helpfulVoteSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          message: "Invalid vote data",
          errors: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const data = validation.data;

    // ============================================
    // 3. GET USER FROM DATABASE
    // ============================================
    const dbUser = await prisma.user.findUnique({
      where: { email: user.emailAddresses[0].emailAddress },
      select: { id: true },
    });

    if (!dbUser) {
      return NextResponse.json(
        { error: "User not found", message: "User account not found in database" },
        { status: 404 }
      );
    }

    // ============================================
    // 4. CHECK IF REVIEW EXISTS
    // ============================================
    const review = await prisma.review.findUnique({
      where: { id: data.reviewId },
      select: { id: true, userId: true, deletedAt: true },
    });

    if (!review) {
      return NextResponse.json(
        { error: "Review not found", message: "The review you're trying to vote on does not exist" },
        { status: 404 }
      );
    }

    if (review.deletedAt) {
      return NextResponse.json(
        { error: "Review deleted", message: "Cannot vote on a deleted review" },
        { status: 410 }
      );
    }

    // ============================================
    // 5. PREVENT SELF-VOTING
    // ============================================
    if (review.userId === dbUser.id) {
      return NextResponse.json(
        { error: "Self-voting not allowed", message: "You cannot vote on your own review" },
        { status: 403 }
      );
    }

    // ============================================
    // 6. CHECK EXISTING VOTE
    // ============================================
    const existingVote = await prisma.reviewVote.findUnique({
      where: {
        reviewId_userId: {
          reviewId: data.reviewId,
          userId: dbUser.id,
        },
      },
    });

    let result: { helpfulCount: number; notHelpfulCount: number; userVote: { isHelpful: boolean } };

    if (existingVote) {
      // ============================================
      // 7A. UPDATE EXISTING VOTE (user changed their mind)
      // ============================================
      if (existingVote.isHelpful === data.isHelpful) {
        // User clicked the same button - remove vote
        await prisma.$transaction([
          prisma.reviewVote.delete({
            where: { id: existingVote.id },
          }),
          prisma.review.update({
            where: { id: data.reviewId },
            data: {
              helpfulCount: existingVote.isHelpful ? { decrement: 1 } : undefined,
              notHelpfulCount: !existingVote.isHelpful ? { decrement: 1 } : undefined,
              totalVotes: { decrement: 1 },
            },
          }),
        ]);

        // Fetch updated counts
        const updatedReview = await prisma.review.findUnique({
          where: { id: data.reviewId },
          select: { helpfulCount: true, notHelpfulCount: true },
        });

        return NextResponse.json({
          success: true,
          message: "Vote removed",
          voteRemoved: true,
          helpfulCount: updatedReview?.helpfulCount || 0,
          notHelpfulCount: updatedReview?.notHelpfulCount || 0,
          userVote: null,
        });
      } else {
        // User switched vote (helpful -> not helpful or vice versa)
        await prisma.$transaction([
          prisma.reviewVote.update({
            where: { id: existingVote.id },
            data: { isHelpful: data.isHelpful },
          }),
          prisma.review.update({
            where: { id: data.reviewId },
            data: {
              helpfulCount: data.isHelpful ? { increment: 1 } : { decrement: 1 },
              notHelpfulCount: data.isHelpful ? { decrement: 1 } : { increment: 1 },
            },
          }),
        ]);

        const updatedReview = await prisma.review.findUnique({
          where: { id: data.reviewId },
          select: { helpfulCount: true, notHelpfulCount: true },
        });

        result = {
          helpfulCount: updatedReview?.helpfulCount || 0,
          notHelpfulCount: updatedReview?.notHelpfulCount || 0,
          userVote: { isHelpful: data.isHelpful },
        };
      }
    } else {
      // ============================================
      // 7B. CREATE NEW VOTE
      // ============================================
      await prisma.$transaction([
        prisma.reviewVote.create({
          data: {
            reviewId: data.reviewId,
            userId: dbUser.id,
            isHelpful: data.isHelpful,
          },
        }),
        prisma.review.update({
          where: { id: data.reviewId },
          data: {
            helpfulCount: data.isHelpful ? { increment: 1 } : undefined,
            notHelpfulCount: !data.isHelpful ? { increment: 1 } : undefined,
            totalVotes: { increment: 1 },
          },
        }),
      ]);

      const updatedReview = await prisma.review.findUnique({
        where: { id: data.reviewId },
        select: { helpfulCount: true, notHelpfulCount: true },
      });

      result = {
        helpfulCount: updatedReview?.helpfulCount || 0,
        notHelpfulCount: updatedReview?.notHelpfulCount || 0,
        userVote: { isHelpful: data.isHelpful },
      };
    }

    // ============================================
    // 8. RETURN SUCCESS RESPONSE
    // ============================================
    return NextResponse.json({
      success: true,
      message: "Vote recorded successfully",
      ...result,
    });
  } catch (error) {
    console.error("[Review Vote] Error:", error);

    return NextResponse.json(
      {
        error: "Internal server error",
        message: "Failed to record vote. Please try again later.",
      },
      { status: 500 }
    );
  }
}
