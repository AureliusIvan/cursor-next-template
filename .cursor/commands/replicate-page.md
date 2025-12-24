# Replicate Page Design Command

## 1. Gather Source Information
- Ask user for the source URL or design reference
- If URL provided, scrape/analyze the page content using browser tools
- Identify the target page/route in the Next.js project where it should be replicated
- Determine if it's a full page replacement or a new route

## 2. Analyze the Design Deeply
- Extract layout structure (header, footer, sidebar, main content areas)
- Identify reusable components (buttons, cards, forms, navigation)
- Analyze styling approach (CSS framework, custom CSS, Tailwind classes)
- Identify interactive elements and their behavior
- Note responsive breakpoints and mobile behavior
- Extract color scheme, typography, spacing patterns
- Identify any required assets (images, icons, fonts)

## 3. Create Implementation Blueprint
- Map extracted components to Next.js component structure
- Show component hierarchy using mermaid diagram
- Identify which existing components can be reused
- Plan new components to create
- Determine styling approach (Tailwind, CSS modules, or global styles)
- Plan data fetching if needed (API routes, server components)

## 4. Start Executing
- Create new page route if needed (`app/[route]/page.tsx`)
- Extract and create reusable components in appropriate directories
- Implement layout structure matching the source design
- Apply styling (Tailwind classes or CSS modules)
- Add required assets to `public/` directory
- Set up any necessary API routes or data fetching
- Ensure TypeScript types are properly defined

## 5. Testing & Verification
- Visual comparison with source design
- Test responsive behavior across breakpoints
- Verify interactive elements work correctly
- Check accessibility (keyboard navigation, screen readers)
- Test in browser using Cursor Browser tools
- Verify all links and navigation work
- Check performance (images optimized, code split properly)

## 6. Code Review & Quality Check
- Ensure components follow DRY & SOLID principles
- Verify proper TypeScript typing
- Check for accessibility best practices (ARIA labels, semantic HTML)
- Ensure code is debuggable (descriptive names, strategic logging)
- Verify consistent styling approach
- Check for any hardcoded values that should be configurable

## 7. Documentation (do NOT created any markdown)
- Confirm to user if all design elements have been replicated without creating documentation