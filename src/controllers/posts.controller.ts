import type { Context } from "hono";
import pool from "../config/db";
import type { CreatePostModel, PostModel } from "../models/posts.model";
import type { ResultSetHeader } from "mysql2";

export async function getAllPosts(context: Context) {
  try {
    const [rows] = await pool.query<PostModel[]>(`SELECT * FROM posts`);
    return context.json(rows, 200);
  } catch (error) {
    console.log(error);
    return context.json({ message: 'Internal server error' }, 500);
  }
}

export async function getPostById(context: Context) {
  try { 
    const id = context.req.param('id');
    const [rows] = await pool.query<PostModel[]>(`SELECT * FROM posts WHERE post_id = ?`, [id]);
    const data = rows[0];

    if (data) {
      return context.json(data, 200);
    }

    return context.json(null, 200);
  } catch (error) {
    console.log(error);
    return context.json({ message: 'Internal server error' }, 500);
  }
}

export async function createPost(context: Context) {
  try {
    const body: CreatePostModel = await context.req.json();
    
    // Validation for creating a post
    // Use zod to validate the data
    if (!body.title || body.title === "") {
      return context.json({ message: "Title is required" }, 400);
    }
    
    const [result] = await pool.query<ResultSetHeader>
      (`INSERT INTO posts (title, description, status) VALUES (?, ?, ?)`, [body.title, body.description, body.status]);

    if (result) {
      const id = result.insertId;
      const [data] = await pool.query<PostModel[]>(`SELECT * FROM posts WHERE post_id = ?`, [id]);
      const post = data[0];
      return context.json(post, 201);
    }

    return context.json({ message: "Failed to create post" }, 400);
  } catch (error) {
    console.log(error);
    return context.json({ message: "Internal server error" }, 500);
  }
}

export async function deletePostById(context: Context) {
  try {
    const id = context.req.param('id');
    const [result] = await pool.query<ResultSetHeader>(`DELETE FROM posts WHERE post_id = ?`, [id]);

    if (result.affectedRows > 0) {
      return context.json({ message: "Post successfully deleted" }, 200);
    }

    return context.json({ message: "Post not found" }, 404);
  } catch (error) {
    console.log(error);
    return context.json({ message: "Internal server error" }, 500);
  }
}