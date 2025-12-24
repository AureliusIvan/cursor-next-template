import { PrismaClient } from "../app/generated/prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Create users
  const user1 = await prisma.user.upsert({
    where: { email: "alice@example.com" },
    update: {},
    create: {
      email: "alice@example.com",
      name: "Alice",
      posts: {
        create: {
          title: "Hello World",
          content: "This is my first post!",
          published: true,
        },
      },
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: "bob@example.com" },
    update: {},
    create: {
      email: "bob@example.com",
      name: "Bob",
      posts: {
        create: [
          {
            title: "My Second Post",
            content: "This is another post.",
            published: true,
          },
          {
            title: "Draft Post",
            content: "This is a draft.",
            published: false,
          },
        ],
      },
    },
  });

  console.log("Created users:", { user1, user2 });
  console.log("Seeding completed!");
}

main()
  .catch((e) => {
    console.error("Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
