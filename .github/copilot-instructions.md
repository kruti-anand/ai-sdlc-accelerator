# AI SDLC Accelerator — Copilot Instructions

## Project Purpose

Build an AI-powered Software Development Lifecycle (SDLC) accelerator that demonstrates how AI can help technology teams transform ambiguous business requests into validated, traceable requirements and, in later stages, downstream technical delivery artifacts.

The primary Version 1 capability is an:

**AI Requirements Engineering Copilot**

The Copilot helps users move from:

**Ambiguous Request → Dynamic Requirements Interview → Requirement State → Human Validation → BRD**

Future versions may extend the validated requirements into:

**BRD → SDD → Implementation Tasks → Test Scenarios**

---

# 1. Product Positioning

The application should demonstrate an AI-assisted requirements engineering workflow rather than a generic form or questionnaire.

The AI should behave like an experienced Business Analyst / Product Manager conducting a contextual requirements discovery conversation.

The core experience should demonstrate:

* Understanding ambiguous requests
* Extracting known information
* Identifying meaningful gaps
* Asking contextual follow-up questions
* Maintaining a living Requirement State
* Distinguishing facts from assumptions
* Surfacing scope, dependencies, risks, and open decisions
* Knowing when enough information has been gathered
* Requiring human validation
* Generating a traceable BRD from validated requirements

The AI proposes.

The human validates.

---

# 2. Version 1 Objective

Version 1 should focus on a complete requirements-engineering workflow:

```text
Raw Business Request
        ↓
Initial Request Analysis
        ↓
Dynamic AI Requirements Interview
        ↓
Requirement State
        ↓
Ready for Human Validation
        ↓
Human Approval
        ↓
Validated BRD
```

Do not attempt to implement the entire SDLC accelerator at once.

The first milestone is a strong, demonstrable requirements-engineering experience.

---

# 3. Core Design Principle

The application must NOT behave like a fixed questionnaire.

After every user answer, the AI should reassess the current Requirement State and determine whether another question is materially necessary.

The next question must be based on:

* Original request
* Current Requirement State
* Previous answers
* Previously asked questions
* Current ambiguities
* Scope
* Constraints
* Dependencies
* Business rules
* Success criteria
* Open decisions

The AI should ask the **single highest-value unresolved question**.

There is no fixed question sequence.

---

# 4. Dynamic Interview Behavior

When the user submits a request, the AI should:

1. Read the entire request.
2. Determine what the user is trying to accomplish.
3. Classify the request type.
4. Extract all explicitly known information.
5. Identify important missing or ambiguous information.
6. Avoid asking about information already known.
7. Select one meaningful unresolved issue.
8. Ask one contextual question.
9. Wait for the answer.
10. Update the Requirement State.
11. Reassess the remaining unknowns.
12. Either ask one new question or determine that the requirement is ready for validation.

The AI must continuously reconsider the requirement instead of following a predetermined checklist.

---

# 5. One Question at a Time

The interview UI must display one meaningful question at a time.

Do not present a list of clarification questions.

Do not implement a fixed question bank as the primary interview mechanism.

Bad:

```text
1. Who are the users?
2. What is the timeline?
3. What are the dependencies?
4. What are the risks?
5. What are the technical requirements?
```

Better:

```text
Who are the external users this requirement is intended to cover?
```

After the user answers, determine the next question from the updated Requirement State.

---

# 6. Question Selection

Questions should be selected based on materiality rather than completeness of a template.

Generally prioritize:

1. Critical ambiguity
2. Scope
3. Desired outcome
4. Material constraints
5. Dependencies
6. Business rules
7. Success criteria

This is guidance, not a rigid sequence.

The AI may change the priority based on context.

A question should only be asked when its answer could materially improve or change the documented requirement.

Avoid questions that are merely conventional requirements-document fields.

---

# 7. Requirement State

Maintain a structured Requirement State throughout the interview.

The conceptual Version 1 model is:

```javascript
const requirementState = {
  originalRequest: "",

  requestType: {
    category: "",
    confidence: null
  },

  objective: "",

  knownFacts: [],

  usersAndStakeholders: [],

  requirements: [],

  scope: {
    inScope: [],
    outOfScope: []
  },

  constraints: [],

  businessRules: [],

  dependencies: [],

  successCriteria: [],

  assumptions: [],

  openDecisions: [],

  risks: [],

  interview: {
    status: "INTERVIEWING",
    questionsAsked: [],
    currentQuestion: null
  },

  validation: {
    status: "NOT_READY",
    reviewedByHuman: false
  }
};
```

This is a living model, not a checklist.

It must be updated as new information is learned.

---

# 8. Information Confidence

The application must clearly distinguish:

### Known Fact

Explicitly provided by the user.

### Confirmed Requirement

Explicitly confirmed by the user during the interview.

### Assumption

An AI inference that has not been confirmed.

### TBD / Open Decision

Information the user does not know or has not decided.

Never convert an assumption into a confirmed requirement.

Never overwrite user-confirmed information with an AI inference.

If the user corrects previously captured information, the latest user-confirmed information takes precedence.

---

# 9. Interview Status

Use:

```text
INTERVIEWING
READY_FOR_VALIDATION
```

### INTERVIEWING

Additional meaningful clarification is still required.

### READY_FOR_VALIDATION

The requirement is sufficiently defined for human review.

Ready for validation does NOT mean:

* Every field is populated.
* There are no TBDs.
* There are no assumptions.
* The requirement is perfect.
* Technical design is complete.

It means no remaining unknown is likely to materially change the objective, scope, requirements, constraints, dependencies, business rules, or success criteria.

---

# 10. Human Validation Gate

The AI must not autonomously approve its own output.

When the requirement reaches:

```text
READY_FOR_VALIDATION
```

the UI should present a concise validation summary containing, where relevant:

* Objective
* Confirmed requirements
* Scope
* Users and stakeholders
* Dependencies
* Risks
* Constraints
* Assumptions
* TBD / open decisions
* Success criteria

The user should be able to:

* Continue the interview
* Edit/correct the requirement
* Approve and generate the BRD

Only explicit user approval may change:

```text
validation.status = "VALIDATED"
```

---

# 11. Validation States

Use:

```text
NOT_READY
PENDING_REVIEW
VALIDATED
CHANGES_REQUESTED
```

The AI can determine that a requirement is ready for review.

Only the human can validate it.

If the human requests changes, return to the requirements interview and update the Requirement State.

---

# 12. BRD / SDD Boundary

The most important documentation boundary is:

> **BRD = WHAT and WHY**
>
> **SDD = HOW**

The BRD should document the business need and desired outcome.

The SDD will later document technical implementation.

Do not introduce technical design into the BRD simply because the request involves technology.

---

# 13. BRD Content

The BRD should generally contain:

* Executive Summary
* Business Problem / Opportunity
* Users & Stakeholders
* Scope

  * In Scope
  * Out of Scope
* Business Requirements
* Business Rules
* Business Constraints
* Business-Level Dependencies
* Success Criteria
* Assumptions
* TBD / Open Decisions
* Risks
* Acceptance Criteria

Sections should adapt to the request.

Do not force irrelevant sections into every BRD.

---

# 14. Technical Boundary

Do NOT invent or prescribe:

* APIs
* API contracts
* Lambda
* AWS services
* Databases
* Data models
* Infrastructure
* Environments
* Programming languages
* Frameworks
* Architecture
* Deployment architecture
* Technical authentication implementation
* Technical integration patterns
* Logging architecture
* Monitoring architecture
* Network design

These belong in the future SDD.

If the user explicitly provides a technical implementation detail, preserve it as user-provided information without expanding it into additional technical design.

---

# 15. BRD Generation Rules

The BRD must be generated only after:

```text
interview.status = READY_FOR_VALIDATION
```

and:

```text
validation.status = VALIDATED
```

The BRD must be generated from the validated Requirement State.

Do not generate the final BRD directly from the original request after the interview has occurred.

---

# 16. Requirement IDs and Traceability

Business requirements should receive unique identifiers:

```text
BR-001
BR-002
BR-003
```

Requirements should remain traceable to the information gathered during the interview.

Where appropriate, retain metadata such as:

```javascript
{
  id: "BR-001",
  statement: "External customers must use MFA.",
  source: "user_confirmed",
  sourceQuestion: "Q-002",
  confidence: "confirmed"
}
```

The primary user-facing BRD should remain readable.

Traceability metadata can be surfaced separately or through expandable UI elements.

---

# 17. AI Turn Contract

The AI should return structured data rather than free-form workflow instructions.

Conceptually:

```json
{
  "status": "INTERVIEWING",
  "requirementState": {},
  "nextQuestion": {
    "question": "Who should this capability apply to?",
    "why": "This defines the target population and scope."
  }
}
```

When no further meaningful question is required:

```json
{
  "status": "READY_FOR_VALIDATION",
  "requirementState": {},
  "nextQuestion": null
}
```

The frontend should render these fields directly.

The frontend should not attempt to infer AI intent by parsing prose.

---

# 18. User-Facing "Why"

A short explanation may accompany each question.

Example:

```text
Why I'm asking:
This determines whether the requirement applies to all external users or only a defined subset.
```

The explanation must:

* Be concise
* Explain business relevance
* Avoid internal reasoning
* Never expose chain-of-thought

---

# 19. Handling Unknown Information

Accept:

* TBD
* Unknown
* Not decided
* No preference
* Not applicable

Do not force users to provide information they do not know.

Unknown information should remain explicitly represented rather than being filled with invented content.

---

# 20. No Hallucinated Enterprise Information

Never invent:

* Enterprise systems
* Existing architecture
* Organizational policies
* Regulatory requirements
* Compliance obligations
* Stakeholders
* Deadlines
* Volumes
* SLAs
* Technology choices
* Dependencies
* Business rules

If information is not known, mark it appropriately as unknown, TBD, or an assumption.

---

# 21. Example — MFA Requirement

Input:

```text
We need to add MFA authentication for external users.
```

The AI knows:

* MFA is desired.
* External users are the target population.

The AI should not immediately ask technical questions such as:

```text
Which identity provider should be used?
Which API should handle MFA?
Should this use Lambda?
```

Instead, it should clarify the business requirement.

For example:

```text
Who are the external users this requirement is intended to cover?
```

If the user answers:

```text
External customers who access their accounts.
```

the next question should build on that information.

For example:

```text
Should MFA apply to every external customer, or are there customer groups that should be excluded?
```

The AI should never ask:

```text
Who are the users?
```

again because that information is already known.

---

# 22. Example — Business Process

Input:

```text
Create a process for onboarding new vendors.
```

The AI should first understand the desired business outcome.

A useful question could be:

```text
What needs to be true before a vendor is considered fully onboarded?
```

The next question must depend on the answer.

Do not automatically ask a standard list of process questions.

Do not introduce a software solution unless the user indicates that technology is part of the requirement.

---

# 23. Example — Planning Request

Input:

```text
Plan a family trip to Spain.
```

The AI should classify this as a planning/outcome request.

Potentially relevant information may include:

* Participants
* Dates
* Geographic scope
* Desired experience
* Budget
* Constraints
* Preferences
* Activities
* Travel limitations

The AI should determine which of these actually matters based on the user's request and previous answers.

Do not ask software-specific questions.

---

# 24. BRD Quality Rules

Before generating the final BRD, verify:

1. The BRD reflects the original request.
2. The BRD reflects confirmed user answers.
3. Confirmed information is distinguished from assumptions.
4. TBD items are clearly identified.
5. Scope boundaries are explicit where known.
6. Requirements are specific and objectively verifiable where applicable.
7. Requirements are traceable to the Requirement State.
8. Unsupported requirements have not been invented.
9. Technical implementation details have not been unnecessarily introduced.
10. Business rules are clearly identified.
11. Risks and dependencies are supported by information gathered.
12. Acceptance criteria align with the validated requirements.
13. The document represents the validated business need rather than an AI-prescribed solution.

---

# 25. Version 1 Scope

Version 1 should demonstrate:

### Included

* Business request input
* Initial request analysis
* Request classification
* Dynamic requirements interview
* One-question-at-a-time interaction
* Requirement State
* Assumption / TBD handling
* Interview history
* Readiness detection
* Human validation
* BRD generation
* Requirement traceability
* AI quality/governance documentation

### Deferred

* SDD generation
* Implementation task generation
* Test scenario generation
* Autonomous code generation
* Production deployment
* Enterprise data
* Customer data
* Enterprise authentication
* Complex multi-agent architecture
* Advanced RAG
* Autonomous decision-making

---

# 26. Architecture Principles

Keep the implementation simple and incremental.

The initial static prototype may demonstrate the workflow using deterministic browser behavior.

However, genuine dynamic AI interviewing requires an AI model to evaluate:

* Original request
* Requirement State
* Interview history
* User's latest answer

The eventual architecture should therefore separate:

```text
Frontend
   ↓
Secure AI / Serverless Backend
   ↓
LLM
   ↓
Structured AI Turn Contract
   ↓
Frontend
```

Never expose an AI provider API key in client-side JavaScript.

The frontend should render structured AI responses rather than attempting to perform LLM reasoning itself.

---

# 27. Development Approach

Build incrementally.

Do not rewrite the entire application at once.

Each major change should:

1. Have a clear purpose.
2. Preserve working functionality where possible.
3. Be tested before the next feature is added.
4. Keep the architecture understandable.
5. Avoid unnecessary dependencies.
6. Avoid premature infrastructure.
7. Maintain a clear separation between UI, workflow state, AI interaction, and document generation.

Prioritize:

1. Working functionality
2. Correct requirements workflow
3. Clear architecture
4. AI output quality
5. Human validation
6. Traceability
7. Testing
8. Documentation
9. Governance

---

# 28. UI Principles

The UI should communicate the workflow clearly:

```text
1. Requirement
2. Clarify
3. Validate
4. BRD
```

The interview experience should feel conversational rather than like completing a form.

The UI should make it obvious:

* What the AI currently understands
* What question it is asking
* Why the question matters
* What the user has already confirmed
* When the requirement is ready for review
* When human approval is required

Do not overwhelm the user with internal state.

Detailed interview history and traceability can be expandable.

---

# 29. Human-in-the-Loop Principle

The AI should assist with:

* Discovery
* Clarification
* Structuring
* Gap identification
* Traceability
* Drafting

The human remains responsible for:

* Business decisions
* Requirement confirmation
* Scope approval
* Assumption acceptance
* Final validation

The application should never imply that AI-generated requirements are automatically authoritative.

---

# 30. Portfolio Demonstration Goals

The project should demonstrate practical enterprise AI capabilities, including:

* AI-assisted requirements engineering
* Human-in-the-loop AI
* Contextual conversational AI
* Requirements quality
* Structured state management
* AI governance
* Traceability
* Risk and dependency identification
* Business / technology boundary management
* AI-enabled delivery efficiency
* Responsible AI adoption

The project should communicate that AI is being used to improve the quality and efficiency of technology delivery—not simply to generate text.

---

# 31. Non-Goals

Do not initially implement:

* Autonomous production deployment
* Real enterprise data
* Customer data
* Enterprise authentication
* Complex multi-agent orchestration
* Automated code deployment
* Production infrastructure
* Advanced RAG
* Autonomous business decision-making

Keep the project focused, understandable, secure, and demonstrable.

---

# 32. Implementation Rule

When modifying the project:

**Do not solve a future problem before it is needed.**

Implement the smallest change that supports the current workflow.

Prefer a clean architectural foundation over adding features prematurely.

The immediate product goal is:

> **Demonstrate an AI Requirements Engineering Copilot that can take an ambiguous request, conduct a contextual one-question-at-a-time interview, build a living Requirement State, obtain human validation, and generate a traceable BRD.**
