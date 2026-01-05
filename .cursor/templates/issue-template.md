# Issue Template

Use this template when creating beads issues for consistent formatting and completeness.

## Title Format

```
Type: Brief description
```

**Types:**
- `Bug:` - Bug fixes
- `Feature:` - New features
- `Refactor:` - Code refactoring
- `Fix:` - Quick fixes
- `Task:` - General tasks
- `Docs:` - Documentation

**Examples:**
- `Bug: Login form not submitting`
- `Feature: Add user authentication`
- `Fix: New Project button not working`
- `Task: Update dependencies`

## Description Template

```bash
bd create "Type: Brief description" "**Problem:**
[Describe the problem or task clearly]

**Location:**
- File: \`path/to/file.ts\`
- Lines: X-Y (if applicable)
- Component/Function: [name]

**Root Cause:**
[Why does this issue exist? What's causing it?]

**Proposed Solution:**
[How should this be fixed or implemented?]

**Files to modify:**
- \`file1.ts\` - [what changes]
- \`file2.tsx\` - [what changes]

**Testing Approach:**
[How will this be tested? What scenarios?]

**Additional Context:**
[Any other relevant information]"
```

## Complete Example

```bash
bd create "Fix: New Project button not working" "**Problem:**
The \"New Project\" button on the main dashboard page (/dashboard) has no onClick handler and does nothing when clicked.

**Location:**
- File: \`app/(auth)/dashboard/page.tsx\`
- Lines: 45-48
- Component: DashboardPage

**Root Cause:**
The button was created without functionality, likely as a placeholder during initial implementation.

**Proposed Solution:**
Replace the static button with the \`ProjectForm\` component, similar to how it's implemented in the projects page. This will provide a consistent user experience and reuse existing functionality.

**Files to modify:**
- \`app/(auth)/dashboard/page.tsx\` - Replace button with ProjectForm component
- May need to import ProjectForm from \`@/components/crm/project-form\`

**Testing Approach:**
- Click button should open project creation form modal
- Form submission should create new project via API
- Form should close after successful creation
- Error handling should display appropriate messages

**Additional Context:**
The ProjectForm component already exists and works correctly in /dashboard/projects page."
```

## After Creation

Add labels and priority:

```bash
# Add labels
bd label <issue-id> bug|feature|frontend|backend|api|ui|refactor|docs

# Set priority
bd priority <issue-id> low|normal|high|critical

# Set dependencies (if any)
bd depends <issue-id> <dependency-id>
```

## Label Guidelines

- `bug` - Bug fixes
- `feature` - New features  
- `frontend` - Frontend work (React, UI components)
- `backend` - Backend work (API, server logic)
- `api` - API changes (routes, endpoints)
- `ui` - UI/UX changes (design, styling)
- `refactor` - Code refactoring (no new features)
- `docs` - Documentation updates
- `test` - Testing related

## Priority Guidelines

- `low` - Nice to have, not urgent, can wait
- `normal` - Standard priority, default for most issues
- `high` - Important, should be done soon, affects users
- `critical` - Urgent, blocking issue, needs immediate attention

## Best Practices

1. **Be specific** - Clear, actionable titles
2. **Include context** - File paths, line numbers, error messages
3. **Propose solutions** - Don't just describe problems
4. **Break down large tasks** - Create sub-issues for complex work
5. **Set dependencies** - Show work order clearly
6. **Use consistent labels** - Makes issues searchable
7. **Update progress** - Add notes as work progresses
