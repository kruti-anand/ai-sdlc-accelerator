// AI SDLC Accelerator
// Human-in-the-loop requirements engineering showcase

"use strict";

/* =========================================================
   DOM HELPERS
   ========================================================= */

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

function escapeHtml(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

/* =========================================================
   APPLICATION STATE
   ========================================================= */

const interviewState = {
    originalRequirement: "",
    status: "IDLE",

    currentQuestion: null,
    questionNumber: 0,

    questionsAsked: [],
    answers: [],

    clarified: {
        objective: false,
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

/* =========================================================
   STEP NAVIGATION
   ========================================================= */

function goToStep(step, focusSelector = null) {
    $$(".step-panel").forEach((panel) => {
        const panelStep = Number(panel.dataset.step);
        panel.hidden = panelStep !== step;
    });

    $$(".progress-step").forEach((item) => {
        const itemStep = Number(item.dataset.step);

        item.classList.toggle("active", itemStep === step);
        item.classList.toggle("completed", itemStep < step);
    });

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

    if (focusSelector) {
        const element = $(focusSelector);

        if (element) {
            setTimeout(() => {
                element.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });
            }, 100);
        }
    }
}

/* =========================================================
   REQUIREMENT ANALYSIS
   ========================================================= */

function analyzeRequirement() {
    const input = $("#requirement");

    if (!input) {
        return;
    }

    const requirement = input.value.trim();

    if (!requirement) {
        showError("Please enter a requirement before continuing.");
        return;
    }

    clearError();
    resetInterviewState();

    interviewState.originalRequirement = requirement;
    interviewState.status = "INTERVIEWING";

    initializeRequirementState(requirement);

    const firstQuestion = selectNextQuestion();

    if (firstQuestion) {
        setNextQuestion(firstQuestion);
    }

    goToStep(2, "#step-2");
    renderInterview();
}

/* =========================================================
   INITIAL REQUIREMENT STATE
   ========================================================= */

function initializeRequirementState(requirement) {
    interviewState.state.objective = inferObjective(requirement);

    if (interviewState.state.objective) {
        interviewState.clarified.objective = true;
    }

    const understanding = $("#understanding-content");

    if (understanding) {
        understanding.textContent =
            "The initial request has been captured as the working objective. The copilot will now clarify the users, scope, behavior, rules, constraints, dependencies, and success criteria before validation.";
    }
}

function inferObjective(text) {
    return text ? text.trim() : "";
}

/* =========================================================
   CONTEXTUAL QUESTION ENGINE
   ========================================================= */

function selectNextQuestion() {
    const clarified = interviewState.clarified;

    /*
     * There is intentionally NO fixed question count.
     *
     * The interview continues until every meaningful
     * discovery area has been addressed.
     */

    if (!clarified.users) {
        return {
            type: "users",
            question:
                "Who will use this capability, and are there any users or stakeholders who should be excluded?",
            why:
                "Understanding the affected users helps define the scope and prevents the requirement from being interpreted too broadly."
        };
    }

    if (!clarified.scope) {
        return {
            type: "scope",
            question:
                "What should this change cover, and are there any areas or scenarios that should explicitly be excluded?",
            why:
                "Clear boundaries help engineering understand what is inside and outside the requested change."
        };
    }

    if (!clarified.requirements) {
        return {
            type: "requirements",
            question:
                "What should the system or process actually do? Please describe the capability or behavior you expect.",
            why:
                "The business need needs to be translated into a concrete, testable requirement."
        };
    }

    if (!clarified.businessRules) {
        return {
            type: "businessRules",
            question:
                "Are there any business rules, policies, approvals, or conditions that the solution must follow?",
            why:
                "Business rules can materially affect solution design and acceptance criteria."
        };
    }

    if (!clarified.constraints) {
        return {
            type: "constraints",
            question:
                "Are there any constraints we should account for, such as timing, compliance, security, technology, budget, or operational limitations?",
            why:
                "Known constraints help engineering identify feasibility concerns early."
        };
    }

    if (!clarified.dependencies) {
        return {
            type: "dependencies",
            question:
                "Does this depend on another application, team, process, data source, API, approval, or upstream/downstream change?",
            why:
                "Dependencies can affect sequencing, delivery planning, and risk."
        };
    }

    if (!clarified.successCriteria) {
        return {
            type: "successCriteria",
            question:
                "How will you know this change is successful? What outcome or measurable result should we be able to verify?",
            why:
                "Success criteria provide a basis for validation and later testing."
        };
    }

    return null;
}

/* =========================================================
   QUESTION MANAGEMENT
   ========================================================= */

function setNextQuestion(question) {
    interviewState.currentQuestion = question;
    interviewState.questionNumber += 1;

    interviewState.questionsAsked.push({
        number: interviewState.questionNumber,
        type: question.type,
        question: question.question
    });
}

function processAnswer(answer, markedTbd = false) {
    if (!interviewState.currentQuestion) {
        return;
    }

    const question = interviewState.currentQuestion;
    const cleanAnswer = answer.trim();

    if (!cleanAnswer && !markedTbd) {
        showError("Please enter an answer or select “Mark as TBD”.");
        return;
    }

    clearError();

    const finalAnswer = markedTbd ? "TBD" : cleanAnswer;

    interviewState.answers.push({
        number: interviewState.questionNumber,
        type: question.type,
        question: question.question,
        answer: finalAnswer
    });

    updateRequirementState(
        question.type,
        finalAnswer,
        markedTbd
    );

    interviewState.currentQuestion = null;

    /*
     * FIRST determine whether another meaningful question exists.
     *
     * ONLY when there is no next question do we complete
     * the interview.
     */

    const nextQuestion = selectNextQuestion();

    if (nextQuestion) {
        setNextQuestion(nextQuestion);
        interviewState.status = "INTERVIEWING";
        renderInterview();
        return;
    }

    finishInterview();
}

/* =========================================================
   UPDATE REQUIREMENT STATE
   ========================================================= */

function updateRequirementState(type, answer, markedTbd) {
    switch (type) {
        case "users":
            interviewState.state.users = answer;
            interviewState.clarified.users = true;
            break;

        case "scope":
            interviewState.state.scope = answer;
            interviewState.clarified.scope = true;
            break;

        case "requirements":
            interviewState.state.requirements = markedTbd
                ? ["TBD"]
                : [answer];

            interviewState.clarified.requirements = true;
            break;

        case "businessRules":
            interviewState.state.businessRules = answer;
            interviewState.clarified.businessRules = true;
            break;

        case "constraints":
            interviewState.state.constraints = answer;
            interviewState.clarified.constraints = true;
            break;

        case "dependencies":
            interviewState.state.dependencies = answer;
            interviewState.clarified.dependencies = true;
            break;

        case "successCriteria":
            interviewState.state.successCriteria = answer;
            interviewState.clarified.successCriteria = true;
            break;
    }
}

/* =========================================================
   INTERVIEW COMPLETION
   ========================================================= */

function isReadyForValidation() {
    const state = interviewState.state;

    return Boolean(
        state.objective &&
        state.objective.trim() &&
        state.scope &&
        state.scope.trim() &&
        Array.isArray(state.requirements) &&
        state.requirements.length > 0
    );
}

function finishInterview() {
    /*
     * This function is reached only after the question engine
     * has no meaningful question remaining.
     */

    if (isReadyForValidation()) {
        interviewState.status = "READY_FOR_VALIDATION";
        interviewState.currentQuestion = null;
    } else {
        /*
         * Safety fallback.
         *
         * This should not normally occur because the question
         * engine collects the required fields.
         */
        interviewState.status = "INTERVIEWING";

        interviewState.currentQuestion = {
            type: "requirements",
            question:
                "Is there anything else the requirement must do or achieve that we have not captured?",
            why:
                "A final clarification helps ensure the requirement is complete before validation."
        };

        interviewState.questionNumber += 1;
    }

    renderInterview();
}

/* =========================================================
   INTERVIEW RENDERING
   ========================================================= */

function renderInterview() {
    const question = interviewState.currentQuestion;

    const currentQuestion = $("#current-question");
    const questionNumber = $("#question-number");
    const questionWhy = $("#question-why");

    const answerInput = $("#current-answer");
    const answerArea = $("#answer-area");
    const questionState = $("#question-state");

    const completionState = $("#completion-state");

    const continueButton = $("#continue-btn");
    const tbdButton = $("#tbd-btn");

    const reviewButton = $("#review-requirement-btn");

    const interviewStatus = $("#interview-status");

    if (!currentQuestion) {
        return;
    }

    /* =====================================================
       COMPLETED STATE
       ===================================================== */

    if (interviewState.status === "READY_FOR_VALIDATION") {
        if (interviewStatus) {
            interviewStatus.innerHTML =
                '<span class="status-dot"></span> Complete';
        }

        if (questionState) {
            questionState.hidden = true;
        }

        if (answerArea) {
            answerArea.hidden = true;
        }

        if (completionState) {
            completionState.hidden = false;
        }

        if (answerInput) {
            answerInput.value = "";
            answerInput.disabled = true;
        }

        if (continueButton) {
            continueButton.hidden = true;
        }

        if (tbdButton) {
            tbdButton.hidden = true;
        }

        if (reviewButton) {
            reviewButton.hidden = false;
        }

        renderInterviewHistory();
        renderRequirementState();

        return;
    }

    /* =====================================================
       ACTIVE INTERVIEW STATE
       ===================================================== */

    if (!question) {
        return;
    }

    if (interviewStatus) {
        interviewStatus.innerHTML =
            '<span class="status-dot"></span> Interviewing';
    }

    if (questionState) {
        questionState.hidden = false;
    }

    if (answerArea) {
        answerArea.hidden = false;
    }

    if (completionState) {
        completionState.hidden = true;
    }

    if (questionNumber) {
        questionNumber.textContent =
            `QUESTION ${String(
                interviewState.questionNumber
            ).padStart(2, "0")}`;
    }

    currentQuestion.textContent = question.question;

    if (questionWhy) {
        questionWhy.textContent = question.why;
    }

    if (answerInput) {
        answerInput.disabled = false;
        answerInput.value = "";
        answerInput.placeholder =
            "Enter your answer...";
    }

    if (continueButton) {
        continueButton.hidden = false;
    }

    if (tbdButton) {
        tbdButton.hidden = false;
    }

    if (reviewButton) {
        reviewButton.hidden = true;
    }

    renderInterviewHistory();
    renderRequirementState();
}

/* =========================================================
   INTERVIEW HISTORY
   ========================================================= */

function renderInterviewHistory() {
    const container = $("#history-content");

    if (!container) {
        return;
    }

    if (!interviewState.answers.length) {
        container.innerHTML =
            "<p>No questions answered yet.</p>";
        return;
    }

    container.innerHTML = interviewState.answers
        .map((item) => {
            return `
                <div class="history-item">
                    <div class="history-question">
                        Q-${String(item.number).padStart(2, "0")}
                    </div>

                    <div class="history-question-text">
                        ${escapeHtml(item.question)}
                    </div>

                    <div class="history-answer-label">
                        YOUR ANSWER
                    </div>

                    <div class="history-answer">
                        ${escapeHtml(item.answer)}
                    </div>
                </div>
            `;
        })
        .join("");
}

/* =========================================================
   REQUIREMENT STATE DISPLAY
   ========================================================= */

function renderRequirementState() {
    const state = interviewState.state;

    setText(
        "#state-objective",
        state.objective || "Not established yet"
    );

    setText(
        "#state-scope",
        state.scope || "Not established yet"
    );

    setText(
        "#state-users",
        state.users || "Not established yet"
    );

    setText(
        "#state-constraints",
        state.constraints || "Not established yet"
    );

    setText(
        "#state-dependencies",
        state.dependencies || "Not established yet"
    );

    setText(
        "#state-success",
        state.successCriteria || "Not established yet"
    );

    const requirementCount =
        Array.isArray(state.requirements)
            ? state.requirements.length
            : 0;

    setText(
        "#metric-known",
        countKnownFields()
    );

    setText(
        "#metric-requirements",
        requirementCount
    );

    setText(
        "#metric-open",
        countOpenQuestions()
    );
}

function countKnownFields() {
    let count = 0;

    if (interviewState.state.objective) count++;
    if (interviewState.state.users) count++;
    if (interviewState.state.scope) count++;
    if (interviewState.state.requirements.length) count++;
    if (interviewState.state.businessRules) count++;
    if (interviewState.state.constraints) count++;
    if (interviewState.state.dependencies) count++;
    if (interviewState.state.successCriteria) count++;

    return count;
}

function countOpenQuestions() {
    return Object.values(interviewState.clarified)
        .filter((value) => !value)
        .length;
}

function setText(selector, value) {
    const element = $(selector);

    if (element) {
        element.textContent = value;
    }
}

/* =========================================================
   VALIDATION
   ========================================================= */

function renderValidation() {
    const state = interviewState.state;

    setText(
        "#validation-objective",
        state.objective || "Not provided"
    );

    setText(
        "#validation-scope",
        state.scope || "Not provided"
    );

    setText(
        "#validation-dependencies",
        state.dependencies || "TBD / None identified"
    );

    setText(
        "#validation-assumptions",
        state.assumptions.length
            ? state.assumptions.join("; ")
            : "None identified"
    );

    const requirementsElement =
        $("#validation-requirements");

    if (requirementsElement) {
        requirementsElement.innerHTML =
            state.requirements.length
                ? state.requirements
                    .map(
                        (requirement) =>
                            `<li>${escapeHtml(requirement)}</li>`
                    )
                    .join("")
                : "<li>No requirements captured</li>";
    }

    const successElement =
        $("#validation-success");

    if (successElement) {
        successElement.textContent =
            state.successCriteria || "Not provided";
    }
}

/* =========================================================
   BRD GENERATION
   ========================================================= */

function generateBRD() {
    const state = interviewState.state;

    const requirements =
        state.requirements.length
            ? state.requirements
                .map(
                    (item, index) =>
                        `${index + 1}. ${item}`
                )
                .join("\n")
            : "No requirements captured.";

    const brd = `
BUSINESS REQUIREMENTS DOCUMENT

1. OBJECTIVE
${state.objective || "TBD"}

2. USERS & STAKEHOLDERS
${state.users || "TBD"}

3. SCOPE
${state.scope || "TBD"}

4. BUSINESS REQUIREMENTS
${requirements}

5. BUSINESS RULES
${state.businessRules || "TBD"}

6. CONSTRAINTS
${state.constraints || "TBD"}

7. DEPENDENCIES
${state.dependencies || "TBD"}

8. SUCCESS CRITERIA
${state.successCriteria || "TBD"}

9. ASSUMPTIONS
${
    state.assumptions.length
        ? state.assumptions.join("\n")
        : "None identified"
}

10. TRACEABILITY
Source requirement:
${interviewState.originalRequirement}

This BRD was generated from the structured requirement
captured through the AI SDLC Accelerator's human-in-the-loop
requirements interview.
`.trim();

    interviewState.brd = brd;

    const container = $("#brd-content");

    if (container) {
        container.textContent = brd;
    }

    const banner = $("#traceability-banner");

    if (banner) {
        banner.hidden = false;
    }
}

/* =========================================================
   BUTTON ACTIONS
   ========================================================= */

function continueInterview() {
    const answerInput = $("#current-answer");

    if (!answerInput) {
        return;
    }

    processAnswer(answerInput.value, false);
}

function markTbd() {
    processAnswer("TBD", true);
}

function reviewRequirement() {
    if (
        interviewState.status !==
        "READY_FOR_VALIDATION"
    ) {
        return;
    }

    renderValidation();
    goToStep(3, "#step-3");
}

function approveRequirement() {
    renderValidation();
    generateBRD();
    goToStep(4, "#step-4");
}

function backToRequirement() {
    goToStep(1, "#step-1");
}

function continueFromValidation() {
    goToStep(2, "#step-2");
}

/* =========================================================
   RESTART
   ========================================================= */

function restart() {
    resetInterviewState();

    const input = $("#requirement");

    if (input) {
        input.value = "";
    }

    updateCharacterCount();
    clearError();

    goToStep(1, "#step-1");
}

/* =========================================================
   RESET
   ========================================================= */

function resetInterviewState() {
    interviewState.originalRequirement = "";
    interviewState.status = "IDLE";

    interviewState.currentQuestion = null;
    interviewState.questionNumber = 0;

    interviewState.questionsAsked = [];
    interviewState.answers = [];

    interviewState.clarified = {
        objective: false,
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

    const completionState = $("#completion-state");

    if (completionState) {
        completionState.hidden = true;
    }

    const questionState = $("#question-state");

    if (questionState) {
        questionState.hidden = false;
    }

    const answerArea = $("#answer-area");

    if (answerArea) {
        answerArea.hidden = false;
    }

    const reviewButton = $("#review-requirement-btn");

    if (reviewButton) {
        reviewButton.hidden = true;
    }

    const traceabilityBanner =
        $("#traceability-banner");

    if (traceabilityBanner) {
        traceabilityBanner.hidden = true;
    }

    const brdContent = $("#brd-content");

    if (brdContent) {
        brdContent.textContent = "";
    }

    const historyContent = $("#history-content");

    if (historyContent) {
        historyContent.innerHTML =
            "<p>No questions answered yet.</p>";
    }
}

/* =========================================================
   SAMPLE REQUIREMENT
   ========================================================= */

function loadSampleRequirement() {
    const input = $("#requirement");

    if (!input) {
        return;
    }

    input.value =
        "Allow customers with an active account to update their contact information through the online portal.";

    updateCharacterCount();
    clearError();
}

/* =========================================================
   CHARACTER COUNT
   ========================================================= */

function updateCharacterCount() {
    const input = $("#requirement");
    const counter = $("#character-count");

    if (!input || !counter) {
        return;
    }

    counter.textContent =
        `${input.value.length} characters`;
}

/* =========================================================
   ERROR HANDLING
   ========================================================= */

function showError(message) {
    const errorElement = $("#error-message");

    if (!errorElement) {
        return;
    }

    errorElement.textContent = message;
    errorElement.hidden = false;
}

function clearError() {
    const errorElement = $("#error-message");

    if (!errorElement) {
        return;
    }

    errorElement.textContent = "";
    errorElement.hidden = true;
}

/* =========================================================
   COPY BRD
   ========================================================= */

async function copyBRD() {
    if (!interviewState.brd) {
        return;
    }

    try {
        await navigator.clipboard.writeText(
            interviewState.brd
        );

        const button = $("#copy-brd-btn");

        if (button) {
            const originalText = button.textContent;

            button.textContent = "Copied!";

            setTimeout(() => {
                button.textContent = originalText;
            }, 1500);
        }
    } catch (error) {
        showError(
            "The BRD could not be copied automatically. Please select and copy the text manually."
        );
    }
}

/* =========================================================
   HERO NAVIGATION
   ========================================================= */

function exploreAccelerator() {
    const target = $("#requirements-workflow");

    if (target) {
        target.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    }
}

/* =========================================================
   EVENT LISTENERS
   ========================================================= */

function initializeApp() {
    const exploreButton = $("#explore-btn");
    const analyzeButton = $("#analyze-btn");
    const sampleButton = $("#sample-btn");
    const continueButton = $("#continue-btn");
    const tbdButton = $("#tbd-btn");
    const reviewButton = $("#review-requirement-btn");
    const approveButton = $("#approve-btn");
    const copyButton = $("#copy-brd-btn");
    const restartButton = $("#restart-btn");
    const backButton = $("#back-to-requirement");
    const continueValidationButton =
        $("#continue-interview-btn");
    const requirementInput = $("#requirement");

    if (exploreButton) {
        exploreButton.addEventListener(
            "click",
            exploreAccelerator
        );
    }

    if (analyzeButton) {
        analyzeButton.addEventListener(
            "click",
            analyzeRequirement
        );
    }

    if (sampleButton) {
        sampleButton.addEventListener(
            "click",
            loadSampleRequirement
        );
    }

    if (continueButton) {
        continueButton.addEventListener(
            "click",
            continueInterview
        );
    }

    if (tbdButton) {
        tbdButton.addEventListener(
            "click",
            markTbd
        );
    }

    if (reviewButton) {
        reviewButton.addEventListener(
            "click",
            reviewRequirement
        );
    }

    if (approveButton) {
        approveButton.addEventListener(
            "click",
            approveRequirement
        );
    }

    if (copyButton) {
        copyButton.addEventListener(
            "click",
            copyBRD
        );
    }

    if (restartButton) {
        restartButton.addEventListener(
            "click",
            restart
        );
    }

    if (backButton) {
        backButton.addEventListener(
            "click",
            backToRequirement
        );
    }

    if (continueValidationButton) {
        continueValidationButton.addEventListener(
            "click",
            continueFromValidation
        );
    }

    if (requirementInput) {
        requirementInput.addEventListener(
            "input",
            updateCharacterCount
        );
    }

    resetInterviewState();
    updateCharacterCount();
    goToStep(1);
}

/* =========================================================
   START APPLICATION
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    initializeApp
);
