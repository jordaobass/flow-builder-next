# Flow Builder - POC (Proof of Concept)

> **This is a proof of concept / prototype only.** It is not production-ready software. Built as a technical demonstration of a visual policy decision engine using React Flow.

## What is this?

A visual policy builder that lets you create decision flows through a drag-and-drop interface. The idea is simple:

1. **Define parameters** (country, state, company, department...) that act as filters
2. **Create questions** (yes/no, select, number, text) that users will answer
3. **Build policies** by combining a scope (filter) + questions + decision rules
4. **Design the flow visually** using React Flow with condition nodes (true/false branches)
5. **Test it** in a demo that picks the right policy and runs the questionnaire

The engine automatically selects the correct policy based on the context (e.g., country=BR, companyId=BANK_A) and evaluates the answers against the decision rules.

## Included Example Scenarios

The app comes with 4 pre-loaded scenarios to demonstrate different use cases:

| Scenario | Scope | What it does |
|----------|-------|-------------|
| **Uber Release** | BR / SP / EMP_X | Driver worked? Missed stop? Vehicle condition? |
| **Credit Approval** | BR / BANK_A | Credit score, income, employment, property check |
| **Medical Triage** | BR / SAO_PAULO / HOSP_A | Conscious? Chest pain? Temperature? Pain level? |
| **Expense Approval** | BR / CORP_X / Technology | Amount, receipt, manager approval, approver name |

## Tech Stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **React Flow** (@xyflow/react) for the visual editor
- **Zustand** for state management
- **Tailwind CSS v4** + **shadcn/ui** for the UI
- **sessionStorage** for persistence (data resets when you close the tab)

## Running Locally

```bash
npm install
npm run dev
```

Open http://localhost:3000 - the app loads with seed data automatically.

## Project Structure

```
src/
  app/                        # Next.js routes
    (main)/                   # Layout with sidebar
      getting-started/        # Guide page
      parameters/             # CRUD for scope parameters
      questions/              # CRUD for question bank
      policies/               # CRUD for policies
      demo/                   # Test the flow
    builder/[policyId]/       # Visual flow editor (full-screen)
  components/
    builder/                  # React Flow canvas, nodes, palette, inspector
    demo/                     # Context picker, flow modal, result display
    parameters/               # Parameter table and form
    policies/                 # Policy table, form, duplicate dialog
    questions/                # Question table and form
    layout/                   # Sidebar shell
    ui/                       # shadcn/ui components
  stores/                     # Zustand stores (parameter, question, policy, builder)
  types/                      # TypeScript types
  lib/                        # Engine, converter, seed data, constants
```

## How it Works

1. **Scope-based policy selection**: Each policy defines a scope (key-value pairs). When running the demo, the engine scores all policies against the provided context and picks the best match.

2. **Visual flow builder**: 4 node types:
   - **Filter** (blue) - displays the policy scope
   - **Question** (white) - a step the user answers
   - **Condition** (purple) - evaluates an answer with true/false branches
   - **End** (green/red/amber) - final decision: ALLOW, BLOCK, or REVIEW

3. **Bidirectional conversion**: The flow graph converts to/from the Policy data model, so you can edit visually and save back to the store.

## Limitations (it's a POC)

- Data is stored in **sessionStorage** - closes the tab, loses the data
- No authentication, no database, no API
- No real-time collaboration
- The flow converter handles basic AND/OR condition chains but complex nested logic may need manual JSON editing
- No undo/redo in the visual editor
- No automated tests

## License

This is a proof of concept for demonstration purposes.
