javascript
/* =========================================================
   AI Requirements Engineering Copilot
   Version 1 — Deterministic prototype
   ---------------------------------------------------------
   The UI and state model are designed so a real LLM-backed
   interview service can replace the prototype question
   selection later without changing the product flow.
   ========================================================= */

"use strict";

/* =========================================================
   Requirement State
   ========================================================= */

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

/* =========================================================
   Application State
   ========================================================= */

const appState = {
  currentStep: 1,
  loading: false,
  error: null,
  questionCounter: 0
};

/* =========================================================
   DOM Helpers
   ========================================================= */

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function normalize(value) {
  return String(value || "").trim().toLowerCase();
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

/* =========================================================
   Accessibility / Status
   ========================================================= */

function setLoading(isLoading, message = "Working…") {
  appState.loading = isLoading;

  const analyzeButton = $("#analyze-btn");
  const continueButton = $("#continue-btn");
  const tbdButton = $("#tbd-btn");

  if (analyzeButton) {
    analyzeButton.disabled = isLoading;
    analyzeButton.setAttribute("aria-busy", String(isLoading));
  }

  if (continueButton) {
    continueButton.disabled = isLoading;
    continueButton.setAttribute("aria-busy", String(isLoading));
  }

  if (tbdButton) {
    tbdButton.disabled = isLoading;
  }

  const loadingRegion = $("#loading-state");

  if (loadingRegion) {
    loadingRegion.hidden = !isLoading;
    loadingRegion.textContent = isLoading ? message : "";
  }
}

function showError(message) {
  appState.error = message;

  const errorRegion = $("#error-state");

  if (errorRegion) {
    errorRegion.hidden = false;
    errorRegion.textContent = message;
    errorRegion.setAttribute("role", "alert");
    errorRegion.focus();
  }
}

function clearError() {
  appState.error = null;

  const errorRegion = $("#error-state");

  if (errorRegion) {
    errorRegion.hidden = true;
    errorRegion.textContent = "";
  }
}

function focusElement(selector) {
  const element = $(selector);

  if (element) {
    window.setTimeout(() => {
      element.focus();
    }, 50);
  }
}

/* =========================================================
   Navigation
   ========================================================= */

function goToStep(step) {
  appState.currentStep = step;

  $$(".step-panel").forEach((panel) => {
    const panelStep = Number(panel.dataset.step);
    panel.hidden = panelStep !== step;
  });

  $$(".progress-step").forEach((item) => {
    const itemStep = Number(item.dataset.step);

    item.classList.toggle("active", itemStep === step);
    item.classList.toggle("complete", itemStep < step);

    item.setAttribute(
      "aria-current",
      itemStep === step ? "step" : "false"
    );
  });

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}

/* =========================================================
   Request Classification
   ========================================================= */

function classifyRequest(request) {
  const text = normalize(request);

  let category = "OTHER";
  let confidence = 0.55;

  if (
    /add|build|create|develop|implement|system|application|portal|feature|authentication|mfa|integration|software|platform/.test(
      text
    )
  ) {
    category = "SOFTWARE_SYSTEM";
    confidence = 0.88;
  } else if (
    /process|workflow|approval|intake|procedure|manual|operational|handoff/.test(
      text
    )
  ) {
    category = "BUSINESS_PROCESS";
    confidence = 0.84;
  } else if (
    /plan|planning|strategy|roadmap|initiative|program|launch|migration|transformation/.test(
      text
    )
  ) {
    category = "PLANNING_OUTCOME";
    confidence = 0.78;
  } else if (
    /report|understand|analyze|information|insight|visibility|dashboard|why|what is/.test(
      text
    )
  ) {
    category = "INFORMATIONAL";
    confidence = 0.76;
  }

  return {
    category,
    confidence
  };
}

function getRequestTypeLabel(category) {
  const labels = {
    SOFTWARE_SYSTEM: "Software / System",
    BUSINESS_PROCESS: "Business Process",
    PLANNING_OUTCOME: "Planning / Outcome",
    INFORMATIONAL: "Information / Analysis",
    OTHER: "Other"
  };

  return labels[category] || "Other";
}

/* =========================================================
   State Helpers
   ========================================================= */

function addKnownFact(statement, source = "user_provided") {
  if (!statement) return;

  const exists = requirementState.knownFacts.some(
    (item) => normalize(item.statement) === normalize(statement)
  );

  if (!exists) {
    requirementState.knownFacts.push({
      statement,
      source
    });
  }
}

function addRequirement(statement, source = "user_confirmed") {
  if (!statement) return;

  const exists = requirementState.requirements.some(
    (item) => normalize(item.statement) === normalize(statement)
  );

  if (!exists) {
    const id = `BR-${String(
      requirementState.requirements.length + 1
    ).padStart(3, "0")}`;

    requirementState.requirements.push({
      id,
      statement,
      source,
      confidence: source === "user_confirmed" ? "confirmed" : "inferred"
    });
  }
}

function addToList(collection, statement) {
  if (!statement) return;

  const exists = collection.some(
    (item) => normalize(item) === normalize(statement)
  );

  if (!exists) {
    collection.push(statement);
  }
}

/* =========================================================
   Initial Request Analysis
   ========================================================= */

function analyzeInitialRequest(request) {
  const classification = classifyRequest(request);

  requirementState.originalRequest = request;
  requirementState.requestType = classification;

  /*
   * The objective starts as a conservative interpretation.
   * It is deliberately not treated as confirmed until the
   * interview validates it.
   */
  requirementState.objective = deriveInitialObjective(request);

  addKnownFact(
    `The user described the request as: "${request}"`,
    "original_request"
  );

  extractInitialFacts(request);

  requirementState.interview.status = "INTERVIEWING";
  requirementState.validation.status = "NOT_READY";
}

function deriveInitialObjective(request) {
  const cleaned = request
    .replace(/^we need to /i, "")
    .replace(/^we need /i, "")
    .replace(/^i need to /i, "")
    .replace(/^i need /i, "")
    .trim();

  if (!cleaned) {
    return "Clarify the desired business outcome.";
  }

  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}

function extractInitialFacts(request) {
  const text = request;

  /*
   * Lightweight extraction for the deterministic prototype.
   * The eventual LLM service will perform richer extraction.
   */

  const externalUserMatch = text.match(
    /external users?/i
  );

  if (externalUserMatch) {
    addKnownFact(
      "The request involves external users.",
      "original_request"
    );
  }

  if (/mfa|multi[- ]factor|two[- ]factor/i.test(text)) {
    addRequirement(
      "External users must use multi-factor authentication.",
      "user_stated"
    );
  }

  if (/authentication/i.test(text)) {
    addKnownFact(
      "Authentication is part of the requested outcome.",
      "original_request"
    );
  }
}

/* =========================================================
   Contextual Question Selection
   ---------------------------------------------------------
   This is NOT a fixed questionnaire.

   The prototype evaluates the current state after every
   answer and chooses the highest-impact unresolved area.
   ========================================================= */

function selectNextQuestion() {
  const candidates = [];

  const state = requirementState;
  const request = normalize(state.originalRequest);

  /* Objective ambiguity */

  if (
    !state.objective ||
    state.objective === "Clarify the desired business outcome."
  ) {
    candidates.push({
      priority: 100,
      key: "objective",
      question:
        "What business outcome are you trying to achieve with this request?",
      why:
        "Clarifying the intended outcome helps define what the requirement must accomplish."
    });
  }

  /* User / population ambiguity */

  if (
    state.usersAndStakeholders.length === 0 &&
    !state.knownFacts.some((item) =>
      /external users|internal users|customers|employees|users/i.test(
        item.statement
      )
    )
  ) {
    candidates.push({
      priority: 95,
      key: "users",
      question:
        "Who will be affected by this change or use the resulting capability?",
      why:
        "The target users determine the business scope and requirements."
    });
  }

  /* Scope ambiguity */

  if (
    state.scope.inScope.length === 0 &&
    state.scope.outOfScope.length === 0
  ) {
    candidates.push({
      priority: 90,
      key: "scope",
      question:
        "What should this change cover, and are there any users, scenarios, or areas that should explicitly be excluded?",
      why:
        "Clear scope prevents the requirement from expanding beyond the intended outcome."
    });
  }

  /* MFA-specific contextual questions */

  if (
    /mfa|multi[- ]factor|two[- ]factor/.test(request) &&
    !hasAnswerAbout("scope exceptions")
  ) {
    candidates.push({
      priority: 92,
      key: "mfa_scope",
      question:
        "Should multi-factor authentication apply to every external user, or are there specific users or scenarios that should be excluded?",
      why:
        "MFA scope and exceptions can materially change the business requirement."
    });
  }

  /* Business rules */

  if (
    state.businessRules.length === 0 &&
    state.requirements.length > 0
  ) {
    candidates.push({
      priority: 75,
      key: "business_rules",
      question:
        "Are there any business rules, policies, or conditions that this requirement must follow?",
      why:
        "Business rules can materially change how the requirement should behave."
    });
  }

  /* Constraints */

  if (
    state.constraints.length === 0 &&
    state.requirements.length > 0
  ) {
    candidates.push({
      priority: 70,
      key: "constraints",
      question:
        "Are there any important business, regulatory, timing, budget, or user-experience constraints we need to account for?",
      why:
        "Material constraints can affect scope and acceptance of the outcome."
    });
  }

  /* Success criteria */

  if (
    state.successCriteria.length === 0 &&
    state.requirements.length > 0
  ) {
    candidates.push({
      priority: 65,
      key: "success",
      question:
        "How will the business know this change has achieved the intended outcome?",
      why:
        "Success criteria provide a measurable way to determine whether the requirement has delivered its intended value."
    });
  }

  /* Dependencies */

  if (
    state.dependencies.length === 0 &&
    state.requirements.length > 0
  ) {
    candidates.push({
      priority: 60,
      key: "dependencies",
      question:
        "Does this depend on another business team, process, policy, vendor, system change, or decision?",
      why:
        "Known business dependencies help identify delivery risks and ownership."
    });
  }

  /*
   * If enough meaningful information exists, stop.
   */

  if (isReadyForValidation()) {
    return null;
  }

  candidates.sort((a, b) => b.priority - a.priority);

  return candidates[0] || null;
}

function hasAnswerAbout(topic) {
  return requirementState.interview.questionsAsked.some((item) =>
    normalize(item.question).includes(normalize(topic))
  );
}

/* =========================================================
   Readiness
   ========================================================= */

function isReadyForValidation() {
  const state = requirementState;

  const hasObjective =
    Boolean(state.objective) &&
    state.objective !== "Clarify the desired business outcome.";

  const hasRequirements = state.requirements.length > 0;

  const hasScope =
    state.scope.inScope.length > 0 ||
    state.scope.outOfScope.length > 0 ||
    state.openDecisions.length > 0;

  const hasMeaningfulInterview =
    state.interview.questionsAsked.length >= 3;

  if (
    hasObjective &&
    hasRequirements &&
    hasScope &&
    hasMeaningfulInterview
  ) {
    return true;
  }

  return false;
}

/* =========================================================
   Process Answers
   ========================================================= */

function processAnswer(answer, isTBD = false) {
  const current = requirementState.interview.currentQuestion;

  if (!current) return;

  const cleanAnswer = answer.trim();

  const interviewRecord = {
    id: current.id,
    question: current.question,
    why: current.why,
    answer: isTBD ? "TBD / Not decided" : cleanAnswer
  };

  requirementState.interview.questionsAsked.push(interviewRecord);

  if (isTBD) {
    addToList(
      requirementState.openDecisions,
      current.question
    );
  } else {
    applyAnswerToState(current, cleanAnswer);
  }

  requirementState.interview.currentQuestion = null;

  const nextQuestion = selectNextQuestion();

  if (!nextQuestion) {
    requirementState.interview.status = "READY_FOR_VALIDATION";
    requirementState.validation.status = "PENDING_REVIEW";
  } else {
    requirementState.interview.status = "INTERVIEWING";
    requirementState.validation.status = "NOT_READY";
    setCurrentQuestion(nextQuestion);
  }
}

function applyAnswerToState(question, answer) {
  const key = question.key;
  const clean = answer.trim();

  switch (key) {
    case "objective":
      requirementState.objective = clean;
      addKnownFact(clean, "interview_answer");
      break;

    case "users":
      addToList(requirementState.usersAndStakeholders, clean);
      addKnownFact(
        `Target users/stakeholders: ${clean}`,
        "interview_answer"
      );
      break;

    case "scope":
      addToList(
        requirementState.scope.inScope,
        clean
      );

      addKnownFact(
        `Scope clarified as: ${clean}`,
        "interview_answer"
      );
      break;

    case "mfa_scope":
      addToList(
        requirementState.scope.inScope,
        clean
      );

      addKnownFact(
        `MFA scope clarification: ${clean}`,
        "interview_answer"
      );
      break;

    case "business_rules":
      addToList(
        requirementState.businessRules,
        clean
      );
      break;

    case "constraints":
      addToList(
        requirementState.constraints,
        clean
      );
      break;

    case "success":
      addToList(
        requirementState.successCriteria,
        clean
      );
      break;

    case "dependencies":
      addToList(
        requirementState.dependencies,
        clean
      );
      break;

    default:
      addKnownFact(clean, "interview_answer");
      break;
  }
}

function setCurrentQuestion(question) {
  appState.questionCounter += 1;

  requirementState.interview.currentQuestion = {
    id: `Q-${String(appState.questionCounter).padStart(3, "0")}`,
    question: question.question,
    why: question.why,
    key: question.key
  };
}

/* =========================================================
   UI Rendering
   ========================================================= */

function renderUnderstanding() {
  const typeBadge = $("#request-type");

  if (typeBadge) {
    typeBadge.textContent = getRequestTypeLabel(
      requirementState.requestType.category
    );
  }

  const understanding = $("#understanding-text");

  if (understanding) {
    understanding.textContent =
      requirementState.objective ||
      "The request has been received and is being clarified.";
  }

  renderStateMetrics();
}

function renderStateMetrics() {
  const metrics = {
    "#metric-known": requirementState.knownFacts.length,
    "#metric-requirements": requirementState.requirements.length,
    "#metric-scope":
      requirementState.scope.inScope.length +
      requirementState.scope.outOfScope.length,
    "#metric-open":
      requirementState.openDecisions.length +
      requirementState.assumptions.length
  };

  Object.entries(metrics).forEach(([selector, value]) => {
    const element = $(selector);

    if (element) {
      element.textContent = value;
    }
  });
}

function renderInterview() {
  const history = $("#interview-history");

  if (history) {
    history.innerHTML = requirementState.interview.questionsAsked
      .map(
        (item) => `
          <div class="history-item">
            <div class="history-question">
              <span>${escapeHtml(item.id)}</span>
              ${escapeHtml(item.question)}
            </div>
            <div class="history-answer">
              ${escapeHtml(item.answer)}
            </div>
          </div>
        `
      )
      .join("");
  }

  const question = requirementState.interview.currentQuestion;

  const questionElement = $("#current-question");
  const whyElement = $("#question-why");
  const answerInput = $("#current-answer");
  const readyMessage = $("#ready-message");
  const continueButton = $("#continue-btn");
  const tbdButton = $("#tbd-btn");

  if (question) {
    if (questionElement) {
      questionElement.textContent = question.question;
    }

    if (whyElement) {
      whyElement.textContent = question.why;
    }

    if (answerInput) {
      answerInput.value = "";
      answerInput.disabled = false;
    }

    if (continueButton) {
      continueButton.hidden = false;
      continueButton.disabled = false;
    }

    if (tbdButton) {
      tbdButton.hidden = false;
    }

    if (readyMessage) {
      readyMessage.hidden = true;
    }

    focusElement("#current-answer");
  } else {
    if (questionElement) {
      questionElement.textContent =
        "The requirement has enough information for stakeholder validation.";
    }

    if (whyElement) {
      whyElement.textContent =
        "Review the requirement before approving it for BRD generation.";
    }

    if (continueButton) {
      continueButton.hidden = true;
    }

    if (tbdButton) {
      tbdButton.hidden = true;
    }

    if (readyMessage) {
      readyMessage.hidden = false;
    }

    if (answerInput) {
      answerInput.disabled = true;
    }
  }

  renderStateMetrics();
}

function renderValidation() {
  const state = requirementState;

  setText(
    "#validation-objective",
    state.objective || "Not yet defined"
  );

  setHtml(
    "#validation-requirements",
    renderList(
      state.requirements.map(
        (item) => `<strong>${escapeHtml(item.id)}</strong> — ${escapeHtml(item.statement)}`
      )
    )
  );

  setHtml(
    "#validation-scope",
    renderList([
      ...state.scope.inScope.map(
        (item) => `In scope: ${item}`
      ),
      ...state.scope.outOfScope.map(
        (item) => `Out of scope: ${item}`
      )
    ])
  );

  setHtml(
    "#validation-dependencies",
    renderList([
      ...state.dependencies.map(
        (item) => `Dependency: ${item}`
      ),
      ...state.risks.map(
        (item) => `Risk: ${item}`
      )
    ])
  );

  setHtml(
    "#validation-assumptions",
    renderList([
      ...state.assumptions.map(
        (item) => `Assumption: ${item}`
      ),
      ...state.openDecisions.map(
        (item) => `TBD: ${item}`
      )
    ])
  );

  setHtml(
    "#validation-success",
    renderList(state.successCriteria)
  );

  const status = $("#validation-status");

  if (status) {
    status.textContent =
      state.validation.status === "PENDING_REVIEW"
        ? "Pending human review"
        : state.validation.status;
  }

  renderValidationEditControls();
}

function renderValidationEditControls() {
  const container = $("#validation-edit-controls");

  if (!container) return;

  container.innerHTML = `
    <div class="edit-control">
      <label for="edit-objective">Objective</label>
      <textarea id="edit-objective" rows="3">${escapeHtml(
        requirementState.objective
      )}</textarea>
      <button type="button" class="secondary-btn" id="save-objective">
        Save objective
      </button>
    </div>

    <div class="edit-control">
      <label for="edit-requirements">Requirements</label>
      <textarea id="edit-requirements" rows="5">${escapeHtml(
        requirementState.requirements
          .map((item) => item.statement)
          .join("\n")
      )}</textarea>
      <button type="button" class="secondary-btn" id="save-requirements">
        Save requirements
      </button>
    </div>

    <div class="edit-control">
      <label for="edit-scope">Scope</label>
      <textarea id="edit-scope" rows="4">${escapeHtml(
        requirementState.scope.inScope.join("\n")
      )}</textarea>
      <button type="button" class="secondary-btn" id="save-scope">
        Save scope
      </button>
    </div>

    <div class="edit-control">
      <label for="edit-open-decisions">Assumptions / TBDs</label>
      <textarea id="edit-open-decisions" rows="4">${escapeHtml(
        requirementState.openDecisions.join("\n")
      )}</textarea>
      <button type="button" class="secondary-btn" id="save-open-decisions">
        Save assumptions / TBDs
      </button>
    </div>
  `;

  $("#save-objective")?.addEventListener("click", () => {
    requirementState.objective =
      $("#edit-objective").value.trim();

    markRequirementChanged();
  });

  $("#save-requirements")?.addEventListener("click", () => {
    const values = $("#edit-requirements").value
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean);

    requirementState.requirements = values.map(
      (statement, index) => ({
        id: `BR-${String(index + 1).padStart(3, "0")}`,
        statement,
        source: "human_edited",
        confidence: "confirmed"
      })
    );

    markRequirementChanged();
  });

  $("#save-scope")?.addEventListener("click", () => {
    requirementState.scope.inScope = $("#edit-scope").value
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean);

    markRequirementChanged();
  });

  $("#save-open-decisions")?.addEventListener("click", () => {
    requirementState.openDecisions =
      $("#edit-open-decisions").value
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean);

    markRequirementChanged();
  });
}

function markRequirementChanged() {
  requirementState.validation.status = "CHANGES_REQUESTED";
  requirementState.validation.reviewedByHuman = true;

  renderValidation();

  const notice = $("#validation-edit-notice");

  if (notice) {
    notice.hidden = false;
    notice.textContent =
      "Changes saved. Review the updated requirement before approving it.";
  }
}

/* =========================================================
   BRD Generation
   ========================================================= */

function generateBRD() {
  const state = requirementState;

  if (
    state.validation.status !== "VALIDATED" ||
    !state.validation.reviewedByHuman
  ) {
    showError(
      "The BRD can only be generated after explicit human approval."
    );
    return;
  }

  const requirementsHtml = state.requirements
    .map(
      (item) => `
        <li>
          <strong>${escapeHtml(item.id)}</strong>
          — ${escapeHtml(item.statement)}
          <small>Source: ${escapeHtml(item.source)}</small>
        </li>
      `
    )
    .join("");

  const scopeHtml = renderList([
    ...state.scope.inScope.map(
      (item) => `In scope: ${item}`
    ),
    ...state.scope.outOfScope.map(
      (item) => `Out of scope: ${item}`
    )
  ]);

  const brd = `
    <article class="brd-document">
      <header>
        <div class="brd-label">BUSINESS REQUIREMENTS DOCUMENT</div>
        <h2>${escapeHtml(state.objective)}</h2>
        <p class="brd-status">Status: Human Validated</p>
      </header>

      <section>
        <h3>1. Executive Summary</h3>
        <p>
          This document captures the business requirements for the
          validated request and is based exclusively on the
          human-approved Requirement State.
        </p>
      </section>

      <section>
        <h3>2. Business Problem / Opportunity</h3>
        <p>${escapeHtml(state.originalRequest)}</p>
      </section>

      <section>
        <h3>3. Users &amp; Stakeholders</h3>
        ${renderList(state.usersAndStakeholders)}
      </section>

      <section>
        <h3>4. Scope</h3>
        ${scopeHtml}
      </section>

      <section>
        <h3>5. Business Requirements</h3>
        <ol>
          ${requirementsHtml}
        </ol>
      </section>

      <section>
        <h3>6. Business Rules</h3>
        ${renderList(state.businessRules)}
      </section>

      <section>
        <h3>7. Business Constraints</h3>
        ${renderList(state.constraints)}
      </section>

      <section>
        <h3>8. Dependencies</h3>
        ${renderList(state.dependencies)}
      </section>

      <section>
        <h3>9. Success Criteria</h3>
        ${renderList(state.successCriteria)}
      </section>

      <section>
        <h3>10. Assumptions &amp; TBDs</h3>
        ${renderList([
          ...state.assumptions.map(
            (item) => `Assumption: ${item}`
          ),
          ...state.openDecisions.map(
            (item) => `TBD: ${item}`
          )
        ])}
      </section>

      <section>
        <h3>11. Risks</h3>
        ${renderList(state.risks)}
      </section>

      <section>
        <h3>12. Acceptance Criteria</h3>
        ${renderList(
          state.successCriteria.length
            ? state.successCriteria
            : [
                "Business stakeholders confirm that the documented requirements accurately represent the intended outcome.",
                "All material scope, assumptions, dependencies, and open decisions are explicitly documented."
              ]
        )}
      </section>
    </article>
  `;

  setHtml("#brd-content", brd);

  const traceability = $("#traceability-banner");

  if (traceability) {
    traceability.hidden = false;
    traceability.textContent =
      "Traceability: BRD requirements are generated from the human-validated Requirement State.";
  }

  goToStep(4);
}

/* =========================================================
   Utility Rendering
   ========================================================= */

function setText(selector, value) {
  const element = $(selector);

  if (element) {
    element.textContent = value;
  }
}

function setHtml(selector, value) {
  const element = $(selector);

  if (element) {
    element.innerHTML = value;
  }
}

function renderList(items) {
  const filtered = items.filter(Boolean);

  if (!filtered.length) {
    return `<p class="empty-state">Not specified.</p>`;
  }

  return `
    <ul>
      ${filtered
        .map(
          (item) =>
            `<li>${escapeHtml(stripHtml(String(item)))}</li>`
        )
        .join("")}
    </ul>
  `;
}

function stripHtml(value) {
  return value.replace(/<[^>]*>/g, "");
}

/* =========================================================
   Main Actions
   ========================================================= */

function handleAnalyze() {
  clearError();

  const input = $("#requirement");

  if (!input) return;

  const request = input.value.trim();

  if (!request) {
    showError(
      "Please enter a business request before continuing."
    );
    input.focus();
    return;
  }

  setLoading(true, "Analyzing the request…");

  window.setTimeout(() => {
    try {
      analyzeInitialRequest(request);

      const firstQuestion = selectNextQuestion();

      if (firstQuestion) {
        setCurrentQuestion(firstQuestion);
      }

      renderUnderstanding();
      renderInterview();

      goToStep(2);
    } catch (error) {
      console.error(error);
      showError(
        "Something went wrong while analyzing the request. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, 350);
}

function handleContinue() {
  clearError();

  const answerInput = $("#current-answer");

  if (!answerInput) return;

  const answer = answerInput.value.trim();

  if (!answer) {
    showError(
      "Please provide an answer or choose “Mark as TBD.”"
    );
    answerInput.focus();
    return;
  }

  setLoading(true, "Updating the requirement state…");

  window.setTimeout(() => {
    try {
      processAnswer(answer, false);

      renderUnderstanding();
      renderInterview();

      if (
        requirementState.interview.status ===
        "READY_FOR_VALIDATION"
      ) {
        renderValidation();
      }
    } catch (error) {
      console.error(error);
      showError(
        "The answer could not be processed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, 250);
}

function handleTBD() {
  clearError();

  setLoading(true, "Recording this as an open decision…");

  window.setTimeout(() => {
    try {
      processAnswer("", true);

      renderUnderstanding();
      renderInterview();
    } catch (error) {
      console.error(error);
      showError(
        "The TBD response could not be recorded."
      );
    } finally {
      setLoading(false);
    }
  }, 200);
}

function handleReview() {
  clearError();

  if (
    requirementState.interview.status !==
    "READY_FOR_VALIDATION"
  ) {
    showError(
      "The requirement is not ready for validation yet."
    );
    return;
  }

  requirementState.validation.status = "PENDING_REVIEW";

  renderValidation();
  goToStep(3);

  focusElement("#validation-heading");
}

function handleContinueInterview() {
  requirementState.validation.status = "CHANGES_REQUESTED";
  requirementState.validation.reviewedByHuman = true;
  requirementState.interview.status = "INTERVIEWING";

  const nextQuestion = selectNextQuestion();

  if (nextQuestion) {
    setCurrentQuestion(nextQuestion);
  }

  renderInterview();
  goToStep(2);
}

function handleApprove() {
  clearError();

  /*
   * Explicit human action is the only path to VALIDATED.
   */
  requirementState.validation.status = "VALIDATED";
  requirementState.validation.reviewedByHuman = true;

  generateBRD();
}

function handleCopyBRD() {
  const brd = $("#brd-content");

  if (!brd) return;

  navigator.clipboard
    ?.writeText(brd.innerText)
    .then(() => {
      const button = $("#copy-brd-btn");

      if (button) {
        const original = button.textContent;
        button.textContent = "Copied";

        window.setTimeout(() => {
          button.textContent = original;
        }, 1500);
      }
    })
    .catch(() => {
      showError(
        "The BRD could not be copied automatically. You can select and copy the text manually."
      );
    });
}

function restart() {
  window.location.reload();
}

/* =========================================================
   Sample Request
   ========================================================= */

function loadSample() {
  const input = $("#requirement");

  if (!input) return;

  input.value =
    "We need to add MFA authentication for external users.";

  updateCharacterCount();
  input.focus();
}

/* =========================================================
   Character Count
   ========================================================= */

function updateCharacterCount() {
  const input = $("#requirement");
  const counter = $("#character-count");

  if (!input || !counter) return;

  counter.textContent = `${input.value.length} characters`;
}

/* =========================================================
   Keyboard Behavior
   ========================================================= */

function handleAnswerKeydown(event) {
  /*
   * Ctrl/Cmd + Enter submits the current answer.
   */
  if (
    event.key === "Enter" &&
    (event.ctrlKey || event.metaKey)
  ) {
    event.preventDefault();

    if (!appState.loading) {
      handleContinue();
    }
  }
}

/* =========================================================
   Event Wiring
   ========================================================= */

function initialize() {
  $("#analyze-btn")?.addEventListener(
    "click",
    handleAnalyze
  );

  $("#sample-btn")?.addEventListener(
    "click",
    loadSample
  );

  $("#continue-btn")?.addEventListener(
    "click",
    handleContinue
  );

  $("#tbd-btn")?.addEventListener(
    "click",
    handleTBD
  );

  $("#review-requirement-btn")?.addEventListener(
    "click",
    handleReview
  );

  $("#continue-interview-btn")?.addEventListener(
    "click",
    handleContinueInterview
  );

  $("#approve-btn")?.addEventListener(
    "click",
    handleApprove
  );

  $("#copy-brd-btn")?.addEventListener(
    "click",
    handleCopyBRD
  );

  $("#restart-btn")?.addEventListener(
    "click",
    restart
  );

  $("#requirement")?.addEventListener(
    "input",
    updateCharacterCount
  );

  $("#current-answer")?.addEventListener(
    "keydown",
    handleAnswerKeydown
  );

  /*
   * Progress navigation is intentionally restricted.
   * Users should not be able to bypass the validation gate.
   */
  $$(".progress-step").forEach((step) => {
    step.addEventListener("click", () => {
      const target = Number(step.dataset.step);

      if (target === 1) {
        goToStep(1);
        return;
      }

      if (
        target === 2 &&
        requirementState.originalRequest
      ) {
        goToStep(2);
        return;
      }

      if (
        target === 3 &&
        requirementState.validation.status ===
          "PENDING_REVIEW"
      ) {
        goToStep(3);
        return;
      }

      if (
        target === 4 &&
        requirementState.validation.status ===
          "VALIDATED"
      ) {
        goToStep(4);
      }
    });
  });

  updateCharacterCount();
  goToStep(1);
}

document.addEventListener(
  "DOMContentLoaded",
  initialize
);
