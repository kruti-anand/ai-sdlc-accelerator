# AI Quality & Governance Scorecard

## Purpose

This scorecard evaluates the quality, reliability, governance, and traceability of the AI-assisted SDLC workflow.

The goal is not to reward the AI for generating more content.

The goal is to determine whether the AI:

* Understands the user's request
* Asks meaningful questions
* Avoids unnecessary questioning
* Distinguishes facts from assumptions
* Avoids inventing enterprise information
* Identifies material risks and dependencies
* Maintains requirement traceability
* Produces requirements that are sufficiently defined for human review
* Keeps business requirements separate from technical design
* Requires human validation before downstream artifacts are generated

The scorecard is intended to support continuous improvement and portfolio demonstration of responsible enterprise AI adoption.

---

# 1. Evaluation Philosophy

The AI should be evaluated on **quality of information gathered**, not quantity of questions asked.

A good requirements interview is not necessarily a long interview.

A high-quality AI response should:

1. Ask only questions that materially improve the requirement.
2. Build on information already provided.
3. Avoid repeating answered questions.
4. Identify meaningful ambiguity.
5. Stop when the requirement is sufficiently defined.
6. Clearly distinguish confirmed information from assumptions and TBDs.
7. Avoid introducing unsupported enterprise or technical details.
8. Preserve traceability from request → interview → requirement → BRD.
9. Require human validation before final BRD generation.

---

# 2. Scoring Scale

Use a 1–5 scale.

| Score             | Meaning                                                                              |
| ----------------- | ------------------------------------------------------------------------------------ |
| **5 — Excellent** | Consistently demonstrates the intended behavior with little or no material weakness. |
| **4 — Strong**    | Meets the intended behavior with only minor gaps.                                    |
| **3 — Adequate**  | Generally useful but has noticeable weaknesses or inconsistencies.                   |
| **2 — Weak**      | Significant quality or governance issues are present.                                |
| **1 — Poor**      | Fails the intended behavior or introduces material risk.                             |

### Target

A mature workflow should generally achieve **4 or higher** across the applicable criteria.

A single low score in a critical governance area should trigger review even if the overall score is high.

---

# 3. Stage 1 — Initial Request Understanding

Evaluate whether the AI correctly understands the user's initial request before beginning the interview.

## Criteria

### 1.1 Request Understanding

Does the AI correctly identify what the user is trying to accomplish?

**5:** Accurately captures the user's intended outcome without adding unsupported meaning.

**3:** Generally understands the request but misses some context.

**1:** Misinterprets the request or introduces an unsupported objective.

---

### 1.2 Request Classification

Does the AI appropriately classify the request?

Possible categories:

* `SOFTWARE_SYSTEM`
* `BUSINESS_PROCESS`
* `PLANNING_OUTCOME`
* `INFORMATIONAL`
* `OTHER`

The classification should guide questioning without becoming a rigid question sequence.

---

### 1.3 Known Information Extraction

Does the AI capture information that the user has already provided?

**5:** Relevant facts are captured accurately and are not unnecessarily re-questioned.

**1:** The AI repeatedly asks for information already provided or loses important facts.

---

### 1.4 Scope of Initial Understanding

Does the AI identify important scope signals already present in the request?

Evaluate whether it recognizes:

* Target population
* Requested capability
* Explicit exclusions
* Important constraints
* Desired outcome

Only information actually supported by the request should be recorded.

---

# 4. Stage 2 — Dynamic Requirements Interview

This stage evaluates the core AI Requirements Engineering Copilot behavior.

## Criteria

### 2.1 Question Materiality

Does each question have meaningful information value?

A strong question should resolve an ambiguity or gap that could materially affect:

* Objective
* Scope
* Requirements
* Constraints
* Dependencies
* Business rules
* Success criteria

**Do not reward question volume.**

---

### 2.2 Contextual Questioning

Does each question build on the original request and previous answers?

**5:** Questions clearly adapt to the evolving Requirement State.

**3:** Some contextual behavior is present, but questions occasionally feel generic.

**1:** The AI follows a fixed questionnaire or asks unrelated questions.

---

### 2.3 No Repetition

Does the AI avoid asking questions whose answers are already known or confirmed?

**5:** No meaningful repetition.

**1:** Frequently asks the user to restate previously provided information.

---

### 2.4 Information Gain

Does each question meaningfully reduce uncertainty?

The evaluation should consider whether the answer changes or improves the Requirement State.

A question with little or no impact should generally not have been asked.

---

### 2.5 One Question at a Time

Does the AI maintain a focused conversational experience?

**5:** Exactly one meaningful question is presented at a time.

**1:** Multiple unrelated questions are bundled together.

---

### 2.6 Appropriate Stopping Behavior

Does the AI stop interviewing when additional questioning is no longer materially useful?

**5:** Stops at the point of sufficient definition.

**3:** Slightly over- or under-questions.

**1:** Continues asking generic questions unnecessarily or stops while material ambiguity remains.

---

# 5. Stage 3 — Requirement State Quality

Evaluate whether the AI maintains an accurate living representation of the requirement.

## Criteria

### 3.1 State Accuracy

Does the Requirement State accurately reflect the latest user-confirmed information?

The latest user correction must take precedence over earlier information.

---

### 3.2 Fact / Confirmation / Assumption / TBD Distinction

Does the AI clearly distinguish:

* Known facts
* User-confirmed requirements
* AI assumptions
* TBD / open decisions

**5:** Distinctions are consistently maintained.

**1:** AI assumptions are presented as facts or requirements.

---

### 3.3 Requirement State Completeness

Does the Requirement State contain the information necessary to support the validated requirement?

Relevant areas include:

* Objective
* Users / stakeholders
* Requirements
* Scope
* Constraints
* Business rules
* Dependencies
* Success criteria
* Assumptions
* Open decisions
* Risks

Not every field must be populated for every request.

---

### 3.4 No State Contradictions

Does the Requirement State remain internally consistent?

The AI should not simultaneously represent contradictory user-confirmed requirements as valid.

---

# 6. Stage 4 — Risk, Dependency & Ambiguity Governance

This stage evaluates whether the AI identifies material issues without inventing them.

## Criteria

### 4.1 Material Ambiguity Identification

Does the AI identify ambiguities that could materially affect the outcome?

The AI should prioritize consequential ambiguity over minor details.

---

### 4.2 Risk Identification

Does the AI surface relevant risks supported by the information gathered?

The AI should not create speculative risks simply to populate a section.

---

### 4.3 Dependency Identification

Does the AI identify meaningful business or organizational dependencies?

Dependencies should be based on known or explicitly stated information.

Technical dependencies should be deferred to the SDD unless the user explicitly provides them.

---

### 4.4 Constraint Identification

Does the AI capture material constraints that could affect the requirement?

Examples may include:

* Regulatory constraints
* Business policy
* Timing constraints
* Scope limitations
* Resource constraints
* User or operational limitations

Only supported constraints should be recorded.

---

# 7. Stage 5 — Readiness & Human Validation

This stage evaluates whether the AI correctly separates AI readiness from human approval.

## Canonical State Model

### Interview Status

```text
INTERVIEWING
READY_FOR_VALIDATION
```

### Validation Status

```text
NOT_READY
PENDING_REVIEW
VALIDATED
CHANGES_REQUESTED
```

### Intended Workflow

```text
INTERVIEWING
      ↓
READY_FOR_VALIDATION
      ↓
PENDING_REVIEW
      ↓
VALIDATED
      ↓
BRD GENERATION
```

If changes are requested:

```text
PENDING_REVIEW
      ↓
CHANGES_REQUESTED
      ↓
INTERVIEWING
```

---

## Criteria

### 5.1 Readiness Determination

Does the AI correctly determine when the requirement is sufficiently defined for human review?

Readiness should require:

* Clear objective
* Meaningful scope
* Material requirements identified
* Material constraints known or explicitly TBD
* Material dependencies known or explicitly TBD
* Important business rules known or explicitly TBD
* Relevant success criteria defined
* No remaining unknown likely to materially change the requirement

Readiness does **not** require every field to be populated.

---

### 5.2 Human Validation Gate

Does the system require explicit human approval before final BRD generation?

**5:** AI can recommend readiness but cannot self-validate.

**1:** AI automatically treats its own output as approved.

---

### 5.3 Validation State Accuracy

Does the application use the validation states correctly?

`PENDING_REVIEW` means the requirement is awaiting human review.

`VALIDATED` means the human explicitly approved it.

`CHANGES_REQUESTED` means the human requested additional clarification or changes.

The AI must not use `VALIDATED` simply because the interview ended.

---

### 5.4 Change Handling

When a human requests changes, does the system return to requirements clarification rather than silently modifying the approved requirement?

---

# 8. Stage 6 — BRD Quality

The BRD should be generated exclusively from the human-validated Requirement State.

## Criteria

### 6.1 Requirement Accuracy

Does the BRD accurately represent the validated requirement?

---

### 6.2 Business Requirement Quality

Are requirements:

* Specific
* Clear
* Unambiguous
* Testable where applicable
* Traceable

---

### 6.3 Scope Quality

Are:

* In-scope items
* Out-of-scope items

clearly represented where relevant?

---

### 6.4 Assumptions & TBD Quality

Are assumptions and unresolved decisions clearly identified rather than silently resolved?

---

### 6.5 Acceptance Criteria Quality

Are acceptance criteria objectively verifiable and aligned with the validated requirements?

---

### 6.6 BRD Structure Appropriateness

Does the BRD adapt to the request type rather than forcing irrelevant sections?

---

# 9. Stage 7 — BRD / SDD Boundary

Evaluate whether the AI maintains a clean boundary between business requirements and technical design.

## Criteria

### 7.1 WHAT / WHY vs. HOW

The BRD should describe:

* Business need
* Desired outcome
* Business requirements
* Scope
* Business rules
* Constraints
* Success criteria

The BRD should not prescribe implementation architecture.

---

### 7.2 No Unnecessary Technical Design

The AI should not invent:

* APIs
* Lambda
* Databases
* AWS services
* Architecture
* Infrastructure
* Environments
* Programming languages
* Frameworks
* Deployment architecture
* Technical authentication implementation
* Technical integration patterns

These belong in the SDD.

---

### 7.3 Explicit User Technical Information

If the user explicitly provides a technical constraint or implementation detail, the system should preserve it accurately without expanding it into unsupported design decisions.

---

# 10. Stage 8 — Traceability

Traceability should exist across the workflow:

```text
Original Request
      ↓
Interview Question / Answer
      ↓
Requirement State
      ↓
Validated Requirement
      ↓
BRD Requirement
```

## Criteria

### 8.1 Requirement Traceability

Can each major business requirement be traced to validated information?

---

### 8.2 Interview Traceability

Can the system identify which interview information contributed to a requirement where practical?

---

### 8.3 BRD Traceability

Can the generated BRD be traced back to the validated Requirement State?

---

# 11. Stage 9 — AI Governance

This stage consolidates the core governance principles into a small set of high-value checks.

## Criteria

### 9.1 No Unsupported Information

The AI does not invent enterprise facts, policies, stakeholders, dependencies, requirements, technology, or compliance obligations.

---

### 9.2 Transparent Uncertainty

The AI clearly identifies:

* Assumptions
* TBDs
* Unknowns
* Open decisions

---

### 9.3 Human Accountability

The AI supports human decision-making but does not represent its own output as authoritative approval.

---

### 9.4 Controlled Scope

The AI remains within the requested business problem and does not expand scope without user confirmation.

---

### 9.5 Consistency

The AI maintains consistent information across:

* Interview
* Requirement State
* Validation summary
* BRD

---

### 9.6 Explainability

The system provides concise, user-facing explanations for meaningful clarification questions without exposing internal chain-of-thought.

---

# 12. Stage 10 — Future SDD Evaluation

SDD evaluation is intentionally deferred until SDD generation is implemented.

Future criteria should include:

* BRD → SDD requirement coverage
* Architecture appropriateness
* Component design
* API/interface design
* Data considerations
* Security implementation
* Integration design
* Environment design
* Error handling
* Monitoring / observability
* Technical risks
* Implementation approach
* Technical traceability

The SDD should inherit validated business requirements rather than redefine them.

---

# 13. Future Implementation Task Evaluation

When implementation task generation is introduced, evaluate:

* Requirement coverage
* Task specificity
* Technical area
* Dependencies
* Sequencing
* Acceptance criteria
* Complexity / effort
* Traceability to SDD components

The system should avoid generating implementation tasks from unvalidated requirements.

---

# 14. Future Test Scenario Evaluation

When test scenario generation is introduced, evaluate:

* Acceptance criteria coverage
* Functional scenarios
* Integration scenarios
* Negative scenarios
* Error handling
* Security scenarios
* Regression scenarios
* Test data requirements
* Requirement traceability

Test scenarios should trace back to validated requirements and acceptance criteria.

---

# 15. Quality Gates

The following gates should be applied to the workflow.

## Gate 1 — Interview Quality

Before readiness:

* No material ambiguity remains unresolved.
* Questions were relevant and contextual.
* No significant repetition occurred.
* Facts and assumptions are distinguished.

## Gate 2 — Human Validation

Before BRD generation:

* Requirement status is `READY_FOR_VALIDATION`.
* Validation status is `VALIDATED`.
* Human approval is explicit.

## Gate 3 — BRD Quality

Before downstream use:

* Requirements are traceable.
* Scope is clear.
* Assumptions/TBDs are visible.
* No unsupported requirements were introduced.
* No unnecessary technical design was added.

## Gate 4 — Future SDD

Before implementation planning:

* SDD requirements trace back to the validated BRD.
* Technical decisions are documented.
* Technical risks and dependencies are identified.

---

# 16. Evaluation Summary

| Stage                        | Primary Evaluation                                                  |
| ---------------------------- | ------------------------------------------------------------------- |
| Initial Understanding        | Did the AI understand the request?                                  |
| Dynamic Interview            | Did each question materially improve understanding?                 |
| Requirement State            | Is the evolving requirement accurate and consistent?                |
| Risk / Dependency Governance | Were material issues surfaced without invention?                    |
| Readiness / Validation       | Did the AI stop appropriately and require human approval?           |
| BRD                          | Does the document accurately represent the validated business need? |
| BRD / SDD Boundary           | Did the AI keep WHAT/WHY separate from HOW?                         |
| Traceability                 | Can requirements be traced through the workflow?                    |
| AI Governance                | Is the AI transparent, controlled, and non-authoritative?           |
| Future SDD                   | Can validated requirements support technical design?                |
| Future Tasks                 | Can technical design support implementation planning?               |
| Future Testing               | Can requirements support meaningful test scenarios?                 |

---

# 17. Portfolio Demonstration

The project should demonstrate that AI can improve requirements engineering without removing human accountability.

A useful portfolio narrative is:

> "I designed an AI Requirements Engineering Copilot that uses contextual, one-question-at-a-time discovery rather than a fixed questionnaire. The AI maintains a structured Requirement State, distinguishes confirmed information from assumptions and TBDs, identifies when a requirement is sufficiently defined, and requires explicit human validation before generating a traceable BRD."

The governance scorecard demonstrates how the quality of that workflow can be evaluated systematically.

---

# 18. Key Principle

The quality of an AI requirements workflow should not be measured by how much content it generates.

It should be measured by whether it:

**understands → clarifies → structures → validates → traces**

while minimizing unnecessary questioning, unsupported assumptions, and premature technical design.

> **AI proposes. Humans validate. Requirements remain traceable.**
