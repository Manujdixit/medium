import { Hono } from "hono";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { verify } from "hono/jwt";
import { createBlogInput, updateBlogInput } from "@100xdevs/medium-common";

export const blogRouter = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    JWT_SECRET: string;
  };
  Variables: {
    userId: String;
  };
}>();

blogRouter.use("/*", async (c, next) => {
  const token = c.req.header("authorization") || "";
  try {
    const user = await verify(token, c.env.JWT_SECRET);
    if (user) {
      c.set("userId", user.id);
      await next();
    } else {
      c.status(403);
      return c.json({
        message: "not logged in",
      });
    }
  } catch (error) {
    c.status(403);
    return c.json({
      message: "You are not logged in",
    });
  }
});

blogRouter.post("/create", async (c) => {
  const body = await c.req.json();
  const authorId = c.get("userId");
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());
  try {
    const blog = await prisma.post.create({
      data: {
        title: body.title,
        content: body.content,
        authorId: Number(authorId),
      },
    });
    return c.json({ id: blog.id });
  } catch (error) {
    c.status(403);
    return c.json({
      message: "Cannot create!",
    });
  }
});

// blogRouter.put("/update", async (c) => {
//   const body = await c.req.json();
//   const authorId = c.get("userId");
//   console.log(body);

//   const prisma = new PrismaClient({
//     datasourceUrl: c.env.DATABASE_URL,
//   }).$extends(withAccelerate());

//   const blog = await prisma.post.update({
//     where: { id: authorId },
//     data: {
//       title: body.title,
//       content: body.content,
//     },
//   });
//   return c.json({ id: blog.id });
// });

blogRouter.put("/update/:id", async (c) => {
  const body = await c.req.json();
  const postId = c.req.param("id");
  const authorId = c.get("userId");

  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  try {
    const existingPost = await prisma.post.findUnique({
      where: { id: postId },
      select: { authorId: true }, // Select only the authorId field
    });

    if (!existingPost || existingPost.authorId !== Number(authorId)) {
      c.status(403);
      return c.json({ message: "You are not authorized to update this post." });
    }

    const updatedBlog = await prisma.blog.update({
      where: { id: postId },
      data: {
        title: body.title,
        content: body.content,
      },
    });
    console.log(updatedBlog);
    return c.json({ id: updatedBlog.id });
  } catch (error) {
    // Handle error appropriately
    console.error("Error updating the blog post:", error);
    c.status(500);
    return c.json({ message: "Error updating the blog post" });
  }
});

blogRouter.get("/bulk", async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  try {
    const blogs = await prisma.blog.findMany({
      select: {
        id: true,
        content: true,
        title: true,
        author: {
          select: {
            name: true,
          },
        },
      },
    });
    return c.json(blogs);
  } catch (error) {
    c.status(500);
    return c.json({ message: "error while fetching posts" });
  }
});

blogRouter.get("/:id", async (c) => {
  const id = c.req.param("id");
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  try {
    const blog = await prisma.blog.findFirst({
      where: {
        id: Number(id),
      },
      //   data: {
      //     title: body.title,
      //     content: body.content,
      //   },
    });
    return c.json({
      id: blog,
    });
  } catch (error) {
    c.status(411);
    return c.json({
      message: "error while fetching post",
    });
  }
});
