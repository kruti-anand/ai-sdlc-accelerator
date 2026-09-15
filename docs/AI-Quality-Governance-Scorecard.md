# AI SDLC Accelerator – Version 1 Quality & Governance Scorecard

---

## Stage 1: Requirement Analysis & Clarification Questions

**Purpose**: Evaluate whether AI identified critical information gaps and ambiguities before BRD generation.

### Evaluation Criteria

| Criterion | Score 1-5 | What "Good" Looks Like | Common Failure Modes | Human Reviewer Checklist |
|-----------|-----------|----------------------|---------------------|--------------------------|
| **Completeness of Questions** | | AI asked 8-10 substantive clarification questions covering user context, scope, technical, security, regulatory, dependencies, and assumptions. | AI asks vague questions ("Is this important to you?") or asks only 3-4 questions. Missing entire categories (e.g., no security questions). | ✓ Are there questions about user population, scope boundaries, technical constraints, security/compliance, and dependencies? ✓ Does each question serve a purpose (not filler)? |
| **Distinction: Known vs. Assumed** | | AI explicitly calls out what it's assuming from the requirement text vs. what's missing. E.g., "You mention 'external users'—assuming this means 'customers' not 'partners'. Is this correct?" | AI treats vague terms as facts. E.g., "The requirement says 'secure'—proceeding with industry-standard encryption" without confirming what "secure" means to the business. | ✓ For each assumption AI makes, does it flag it with "⚠️ Assumption:"? ✓ Does AI ask for confirmation of implied terms? |
| **No Enterprise Hallucination** | | AI does not invent facts about the company's infrastructure, systems, or policies. E.g., does not assume "we already have an OAuth provider" or "we use AWS." | AI makes assumptions like: "You'll integrate with your existing IDP" without knowing if an IDP exists. "We'll use Kubernetes" without knowing if the team uses containers. | ✓ Does AI invent specific technology choices? ✓ Does AI assume vendor/tool names without asking? ✓ Are all assumptions based on explicit requirement text or flagged as assumptions? |
| **Risk & Dependency Surfacing** | | AI identifies and flags key risks, dependencies, and constraints implied by the requirement. E.g., "This requires integration with external system X—what's their SLA?" or "GDPR may apply—have you assessed?". | AI ignores integration points. Doesn't flag regulatory/compliance concerns. Doesn't identify where external dependencies exist. | ✓ Does AI surface at least 2-3 risks or dependencies? ✓ Does it ask about regulatory/compliance implications if relevant? ✓ Does it ask about integration points and external systems? |
| **Question Clarity & Actionability** | | Each question is answerable by the Product Owner. Questions are not ambiguous or require technical expertise to answer. E.g., "Who are the primary users?" not "What's your technical architecture?" | AI asks highly technical questions a business person can't answer. Questions are unclear ("What does this mean to you?"). Questions assume jargon the PO may not know. | ✓ Could a Product Owner answer each question without technical background? ✓ Does each question have a clear, bounded answer (not open-ended rambling)? ✓ Are there questions a domain expert (not a coder) should answer? |
| **Traceability to Requirement** | | Each question traces back to a specific phrase or concept in the original requirement. AI explains why the question matters. | AI asks random questions unrelated to the specific requirement. No explanation of why each question is important. | ✓ For each question, can you trace it back to the requirement text? ✓ Does AI explain "Why we ask this"? ✓ Are questions tailored to the specific requirement or generic for any requirement? |

### Scoring Guidance

- **Score 5 (Portfolio-Quality)**: AI asks 10 well-crafted, specific questions covering all major dimensions. Clearly flags assumptions. No invented facts. Surfaces risks and dependencies. Explains why each question matters.
- **Score 4 (Strong)**: AI asks 8-10 good questions covering most dimensions. Flags most assumptions. One or two minor hallucinations. Good explanation.
- **Score 3 (Acceptable)**: AI asks 6-8 questions covering basic dimensions. Flags some assumptions but misses a few. May invent one non-critical assumption. Explanation present but could be clearer.
- **Score 2 (Needs Revision)**: AI asks only 4-5 questions or misses entire categories (e.g., no security questions). Fails to flag assumptions. Some hallucinations. Poor explanation.
- **Score 1 (Poor)**: AI asks vague or irrelevant questions. Invents multiple facts. No assumption flagging. Missing major categories.

### Human Reviewer Decision Gate

- **Score 4-5**: ✅ Approve clarifications → Proceed to BRD generation
- **Score 3**: ⚠️ Proceed with caution. User should carefully answer questions and flag areas AI missed. May need to re-run clarification if user finds gaps later.
- **Score 1-2**: ❌ Reject. Request AI to re-run with refined prompt or return requirement for manual clarification.

---

## Stage 2: Business Requirements Document (BRD)

**Purpose**: Evaluate whether AI translated requirement + clarifications into a complete, structured, traceable BRD with clear functional/non-functional requirements, assumptions, risks, and dependencies.

### Evaluation Criteria

| Criterion | Score 1-5 | What "Good" Looks Like | Common Failure Modes | Human Reviewer Checklist |
|-----------|-----------|----------------------|---------------------|--------------------------|
| **Section Completeness** | | BRD includes all required sections: Business Objective, Problem Statement, Scope / Out of Scope, Stakeholders, Functional Requirements (FR-1, FR-2, ...), Non-Functional Requirements (NFR-1, NFR-2, ...), Business Rules, Assumptions, Dependencies, Risks, Acceptance Criteria. No sections are empty or marked "TBD". | Missing sections (e.g., no "Out of Scope"). Entire sections marked "TBD" or "To be determined." Assumption/Risk/Dependency sections left blank. | ✓ Count sections. Every required section populated? ✓ No "TBD" or empty placeholders? ✓ Each section has substantive content (not one-liners)? |
| **Functional Requirements Quality** | | Functional requirements (FR-1, FR-2, ...) are specific, measurable, and traceable. Each requirement is one feature or behavior. Tied to user actions or system behavior. E.g., "FR-1: System shall allow users to authenticate via OAuth 2.0" not "FR-1: Support modern authentication." | Requirements are vague ("improve security", "better performance"). Not measurable. Multiple features bundled in one requirement. Not tied to user context. Missing acceptance criteria. | ✓ Is each FR specific and measurable? ✓ Does FR describe a behavior or feature, not a goal? ✓ Are FRs tied to user context (e.g., "external users", "administrators")? ✓ Could a developer build this from the FR alone? |
| **Non-Functional Requirements Quality** | | Non-functional requirements (NFR-1, NFR-2, ...) are specific and measurable. Cover performance, scalability, security, reliability, maintainability, compliance. E.g., "NFR-1: System shall support 1000 concurrent users" or "NFR-2: All data encrypted at rest (AES-256)." | NFRs are vague ("be secure", "perform well"). Not measurable. Missing entire categories (e.g., no security NFRs if security is important). | ✓ Is each NFR measurable (with numbers, thresholds, standards)? ✓ Do NFRs cover performance, security, scalability, compliance? ✓ Are NFRs consistent with requirement and clarifications? ✓ Can a team implement and test this NFR? |
| **Assumptions, Risks, Dependencies Clearly Flagged** | | Assumptions are listed with IDs (A-1, A-2, ...). Each assumption is explicit and distinct. Risks are listed (R-1, R-2, ...) with potential impact. Dependencies are listed (D-1, D-2, ...) with external systems/teams. All flagged items trace back to clarifications or requirement text. | Assumptions are buried in the prose (not called out). Same assumption listed twice. Risks missing. Dependencies not mentioned. Flagged items invented by AI (not from requirement/clarifications). | ✓ Are assumptions, risks, and dependencies called out with IDs? ✓ Is each assumption distinct or are there duplicates? ✓ Do flagged items tie back to clarification answers or requirement text? ✓ Is at least one risk identified (if this is a non-trivial requirement)? |
| **Distinction: Requirement vs. Design** | | BRD describes WHAT the system should do (functional requirements), not HOW to build it (design choices). E.g., "authenticate users" (requirement) not "use OAuth 2.0 library" (design). Technology choices are discussed in scope/assumptions but not presented as requirements. | BRD includes design decisions (e.g., "implement using Node.js", "use PostgreSQL"). Requirements are phrased as implementation tasks. Technology is assumed without being flagged. | ✓ Are FRs written as "system shall [do X]" not "developers shall [build Y]"? ✓ Are technology choices clearly separated as assumptions, not requirements? ✓ Could the same BRD be implemented with different tech stacks? |
| **Acceptance Criteria Specificity** | | Acceptance Criteria (AC-1, AC-2, ...) are specific and testable. Each AC defines how to verify a requirement is met. E.g., "AC-1: User can log in with valid OAuth token and gain access to protected resources" or "AC-2: Login fails with clear error message if credentials are invalid." | Acceptance criteria are vague ("User can log in successfully"). Not testable (no way to verify). Missing for half the requirements. Buried in requirements prose (not called out). | ✓ Is each AC testable (could QA write a test for it)? ✓ Is AC specific (includes expected outcome, boundary conditions)? ✓ Does every functional requirement have at least one AC? ✓ Are ACs distinct from FRs (not just restatements)? |
| **Traceability to Clarifications** | | BRD sections reference clarification questions/answers. E.g., "(from Q3: Will use existing IDP)" or "(per clarifications, target users are external customers)". Reader can trace each BRD item back to the clarification that informed it. | BRD has no reference to clarifications. Content appears to come from nowhere. Contradicts clarification answers. | ✓ Sample 3-4 BRD items. Can you trace each back to a clarification or requirement? ✓ Do FRs reflect answers given to clarification questions? ✓ Are contradictions between BRD and clarifications absent? |

### Scoring Guidance

- **Score 5 (Portfolio-Quality)**: All sections present and substantive. FRs are specific and measurable. NFRs cover all important dimensions with measurable targets. Assumptions, risks, dependencies are clearly flagged with IDs and trace back to clarifications. ACs are testable. No design creep. Excellent traceability.
- **Score 4 (Strong)**: All sections present. FRs and NFRs are good but could be more specific. Most assumptions/risks/dependencies flagged. ACs are testable but could be more specific. Clear traceability.
- **Score 3 (Acceptable)**: All major sections present but one or two are thin. FRs are mostly specific; some NFRs missing or vague. Some assumptions/risks flagged but not all. ACs mostly testable. Traceability present but not explicit.
- **Score 2 (Needs Revision)**: Missing sections or large sections marked "TBD". FRs vague or bundled together. Few NFRs or design creep visible. Assumptions/risks/dependencies missing. ACs not testable. Poor traceability.
- **Score 1 (Poor)**: Major sections missing. FRs are barely requirements. No NFRs. No assumptions/risks/dependencies. No ACs. Looks like design document, not BRD.

### Human Reviewer Decision Gate

- **Score 4-5**: ✅ Approve BRD → Proceed to SDD generation
- **Score 3**: ⚠️ Conditional approval. Flag specific weak areas (e.g., "NFRs need detail"). Proceed but ensure SDD addresses gaps. May revisit BRD after SDD review.
- **Score 1-2**: ❌ Reject. Request AI to regenerate BRD with focus on specific gaps (e.g., "Add 5 specific NFRs", "Clearly flag all assumptions").

---

## Stage 3: Software Design Document (SDD)

**Purpose**: Evaluate whether AI translated BRD into a coherent, technically sound design that addresses all requirements, proposes appropriate components/APIs, and maintains traceability to BRD.

### Evaluation Criteria

| Criterion | Score 1-5 | What "Good" Looks Like | Common Failure Modes | Human Reviewer Checklist |
|-----------|-----------|----------------------|---------------------|--------------------------|
| **Requirements Coverage** | | Every functional requirement from BRD has at least one SDD component or design decision that addresses it. Traceability is explicit: "FR-2 (OAuth authentication) → SDD Component C-1 (Auth Module)." Missing or unclear requirements are flagged. | SDD doesn't mention how to implement key BRD requirements. Components exist but no explanation of which FR they address. Entire BRD sections ignored in SDD. | ✓ Sample 4-5 FRs from BRD. For each, find the SDD component/design that addresses it. ✓ Is mapping explicit (e.g., "FR-X → Component Y")? ✓ Are all FRs accounted for? ✓ Are any BRD requirements missing from SDD? |
| **Component Design & Responsibility** | | Each component has a clear name, responsibility, technology stack, and interfaces. Components are reasonable for the architecture (e.g., "Authentication Module", "API Gateway", "Database Abstraction Layer"). Responsibilities don't overlap or are clear about handoffs. | Components are vaguely named ("Service 1", "Module A"). Responsibilities are unclear or overlapping. Technology choices are not explained. Components don't make sense for the problem. | ✓ List each component. For each: Is the name clear? Is responsibility distinct from other components? Is technology justified? ✓ Could a developer implement this component from the description? ✓ Do components align with BRD scope? |
| **API/Interface Specification** | | APIs and interfaces between components are specified. E.g., "API-1: /auth/login (POST) takes credentials, returns OAuth token." Enough detail for a developer to implement. Data types, error codes, and dependencies are mentioned. | APIs are vague ("System interfaces with auth provider" with no details). Missing interface specifications. No mention of error handling or data contracts. | ✓ Count and review 3-4 APIs/interfaces. Is each specific enough to implement? ✓ Are data types and error responses mentioned? ✓ Do APIs align with FRs? ✓ Are async patterns, retry logic, or other integration concerns addressed? |
| **NFR Alignment** | | Design decisions tie back to BRD non-functional requirements. E.g., if NFR-1 requires "support 1000 concurrent users," SDD explains architecture choice (horizontal scaling, load balancing, caching). Security NFRs map to security design decisions (encryption, authentication, authorization). | SDD doesn't mention how design meets NFRs. Performance/security/scalability NFRs are ignored. Design assumes unlimited resources (no scaling). | ✓ Sample 3 NFRs from BRD. For each, does SDD explain how the design meets it? ✓ If NFR is "encrypt all data," does SDD specify encryption method and key management? ✓ If NFR is "1000 users," does SDD show scaling strategy? |
| **Technical Soundness (Not Over-Engineering)** | | Architecture makes sense for the problem. Technology choices are justified. No unnecessary complexity (e.g., doesn't propose microservices for a small CRUD app). Assumptions about infrastructure/tooling are documented. | Design is overly complex (multi-agent architecture for a simple requirement). Technology choices are unjustified ("use Kubernetes because it's popular"). Design ignores practical constraints. Architecture doesn't scale to stated requirements. | ✓ Is the architecture reasonable for the requirement? ✓ Are technology choices explained or flagged as assumptions? ✓ Is there unnecessary complexity? ✓ Does design assume infrastructure that may not exist? ✓ Could a team actually build and operate this? |
| **Risk & Dependency Identification** | | SDD identifies technical risks (e.g., "Integration with external OAuth provider is a single point of failure") and dependencies (e.g., "Requires working OAuth provider SLA of 99.9%"). Risks map back to or expand on BRD risks. Mitigation strategies are proposed. | SDD ignores risks. Dependencies are not mentioned. Assumes external systems will always work. No mention of fallback strategies or error cases. | ✓ Are there at least 2-3 technical risks identified? ✓ Is each risk tied to a design decision or external dependency? ✓ Are mitigation strategies proposed (e.g., "fallback to LDAP if OAuth fails")? ✓ Do technical risks map back to BRD risks? |
| **Traceability: BRD → SDD** | | Traceability is explicit and bidirectional. BRD requirements map to SDD components; SDD components justify their existence by mapping to BRD requirements. Traceability can be exported as a matrix. No orphan components (components with no corresponding requirement). | Traceability is implicit or missing. Components exist with no clear link to BRD. Requirements mentioned in BRD but not addressed in SDD. Matrix is missing or incomplete. | ✓ Can you export a traceability matrix: BRD-FR-X → SDD-Component-Y? ✓ For each SDD component, does at least one BRD requirement justify it? ✓ Are there SDD components with no BRD link (scope creep)? ✓ Are there BRD requirements with no SDD link (gaps)? |

### Scoring Guidance

- **Score 5 (Portfolio-Quality)**: All BRD requirements covered in SDD with explicit traceability. Components are well-defined with clear responsibilities and technology justification. APIs are specific and implementable. All NFRs addressed in design. Technical soundness is high; architecture is appropriate for the problem. Risks identified with mitigation. Traceability matrix is complete.
- **Score 4 (Strong)**: All major BRD requirements covered. Components are mostly well-defined. APIs are mostly specific. NFRs mostly addressed. Architecture is sound. Some technical risks identified. Traceability is present but could be more explicit.
- **Score 3 (Acceptable)**: Most BRD requirements covered. Component definitions are adequate but could be clearer. Some APIs need more detail. Some NFRs addressed but others missing. Architecture is reasonable. Few risks identified. Traceability present but not comprehensive.
- **Score 2 (Needs Revision)**: Many BRD requirements not explicitly addressed. Components are vague. APIs lack detail. Few NFRs addressed. Architecture seems overcomplicated or underdeveloped. Risks not identified. Traceability is sparse.
- **Score 1 (Poor)**: Major BRD requirements not addressed. Components are poorly defined. No APIs specified. NFRs ignored. Architecture is unsound or too complex. No risks. No traceability.

### Human Reviewer Decision Gate

- **Score 4-5**: ✅ Approve SDD → Proceed to implementation planning
- **Score 3**: ⚠️ Conditional approval. Note specific gaps (e.g., "Add caching strategy for performance NFR"). Proceed but tasks should address gaps.
- **Score 1-2**: ❌ Reject. Request AI to regenerate SDD with focus on requirements coverage or technical soundness.

---

## Stage 4: Implementation Plan (Task Decomposition)

**Purpose**: Evaluate whether AI broke SDD into actionable, properly dependent tasks with realistic estimates and clear acceptance criteria.

### Evaluation Criteria

| Criterion | Score 1-5 | What "Good" Looks Like | Common Failure Modes | Human Reviewer Checklist |
|-----------|-----------|----------------------|---------------------|--------------------------|
| **Component Coverage** | | Every SDD component (C-1, C-2, ...) is represented in the task list. Either one task per component or multiple tasks if component is large. No SDD components left unaddressed. No orphan tasks (tasks with no link to SDD). | Tasks don't map to SDD components. Large components (e.g., "Auth Module") are left out. Tasks exist with no clear SDD origin. | ✓ List all SDD components. For each, find corresponding task(s). ✓ Are all components addressed? ✓ List all tasks. For each, which SDD component does it implement? ✓ Are there orphan tasks (scope creep)? |
| **Task Specificity & Clarity** | | Each task has a clear, specific description. Task title is actionable (e.g., "Implement OAuth 2.0 client library" not "Implement authentication"). Description includes what to build, constraints, and dependencies. A developer could pick up the task and know what to do. | Task titles are vague ("Work on backend", "Do API stuff"). Descriptions are missing or one-liners. Conflation of multiple features in one task. No clear deliverable. | ✓ Sample 5-6 tasks. For each, could a developer start implementing without asking questions? ✓ Is scope clear (what's in, what's out)? ✓ Is title action-oriented? ✓ Is description specific enough to estimate? |
| **Dependency Graph Accuracy** | | Dependencies are explicit and correct. E.g., "Task-2 depends on Task-1" (OAuth client library must be built before API integration). No circular dependencies. Dependency ordering makes sense. Graph is acyclic and enables parallel work. | Dependencies are missing (tasks listed as independent when they should be sequential). Circular dependencies exist. Unrealistic parallelization (tasks listed as independent that actually block each other). | ✓ Draw or trace the dependency graph. Are there cycles? ✓ Sample 3-4 dependencies. Does the ordering make sense? ✓ Could tasks be executed in dependency order without conflicts? ✓ Are there opportunities for parallel work that are missed? |
| **Complexity & Effort Estimation** | | Tasks are rated on a complexity scale (1-5) with consistent logic. Complexity drives estimate ranges. E.g., "Complexity 1: 1-2 days", "Complexity 3: 5-8 days", "Complexity 5: 10-15 days." Estimates have ranges (not fixed), acknowledging uncertainty. Estimates are based on SDD detail (not invented). | All tasks rated the same complexity (1s or 3s). No effort ranges. Estimates are precise (fixed hours/days, no ranges). Estimates seem too low or too high with no justification. | ✓ Are complexity ratings consistent across similar tasks? ✓ Do effort ranges increase with complexity? ✓ Are estimates presented as ranges (e.g., "5-8 days") not fixed? ✓ Sample 3 tasks: Are estimates reasonable for the work described? |
| **Acceptance Criteria (Testability)** | | Each task has 1-3 acceptance criteria (AC-1, AC-2, ...) that are testable. AC defines when task is "done". E.g., "OAuth token exchange works end-to-end", "API returns 401 for invalid token". ACs map back to BRD acceptance criteria. | Acceptance criteria are vague ("API works", "feature is implemented"). Not testable. Missing for many tasks. Not tied to BRD acceptance criteria. | ✓ Sample 5-6 tasks. Does each have testable AC? ✓ Could QA write a test for each AC? ✓ Sample 3 ACs: Do they map back to BRD acceptance criteria? ✓ Are there tasks with no AC? |
| **Traceability: SDD → Tasks → BRD** | | Traceability is explicit: "Task-1 implements SDD-Component-1, which addresses BRD-FR-2." Each task links to the SDD component it implements. Each SDD component is covered by one or more tasks. Cross-references are clear and exportable. | Traceability is missing or implicit. Tasks don't reference SDD components. Can't trace task back to BRD requirement. | ✓ Sample 3-4 tasks. Trace each back: Task → SDD Component → BRD Requirement. ✓ Can you create a traceability matrix? ✓ Are there tasks with no SDD link? ✓ Are there SDD components with no task? |
| **Realism & Sequencing** | | Task ordering respects dependencies but allows parallelization where possible. Sequence is implementable by a team (not all tasks blocked until prior ones complete). High-risk tasks are identified. No surprise blockers late in sequence. | Tasks are sequenced linearly (only one thing can happen at a time). Critical path is unclear. High-risk tasks are buried in the middle. Sequencing assumes unlimited resources. | ✓ Can 3-4 tasks run in parallel, or are they all sequential? ✓ Are high-risk tasks scheduled early (to de-risk)? ✓ Is the critical path clear? ✓ Would this sequence work for a real team? |

### Scoring Guidance

- **Score 5 (Portfolio-Quality)**: All SDD components covered. Tasks are specific and clear. Dependency graph is correct with no cycles. Complexity ratings are consistent and estimates have justified ranges. All tasks have testable ACs mapping to BRD criteria. Full traceability (SDD → Task → BRD). Sequencing is realistic and allows parallelization.
- **Score 4 (Strong)**: All components covered. Tasks are mostly clear. Dependencies mostly correct. Complexity and estimates are good. Most tasks have ACs. Traceability is present. Sequencing is mostly realistic.
- **Score 3 (Acceptable)**: Most components covered. Tasks are adequate but could be more specific. Some dependency issues but no cycles. Complexity/estimates are reasonable. Many tasks have ACs but not all. Traceability present. Sequencing is acceptable.
- **Score 2 (Needs Revision)**: Some components missing or poorly broken down. Tasks lack clarity. Dependency issues (may have cycles or missing dependencies). Complexity/estimates are vague. Few tasks have ACs. Traceability is sparse. Sequencing is unrealistic.
- **Score 1 (Poor)**: Major components not covered. Tasks are vague or conflated. Circular dependencies or wrong ordering. No complexity estimates. No ACs. No traceability. Sequencing is unusable.

### Human Reviewer Decision Gate

- **Score 4-5**: ✅ Approve implementation plan → Proceed to test planning
- **Score 3**: ⚠️ Conditional approval. Flag specific concerns (e.g., "Task-3 complexity may be underestimated"). Proceed but monitor during implementation.
- **Score 1-2**: ❌ Reject. Request AI to regenerate task list with focus on component coverage, dependency accuracy, and clearer task definitions.

---

## Stage 5: Test Scenarios

**Purpose**: Evaluate whether AI created comprehensive, traceable test scenarios that cover BRD acceptance criteria, SDD components, and implementation tasks.

### Evaluation Criteria

| Criterion | Score 1-5 | What "Good" Looks Like | Common Failure Modes | Human Reviewer Checklist |
|-----------|-----------|----------------------|---------------------|--------------------------|
| **Acceptance Criteria Coverage** | | Every BRD acceptance criterion (AC-1, AC-2, ...) has at least one test scenario. Tests are mapped explicitly: "TEST-5 validates AC-2 (user logs in with OAuth)." Coverage is complete; no BRD ACs left untested. | Many BRD acceptance criteria have no corresponding test. Tests are generic and don't tie to specific ACs. Coverage is partial or unclear. | ✓ List all BRD acceptance criteria. For each, find the test that validates it. ✓ Are all ACs covered? ✓ Are tests specific to BRD ACs or generic? ✓ Are any ACs left untested? |
| **Test Scenario Comprehensiveness (Categories)** | | Tests are organized by category and cover: Functional (happy path and variants), Integration (cross-component, e.g., OAuth + API), Negative (error cases, e.g., invalid login), Security (auth, encryption, access control), Regression (existing features still work). At least 2-3 tests per category. | Tests are only "happy path" (all working scenarios). No negative or error cases. Security tests missing. Integration tests missing. Only one or two test categories represented. | ✓ List test categories represented: Functional, Integration, Negative, Security, Regression. ✓ How many tests in each category? ✓ Are important scenarios missing (e.g., if security NFR exists, are there security tests)? ✓ Do negative tests cover failure modes from BRD risks? |
| **Test Scenario Specificity & Clarity** | | Each test scenario has: clear name, setup/preconditions, step-by-step test steps, expected outcome. Specific enough that QA can execute without guessing. E.g., "TEST-5: User logs in with OAuth, expects API token in response with 'exp' claim within 1 hour." | Test names are vague ("test login"). Steps are missing or ambiguous. Expected outcome is unclear. No setup described. QA would need to ask questions. | ✓ Sample 5-6 test scenarios. For each: Could QA execute it without ambiguity? ✓ Are setup, steps, and expected outcome all specified? ✓ Are test parameters clear (e.g., what token, what user)? ✓ Is success criterion unambiguous? |
| **Negative & Error Scenario Coverage** | | Tests include error cases and boundary conditions. E.g., "TEST-8: Invalid OAuth token returns 401 Unauthorized", "TEST-10: Empty password field shows validation error", "TEST-12: Concurrent logins don't cause race condition". Tests cover risks from BRD (e.g., if "IDP outage" is a risk, there's a test for degraded mode). | Mostly happy-path tests. Few or no error cases. No boundary conditions. No tests for risks/failure modes. Assumes everything always works. | ✓ Count negative/error tests. Are there at least 3-4? ✓ Do they cover risks from BRD? ✓ Are boundary conditions tested (empty input, max length, timeout)? ✓ Do tests cover partial failures (e.g., IDP slow but not down)? |
| **Traceability: Test → AC → FR → SDD Component** | | Each test scenario is explicitly linked: "TEST-5 validates AC-2 (from BRD-FR-2, implemented by SDD-Component-1 via TASK-3)." Links are explicit and can be exported as traceability matrix. No orphan tests (tests with no BRD connection). | Tests don't reference which AC they validate. Traceability is missing. Tests exist with no clear purpose. Can't trace test back to requirement. | ✓ Sample 4-5 tests. For each, trace: Test → BRD AC → BRD FR → SDD Component → Task. ✓ Are all links present? ✓ Can you export a test traceability matrix? ✓ Are there orphan tests (extra tests with no BRD link)? |
| **Automation Feasibility** | | For each test, there's a note on automation feasibility: "Can automate" or "Manual only" with brief reason. Automation-friendly tests use clear assertions. Tests that are "Manual only" have clear reasons (e.g., performance load test, user experience check). | All tests marked "Can automate" without assessment. No consideration of what's practical to automate. Tests are too vague to automate. | ✓ For each test, is automation feasibility assessed? ✓ Are reasons given for "Manual only" tests? ✓ For automatable tests, are assertions clear (e.g., "HTTP 200", "token.exp < now + 3600")? ✓ Would a test automation engineer agree these are automatable? |
| **Test Data Requirements Specified** | | Each test scenario specifies what test data is needed: "TEST-5 requires: valid OAuth token, API endpoint URL, user session ID." Data setup is clear. For security tests, data sensitivity is noted. | Test data requirements are missing. Tests assume test data exists but don't specify it. Unclear if tests can run with sample data or need production data. | ✓ Sample 5-6 tests. For each, are test data requirements listed? ✓ Can test data be created synthetically or does it require production data? ✓ Are sensitive data concerns noted (e.g., "Don't use real customer data")? |

### Scoring Guidance

- **Score 5 (Portfolio-Quality)**: All BRD ACs covered by explicit tests. Test scenarios organized by comprehensive categories (Functional, Integration, Negative, Security, Regression). Each test is specific and executable. Negative/error scenarios cover BRD risks. Full traceability (Test → AC → FR → SDD → Task). Automation feasibility assessed. Test data requirements specified.
- **Score 4 (Strong)**: All or nearly all BRD ACs covered. Good variety of test categories. Scenarios mostly specific and executable. Most negative/error cases covered. Traceability present. Automation feasibility mostly assessed.
- **Score 3 (Acceptable)**: Most BRD ACs covered. Basic test categories present. Scenarios are adequate but could be more specific. Some negative cases covered. Traceability present. Automation feasibility partially assessed.
- **Score 2 (Needs Revision)**: Many BRD ACs not covered. Limited test variety (mostly happy path). Test scenarios lack specificity. Few negative cases. Traceability is sparse. Automation feasibility not addressed.
- **Score 1 (Poor)**: Few BRD ACs covered. Only happy-path tests. Scenarios are vague. No negative cases. No traceability. Test data unclear.

### Human Reviewer Decision Gate

- **Score 4-5**: ✅ Approve test plan → Ready for QA implementation
- **Score 3**: ⚠️ Conditional approval. Flag missing test categories or vague scenarios. Proceed but QA should refine during implementation.
- **Score 1-2**: ❌ Reject. Request AI to regenerate test plan with focus on AC coverage and scenario specificity.

---

## Stage 6: Traceability Matrix

**Purpose**: Evaluate whether traceability links are complete, correct, and auditable across all artifacts (Requirement → BRD → SDD → Tasks → Tests).

### Evaluation Criteria

| Criterion | Score 1-5 | What "Good" Looks Like | Common Failure Modes | Human Reviewer Checklist |
|-----------|-----------|----------------------|---------------------|--------------------------|
| **Completeness: No Orphans, No Gaps** | | Every BRD requirement (FR, NFR, AC) maps to at least one SDD component. Every SDD component maps to at least one task. Every task maps to at least one test. Reverse: every test maps back to a BRD AC, every task maps back to SDD, every SDD component maps back to BRD. No orphans (items with no upstream/downstream link). | Orphan BRD requirements (nothing in SDD addresses them). Orphan tasks (no BRD link). Tests exist with no connection to requirements. Gaps in traceability chain. | ✓ Export traceability matrix. For each row, check: Requirement → BRD → SDD → Task → Test, no breaks? ✓ Are all BRD requirements represented? ✓ Are all tasks represented? ✓ Are all tests represented? ✓ Count: Does every row have 5 cells (Req, BRD, SDD, Task, Test)? |
| **Accuracy of Links** | | Links are bidirectional and consistent. If "FR-2 → SDD-C-3", then "SDD-C-3 → FR-2". Links are validated (not guessed). E.g., "Test-5 validates AC-2, which is part of FR-2, which is implemented by SDD-C-1, which is built by Task-3." All links are correct. | Links are one-directional or contradictory. "FR-2 → SDD-C-3" but "SDD-C-3 → FR-5" (inconsistent). Links are incorrect (test claims to validate AC but doesn't). Links are invented by AI without basis. | ✓ Sample 3-4 traceability chains. Trace end-to-end: Requirement → BRD → SDD → Task → Test. Are all links correct? ✓ Check reverse: Pick a test, trace back to requirement. ✓ Do links make logical sense (not random pairings)? |
| **Explicit & Exportable** | | Traceability is exported as a structured file (CSV, JSON, or markdown table). Each row shows the full chain for one requirement. Format is clear and human-readable. Links can be updated if requirements change. Not just stored as comments in prose. | Traceability is buried in document text ("mentioned earlier..."). No exportable matrix. Only available in internal comments. Hard to update. | ✓ Can you export traceability matrix as CSV or JSON? ✓ Does it include all artifacts (Req, BRD, SDD, Task, Test)? ✓ Could a stakeholder read and verify it easily? ✓ Is the format structured (not prose)? |
| **Audit Trail Preservation** | | All decisions and approvals are logged with timestamp and approver. E.g., "BRD approved by ProductOwner1 at 2024-01-15 10:30 UTC." Audit trail shows revision history (BRD v1.0 vs v1.1). Links between versions are preserved. Audit trail is immutable (not editable after creation). | No audit trail or minimal logging. Timestamps missing. Approver names not recorded. No revision history. Decisions can be edited after approval. | ✓ Is there an audit trail showing: Requirement submitted, BRD approved (who, when), SDD approved (who, when), etc.? ✓ Can you see the full history of revisions? ✓ Are all decisions timestamped and attributed? ✓ Could you prove in court who approved what and when? |
| **Assumption & Risk Propagation** | | Assumptions and risks from BRD are linked to relevant SDD components, tasks, and tests. E.g., "BRD-A-1 (assumes OAuth provider exists) → SDD-I-2 (OAuth API integration) → TASK-2 (implement OAuth client)." Risks are covered by tests (e.g., "BRD-R-3 (IDP outage risk) → TEST-12 (fallback auth test)"). | Assumptions/risks mentioned in BRD but not reflected in SDD. Risks not addressed by tests. Assumptions not validated by tasks. Disconnect between identified risks and mitigations. | ✓ List all BRD assumptions and risks. For each, find the SDD component that addresses it. ✓ For each risk, is there a test that exercises the mitigation? ✓ Does SDD explain how assumptions are validated? |
| **Usability for Downstream Work** | | Traceability is useful for development and QA teams. A developer can look up a task, see which BRD requirements it implements, see which tests validate it. A QA engineer can look up a test, see what requirement it validates, see which task implements it. Traceability guides implementation and testing. | Traceability is academic (links exist but don't guide practical work). A developer still has to re-read BRD to understand why a task exists. QA has to infer which tests matter. Traceability doesn't reduce rework. | ✓ Imagine a developer picks up Task-3. Can they understand which BRD requirement it addresses? ✓ Imagine QA reviews Test-5. Can they understand which AC it validates? ✓ Would traceability help prevent misalignment during development? |

### Scoring Guidance

- **Score 5 (Portfolio-Quality)**: Complete traceability with no orphans or gaps. All links are accurate and bidirectional. Exportable, structured matrix. Full audit trail with timestamps and approvers. Assumptions/risks are propagated and tested. Traceability is useful for downstream teams.
- **Score 4 (Strong)**: Complete or nearly complete traceability. Most links are accurate. Exportable matrix. Good audit trail. Assumptions/risks mostly propagated.
- **Score 3 (Acceptable)**: Most traceability present. Some links may be missing or unclear. Basic matrix available. Audit trail present. Some assumptions/risks tracked.
- **Score 2 (Needs Revision)**: Significant gaps in traceability. Many links missing or inaccurate. Matrix incomplete. Audit trail minimal. Assumptions/risks not tracked.
- **Score 1 (Poor)**: Traceability missing or incoherent. No exportable matrix. No audit trail. No assumption/risk tracking.

### Human Reviewer Decision Gate

- **Score 4-5**: ✅ Traceability is complete and can be confidently exported for portfolio demonstration
- **Score 3**: ⚠️ Traceability is acceptable but has gaps. Before demo, manually verify end-to-end chains.
- **Score 1-2**: ❌ Reject. Request AI to rebuild traceability matrix, ensuring completeness and accuracy.

---

## Stage 7: AI Governance & Quality (Meta-Evaluation)

**Purpose**: Evaluate whether AI outputs collectively demonstrate good governance principles: distinguishing known from assumed, flagging risks, maintaining auditability, and avoiding hallucinations.

### Evaluation Criteria

| Criterion | Score 1-5 | What "Good" Looks Like | Common Failure Modes | Human Reviewer Checklist |
|-----------|-----------|----------------------|---------------------|--------------------------|
| **Assumptions Clearly Flagged** | | All artifacts use consistent "⚠️ Assumption:" notation. Assumptions are explicit and distinct. Reader can easily distinguish assumptions from facts. Examples: "⚠️ Assumes OAuth provider has SLA of 99.9%", "⚠️ Assumes LDAP is available". Assumptions are numbered (A-1, A-2, ...) and traceable. | Assumptions are buried in prose ("it will probably be Okta"). Mixed with facts ("The system requires LDAP, which we probably have"). Inconsistent notation. No way to find all assumptions. | ✓ Search all artifacts for "Assumption" notation. Is it consistent? ✓ Sample 3-4 assumptions. Are they clearly stated and distinct from facts? ✓ Can a reader easily find all assumptions? ✓ Would a business person and a developer interpret assumptions the same way? |
| **No Enterprise Hallucination** | | AI does not invent specific tool names, vendor names, or policy details without basis in the requirement or clarifications. E.g., doesn't assume "we use Okta" or "we deploy to AWS" without evidence. If AI makes a choice (e.g., "use Redis for caching"), it's flagged as a design decision, not a fact. | AI invents facts: "We'll integrate with your existing Okta instance" (no evidence Okta exists). "We'll deploy to Kubernetes" (not mentioned in requirement). "GDPR applies" (not confirmed). "The team uses Node.js" (not stated). | ✓ Search all artifacts for vendor/tool names (Okta, AWS, Kubernetes, etc.). Is each one either mentioned in the requirement/clarifications or flagged as a design decision? ✓ Are any facts invented with no basis? ✓ Would these assumptions surprise the business person who submitted the requirement? |
| **Risks & Dependencies Explicitly Surfaced** | | All artifacts surface key risks and dependencies. BRD flags assumptions/risks/dependencies with IDs. SDD explains how design addresses risks and manages dependencies. Tasks include risk/dependency notes. Risks are not hidden; they're prominently called out. | Risks and dependencies are mentioned casually in prose. Not flagged with IDs. No distinction between critical and minor risks. Risks that should be flagged (e.g., external API dependency) are glossed over. | ✓ List all risks mentioned across all artifacts. Are they flagged with consistent IDs? ✓ Count dependencies. Are external systems/teams called out? ✓ If a risk exists in BRD, is it addressed in SDD and reflected in tests? ✓ Would a program manager reading this see all the risks? |
| **No Design Creep (BRD vs. SDD)** | | BRD describes requirements (WHAT); SDD describes design (HOW). BRD doesn't prescribe technology. E.g., BRD says "authenticate users securely", not "use OAuth 2.0". SDD proposes OAuth as one design choice, explaining trade-offs. Requirements are not conflated with design. | BRD includes design mandates ("use Node.js", "deploy to AWS"). SDD is just a repeat of requirements with no new design detail. Design decisions are presented as requirements. | ✓ Sample 5 BRD requirements. Does any say "use X technology" or "deploy to Y"? ✓ Sample 5 SDD sections. Do they propose design options with justification? ✓ Could the same BRD be designed 2-3 different ways? |
| **Consistency & Non-Contradiction Across Artifacts** | | All artifacts are consistent. BRD requirements align with SDD design. SDD components align with tasks. Tasks align with tests. No contradictions or conflicting information across documents. E.g., if BRD says "support 1000 users", SDD doesn't propose single-instance architecture. If SDD proposes caching, tests include cache validation. | Contradictions exist: BRD says "fast response" but SDD proposes no caching. SDD proposes microservices but BRD scope is tiny. Tasks don't align with SDD components. Tests don't match task descriptions. Documents were generated independently without coherence check. | ✓ Compare BRD and SDD on key points (user count, performance, security). Are they consistent? ✓ Sample 3 tasks. Do they align with SDD components? ✓ Sample 3 tests. Do they align with BRD acceptance criteria? ✓ Is there any contradiction that would confuse a development team? |
| **Quality & Specificity (Not Vague or Generic)** | | Outputs are specific to the actual requirement, not generic templates. BRD describes this business requirement, not "a generic authentication requirement". SDD proposes architecture for this specific problem, not cookie-cutter patterns. Tasks are specific (not "set up backend"). Examples are relevant to the requirement. | Outputs are heavily templated ("Enter project description", "Add authentication"). Same content would work for any requirement. AI clearly didn't read the requirement carefully. Examples are generic (don't reflect the specific business context). | ✓ Compare BRD for two different requirements. Are they different in substance or just templated versions? ✓ Does BRD use the company's context/terminology or generic language? ✓ Do tasks refer to specific components (not generic steps)? ✓ Would the development team feel these outputs are tailored to their project? |
| **Explainability: Why Decisions Were Made** | | Each major decision is explained. Prompts show reasoning. E.g., SDD explains "We chose OAuth over SAML because [reasons based on NFRs]." BRD explains "Risk flagged because [specific concern]." User can understand the 'why' behind outputs. | Decisions appear without justification ("Component X exists"). AI provides outputs with no reasoning. User can't understand why AI made certain choices. | ✓ Sample 3-5 design decisions in SDD. For each, is reasoning provided? ✓ Sample 3 risks in BRD. Is the "why" explained? ✓ Can a reader understand the logic behind categorization of FR vs. NFR? ✓ If user disagrees with a decision, can they see the reasoning to discuss? |

### Scoring Guidance

- **Score 5 (Portfolio-Quality)**: Assumptions and risks are clearly and consistently flagged. No enterprise hallucinations. All artifacts are specific to the requirement and consistent with each other. No design creep. Good reasoning provided for decisions. Would pass governance review by a skeptical CTO or PM.
- **Score 4 (Strong)**: Most assumptions and risks are flagged. Few or no hallucinations. Outputs are mostly specific and consistent. Minor design creep. Good reasoning for most decisions.
- **Score 3 (Acceptable)**: Assumptions and risks are mentioned but not always clearly flagged. A few minor hallucinations. Outputs are somewhat specific. Some consistency issues. Reasoning could be better.
- **Score 2 (Needs Revision)**: Assumptions not clearly flagged or tracked. Several hallucinations. Outputs are somewhat generic. Significant inconsistencies. Poor reasoning. Governance concerns.
- **Score 1 (Poor)**: Assumptions not flagged. Multiple hallucinations. Generic outputs. Major inconsistencies. No reasoning. Would fail governance review.

### Human Reviewer Decision Gate

- **Score 4-5**: ✅ AI governance is strong. This output is portfolio-ready and demonstrates good AI oversight.
- **Score 3**: ⚠️ Governance is acceptable but has gaps. Flag concerns in demo; manually verify key assumptions and risks.
- **Score 1-2**: ❌ Governance concerns. Before proceeding, either manually review and correct, or re-run AI with refined prompts focusing on transparency and assumption flagging.

---

## Summary Scoring Table

Use this table to quickly score all stages:

| Stage | P0 | Criteria | Target Score | Pass Gate | Notes |
|-------|----|----|------|-----------|-------|
| **Requirement Analysis** | MVP | 6 criteria | 4+ | Score 4-5: Approve clarifications → BRD generation | Looks for clarity, no hallucination, risk surfacing |
| **BRD** | MVP | 6 criteria | 4+ | Score 4-5: Approve BRD → SDD generation | Looks for completeness, specificity, traceability |
| **SDD** | MVP | 6 criteria | 4+ | Score 4-5: Approve SDD → Implementation planning | Looks for requirements coverage, feasibility, NFR alignment |
| **Implementation Plan** | MVP | 6 criteria | 4+ | Score 4-5: Approve plan → Test planning | Looks for component coverage, dependencies, estimates |
| **Test Scenarios** | MVP | 6 criteria | 4+ | Score 4-5: Approve tests → QA ready | Looks for AC coverage, negative cases, traceability |
| **Traceability** | MVP | 6 criteria | 4+ | Complete matrix | Score 4-5: Export confident for portfolio demo | Looks for completeness, accuracy, auditability |
| **AI Governance** | MVP | 7 criteria | 4+ | Meta-approval | Score 4-5: Demonstrate good AI oversight | Looks for assumption flagging, consistency, no hallucination |

---

## How to Use This Scorecard in Practice

### During MVP Development (Copilot-Assisted)

1. **Run AI on example requirement** (e.g., "Add MFA authentication")
2. **Score each stage** using the scorecard (1-5 for each criterion)
3. **Calculate stage score** (average of 6 criteria, round to nearest integer)
4. **Make gate decision**:
   - **Score 4-5**: ✅ Approve & proceed
   - **Score 3**: ⚠️ Note concerns, proceed with caution
   - **Score 1-2**: ❌ Reject, request AI re-run with specific feedback

5. **Document feedback**: If rejecting, note specific criteria that failed (e.g., "BRD score 2: Acceptance criteria not testable")
6. **Refine prompts**: Based on feedback, update AI prompts and re-run until score 4+

### During Portfolio Demo

1. **Select best example** (the one with highest scores across all stages)
2. **Walk through scorecard** with stakeholders:
   - "Here's the BRD. It scores a 5 on section completeness, a 5 on FR specificity, a 5 on assumptions flagging..."
3. **Show traceability**: "Here's the matrix. See how every BRD requirement maps to SDD component to task to test?"
4. **Highlight governance**: "Notice how assumptions are flagged, risks are surfaced, and human approvals are required at each stage?"
5. **Demonstrate iteration**: If available, show a Stage 2 example where you rejected a BRD (scored 2) and re-ran it (scored 5)

### Frame for Hiring Manager

> "I'm evaluating AI outputs using this governance scorecard. It ensures requirements are complete before design, design before implementation, and tests before deployment. Every stage requires a score of 4+ (strong or portfolio-quality) before proceeding. This discipline is what I'd bring to an AI transformation: not just using AI fast, but using it with governance and rigor."

---

**End of V1 AI Quality & Governance Scorecard**
