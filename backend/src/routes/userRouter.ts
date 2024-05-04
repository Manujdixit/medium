import { Hono } from "hono";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { sign } from "hono/jwt";
// import { signupInput, signinInput } from "@100xdevs/medium-common";

export const userRouter = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    JWT_SECRET: string;
  };
}>();

userRouter.post("/signup", async (c) => {
  const body = await c.req.json();
  // const { success } = signupInput.safeParse(body);
  // if (!success) {
  //   c.status(400);
  //   return c.json({ error: "Invalid input" });
  // }

  const prisma = new PrismaClient({
    datasourceUrl: c.env?.DATABASE_URL,
  }).$extends(withAccelerate());

  try {
    const user = await prisma.user.create({
      data: {
        username: body.email,
        password: body.password,
        name: body.name,
      },
    });

    const token = await sign({ id: user.id }, c.env.JWT_SECRET);

    return c.json({ jwt: token });
  } catch (error) {
    console.error("Error while signing up:", error);
    c.status(500); // Internal Server Error
    return c.json({
      error: "An error occurred while signing up. Please try again later.",
    });
  }
});

userRouter.post("/signin", async (c) => {
  const body = await c.req.json();
  // const { success } = signinInput.safeParse(body);
  // if (!success) {
  //   c.status(400);
  //   return c.json({ error: "Invalid input" });
  // }

  const prisma = new PrismaClient({
    datasourceUrl: c.env?.DATABASE_URL,
  }).$extends(withAccelerate());

  try {
    const user = await prisma.user.findUnique({
      where: {
        username: body.email,
        password: body.password,
      },
    });

    if (!user) {
      c.status(403);
      return c.json({ error: "user not found" });
    }

    const jwt = await sign({ id: user.id }, c.env.JWT_SECRET);

    return c.json({ jwt });
  } catch (error) {
    console.error("error: ", error);
    c.status(411);
    return c.json({ error: "Internal Server Error" });
  }
});
