"use strict";

/* =========================================================
   AI Requirements Engineering Copilot
   Deterministic portfolio prototype
   ========================================================= */

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
  return String(value || "")
    .trim()
    .toLowerCase();
}

/* =========================================================
   Scroll / Navigation
   ========================================================= */

function scrollToElement(selector) {
  const element = $(selector);

  if (!element) return;

  window.setTimeout(() => {
    element.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  }, 50);
}

function goToStep(step, scrollTarget = null) {
  appState.currentStep = step;

  $$(".step-panel").forEach((panel) => {
    const panelStep = Number(panel.dataset.step);

    panel.hidden = panelStep !== step;
  });

  $$(".progress-step").forEach((item) => {
    const itemStep = Number(item.dataset.step);

    item.classList.toggle(
      "active",
      itemStep === step
    );

    item.classList.toggle(
      "complete",
      itemStep < step
    );

    item.setAttribute(
      "aria-current",
      itemStep === step ? "step" : "false"
    );
  });

  if (scrollTarget) {
    scrollToElement(scrollTarget);
  }
}

/* =========================================================
   Accessibility / Status
   ========================================================= */

function setLoading(isLoading, message = "Working...") {
  appState.loading = isLoading;

  const analyzeButton = $("#analyze-btn");
  const continueButton = $("#continue-btn");
  const tbdButton = $("#tbd-btn");

  if (analyzeButton) {
    analyzeButton.disabled = isLoading;
    analyzeButton.setAttribute(
      "aria-busy",
      String(isLoading)
    );
  }

  if (continueButton) {
    continueButton.disabled = isLoading;
    continueButton.setAttribute(
      "aria-busy",
      String(isLoading)
    );
  }

  if (tbdButton) {
    tbdButton.disabled = isLoading;
  }

  const loadingRegion = $("#loading-state");

  if (loadingRegion) {
    loadingRegion.hidden = !isLoading;
    loadingRegion.textContent = isLoading
      ? message
      : "";
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
    }, 100);
  }
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

function addKnownFact(
  statement,
  source = "user_provided"
) {
  if (!statement) return;

  const exists = requirementState.knownFacts.some(
    (item) =>
      normalize(item.statement) ===
      normalize(statement)
  );

  if (!exists) {
    requirementState.knownFacts.push({
      statement,
      source
    });
  }
}

function addRequirement(
  statement,
  source = "user_confirmed"
) {
  if (!statement) return;

  const exists = requirementState.requirements.some(
    (item) =>
      normalize(item.statement) ===
      normalize(statement)
  );

  if (!exists) {
    const id = `BR-${String(
      requirementState.requirements.length + 1
    ).padStart(3, "0")}`;

    requirementState.requirements.push({
      id,
      statement,
      source,
      confidence:
        source === "user_confirmed"
          ? "confirmed"
          : "inferred"
    });
  }
}

function addToList(collection, statement) {
  if (!statement) return;

  const exists = collection.some(
    (item) =>
      normalize(item) === normalize(statement)
  );

  if (!exists) {
    collection.push(statement);
  }
}

/* =========================================================
   Initial Request Analysis
   ========================================================= */

function analyzeInitialRequest(request) {
  const classification =
    classifyRequest(request);

  requirementState.originalRequest = request;
  requirementState.requestType = classification;

  requirementState.objective =
    deriveInitialObjective(request);

  addKnownFact(
    `The user described the request as: "${request}"`,
    "original_request"
  );

  extractInitialFacts(request);

  requirementState.interview.status =
    "INTERVIEWING";

  requirementState.validation.status =
    "NOT_READY";

  requirementState.validation.reviewedByHuman =
    false;
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

  return (
    cleaned.charAt(0).toUpperCase() +
    cleaned.slice(1).replace(/[.!?]+$/, "")
  );
}

function extractInitialFacts(request) {
  const text = request;

  if (/external users?/i.test(text)) {
    addKnownFact(
      "The request involves external users.",
      "original_request"
    );
  }

  if (
    /mfa|multi[- ]factor|two[- ]factor/i.test(
      text
    )
  ) {
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
   ========================================================= */

function selectNextQuestion() {
  const candidates = [];

  const state = requirementState;
  const request = normalize(
    state.originalRequest
  );

  if (
    (!state.objective ||
      state.objective ===
        "Clarify the desired business outcome.") &&
    !hasAnsweredKey("objective")
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

  if (
    state.usersAndStakeholders.length === 0 &&
    !state.knownFacts.some((item) =>
      /external users|internal users|customers|employees|users/i.test(
        item.statement
      )
    ) &&
    !hasAnsweredKey("users")
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

  if (
    state.scope.inScope.length === 0 &&
    state.scope.outOfScope.length === 0 &&
    !hasAnsweredKey("scope")
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

  if (
    /mfa|multi[- ]factor|two[- ]factor/.test(
      request
    ) &&
    !hasAnsweredKey("mfa_scope")
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

  if (
    state.businessRules.length === 0 &&
    state.requirements.length > 0 &&
    !hasAnsweredKey("business_rules")
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

  if (
    state.constraints.length === 0 &&
    state.requirements.length > 0 &&
    !hasAnsweredKey("constraints")
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

  if (
    state.successCriteria.length === 0 &&
    state.requirements.length > 0 &&
    !hasAnsweredKey("success")
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

  if (
    state.dependencies.length === 0 &&
    state.requirements.length > 0 &&
    !hasAnsweredKey("dependencies")
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

  if (isReadyForValidation()) {
    return null;
  }

  candidates.sort(
    (a, b) => b.priority - a.priority
  );

  return candidates[0] || null;
}

function hasAnsweredKey(key) {
  return requirementState.interview.questionsAsked.some(
    (item) => item.key === key
  );
}

/* =========================================================
   Readiness
   ========================================================= */

function isReadyForValidation() {
  const state = requirementState;

  const hasObjective =
    Boolean(state.objective) &&
    state.objective !==
      "Clarify the desired business outcome.";

  const hasRequirements =
    state.requirements.length > 0;

  const hasScope =
    state.scope.inScope.length > 0 ||
    state.scope.outOfScope.length > 0 ||
    state.openDecisions.length > 0;

  const hasMeaningfulInterview =
    state.interview.questionsAsked.length >= 3;

  return (
    hasObjective &&
    hasRequirements &&
    hasScope &&
    hasMeaningfulInterview
  );
}

/* =========================================================
   Process Answers
   ========================================================= */

function processAnswer(
  answer,
  isTBD = false
) {
  const current =
    requirementState.interview.currentQuestion;

  if (!current) return;

  const cleanAnswer = answer.trim();

  const interviewRecord = {
    id: current.id,
    key: current.key,
    question: current.question,
    why: current.why,
    answer: isTBD
      ? "TBD / Not decided"
      : cleanAnswer
  };

  requirementState.interview.questionsAsked.push(
    interviewRecord
  );

  if (isTBD) {
    addToList(
      requirementState.openDecisions,
      current.question
    );
  } else {
    applyAnswerToState(
      current,
      cleanAnswer
    );
  }

  requirementState.interview.currentQuestion =
    null;

  const nextQuestion =
    selectNextQuestion();

  if (!nextQuestion) {
    requirementState.interview.status =
      "READY_FOR_VALIDATION";

    requirementState.validation.status =
      "PENDING_REVIEW";

    requirementState.validation.reviewedByHuman =
      false;
  } else {
    requirementState.interview.status =
      "INTERVIEWING";

    requirementState.validation.status =
      "NOT_READY";

    requirementState.validation.reviewedByHuman =
      false;

    setCurrentQuestion(nextQuestion);
  }
}

function applyAnswerToState(
  question,
  answer
) {
  const key = question.key;
  const clean = answer.trim();

  switch (key) {
    case "objective":
      requirementState.objective =
        clean.replace(/[.!?]+$/, "");

      addKnownFact(
        clean,
        "interview_answer"
      );
      break;

    case "users":
      addToList(
        requirementState.usersAndStakeholders,
        clean
      );

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
      addKnownFact(
        clean,
        "interview_answer"
      );
      break;
  }
}

function setCurrentQuestion(question) {
  appState.questionCounter += 1;

  requirementState.interview.currentQuestion = {
    id: `Q-${String(
      appState.questionCounter
    ).padStart(3, "0")}`,
    key: question.key,
    question: question.question,
    why: question.why
  };
}

/* =========================================================
   UI Rendering
   ========================================================= */

function renderUnderstanding() {
  const typeBadge = $("#request-type");

  if (typeBadge) {
    typeBadge.textContent =
      getRequestTypeLabel(
        requirementState.requestType.category
      );
  }

  const understanding =
    $("#understanding-text");

  if (understanding) {
    understanding.textContent =
      requirementState.objective ||
      "The request has been received and is being clarified.";
  }

  renderStateMetrics();
}

function renderStateMetrics() {
  const metrics = {
    "#metric-known":
      requirementState.knownFacts.length,

    "#metric-requirements":
      requirementState.requirements.length,

    "#metric-scope":
      requirementState.scope.inScope.length +
      requirementState.scope.outOfScope.length,

    "#metric-open":
      requirementState.openDecisions.length +
      requirementState.assumptions.length
  };

  Object.entries(metrics).forEach(
    ([selector, value]) => {
      const element = $(selector);

      if (element) {
        element.textContent = value;
      }
    }
  );
}

function renderInterview() {
  const history =
    $("#interview-history");

  if (history) {
    history.innerHTML =
      requirementState.interview.questionsAsked
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

  const question =
    requirementState.interview.currentQuestion;

  const questionElement =
    $("#current-question");

  const whyElement =
    $("#question-why");

  const answerInput =
    $("#current-answer");

  const readyMessage =
    $("#ready-message");

  const continueButton =
    $("#continue-btn");

  const tbdButton =
    $("#tbd-btn");

  const reviewButton =
    $("#review-requirement-btn");

  if (question) {
    if (questionElement) {
      questionElement.textContent =
        question.question;
    }

    if (whyElement) {
      whyElement.textContent =
        question.why;
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
      tbdButton.disabled = false;
    }

    if (readyMessage) {
      readyMessage.hidden = true;
    }

    if (reviewButton) {
      reviewButton.hidden = true;
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

    /*
     * Interview is complete.
     * Disable the answer controls because there is
     * nothing left to answer.
     */
    if (continueButton) {
      continueButton.hidden = true;
      continueButton.disabled = true;
    }

    if (tbdButton) {
      tbdButton.hidden = true;
      tbdButton.disabled = true;
    }

    if (answerInput) {
      answerInput.disabled = true;
      answerInput.value = "";
    }

    /*
     * Show an explicit next action.
     */
    if (readyMessage) {
      readyMessage.hidden = false;

      readyMessage.innerHTML = `
        <strong>Requirement is ready for validation.</strong>

        <p>
          The copilot has enough information for you to
          review the requirement before a BRD is generated.
        </p>

        <p class="ready-next-step">
          <strong>Next step:</strong>
          Review and confirm the requirement.
        </p>
      `;
    }

    if (reviewButton) {
      reviewButton.hidden = false;
      reviewButton.disabled = false;
      reviewButton.textContent =
        "Review Requirement →";
    }
  }

  renderStateMetrics();
}

/* =========================================================
   Synthesized Requirement
   ========================================================= */

function buildSynthesizedRequirement() {
  const state = requirementState;

  const objective =
    state.objective ||
    state.originalRequest ||
    "The requested business outcome has not yet been defined.";

  const users =
    state.usersAndStakeholders.length
      ? ` Intended users or stakeholders: ${state.usersAndStakeholders.join(
          ", "
        )}.`
      : "";

  const scope =
    state.scope.inScope.length
      ? ` Scope includes: ${state.scope.inScope.join(
          "; "
        )}.`
      : "";

  const exclusions =
    state.scope.outOfScope.length
      ? ` Scope excludes: ${state.scope.outOfScope.join(
          "; "
        )}.`
      : "";

  const openDecisions =
    state.openDecisions.length
      ? ` Open decisions: ${state.openDecisions.join(
          "; "
        )}.`
      : "";

  return `${objective.replace(/[.!?]+$/, "")}.${users}${scope}${exclusions}${openDecisions}`.trim();
}

/* =========================================================
   Validation Rendering
   ========================================================= */

function renderValidation() {
  const state = requirementState;

  const synthesizedRequirement =
    buildSynthesizedRequirement();

  setText(
    "#validation-objective",
    state.objective ||
      "Not yet defined"
  );

  setHtml(
    "#validation-requirements",
    `
      <div class="synthesized-requirement">
        <div class="synthesized-label">
          REQUIREMENT SUMMARY
        </div>

        <p class="synthesized-text">
          ${escapeHtml(
            synthesizedRequirement
          )}
        </p>
      </div>

      ${
        state.requirements.length
          ? `
            <div class="supporting-requirements">
              <div class="supporting-label">
                CONFIRMED BUSINESS REQUIREMENTS
              </div>

              ${renderRequirementList(
                state.requirements
              )}
            </div>
          `
          : ""
      }
    `
  );

  setHtml(
    "#validation-scope",
    renderList([
      ...state.scope.inScope.map(
        (item) =>
          `In scope: ${item}`
      ),

      ...state.scope.outOfScope.map(
        (item) =>
          `Out of scope: ${item}`
      )
    ])
  );

  setHtml(
    "#validation-dependencies",
    renderList([
      ...state.dependencies.map(
        (item) =>
          `Dependency: ${item}`
      ),

      ...state.risks.map(
        (item) =>
          `Risk: ${item}`
      )
    ])
  );

  setHtml(
    "#validation-assumptions",
    renderList([
      ...state.assumptions.map(
        (item) =>
          `Assumption: ${item}`
      ),

      ...state.openDecisions.map(
        (item) =>
          `TBD: ${item}`
      )
    ])
  );

  setHtml(
    "#validation-success",
    renderList(
      state.successCriteria
    )
  );

  const status =
    $("#validation-status");

  if (status) {
    status.textContent =
      state.validation.status ===
      "PENDING_REVIEW"
        ? "Pending human review"
        : state.validation.status ===
          "CHANGES_REQUESTED"
        ? "Changes requested"
        : state.validation.status ===
          "VALIDATED"
        ? "Human validated"
        : state.validation.status;
  }

  renderValidationEditControls();
}

function renderRequirementList(requirements) {
  if (!requirements.length) {
    return `
      <p class="empty-state">
        Not specified.
      </p>
    `;
  }

  return `
    <ul>
      ${requirements
        .map(
          (item) => `
            <li>
              <strong>
                ${escapeHtml(item.id)}
              </strong>
              — ${escapeHtml(item.statement)}
            </li>
          `
        )
        .join("")}
    </ul>
  `;
}

/* =========================================================
   Human Validation Editing
   ========================================================= */

function renderValidationEditControls() {
  const container =
    $("#validation-edit-controls");

  if (!container) return;

  container.innerHTML = `
    <div class="edit-control">
      <label for="edit-objective">
        Objective
      </label>

      <textarea
        id="edit-objective"
        rows="3"
      >${escapeHtml(
        requirementState.objective
      )}</textarea>

      <button
        type="button"
        class="secondary-btn"
        id="save-objective"
      >
        Save objective
      </button>
    </div>

    <div class="edit-control">
      <label for="edit-requirements">
        Requirements
      </label>

      <textarea
        id="edit-requirements"
        rows="5"
      >${escapeHtml(
        requirementState.requirements
          .map(
            (item) =>
              item.statement
          )
          .join("\n")
      )}</textarea>

      <button
        type="button"
        class="secondary-btn"
        id="save-requirements"
      >
        Save requirements
      </button>
    </div>

    <div class="edit-control">
      <label for="edit-scope">
        Scope
      </label>

      <textarea
        id="edit-scope"
        rows="4"
      >${escapeHtml(
        requirementState.scope.inScope.join(
          "\n"
        )
      )}</textarea>

      <button
        type="button"
        class="secondary-btn"
        id="save-scope"
      >
        Save scope
      </button>
    </div>

    <div class="edit-control">
      <label for="edit-open-decisions">
        TBDs
      </label>

      <textarea
        id="edit-open-decisions"
        rows="4"
      >${escapeHtml(
        requirementState.openDecisions.join(
          "\n"
        )
      )}</textarea>

      <button
        type="button"
        class="secondary-btn"
        id="save-open-decisions"
      >
        Save TBDs
      </button>
    </div>
  `;

  $("#save-objective")?.addEventListener(
    "click",
    () => {
      requirementState.objective =
        $("#edit-objective").value
          .trim()
          .replace(/[.!?]+$/, "");

      markRequirementChanged();
    }
  );

  $("#save-requirements")?.addEventListener(
    "click",
    () => {
      const values =
        $("#edit-requirements").value
          .split("\n")
          .map(
            (item) =>
              item.trim()
          )
          .filter(Boolean);

      requirementState.requirements =
        values.map(
          (statement, index) => ({
            id: `BR-${String(
              index + 1
            ).padStart(3, "0")}`,

            statement,

            source: "human_edited",

            confidence: "confirmed"
          })
        );

      markRequirementChanged();
    }
  );

  $("#save-scope")?.addEventListener(
    "click",
    () => {
      requirementState.scope.inScope =
        $("#edit-scope").value
          .split("\n")
          .map(
            (item) =>
              item.trim()
          )
          .filter(Boolean);

      markRequirementChanged();
    }
  );

  $("#save-open-decisions")?.addEventListener(
    "click",
    () => {
      requirementState.openDecisions =
        $("#edit-open-decisions").value
          .split("\n")
          .map(
            (item) =>
              item.trim()
          )
          .filter(Boolean);

      markRequirementChanged();
    }
  );
}

function markRequirementChanged() {
  requirementState.validation.status =
    "CHANGES_REQUESTED";

  requirementState.validation.reviewedByHuman =
    false;

  renderValidation();

  const notice =
    $("#validation-edit-notice");

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
    state.validation.status !==
      "VALIDATED" ||
    !state.validation.reviewedByHuman
  ) {
    showError(
      "The BRD can only be generated after explicit human approval."
    );

    return;
  }

  const requirementsHtml =
    state.requirements
      .map(
        (item) => `
          <li>
            <strong>
              ${escapeHtml(item.id)}
            </strong>

            — ${escapeHtml(
              item.statement
            )}

            <small>
              Source:
              ${escapeHtml(
                item.source
              )}
            </small>
          </li>
        `
      )
      .join("");

  const scopeHtml =
    renderList([
      ...state.scope.inScope.map(
        (item) =>
          `In scope: ${item}`
      ),

      ...state.scope.outOfScope.map(
        (item) =>
          `Out of scope: ${item}`
      )
    ]);

  const brd = `
    <article class="brd-document">

      <header>
        <div class="brd-label">
          BUSINESS REQUIREMENTS DOCUMENT
        </div>

        <h2>
          ${escapeHtml(
            state.objective
          )}
        </h2>

        <p class="brd-status">
          Status: Human Validated
        </p>
      </header>

      <section>
        <h3>
          1. Executive Summary
        </h3>

        <p>
          This document captures the business
          requirements for the validated request
          and is based exclusively on the
          human-approved Requirement State.
        </p>
      </section>

      <section>
        <h3>
          2. Business Problem / Opportunity
        </h3>

        <p>
          ${escapeHtml(
            state.originalRequest
          )}
        </p>
      </section>

      <section>
        <h3>
          3. Users &amp; Stakeholders
        </h3>

        ${renderList(
          state.usersAndStakeholders
        )}
      </section>

      <section>
        <h3>
          4. Scope
        </h3>

        ${scopeHtml}
      </section>

      <section>
        <h3>
          5. Business Requirements
        </h3>

        <ol>
          ${requirementsHtml}
        </ol>
      </section>

      <section>
        <h3>
          6. Business Rules
        </h3>

        ${renderList(
          state.businessRules
        )}
      </section>

      <section>
        <h3>
          7. Business Constraints
        </h3>

        ${renderList(
          state.constraints
        )}
      </section>

      <section>
        <h3>
          8. Dependencies
        </h3>

        ${renderList(
          state.dependencies
        )}
      </section>

      <section>
        <h3>
          9. Success Criteria
        </h3>

        ${renderList(
          state.successCriteria
        )}
      </section>

      <section>
        <h3>
          10. Assumptions &amp; TBDs
        </h3>

        ${renderList([
          ...state.assumptions.map(
            (item) =>
              `Assumption: ${item}`
          ),

          ...state.openDecisions.map(
            (item) =>
              `TBD: ${item}`
          )
        ])}
      </section>

      <section>
        <h3>
          11. Risks
        </h3>

        ${renderList(
          state.risks
        )}
      </section>

      <section>
        <h3>
          12. Acceptance Criteria
        </h3>

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

  setHtml(
    "#brd-content",
    brd
  );

  const traceability =
    $("#traceability-banner");

  if (traceability) {
    traceability.hidden = false;

    traceability.textContent =
      "Traceability: BRD requirements are generated from the human-validated Requirement State.";
  }

  goToStep(
    4,
    "#step-4"
  );
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
  const filtered =
    items.filter(Boolean);

  if (!filtered.length) {
    return `
      <p class="empty-state">
        Not specified.
      </p>
    `;
  }

  return `
    <ul>
      ${filtered
        .map(
          (item) =>
            `<li>${escapeHtml(
              String(item)
            )}</li>`
        )
        .join("")}
    </ul>
  `;
}

/* =========================================================
   Main Actions
   ========================================================= */

function handleAnalyze() {
  clearError();

  const input =
    $("#requirement");

  if (!input) return;

  const request =
    input.value.trim();

  if (!request) {
    showError(
      "Please enter a business request before continuing."
    );

    input.focus();

    return;
  }

  setLoading(
    true,
    "Analyzing the request..."
  );

  window.setTimeout(() => {
    try {
      analyzeInitialRequest(
        request
      );

      const firstQuestion =
        selectNextQuestion();

      if (firstQuestion) {
        setCurrentQuestion(
          firstQuestion
        );
      }

      renderUnderstanding();
      renderInterview();

      goToStep(
        2,
        "#step-2"
      );
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

  const answerInput =
    $("#current-answer");

  if (!answerInput) return;

  const answer =
    answerInput.value.trim();

  if (!answer) {
    showError(
      'Please provide an answer or choose "Mark as TBD."'
    );

    answerInput.focus();

    return;
  }

  setLoading(
    true,
    "Updating the requirement state..."
  );

  window.setTimeout(() => {
    try {
      processAnswer(
        answer,
        false
      );

      renderUnderstanding();
      renderInterview();

      if (
        requirementState.interview.status ===
        "READY_FOR_VALIDATION"
      ) {
        scrollToElement(
          "#ready-message"
        );
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

  setLoading(
    true,
    "Recording this as an open decision..."
  );

  window.setTimeout(() => {
    try {
      processAnswer(
        "",
        true
      );

      renderUnderstanding();
      renderInterview();

      if (
        requirementState.interview.status ===
        "READY_FOR_VALIDATION"
      ) {
        scrollToElement(
          "#ready-message"
        );
      }
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

  requirementState.validation.status =
    "PENDING_REVIEW";

  requirementState.validation.reviewedByHuman =
    false;

  renderValidation();

  /*
   * Scroll to the BEGINNING of Step 3.
   * Do not use #validation-heading because it
   * may sit farther down inside the panel.
   */
  goToStep(
    3,
    "#step-3"
  );
}

function handleContinueInterview() {
  clearError();

  requirementState.validation.status =
    "CHANGES_REQUESTED";

  requirementState.validation.reviewedByHuman =
    false;

  requirementState.interview.status =
    "INTERVIEWING";

  const nextQuestion =
    selectNextQuestion();

  if (nextQuestion) {
    setCurrentQuestion(
      nextQuestion
    );
  } else {
    requirementState.interview.status =
      "READY_FOR_VALIDATION";

    requirementState.validation.status =
      "PENDING_REVIEW";
  }

  renderInterview();

  goToStep(
    2,
    "#step-2"
  );
}

function handleApprove() {
  clearError();

  const state = requirementState;

  if (
    !state.objective ||
    !state.requirements.length
  ) {
    showError(
      "An objective and at least one business requirement are needed before approval."
    );

    return;
  }

  state.validation.status =
    "VALIDATED";

  state.validation.reviewedByHuman =
    true;

  generateBRD();
}

function handleCopyBRD() {
  const brd =
    $("#brd-content");

  if (!brd) return;

  if (
    !navigator.clipboard ||
    !navigator.clipboard.writeText
  ) {
    showError(
      "Automatic copy is not available in this browser. You can select and copy the BRD text manually."
    );

    return;
  }

  navigator.clipboard
    .writeText(
      brd.innerText
    )
    .then(() => {
      const button =
        $("#copy-brd-btn");

      if (button) {
        const original =
          button.textContent;

        button.textContent =
          "Copied";

        window.setTimeout(
          () => {
            button.textContent =
              original;
          },
          1500
        );
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
  const input =
    $("#requirement");

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
  const input =
    $("#requirement");

  const counter =
    $("#character-count");

  if (!input || !counter) {
    return;
  }

  counter.textContent =
    `${input.value.length} characters`;
}

/* =========================================================
   Keyboard Behavior
   ========================================================= */

function handleAnswerKeydown(event) {
  if (
    event.key === "Enter" &&
    (event.ctrlKey ||
      event.metaKey)
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

  $$(".progress-step").forEach(
    (step) => {
      step.addEventListener(
        "click",
        () => {
          const target =
            Number(
              step.dataset.step
            );

          if (target === 1) {
            goToStep(
              1,
              "#step-1"
            );
            return;
          }

          if (
            target === 2 &&
            requirementState.originalRequest
          ) {
            goToStep(
              2,
              "#step-2"
            );
            return;
          }

          if (
            target === 3 &&
            requirementState.validation.status ===
              "PENDING_REVIEW"
          ) {
            goToStep(
              3,
              "#step-3"
            );
            return;
          }

          if (
            target === 4 &&
            requirementState.validation.status ===
              "VALIDATED"
          ) {
            goToStep(
              4,
              "#step-4"
            );
          }
        }
      );
    }
  );

  updateCharacterCount();

  goToStep(
    1,
    "#step-1"
  );
}

document.addEventListener(
  "DOMContentLoaded",
  initialize
);
