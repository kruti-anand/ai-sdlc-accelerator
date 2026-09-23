// ============================================================
// AI SDLC ACCELERATOR
// Showcase application logic
// ============================================================

document.addEventListener("DOMContentLoaded", () => {
  // ----------------------------------------------------------
  // Helpers
  // ----------------------------------------------------------

  const $ = (id) => document.getElementById(id);

  const escapeHtml = (value) => {
    if (value === null || value === undefined) {
      return "";
    }

    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  };

  const setText = (id, value) => {
    const element = $(id);

    if (element) {
      element.textContent = value;
    }
  };

  // ----------------------------------------------------------
  // Application state
  // ----------------------------------------------------------

  const interviewState = {
    originalRequirement: "",
    status: "IDLE",

    currentQuestion: null,
    questionNumber: 0,

    questionsAsked: [],
    answers: [],

    clarified: {
      objective: true,
      users: false,
      scope: false,
      requirements: false,
      businessRules: false,
      constraints: false,
      dependencies: false,
      successCriteria: false
    },

    state: {
      objective: "",
      users: "",
      scope: "",
      requirements: [],
      businessRules: "",
      constraints: "",
      dependencies: "",
      successCriteria: "",
      assumptions: []
    },

    brd: null
  };

  // ----------------------------------------------------------
  // Navigation
  // ----------------------------------------------------------

  function goToStep(stepNumber) {
    const panels = document.querySelectorAll(".step-panel");

    panels.forEach((panel) => {
      const panelStep = Number(panel.dataset.step);

      if (panelStep === stepNumber) {
        panel.removeAttribute("hidden");
      } else {
        panel.setAttribute("hidden", "");
      }
    });

    const progressSteps =
      document.querySelectorAll(".progress-step");

    progressSteps.forEach((step) => {
      const value = Number(step.dataset.step);

      step.classList.toggle(
        "active",
        value === stepNumber
      );

      step.classList.toggle(
        "completed",
        value < stepNumber
      );
    });

    const target = document.querySelector(
      `.step-panel[data-step="${stepNumber}"]`
    );

    if (target) {
      target.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    }
  }

  // ----------------------------------------------------------
  // Hero navigation
  // ----------------------------------------------------------

  const exploreButton = $("explore-btn");

  if (exploreButton) {
    exploreButton.addEventListener("click", (event) => {
      event.preventDefault();

      const target = $("requirement-step");

      if (target) {
        target.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });
      }
    });
  }

  // ----------------------------------------------------------
  // Requirement validation
  //
  // This gate only determines whether there is enough content
  // to begin discovery.
  //
  // It does not attempt to determine whether the requirement
  // is complete, correct, or technically valid.
  // ----------------------------------------------------------

  function validateRequirementForDiscovery(requirement) {
    const normalized = requirement
      .trim()
      .replace(/\s+/g, " ");

    if (!normalized) {
      return {
        ready: false,
        message:
          "Describe what you want to accomplish before starting discovery."
      };
    }

    const wordCount =
      normalized.split(" ").filter(Boolean).length;

    if (wordCount < 3) {
      return {
        ready: false,
        message:
          "Add a little more detail about what you want to build or change before starting discovery."
      };
    }

    return {
      ready: true,
      message: ""
    };
  }

  // ----------------------------------------------------------
  // Requirement analysis
  // ----------------------------------------------------------

  function analyzeRequirement() {
    const requirementInput = $("requirement");

    const requirement = requirementInput
      ? requirementInput.value.trim()
      : "";

    clearError();

    if (!requirement) {
      showError(
        "Enter a requirement before starting the analysis."
      );
      return;
    }

    const validation =
      validateRequirementForDiscovery(requirement);

    if (!validation.ready) {
      showError(validation.message);
      return;
    }

    resetInterviewState();

    interviewState.originalRequirement = requirement;
    interviewState.status = "INTERVIEWING";

    interviewState.state.objective =
      inferObjective(requirement);

    setNextQuestion();

    goToStep(2);

    renderAll();
  }

  function inferObjective(requirement) {
    return requirement;
  }

  // ----------------------------------------------------------
  // Discovery questions
  //
  // These represent standard requirement areas a delivery lead
  // would normally clarify before creating a BRD.
  // ----------------------------------------------------------

  function selectNextQuestion() {
    const questions = [
      {
        key: "users",
        question:
          "Who are the primary users or stakeholders for this capability?",
        why:
          "Identifying the people affected by the change helps define the intended audience and downstream impacts."
      },
      {
        key: "scope",
        question:
          "What should be included in the scope of this request, and is there anything explicitly out of scope?",
        why:
          "A clear scope boundary helps prevent requirements from expanding during delivery."
      },
      {
        key: "requirements",
        question:
          "What are the key capabilities or behaviors the solution needs to provide?",
        why:
          "These become the core functional requirements that delivery teams can refine into implementation work."
      },
      {
        key: "businessRules",
        question:
          "Are there business rules, policies, approvals, or decision criteria that the solution must follow?",
        why:
          "Business rules can affect design, workflow, testing, and acceptance criteria."
      },
      {
        key: "constraints",
        question:
          "Are there technical, regulatory, security, timing, budget, or operational constraints we should capture?",
        why:
          "Constraints can materially change solution options and delivery planning."
      },
      {
        key: "dependencies",
        question:
          "What systems, teams, data sources, integrations, or upstream/downstream dependencies could affect delivery?",
        why:
          "Dependencies are important for sequencing work and identifying delivery risks early."
      },
      {
        key: "successCriteria",
        question:
          "How will we know this initiative is successful? What outcomes or measurable results should we expect?",
        why:
          "Success criteria connect delivery activity to the outcome the requirement is intended to achieve."
      }
    ];

    for (const item of questions) {
      if (!interviewState.clarified[item.key]) {
        return item;
      }
    }

    return null;
  }

  function setNextQuestion() {
    const nextQuestion = selectNextQuestion();

    if (!nextQuestion) {
      finishInterview();
      return;
    }

    interviewState.currentQuestion = nextQuestion;

    interviewState.questionNumber += 1;

    interviewState.questionsAsked.push(
      nextQuestion
    );
  }

  // ----------------------------------------------------------
  // Process interview answer
  // ----------------------------------------------------------

  function processAnswer(markAsTbd = false) {
    const answerInput = $("current-answer");

    if (!answerInput) {
      return;
    }

    const answer = answerInput.value.trim();

    if (!markAsTbd && !answer) {
      showError(
        "Enter an answer or select “Mark as TBD.”"
      );
      return;
    }

    clearError();

    const currentQuestion =
      interviewState.currentQuestion;

    if (!currentQuestion) {
      return;
    }

    const finalAnswer = markAsTbd
      ? "TBD — requires human validation."
      : answer;

    interviewState.answers.push({
      key: currentQuestion.key,
      question: currentQuestion.question,
      answer: finalAnswer,
      isTbd: markAsTbd
    });

    updateRequirementState(
      currentQuestion.key,
      finalAnswer,
      markAsTbd,
      answer
    );

    interviewState.currentQuestion = null;

    // Look for another discovery area first.
    // Only when no areas remain do we move to validation.

    const nextQuestion = selectNextQuestion();

    if (nextQuestion) {
      interviewState.currentQuestion =
        nextQuestion;

      interviewState.questionNumber += 1;

      interviewState.questionsAsked.push(
        nextQuestion
      );

      renderAll();
      return;
    }

    finishInterview();
  }

  // ----------------------------------------------------------
  // Update requirement state
  // ----------------------------------------------------------

  function updateRequirementState(
    key,
    answer,
    isTbd,
    originalAnswer
  ) {
    interviewState.clarified[key] = true;

    if (key === "users") {
      interviewState.state.users = answer;
    }

    if (key === "scope") {
      interviewState.state.scope = answer;
    }

    if (key === "requirements") {
      interviewState.state.requirements = [answer];
    }

    if (key === "businessRules") {
      interviewState.state.businessRules = answer;
    }

    if (key === "constraints") {
      interviewState.state.constraints = answer;
    }

    if (key === "dependencies") {
      interviewState.state.dependencies = answer;
    }

    if (key === "successCriteria") {
      interviewState.state.successCriteria = answer;
    }

    // --------------------------------------------------------
    // Preserve only meaningful TBD information.
    //
    // Do not store the entire discovery question as a TBD item.
    // --------------------------------------------------------

    if (isTbd) {
      addTbdItem(key);
      return;
    }

    // If the user's own answer contains TBD, preserve that
    // information without adding the discovery question.

    const tbdItems = String(originalAnswer)
      .split(/\n+/)
      .map((item) => item.trim())
      .filter(
        (item) =>
          item &&
          /\bTBD\b/i.test(item)
      );

    tbdItems.forEach((item) => {
      addTbdItem(key, item);
    });
  }

  // ----------------------------------------------------------
  // TBD handling
  // ----------------------------------------------------------

  function addTbdItem(key, value = "") {
    const labels = {
      businessRules: "Business rules / approval criteria",
      constraints: "Additional constraints",
      dependencies: "Dependencies",
      users: "Users / stakeholders",
      scope: "Scope details",
      requirements: "Additional requirements",
      successCriteria: "Success criteria"
    };

    const label =
      labels[key] || "Additional information";

    const tbdText =
      value &&
      value !== "TBD — requires human validation."
        ? `${label}: ${value}`
        : `${label}: TBD`;

    const alreadyExists =
      interviewState.state.assumptions.includes(
        tbdText
      );

    if (!alreadyExists) {
      interviewState.state.assumptions.push(
        tbdText
      );
    }
  }

  // ----------------------------------------------------------
  // Extract concise TBD information for display
  // ----------------------------------------------------------

  function extractTbdItem(item) {
    const text = String(item || "").trim();

    if (!text) {
      return "";
    }

    const colonIndex = text.indexOf(":");

    if (colonIndex === -1) {
      return text;
    }

    return `${text.substring(0, colonIndex).trim()}: TBD`;
  }

  // ----------------------------------------------------------
  // Finish interview
  // ----------------------------------------------------------

  function finishInterview() {
    if (!isReadyForValidation()) {
      return;
    }

    interviewState.status =
      "READY_FOR_VALIDATION";

    interviewState.currentQuestion = null;

    renderAll();
  }

  function isReadyForValidation() {
    const requiredFields = [
      "objective",
      "users",
      "scope",
      "requirements",
      "businessRules",
      "constraints",
      "dependencies",
      "successCriteria"
    ];

    return requiredFields.every((field) => {
      const value =
        interviewState.state[field];

      if (Array.isArray(value)) {
        return value.length > 0;
      }

      return Boolean(
        value && String(value).trim()
      );
    });
  }

  // ----------------------------------------------------------
  // Rendering
  // ----------------------------------------------------------

  function renderAll() {
    renderUnderstanding();
    renderInterview();
    renderInterviewHistory();
    renderRequirementState();
    renderValidation();
  }

  function renderUnderstanding() {
    const container =
      $("understanding-content");

    if (!container) {
      return;
    }

    if (!interviewState.originalRequirement) {
      container.innerHTML = "";
      return;
    }

    container.innerHTML = `
      <div class="understanding-item">
        <span class="understanding-label">
          Original intent
        </span>

        <p>
          ${escapeHtml(
            interviewState.originalRequirement
          )}
        </p>
      </div>

      <div class="understanding-item">
        <span class="understanding-label">
          Working objective
        </span>

        <p>
          ${escapeHtml(
            interviewState.state.objective
          )}
        </p>
      </div>
    `;
  }

  // ----------------------------------------------------------
  // Interview rendering
  // ----------------------------------------------------------

  function renderInterview() {
    const status = $("interview-status");
    const questionState = $("question-state");
    const question = $("current-question");
    const questionWhy = $("question-why");
    const answerArea = $("answer-area");
    const answerInput = $("current-answer");
    const tbdButton = $("tbd-btn");
    const continueButton = $("continue-btn");

    const completionState =
      $("completion-state");

    const reviewButton =
      $("review-requirement-btn");

    // --------------------------------------------------------
    // Interviewing
    // --------------------------------------------------------

    if (
      interviewState.status ===
      "INTERVIEWING"
    ) {
      if (status) {
        status.textContent =
          "Contextual discovery in progress";
      }

      if (questionState) {
        questionState.removeAttribute(
          "hidden"
        );

        questionState.textContent =
          `Question ${interviewState.questionNumber}`;
      }

      if (question) {
        question.removeAttribute("hidden");

        question.textContent =
          interviewState.currentQuestion
            ? interviewState.currentQuestion.question
            : "";
      }

      if (questionWhy) {
        questionWhy.removeAttribute(
          "hidden"
        );

        questionWhy.textContent =
          interviewState.currentQuestion
            ? interviewState.currentQuestion.why
            : "";
      }

      if (answerArea) {
        answerArea.removeAttribute("hidden");
      }

      if (answerInput) {
        answerInput.value = "";
      }

      if (tbdButton) {
        tbdButton.removeAttribute("hidden");
      }

      if (continueButton) {
        continueButton.removeAttribute(
          "hidden"
        );
      }

      if (completionState) {
        completionState.setAttribute(
          "hidden",
          ""
        );
      }

      if (reviewButton) {
        reviewButton.setAttribute(
          "hidden",
          ""
        );
      }

      return;
    }

    // --------------------------------------------------------
    // Ready for validation
    // --------------------------------------------------------

    if (
      interviewState.status ===
      "READY_FOR_VALIDATION"
    ) {
      if (status) {
        status.textContent =
          "Ready for human validation";
      }

      if (questionState) {
        questionState.setAttribute(
          "hidden",
          ""
        );
      }

      if (question) {
        question.setAttribute(
          "hidden",
          ""
        );
      }

      if (questionWhy) {
        questionWhy.setAttribute(
          "hidden",
          ""
        );
      }

      if (answerArea) {
        answerArea.setAttribute(
          "hidden",
          ""
        );
      }

      if (tbdButton) {
        tbdButton.setAttribute(
          "hidden",
          ""
        );
      }

      if (continueButton) {
        continueButton.setAttribute(
          "hidden",
          ""
        );
      }

      if (completionState) {
        completionState.removeAttribute(
          "hidden"
        );
      }

      if (reviewButton) {
        reviewButton.removeAttribute(
          "hidden"
        );
      }

      return;
    }

    // --------------------------------------------------------
    // Initial state
    // --------------------------------------------------------

    if (status) {
      status.textContent = "";
    }

    if (questionState) {
      questionState.setAttribute(
        "hidden",
        ""
      );
    }

    if (question) {
      question.setAttribute(
        "hidden",
        ""
      );
    }

    if (questionWhy) {
      questionWhy.setAttribute(
        "hidden",
        ""
      );
    }

    if (answerArea) {
      answerArea.setAttribute(
        "hidden",
        ""
      );
    }

    if (tbdButton) {
      tbdButton.setAttribute(
        "hidden",
        ""
      );
    }

    if (continueButton) {
      continueButton.setAttribute(
        "hidden",
        ""
      );
    }

    if (completionState) {
      completionState.setAttribute(
        "hidden",
        ""
      );
    }

    if (reviewButton) {
      reviewButton.setAttribute(
        "hidden",
        ""
      );
    }
  }

  // ----------------------------------------------------------
  // Interview history
  // ----------------------------------------------------------

  function renderInterviewHistory() {
    const container =
      $("interview-history");

    if (!container) {
      return;
    }

    if (interviewState.answers.length === 0) {
      container.innerHTML = "";
      return;
    }

    container.innerHTML =
      interviewState.answers
        .map((item, index) => {
          return `
            <div class="history-item">
              <div class="history-number">
                ${index + 1}
              </div>

              <div class="history-content">
                <div class="history-question">
                  ${escapeHtml(
                    item.question
                  )}
                </div>

                <div class="history-answer">
                  ${escapeHtml(
                    item.answer
                  )}
                </div>
              </div>
            </div>
          `;
        })
        .join("");
  }

  // ----------------------------------------------------------
  // Requirement state
  // ----------------------------------------------------------

  function renderRequirementState() {
    const state =
      interviewState.state;

    setText(
      "state-objective",
      state.objective ||
        "Not yet defined"
    );

    setText(
      "state-users",
      state.users ||
        "Not yet defined"
    );

    setText(
      "state-scope",
      state.scope ||
        "Not yet defined"
    );

    setText(
      "state-requirements",
      state.requirements.length > 0
        ? state.requirements.join(", ")
        : "Not yet defined"
    );

    setText(
      "state-business-rules",
      state.businessRules ||
        "Not yet defined"
    );

    setText(
      "state-constraints",
      state.constraints ||
        "Not yet defined"
    );

    setText(
      "state-dependencies",
      state.dependencies ||
        "Not yet defined"
    );

    setText(
      "state-success",
      state.successCriteria ||
        "Not yet defined"
    );

    updateMetrics();
  }

  // ----------------------------------------------------------
  // Metrics
  // ----------------------------------------------------------

  function updateMetrics() {
    const fields = [
      interviewState.state.objective,
      interviewState.state.users,
      interviewState.state.scope,
      interviewState.state.requirements.length > 0,
      interviewState.state.businessRules,
      interviewState.state.constraints,
      interviewState.state.dependencies,
      interviewState.state.successCriteria
    ];

    const known =
      fields.filter(Boolean).length;

    const total = fields.length;
    const open = total - known;

    setText(
      "metric-known",
      `${known}/${total}`
    );

    setText(
      "metric-requirements",
      `${interviewState.answers.length}`
    );

    setText(
      "metric-open",
      `${open}`
    );
  }

  // ----------------------------------------------------------
  // Human validation
  // ----------------------------------------------------------

  function renderValidation() {
    const state =
      interviewState.state;

    setText(
      "validation-objective",
      state.objective ||
        "Not yet defined"
    );

    setText(
      "validation-requirements",
      state.requirements.length > 0
        ? state.requirements.join(", ")
        : "Not yet defined"
    );

    setText(
      "validation-scope",
      state.scope ||
        "Not yet defined"
    );

    setText(
      "validation-business-rules",
      state.businessRules ||
        "Not yet defined"
    );

    setText(
      "validation-constraints",
      state.constraints ||
        "Not yet defined"
    );

    setText(
      "validation-dependencies",
      state.dependencies ||
        "Not yet defined"
    );

    const assumptionsElement =
      $("validation-assumptions");

    if (assumptionsElement) {
      if (state.assumptions.length > 0) {
        assumptionsElement.innerHTML = `
          <ul class="tbd-list">
            ${state.assumptions
              .map(
                (item) =>
                  `<li>${escapeHtml(
                    extractTbdItem(item)
                  )}</li>`
              )
              .join("")}
          </ul>
        `;
      } else {
        assumptionsElement.textContent =
          "No additional assumptions or TBD items recorded.";
      }
    }

    setText(
      "validation-success",
      state.successCriteria ||
        "Not yet defined"
    );

    if (
      interviewState.status ===
      "READY_FOR_VALIDATION"
    ) {
      setText(
        "validation-status",
        "Review the clarified requirement before approving the BRD."
      );
    }
  }

  // ----------------------------------------------------------
  // BRD generation
  // ----------------------------------------------------------

  function generateBRD() {
    const state =
      interviewState.state;

    interviewState.brd = {
      title:
        "Business Requirements Document",

      objective:
        state.objective,

      users:
        state.users,

      requirements:
        state.requirements,

      scope:
        state.scope,

      businessRules:
        state.businessRules,

      constraints:
        state.constraints,

      dependencies:
        state.dependencies,

      assumptions:
        state.assumptions,

      successCriteria:
        state.successCriteria
    };

    const container =
      $("brd-content");

    if (!container) {
      return;
    }

    container.innerHTML = `
      <div class="brd-section">
        <h3>1. Objective</h3>
        <p>
          ${escapeHtml(state.objective)}
        </p>
      </div>

      <div class="brd-section">
        <h3>2. Primary Users / Stakeholders</h3>
        <p>
          ${escapeHtml(state.users)}
        </p>
      </div>

      <div class="brd-section">
        <h3>3. Requirements</h3>
        <ul>
          ${state.requirements
            .map(
              (item) =>
                `<li>${escapeHtml(item)}</li>`
            )
            .join("")}
        </ul>
      </div>

      <div class="brd-section">
        <h3>4. Scope</h3>
        <p>
          ${escapeHtml(state.scope)}
        </p>
      </div>

      <div class="brd-section">
        <h3>5. Business Rules</h3>
        <p>
          ${escapeHtml(state.businessRules)}
        </p>
      </div>

      <div class="brd-section">
        <h3>6. Constraints</h3>
        <p>
          ${escapeHtml(state.constraints)}
        </p>
      </div>

      <div class="brd-section">
        <h3>7. Dependencies</h3>
        <p>
          ${escapeHtml(state.dependencies)}
        </p>
      </div>

      <div class="brd-section">
        <h3>8. Assumptions / TBD Items</h3>
        ${
          state.assumptions.length > 0
            ? `
              <ul class="tbd-list">
                ${state.assumptions
                  .map(
                    (item) =>
                      `<li>${escapeHtml(
                        extractTbdItem(item)
                      )}</li>`
                  )
                  .join("")}
              </ul>
            `
            : "<p>None recorded.</p>"
        }
      </div>

      <div class="brd-section">
        <h3>9. Success Criteria</h3>
        <p>
          ${escapeHtml(
            state.successCriteria
          )}
        </p>
      </div>
    `;
  }

  // ----------------------------------------------------------
  // Human validation actions
  // ----------------------------------------------------------

  function reviewRequirement() {
    if (
      interviewState.status !==
      "READY_FOR_VALIDATION"
    ) {
      return;
    }

    goToStep(3);
    renderValidation();
  }

  function approveRequirement() {
    if (
      interviewState.status !==
      "READY_FOR_VALIDATION"
    ) {
      return;
    }

    generateBRD();
    goToStep(4);
  }

  function continueInterview() {
    goToStep(2);
    renderInterview();
  }

  // ----------------------------------------------------------
  // Return to requirement
  // ----------------------------------------------------------

  function backToRequirement() {
    goToStep(1);
  }

  // ----------------------------------------------------------
  // Sample requirement
  // ----------------------------------------------------------

  function loadSampleRequirement() {
    const requirementInput =
      $("requirement");

    if (!requirementInput) {
      return;
    }

    requirementInput.value =
      "Create a centralized intake process that allows business teams to submit technology requests and gives delivery teams a consistent way to assess, prioritize, and prepare those requests for execution.";

    updateCharacterCount();
    clearError();
  }

  // ----------------------------------------------------------
  // Restart
  // ----------------------------------------------------------

  function restart() {
    resetInterviewState();

    const requirementInput =
      $("requirement");

    if (requirementInput) {
      requirementInput.value = "";
    }

    updateCharacterCount();
    clearError();

    goToStep(1);
  }

  function resetInterviewState() {
    interviewState.originalRequirement = "";
    interviewState.status = "IDLE";

    interviewState.currentQuestion = null;
    interviewState.questionNumber = 0;

    interviewState.questionsAsked = [];
    interviewState.answers = [];

    interviewState.clarified = {
      objective: true,
      users: false,
      scope: false,
      requirements: false,
      businessRules: false,
      constraints: false,
      dependencies: false,
      successCriteria: false
    };

    interviewState.state = {
      objective: "",
      users: "",
      scope: "",
      requirements: [],
      businessRules: "",
      constraints: "",
      dependencies: "",
      successCriteria: "",
      assumptions: []
    };

    interviewState.brd = null;

    renderAll();
  }

  // ----------------------------------------------------------
  // Copy BRD
  // ----------------------------------------------------------

  async function copyBRD() {
    if (!interviewState.brd) {
      return;
    }

    const state =
      interviewState.brd;

    const text = `
BUSINESS REQUIREMENTS DOCUMENT

OBJECTIVE
${state.objective}

PRIMARY USERS / STAKEHOLDERS
${state.users}

REQUIREMENTS
${state.requirements.join("\n")}

SCOPE
${state.scope}

BUSINESS RULES
${state.businessRules}

CONSTRAINTS
${state.constraints}

DEPENDENCIES
${state.dependencies}

ASSUMPTIONS / TBD ITEMS
${
  state.assumptions.length > 0
    ? state.assumptions
        .map(
          (item) =>
            `• ${extractTbdItem(item)}`
        )
        .join("\n")
    : "None recorded."
}

SUCCESS CRITERIA
${state.successCriteria}
`.trim();

    try {
      await navigator.clipboard.writeText(text);

      const button =
        $("copy-brd-btn");

      if (button) {
        const originalText =
          button.textContent;

        button.textContent =
          "Copied";

        setTimeout(() => {
          button.textContent =
            originalText;
        }, 1500);
      }
    } catch (error) {
      console.error(
        "Unable to copy BRD:",
        error
      );
    }
  }

  // ----------------------------------------------------------
  // Character count
  // ----------------------------------------------------------

  function updateCharacterCount() {
    const input =
      $("requirement");

    const counter =
      $("character-count");

    if (!input || !counter) {
      return;
    }

    counter.textContent =
      `${input.value.length} characters`;
  }

  // ----------------------------------------------------------
  // Error handling
  // ----------------------------------------------------------

  function showError(message) {
    const errorElement =
      $("error-message");

    if (!errorElement) {
      return;
    }

    errorElement.textContent =
      message;

    errorElement.removeAttribute(
      "hidden"
    );
  }

  function clearError() {
    const errorElement =
      $("error-message");

    if (!errorElement) {
      return;
    }

    errorElement.textContent = "";

    errorElement.setAttribute(
      "hidden",
      ""
    );
  }

  // ----------------------------------------------------------
  // Event listeners
  // ----------------------------------------------------------

  const analyzeButton =
    $("analyze-btn");

  if (analyzeButton) {
    analyzeButton.addEventListener(
      "click",
      analyzeRequirement
    );
  }

  const sampleButton =
    $("sample-btn");

  if (sampleButton) {
    sampleButton.addEventListener(
      "click",
      loadSampleRequirement
    );
  }

  const continueButton =
    $("continue-btn");

  if (continueButton) {
    continueButton.addEventListener(
      "click",
      () => processAnswer(false)
    );
  }

  const tbdButton =
    $("tbd-btn");

  if (tbdButton) {
    tbdButton.addEventListener(
      "click",
      () => processAnswer(true)
    );
  }

  const reviewButton =
    $("review-requirement-btn");

  if (reviewButton) {
    reviewButton.addEventListener(
      "click",
      reviewRequirement
    );
  }

  const continueInterviewButton =
    $("continue-interview-btn");

  if (continueInterviewButton) {
    continueInterviewButton.addEventListener(
      "click",
      continueInterview
    );
  }

  const approveButton =
    $("approve-btn");

  if (approveButton) {
    approveButton.addEventListener(
      "click",
      approveRequirement
    );
  }

  const copyButton =
    $("copy-brd-btn");

  if (copyButton) {
    copyButton.addEventListener(
      "click",
      copyBRD
    );
  }

  const restartButton =
    $("restart-btn");

  if (restartButton) {
    restartButton.addEventListener(
      "click",
      restart
    );
  }

  const backButton =
    $("back-to-requirement");

  if (backButton) {
    backButton.addEventListener(
      "click",
      backToRequirement
    );
  }

  const requirementInput =
    $("requirement");

  if (requirementInput) {
    requirementInput.addEventListener(
      "input",
      updateCharacterCount
    );
  }

  // ----------------------------------------------------------
  // Initial render
  // ----------------------------------------------------------

  updateCharacterCount();
  renderAll();
});
