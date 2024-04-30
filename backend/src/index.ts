import { Hono } from "hono";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";

const app = new Hono();

app.post("/", (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: env.DATABASE_URL,
  }).$extends(withAccelerate());
  return c.text("Hello Hono!");
});

app.post("/signup", (c) => {
  return c.text("signup");
});

app.get("/signin", (c) => {
  return c.text("signin");
});

app.get("/blog/:id", (c) => {
  return c.text("blog");
});

app.post("/blog", (c) => {
  return c.text("blog");
});

app.put("/blog", (c) => {
  return c.text("blog");
});

export default app;
