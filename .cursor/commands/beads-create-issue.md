# Creating Beads Issues

Guide for creating well-formatted, actionable beads issues.

## Basic Creation

```bash
bd create "Issue title" "Optional detailed description"
```

## Title Format

Use clear, descriptive titles:

**Good:**
- `Fix login bug: users cannot log in with email`
- `Add user authentication`
- `Implement project creation form`
- `Refactor API error handling`

**Bad:**
- `bug`
- `fix`
- `update`

## Description Structure

When creating issues, include:

### Problem Statement
What is the issue or task?

### Location
- File paths
- Line numbers (if applicable)
- Component/function names

### Root Cause Analysis
Why does this issue exist? What's causing it?

### Proposed Solution
How should this be fixed or implemented?

### Files to Modify
List specific files that need changes

### Testing Approach
How will this be tested?

## Example Issue Creation

```bash
bd create "Fix: New Project button not working" "The \"New Project\" button on the main dashboard page (/dashboard) has no onClick handler and does nothing when clicked.

**Location:** \`app/(auth)/dashboard/page.tsx\` lines 45-48

**Problem:**
- Button displays \"New Project\" with Plus icon
- No onClick handler attached
- Clicking the button has no effect

**Root Cause:**
The button was created without functionality, likely as a placeholder.

**Proposed Solution:**
Replace the static button with the \`ProjectForm\` component, similar to how it's implemented in the projects page.

**Files to modify:**
- \`app/(auth)/dashboard/page.tsx\` - Replace button with ProjectForm component
- May need to import ProjectForm from \`@/components/crm/project-form\`

**Testing:**
- Click button should open project creation form
- Form submission should create new project
- Form should close after successful creation"
```

## Labels

Add labels to categorize issues:

```bash
bd label <issue-id> <label1> <label2> <label3>
```

### Common Labels

- `bug` - Bug fixes
- `feature` - New features
- `frontend` - Frontend work
- `backend` - Backend work
- `api` - API changes
- `ui` - UI/UX changes
- `refactor` - Code refactoring
- `docs` - Documentation
- `test` - Testing

### Examples

```bash
bd label <issue-id> bug frontend
bd label <issue-id> feature api backend
bd label <issue-id> refactor
```

## Priority

Set priority levels:

```bash
bd priority <issue-id> <priority>
```

### Priority Levels

- `low` - Nice to have, not urgent
- `normal` - Standard priority (default)
- `high` - Important, should be done soon
- `critical` - Urgent, blocking issue

### Examples

```bash
bd priority <issue-id> high
bd priority <issue-id> critical
```

## Dependencies

Set dependencies between issues:

```bash
bd depends <issue-id> <dependency-id>
bd depends <issue-id> <dep1> <dep2> <dep3>  # Multiple dependencies
```

### Example

```bash
# Create parent issue
bd create "Add database schema"

# Create dependent issue
bd create "Implement API endpoint"

# Set dependency
bd depends <api-endpoint-id> <schema-id>
```

## Complete Issue Creation Workflow

```bash
# 1. Create issue
ISSUE_ID=$(bd create "Fix: New Project button" "Description here" | grep -o 'cursor-next-template-[a-z0-9]*')

# 2. Add labels
bd label $ISSUE_ID bug frontend

# 3. Set priority
bd priority $ISSUE_ID high

# 4. Set dependencies (if any)
bd depends $ISSUE_ID <dependency-id>

# 5. Verify
bd show $ISSUE_ID
```

## Best Practices

1. **Be specific** - Clear titles and descriptions
2. **Include context** - File paths, line numbers, error messages
3. **Propose solutions** - Don't just describe problems
4. **Set priorities** - Help prioritize work
5. **Use labels** - Make issues searchable
6. **Set dependencies** - Show work order
7. **Break down large tasks** - Create sub-issues

## Issue Template

Use this template for consistent issue creation:

```bash
bd create "Type: Brief description" "**Problem:**
[Describe the problem]

**Location:**
- File: \`path/to/file.ts\`
- Lines: X-Y

**Root Cause:**
[Why does this exist?]

**Proposed Solution:**
[How to fix/implement]

**Files to modify:**
- \`file1.ts\`
- \`file2.tsx\`

**Testing:**
[How to test]"
```
