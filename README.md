# AI SDLC Accelerator

An AI-assisted requirements engineering and software delivery accelerator designed to transform ambiguous business requests into **validated, traceable, implementation-ready requirements**.

The project demonstrates how AI can be used as a **Requirements Engineering Copilot** while keeping humans accountable for business decisions and requirement validation.

---

## The Problem

Technology teams often receive requirements that are incomplete, ambiguous, or expressed primarily in business language.

Before development can begin, teams need to determine:

* What problem are we solving?
* Who is affected?
* What outcome is expected?
* What is actually in scope?
* What business rules apply?
* What constraints or dependencies exist?
* How will success be measured?
* What information is still unknown?

Traditional approaches often rely on static templates or long requirement questionnaires.

This project explores a different approach:

> **Use AI to conduct a contextual requirements conversation that adapts to what the user has already provided.**

---

# AI Requirements Engineering Copilot

The primary capability of the project is an AI Requirements Engineering Copilot.

It transforms:

```text
Ambiguous Request
       ↓
Dynamic AI Requirements Interview
       ↓
Requirement State
       ↓
Human Validation
       ↓
Validated BRD
```

The AI does not simply generate a document from a short prompt.

Instead, it progressively builds an understanding of the requirement by asking **one meaningful question at a time**.

---

## How It Works

### 1. Submit a Request

The user provides a business request in natural language.

Example:

> "We need to add MFA authentication for external users."

The request does not need to be perfectly structured.

---

### 2. Understand What Is Already Known

The AI analyzes the entire request and identifies:

* Objective
* Known facts
* Users
* Scope signals
* Constraints
* Business rules
* Dependencies
* Existing requirements

It does not ask for information that has already been provided.

---

### 3. Dynamic Requirements Interview

The AI identifies the most important unresolved ambiguity and asks **one contextual question**.

For example:

> Who are the external users this requirement is intended to cover?

After the user answers, the AI updates its understanding and determines what should be clarified next.

The next question is therefore based on:

* Original request
* Previous answers
* Current Requirement State
* Remaining ambiguities
* Materiality of the unresolved information

This is intentionally **not a fixed questionnaire**.

---

### 4. Living Requirement State

The AI maintains a structured representation of the requirement throughout the conversation.

The state includes:

* Objective
* Known Facts
* Requirements
* Users & Stakeholders
* Scope
* Constraints
* Business Rules
* Dependencies
* Success Criteria
* Assumptions
* TBD / Open Decisions
* Risks
* Interview Status
* Validation Status

Information is explicitly classified as:

**Known → Confirmed → Assumption → TBD**

This prevents AI-generated assumptions from silently becoming requirements.

---

### 5. Readiness Detection

The AI determines when the requirement is sufficiently defined for human review.

The interview stops when:

* The objective is clear.
* Meaningful scope is defined.
* Material requirements are understood.
* Important constraints and dependencies are known or explicitly TBD.
* Relevant business rules are understood.
* Success criteria are sufficiently defined.
* No remaining unknown is likely to materially change the requirement.

The goal is **minimum sufficient information**, not maximum questioning.

---

### 6. Human Validation

The AI does not validate its own work.

When the requirement is ready, the user reviews:

* Objective
* Confirmed requirements
* Scope
* Dependencies
* Risks
* Assumptions
* TBDs
* Success criteria

The user can:

* Continue the interview
* Correct the requirement
* Approve the requirement

Only explicit human approval moves the requirement to:

```text
VALIDATED
```

---

### 7. BRD Generation

The final Business Requirements Document is generated from the **human-validated Requirement State**.

The BRD includes, where relevant:

* Executive Summary
* Business Problem / Opportunity
* Users & Stakeholders
* Scope
* Business Requirements
* Business Rules
* Business Constraints
* Dependencies
* Success Criteria
* Assumptions & TBDs
* Risks
* Acceptance Criteria

Requirements receive identifiers such as:

```text
BR-001
BR-002
BR-003
```

The workflow maintains traceability from the original request through the interview and validated requirements into the BRD.

---

# BRD vs. SDD

A core design principle of the project is:

> **BRD = WHAT and WHY**
> **SDD = HOW**

The BRD focuses on the business need and desired outcome.

Technical implementation belongs in the future Software Design Document (SDD).

The requirements workflow therefore does not unnecessarily introduce:

* APIs
* Lambda
* Databases
* AWS services
* Infrastructure
* Architecture
* Programming languages
* Frameworks
* Deployment design

Those decisions belong downstream.

---

# AI Turn Contract

The eventual AI interaction is designed around a structured contract rather than free-form model output.

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

When sufficient information has been gathered:

```json
{
  "status": "READY_FOR_VALIDATION",
  "requirementState": {},
  "nextQuestion": null
}
```

The frontend renders the structured response rather than attempting to infer the AI's intent from prose.

---

# Human-in-the-Loop

The project intentionally keeps humans in control of business decisions.

### AI assists with

* Requirements discovery
* Gap identification
* Clarification
* Structuring
* Assumption identification
* Risk and dependency surfacing
* Traceability
* BRD drafting

### Humans remain responsible for

* Business decisions
* Requirement confirmation
* Scope approval
* Assumption acceptance
* Final validation

> **AI proposes. Humans validate.**

---

# Quality & Governance

AI output quality is evaluated using a dedicated governance scorecard.

The evaluation focuses on:

* Request understanding
* Dynamic question quality
* Information gain
* Avoidance of repetitive questions
* Requirement State accuracy
* Fact / assumption / TBD distinction
* Risk and dependency identification
* Readiness determination
* Human validation
* BRD quality
* BRD / SDD boundary
* Traceability
* AI governance

The scorecard is designed to measure **quality of the requirements process**, not the volume of AI-generated content.

See:

`docs/AI Quality & Governance Scorecard.md`

---

# Current Architecture

The repository currently contains a static prototype used to demonstrate the workflow and user experience.

```text
User
  ↓
Frontend
  ↓
Requirements Interview
  ↓
Requirement State
  ↓
Validation
  ↓
BRD
```

A production-oriented implementation would introduce a secure AI backend:

```text
User
  ↓
Frontend
  ↓
Secure Backend / Serverless Function
  ↓
LLM
  ↓
Structured AI Turn Contract
  ↓
Frontend
```

AI provider API keys should never be exposed in client-side JavaScript.

---

# Repository Structure

```text
ai-sdlc-accelerator/
│
├── .github/
│   └── copilot instructions.md
│
├── docs/
│   └── AI Quality & Governance Scorecard.md
│
├── prompts/
│   └── brd.prompt.md
│
├── README.md
├── index.html
├── app.js
└── styles.css
```

### Key Files

**`prompts/brd.prompt.md`**

Defines the AI Requirements Engineering behavior, dynamic interview model, Requirement State, validation rules, BRD generation rules, and AI turn contract.

**`.github/copilot instructions.md`**

Defines project architecture, development principles, product boundaries, and implementation guidance.

**`docs/AI Quality & Governance Scorecard.md`**

Defines the quality and governance framework used to evaluate the AI workflow.

**`index.html` / `styles.css` / `app.js`**

Frontend prototype and workflow implementation.

---

# Version 1 Scope

### Current focus

* Natural-language business request
* Request understanding
* Dynamic requirements interview
* One-question-at-a-time interaction
* Requirement State
* Assumption and TBD handling
* Interview history
* Readiness detection
* Human validation
* BRD generation
* Requirement traceability
* AI quality and governance

### Future capabilities

```text
Validated BRD
      ↓
Software Design Document (SDD)
      ↓
Implementation Tasks
      ↓
Test Scenarios
```

Future versions may also explore:

* AI-assisted technical design
* Implementation planning
* Test scenario generation
* Requirement-to-code traceability
* AI quality evaluation
* SDLC analytics
* Additional AI-assisted delivery workflows

---

# Version 1 Non-Goals

The initial version intentionally does not implement:

* Autonomous production deployment
* Real enterprise data
* Customer data
* Enterprise authentication
* Complex multi-agent orchestration
* Automated code deployment
* Production infrastructure
* Advanced RAG
* Autonomous business decision-making

The objective is to demonstrate a focused, understandable, human-in-the-loop AI workflow.

---

# Example

### Input

> We need to add MFA authentication for external users.

### AI Interview

**Question 1**

> Who are the external users this requirement is intended to cover?

**User**

> External customers who access their accounts.

**Question 2**

> Should MFA apply to every external customer, or are there customer groups that should be excluded?

The AI continues adapting the interview based on each answer.

It does not ask a predefined sequence of questions.

Once the requirement is sufficiently defined, the user reviews and validates the Requirement State before the BRD is generated.

---

# Portfolio Objective

This project demonstrates practical application of AI to enterprise technology delivery, including:

* Requirements engineering
* AI-assisted business analysis
* Human-in-the-loop AI
* AI governance
* Requirement traceability
* Risk and dependency management
* Business / technology boundary management
* AI-assisted SDLC
* Responsible enterprise AI adoption

The goal is not simply to demonstrate that AI can generate documents.

The goal is to demonstrate how AI can improve the **quality, consistency, and efficiency of requirements discovery while keeping humans accountable for the decisions that matter.**
