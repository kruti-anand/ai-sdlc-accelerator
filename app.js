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
    if (value === null || value === undefined) return "";

    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
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

    const progressSteps = document.querySelectorAll(".progress-step");

    progressSteps.forEach((step) => {
      const stepNumberValue = Number(step.dataset.step);

      step.classList.toggle(
        "active",
        stepNumberValue === stepNumber
      );

      step.classList.toggle(
        "completed",
        stepNumberValue < stepNumber
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
  // IMPORTANT:
  // "Explore the accelerator" button
  // ----------------------------------------------------------

  const exploreButton = $("explore-btn");
  const workflowSection = $("requirements-workflow");

  if (exploreButton && workflowSection) {
    exploreButton.addEventListener("click", (event) => {
      event.preventDefault();

      workflowSection.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    });
  }

  // ----------------------------------------------------------
  // Requirement validation gate
  // ----------------------------------------------------------

  function validateRequirementForDiscovery(requirement) {
    const normalized = requirement
      .toLowerCase()
      .replace(/[^\w\s-]/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    if (!normalized) {
      return {
        ready: false,
        message: "Describe what you want to accomplish before starting discovery."
      };
    }

    // --------------------------------------------------------
    // Look for a recognizable action/change.
    // This is intentionally lightweight rather than AI-based.
    // --------------------------------------------------------

    const actionPatterns = [
      /\b(build|create|develop|design|implement|launch|introduce)\b/,
      /\b(improve|enhance|modernize|simplify|streamline|optimize)\b/,
      /\b(automate|replace|upgrade|migrate|integrate|connect)\b/,
      /\b(enable|support|provide|establish|centralize)\b/,
      /\b(reduce|increase|eliminate|prevent)\b/
    ];

    const hasAction = actionPatterns.some((pattern) =>
      pattern.test(normalized)
    );

    if (!hasAction) {
      return {
        ready: false,
        message:
          "I need a little more context before starting discovery. What are you trying to build, change, improve, automate, or accomplish?"
      };
    }

    // --------------------------------------------------------
    // Look for meaningful context.
    //
    // Context can be:
    // - a person/group
    // - a business/process area
    // - a system/application
    // - a capability/object
    // - a business outcome
    //
    // This is NOT intended to prove completeness.
    // It only determines whether discovery can begin.
    // --------------------------------------------------------

    const contextPatterns = [
      // People / stakeholders
      /\b(customer|customers|user|users|employee|employees|staff|team|teams|business|operations|manager|managers|analyst|analysts|stakeholder|stakeholders|client|clients)\b/,

      // Processes / business areas
      /\b(process|workflow|intake|reporting|report|claims|payments|loan|loans|orders|onboarding|approval|approvals|request|requests|service|services|operations)\b/,

      // Technology / systems
      /\b(system|systems|application|applications|app|apps|platform|portal|dashboard|api|apis|database|data|integration|integrations|website|software|technology)\b/,

      // Outcomes
      /\b(outcome|outcomes|experience|efficiency|visibility|accuracy|speed|productivity|cost|costs|risk|risks|compliance|quality|performance)\b/
    ];

    const hasContext = contextPatterns.some((pattern) =>
      pattern.test(normalized)
    );

    if (!hasContext) {
      return {
        ready: false,
        message:
          "I need a little more context before starting discovery. What process, system, capability, or group is affected by this request?"
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
      showError("Enter a requirement before starting the analysis.");
      return;
    }

    // --------------------------------------------------------
    // Lightweight requirement-validation gate
    //
    // We only check whether there is enough context to begin
    // meaningful discovery. We are NOT judging whether the
    // requirement is complete.
    // --------------------------------------------------------

    const validation = validateRequirementForDiscovery(
      requirement
    );

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
  // Interview question selection
  // ----------------------------------------------------------

  function selectNextQuestion() {
    const unansweredQuestions = [
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
          "Business rules often affect design, workflow, testing, and acceptance criteria."
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
          "Success criteria connect delivery activity to the business outcome the requirement is intended to achieve."
      }
    ];

    for (const item of unansweredQuestions) {
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

    interviewState.questionsAsked.push(nextQuestion);
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
      showError("Enter an answer or select “Mark as TBD.”");
      return;
    }

    clearError();

    const currentQuestion = interviewState.currentQuestion;

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
      markAsTbd
    );

    interviewState.currentQuestion = null;

    // --------------------------------------------------------
    // Always look for another meaningful contextual question
    // before declaring the requirement ready.
    // --------------------------------------------------------

    const nextQuestion = selectNextQuestion();

    if (nextQuestion) {
      interviewState.currentQuestion = nextQuestion;
      interviewState.questionNumber += 1;
      interviewState.questionsAsked.push(nextQuestion);

      renderAll();
      return;
    }

    finishInterview();
  }

  // ----------------------------------------------------------
  // Update planning state
  // ----------------------------------------------------------

  function updateRequirementState(key, answer, isTbd) {
    interviewState.clarified[key] = true;

    if (key === "users") {
      interviewState.state.users = answer;
    }

    if (key === "scope") {
      interviewState.state.scope = answer;
    }

    if (key === "requirements") {
      interviewState.state.requirements = [
        answer
      ];
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

    if (isTbd) {
      interviewState.state.assumptions.push(
        `${key}: requires human validation.`
      );
    }
  }

  // ----------------------------------------------------------
  // Finish interview
  // ----------------------------------------------------------

  function finishInterview() {
    const ready = isReadyForValidation();

    if (!ready) {
      return;
    }

    interviewState.status = "READY_FOR_VALIDATION";
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
      const value = interviewState.state[field];

      if (Array.isArray(value)) {
        return value.length > 0;
      }

      return Boolean(value && String(value).trim());
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
    const container = $("understanding-content");

    if (!container) {
      return;
    }

    if (!interviewState.originalRequirement) {
      container.innerHTML = "";
      return;
    }

    container.innerHTML = `
      <div class="understanding-item">
        <span class="understanding-label">Original intent</span>
        <p>${escapeHtml(interviewState.originalRequirement)}</p>
      </div>

      <div class="understanding-item">
        <span class="understanding-label">Working objective</span>
        <p>${escapeHtml(interviewState.state.objective)}</p>
      </div>
    `;
  }

  function renderInterview() {
    const status = $("interview-status");
    const questionState = $("question-state");
    const question = $("current-question");
    const questionWhy = $("question-why");
    const answerArea = $("answer-area");
    const answerInput = $("current-answer");
    const tbdButton = $("tbd-btn");
    const continueButton = $("continue-btn");

    const completionState = $("completion-state");
    const reviewButton = $("review-requirement-btn");

    if (status) {
      if (interviewState.status === "INTERVIEWING") {
        status.textContent = "Contextual discovery in progress";
      } else if (
        interviewState.status === "READY_FOR_VALIDATION"
      ) {
        status.textContent = "Ready for human validation";
      } else {
        status.textContent = "";
      }
    }

    if (interviewState.status === "INTERVIEWING") {
      if (questionState) {
        questionState.removeAttribute("hidden");
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
        questionWhy.removeAttribute("hidden");

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
        answerInput.focus();
      }

      if (tbdButton) {
        tbdButton.removeAttribute("hidden");
      }

      if (continueButton) {
        continueButton.removeAttribute("hidden");
      }

      if (completionState) {
        completionState.setAttribute("hidden", "");
      }

      if (reviewButton) {
        reviewButton.setAttribute("hidden", "");
      }

      return;
    }

    if (interviewState.status === "READY_FOR_VALIDATION") {
      if (questionState) {
        questionState.setAttribute("hidden", "");
      }

      if (question) {
        question.setAttribute("hidden", "");
      }

      if (questionWhy) {
        questionWhy.setAttribute("hidden", "");
      }

      if (answerArea) {
        answerArea.setAttribute("hidden", "");
      }

      if (tbdButton) {
        tbdButton.setAttribute("hidden", "");
      }

      if (continueButton) {
        continueButton.setAttribute("hidden", "");
      }

      if (completionState) {
        completionState.removeAttribute("hidden");
      }

      if (reviewButton) {
        reviewButton.removeAttribute("hidden");
      }

      return;
    }

    // Default / initial state

    if (questionState) {
      questionState.setAttribute("hidden", "");
    }

    if (question) {
      question.setAttribute("hidden", "");
    }

    if (questionWhy) {
      questionWhy.setAttribute("hidden", "");
    }

    if (answerArea) {
      answerArea.setAttribute("hidden", "");
    }

    if (tbdButton) {
      tbdButton.setAttribute("hidden", "");
    }

    if (continueButton) {
      continueButton.setAttribute("hidden", "");
    }

    if (completionState) {
      completionState.setAttribute("hidden", "");
    }

    if (reviewButton) {
      reviewButton.setAttribute("hidden", "");
    }
  }

  function renderInterviewHistory() {
    const container = $("interview-history");

    if (!container) {
      return;
    }

    if (interviewState.answers.length === 0) {
      container.innerHTML = "";
      return;
    }

    container.innerHTML = interviewState.answers
      .map((item, index) => {
        return `
          <div class="history-item">
            <div class="history-number">${index + 1}</div>

            <div class="history-content">
              <div class="history-question">
                ${escapeHtml(item.question)}
              </div>

              <div class="history-answer">
                ${escapeHtml(item.answer)}
              </div>
            </div>
          </div>
        `;
      })
      .join("");
  }

  function renderRequirementState() {
    const state = interviewState.state;

    setText(
      "state-objective",
      state.objective || "Not yet defined"
    );

    setText(
      "state-scope",
      state.scope || "Not yet defined"
    );

    setText(
      "state-users",
      state.users || "Not yet defined"
    );

    setText(
      "state-constraints",
      state.constraints || "Not yet defined"
    );

    setText(
      "state-dependencies",
      state.dependencies || "Not yet defined"
    );

    setText(
      "state-success",
      state.successCriteria || "Not yet defined"
    );

    const requirementsElement = $("state-requirements");

    if (requirementsElement) {
      requirementsElement.textContent =
        state.requirements.length > 0
          ? state.requirements.join(", ")
          : "Not yet defined";
    }

    updateMetrics();
  }

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

    const known = fields.filter(Boolean).length;
    const total = fields.length;
    const open = total - known;

    setText("metric-known", `${known}/${total}`);
    setText(
      "metric-requirements",
      `${interviewState.answers.length}`
    );
    setText("metric-open", `${open}`);
  }

  function renderValidation() {
    const state = interviewState.state;

    setText(
      "validation-objective",
      state.objective || "Not yet defined"
    );

    setText(
      "validation-requirements",
      state.requirements.length > 0
        ? state.requirements.join(", ")
        : "Not yet defined"
    );

    setText(
      "validation-scope",
      state.scope || "Not yet defined"
    );

    setText(
      "validation-dependencies",
      state.dependencies || "Not yet defined"
    );

    setText(
      "validation-assumptions",
      state.assumptions.length > 0
        ? state.assumptions.join(" ")
        : "No additional assumptions recorded."
    );

    setText(
      "validation-success",
      state.successCriteria || "Not yet defined"
    );

    if (interviewState.status === "READY_FOR_VALIDATION") {
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
    const state = interviewState.state;

    interviewState.brd = {
      title: "Business Requirements Document",
      objective: state.objective,
      users: state.users,
      requirements: state.requirements,
      scope: state.scope,
      businessRules: state.businessRules,
      constraints: state.constraints,
      dependencies: state.dependencies,
      assumptions: state.assumptions,
      successCriteria: state.successCriteria
    };

    const container = $("brd-content");

    if (!container) {
      return;
    }

    container.innerHTML = `
      <div class="brd-section">
        <h3>1. Objective</h3>
        <p>${escapeHtml(state.objective)}</p>
      </div>

      <div class="brd-section">
        <h3>2. Primary Users / Stakeholders</h3>
        <p>${escapeHtml(state.users)}</p>
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
        <p>${escapeHtml(state.scope)}</p>
      </div>

      <div class="brd-section">
        <h3>5. Business Rules</h3>
        <p>${escapeHtml(state.businessRules)}</p>
      </div>

      <div class="brd-section">
        <h3>6. Constraints</h3>
        <p>${escapeHtml(state.constraints)}</p>
      </div>

      <div class="brd-section">
        <h3>7. Dependencies</h3>
        <p>${escapeHtml(state.dependencies)}</p>
      </div>

      <div class="brd-section">
        <h3>8. Assumptions / TBD Items</h3>
        <p>
          ${
            state.assumptions.length > 0
              ? escapeHtml(state.assumptions.join(" "))
              : "None recorded."
          }
        </p>
      </div>

      <div class="brd-section">
        <h3>9. Success Criteria</h3>
        <p>${escapeHtml(state.successCriteria)}</p>
      </div>
    `;
  }

  // ----------------------------------------------------------
  // Human validation
  // ----------------------------------------------------------

  function reviewRequirement() {
    if (
      interviewState.status !== "READY_FOR_VALIDATION"
    ) {
      return;
    }

    goToStep(3);
    renderValidation();
  }

  function approveRequirement() {
    generateBRD();

    goToStep(4);
  }

  function continueInterview() {
    goToStep(2);
    renderInterview();
  }

  function backToRequirement() {
    goToStep(1);
  }

  // ----------------------------------------------------------
  // Sample requirement
  // ----------------------------------------------------------

  function loadSampleRequirement() {
    const requirementInput = $("requirement");

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

    const requirementInput = $("requirement");

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

    const state = interviewState.brd;

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
    ? state.assumptions.join("\n")
    : "None recorded."
}

SUCCESS CRITERIA
${state.successCriteria}
`.trim();

    try {
      await navigator.clipboard.writeText(text);

      const button = $("copy-brd-btn");

      if (button) {
        const originalText = button.textContent;

        button.textContent = "Copied";

        setTimeout(() => {
          button.textContent = originalText;
        }, 1500);
      }
    } catch (error) {
      console.error("Unable to copy BRD:", error);
    }
  }

  // ----------------------------------------------------------
  // Character count
  // ----------------------------------------------------------

  function updateCharacterCount() {
    const input = $("requirement");
    const counter = $("character-count");

    if (!input || !counter) {
      return;
    }

    counter.textContent = `${input.value.length} characters`;
  }

  // ----------------------------------------------------------
  // Error handling
  // ----------------------------------------------------------

  function showError(message) {
    const errorElement = $("error-message");

    if (!errorElement) {
      return;
    }

    errorElement.textContent = message;
    errorElement.removeAttribute("hidden");
  }

  function clearError() {
    const errorElement = $("error-message");

    if (!errorElement) {
      return;
    }

    errorElement.textContent = "";
    errorElement.setAttribute("hidden", "");
  }

  // ----------------------------------------------------------
  // Small DOM helper
  // ----------------------------------------------------------

  function setText(id, value) {
    const element = $(id);

    if (element) {
      element.textContent = value;
    }
  }

  // ----------------------------------------------------------
  // Event listeners
  // ----------------------------------------------------------

  const analyzeButton = $("analyze-btn");

  if (analyzeButton) {
    analyzeButton.addEventListener(
      "click",
      analyzeRequirement
    );
  }

  const sampleButton = $("sample-btn");

  if (sampleButton) {
    sampleButton.addEventListener(
      "click",
      loadSampleRequirement
    );
  }

  const continueButton = $("continue-btn");

  if (continueButton) {
    continueButton.addEventListener(
      "click",
      () => processAnswer(false)
    );
  }

  const tbdButton = $("tbd-btn");

  if (tbdButton) {
    tbdButton.addEventListener(
      "click",
      () => processAnswer(true)
    );
  }

  const reviewButton = $("review-requirement-btn");

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

  const approveButton = $("approve-btn");

  if (approveButton) {
    approveButton.addEventListener(
      "click",
      approveRequirement
    );
  }

  const backButton = $("back-to-requirement");

  if (backButton) {
    backButton.addEventListener(
      "click",
      backToRequirement
    );
  }

  const copyButton = $("copy-brd-btn");

  if (copyButton) {
    copyButton.addEventListener(
      "click",
      copyBRD
    );
  }

  const restartButton = $("restart-btn");

  if (restartButton) {
    restartButton.addEventListener(
      "click",
      restart
    );
  }

  const requirementInput = $("requirement");

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
