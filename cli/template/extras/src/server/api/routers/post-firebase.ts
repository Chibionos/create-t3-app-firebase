import { z } from "zod";
import { adminDb } from "~/server/firebase-admin";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { Timestamp } from "firebase-admin/firestore";

// Zod schemas for Firestore data validation
export const postSchema = z.object({
  id: z.string(),
  title: z.string().min(1).max(200),
  content: z.string().min(1),
  published: z.boolean().default(false),
  authorId: z.string(),
  authorName: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  likes: z.number().default(0),
  tags: z.array(z.string()).default([]),
});

export const createPostSchema = postSchema.omit({
  id: true,
  authorId: true,
  authorName: true,
  createdAt: true,
  updatedAt: true,
  likes: true,
});

export const updatePostSchema = createPostSchema.partial();

export type Post = z.infer<typeof postSchema>;
export type CreatePost = z.infer<typeof createPostSchema>;
export type UpdatePost = z.infer<typeof updatePostSchema>;

export const postRouter = createTRPCRouter({
  // Public query - get all published posts
  getAll: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(10),
        published: z.boolean().optional(),
      })
    )
    .query(async ({ input }) => {
      let query = adminDb.collection("posts").limit(input.limit);
      
      if (input.published !== undefined) {
        query = query.where("published", "==", input.published);
      }
      
      query = query.orderBy("createdAt", "desc");
      
      const snapshot = await query.get();
      
      const posts = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as Post;
      });
      
      return posts;
    }),

  // Public query - get single post by ID
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const doc = await adminDb.collection("posts").doc(input.id).get();
      
      if (!doc.exists) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Post not found",
        });
      }
      
      const data = doc.data()!;
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as Post;
    }),

  // Protected mutation - create a new post
  create: protectedProcedure
    .input(createPostSchema)
    .mutation(async ({ ctx, input }) => {
      const now = Timestamp.now();
      
      const postData = {
        ...input,
        authorId: ctx.user.uid,
        authorName: ctx.user.name || ctx.user.email || "Anonymous",
        createdAt: now,
        updatedAt: now,
        likes: 0,
      };
      
      const docRef = await adminDb.collection("posts").add(postData);
      
      return {
        id: docRef.id,
        ...postData,
        createdAt: now.toDate(),
        updatedAt: now.toDate(),
      } as Post;
    }),

  // Protected mutation - update a post
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        data: updatePostSchema,
      })
    )
    .mutation(async ({ ctx, input }) => {
      const docRef = adminDb.collection("posts").doc(input.id);
      const doc = await docRef.get();
      
      if (!doc.exists) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Post not found",
        });
      }
      
      // Check if user is the author
      const postData = doc.data()!;
      if (postData.authorId !== ctx.user.uid) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You can only edit your own posts",
        });
      }
      
      const updateData = {
        ...input.data,
        updatedAt: Timestamp.now(),
      };
      
      await docRef.update(updateData);
      
      const updated = await docRef.get();
      const updatedData = updated.data()!;
      
      return {
        id: updated.id,
        ...updatedData,
        createdAt: updatedData.createdAt?.toDate() || new Date(),
        updatedAt: updatedData.updatedAt?.toDate() || new Date(),
      } as Post;
    }),

  // Protected mutation - delete a post
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const docRef = adminDb.collection("posts").doc(input.id);
      const doc = await docRef.get();
      
      if (!doc.exists) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Post not found",
        });
      }
      
      // Check if user is the author
      const postData = doc.data()!;
      if (postData.authorId !== ctx.user.uid) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You can only delete your own posts",
        });
      }
      
      await docRef.delete();
      
      return { success: true };
    }),

  // Protected mutation - like/unlike a post
  toggleLike: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const postRef = adminDb.collection("posts").doc(input.id);
      const likeRef = adminDb
        .collection("posts")
        .doc(input.id)
        .collection("likes")
        .doc(ctx.user.uid);
      
      const [postDoc, likeDoc] = await Promise.all([
        postRef.get(),
        likeRef.get(),
      ]);
      
      if (!postDoc.exists) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Post not found",
        });
      }
      
      const batch = adminDb.batch();
      
      if (likeDoc.exists) {
        // Unlike
        batch.delete(likeRef);
        batch.update(postRef, {
          likes: adminDb.FieldValue.increment(-1),
        });
      } else {
        // Like
        batch.set(likeRef, {
          userId: ctx.user.uid,
          createdAt: Timestamp.now(),
        });
        batch.update(postRef, {
          likes: adminDb.FieldValue.increment(1),
        });
      }
      
      await batch.commit();
      
      return { liked: !likeDoc.exists };
    }),

  // Protected query - get user's posts
  getMyPosts: protectedProcedure.query(async ({ ctx }) => {
    const snapshot = await adminDb
      .collection("posts")
      .where("authorId", "==", ctx.user.uid)
      .orderBy("createdAt", "desc")
      .get();
    
    const posts = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as Post;
    });
    
    return posts;
  }),

  // Public query with aggregation - get posts by tag
  getByTag: publicProcedure
    .input(
      z.object({
        tag: z.string(),
        limit: z.number().min(1).max(100).default(10),
      })
    )
    .query(async ({ input }) => {
      const snapshot = await adminDb
        .collection("posts")
        .where("tags", "array-contains", input.tag)
        .where("published", "==", true)
        .orderBy("createdAt", "desc")
        .limit(input.limit)
        .get();
      
      const posts = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as Post;
      });
      
      return posts;
    }),
});