This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.



chapter 1: Global provider(Theme and Query)

1.1 Theme provider: components/provider/theme-provider.tsx
    - Theme provider is a global provider that provides the theme to the entire application.

1.2 Query provider: components/provider/query.tsx
    - Query provider is a global provider that provides the query to the entire application
    - Query provider is used to fetch data from the server and cache the data for a certain time
    
1.3  Wire provider in layout.tsx
    - Wire the theme provider and query provider in the layout.tsx file

chapter 2: Prisma and database setup

2.1 Prisma and database setup
    - Prisma is a database ORM that provides a database client and a schema language for the database.
    -used Neon as the database

chapter 3: Authentication with clerk
    - Clerk is a authentication provider that provides a authentication solution for the application.
    - used clerk to authenticate the user and store the user in the database.
    Protected routes
    - Protected routes are routes that are protected and can only be accessed by authenticated users.
    - Onboarding user is a process that is used to onboard the user to the application.

chapter 4: conversation and message schema

        user -> conversation -> messages
        - user has many conversations
        - conversation has many messages
        - message belongs to a conversation
        - message belongs to a user
        - conversation belongs to a user
        - user has many messages
        - message has many conversations
        - conversation has many users
        - message has many users
        - conversation has many messages

chapter 5: server actions and react queries
    
        - server actions are used to perform server-side operations
         -message hooks
         -useMessages.ts

chapter 6: conversation list and details page