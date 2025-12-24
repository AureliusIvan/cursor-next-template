# Setup Auth Command

## 1. Ask user which provider they want to use: 
- Better Auth https://www.better-auth.com/docs/installation
- Clerk https://clerk.com/
- Supabase Auth https://supabase.com/docs/guides/auth
- Auth.js https://authjs.dev/getting-started
- Others (Paste the DOCS url)

## 2. Analyze Deeply on How to Implement the Auth System
- Assume the docs changes rapidly, thus need to re-check
- Project directory & current setup
- Key file to edit

## 3. Start creating blueprint using plan mode
- Show how authentication flow will works using mermaid diagram

## 4. Start Executing
- Install packages
- Configure provider
- Create auth routes/components
- Set up middleware
- Add environment variables setup on .env.example

## 5. Testing & Verification
- Test login/logout flows
- Verify protected routes
- Test session persistence
- Check error handling
- Browser based e2e testing using cursor Browser

## 6. Code Review & Security Review
- CSRF protection check 
- Session security (httpOnly, secure, sameSite)
- Rate limiting considerations
- Ensure created code follow DRY & SOLID principle

## 7. Documentation
- Confirm to user if all targets have been fulfilled
- Create documentaion at /docs/auth.md