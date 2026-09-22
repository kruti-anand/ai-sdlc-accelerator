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

    // Tracks what we have already clarified.
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

    // Structured requirement state.
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

    if (focusSelector) {
        const element = $(focusSelector);

        if (element) {
            setTimeout(() => {
                element.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });
            }, 50);
        }
    }

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
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

    // Establish what can reasonably be inferred from the initial request.
    initializeRequirementState(requirement);

    const firstQuestion = selectNextQuestion();

    if (firstQuestion) {
        setNextQuestion(firstQuestion);
    } else {
        finishInterview();
    }

    goToStep(2, "#step-2");
    renderInterview();
}

/* =========================================================
   INITIAL STATE
   ========================================================= */

function initializeRequirementState(requirement) {
    const text = requirement.trim();

    /*
     * We intentionally do not try to invent detailed requirements.
     * The initial request provides context, but the interview is
     * responsible for clarifying the important details.
     */

    interviewState.state.objective = inferObjective(text);

    if (interviewState.state.objective) {
        interviewState.clarified.objective = true;
    }
}

function inferObjective(text) {
    if (!text) {
        return "";
    }

    // Simple, transparent interpretation of the user's initial intent.
    // The interview will clarify it if needed.
    return text;
}

/* =========================================================
   QUESTION ENGINE
   ========================================================= */

function selectNextQuestion() {
    const state = interviewState.state;

    /*
     * IMPORTANT:
     * There is deliberately NO question-count rule here.
     *
     * The accelerator keeps asking questions until the relevant
     * information gaps have been addressed.
     */

    if (!interviewState.clarified.users) {
        return {
            type: "users",
            question:
                "Who will use this capability, and are there any users or stakeholders who should be excluded?",
            why:
                "Understanding the affected users helps define the scope and prevents the requirement from being interpreted too broadly."
        };
    }

    if (!interviewState.clarified.scope) {
        return {
            type: "scope",
            question:
                "What should this change cover, and are there any areas or scenarios that should explicitly be excluded?",
            why:
                "Clear boundaries help engineering understand what is inside and outside the requested change."
        };
    }

    if (!interviewState.clarified.requirements) {
        return {
            type: "requirements",
            question:
                "What should the system or process actually do? Please describe the capability or behavior you expect.",
            why:
                "The business need needs to be translated into a concrete, testable requirement."
        };
    }

    if (!interviewState.clarified.businessRules) {
        return {
            type: "businessRules",
            question:
                "Are there any business rules, policies, approvals, or conditions that the solution must follow?",
            why:
                "Business rules can materially affect solution design and acceptance criteria."
        };
    }

    if (!interviewState.clarified.constraints) {
        return {
            type: "constraints",
            question:
                "Are there any constraints we should account for, such as timing, compliance, security, technology, budget, or operational limitations?",
            why:
                "Known constraints help engineering identify feasibility concerns early."
        };
    }

    if (!interviewState.clarified.dependencies) {
        return {
            type: "dependencies",
            question:
                "Does this depend on another application, team, process, data source, API, approval, or upstream/downstream change?",
            why:
                "Dependencies can affect sequencing, delivery planning, and risk."
        };
    }

    if (!interviewState.clarified.successCriteria) {
        return {
            type: "successCriteria",
            question:
                "How will you know this change is successful? What outcome or measurable result should we be able to verify?",
            why:
                "Success criteria provide a basis for validation and later testing."
        };
    }

    // No meaningful questions remain.
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
     * THIS IS THE IMPORTANT FLOW:
     *
     * First ask whether another meaningful question exists.
     *
     * Only when there is NO next question do we evaluate readiness.
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
            if (markedTbd) {
                interviewState.state.requirements.push("TBD");
            } else {
                interviewState.state.requirements.push(answer);
            }

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
   READINESS
   ========================================================= */

function isReadyForValidation() {
    const state = interviewState.state;

    const hasObjective =
        Boolean(state.objective && state.objective.trim());

    const hasScope =
        Boolean(state.scope && state.scope.trim());

    const hasRequirement =
        Array.isArray(state.requirements) &&
        state.requirements.length > 0;

    return (
        hasObjective &&
        hasScope &&
        hasRequirement
    );
}

function finishInterview() {
    /*
     * We only arrive here after selectNextQuestion()
     * returns null.
     *
     * Therefore the contextual interview is complete.
     */

    if (isReadyForValidation()) {
        interviewState.status = "READY_FOR_VALIDATION";
        interviewState.currentQuestion = null;
    } else {
        /*
         * Safety fallback. This should rarely be reached because
         * the question engine is designed to gather the required
         * information before finishing.
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

    const currentQuestionElement = $("#current-question");
    const questionNumberElement = $("#question-number");
    const questionWhyElement = $("#question-why");
    const answerInput = $("#current-answer");
    const readyMessage = $("#ready-message");
    const continueButton = $("#continue-btn");
    const tbdButton = $("#tbd-btn");
    const reviewButton = $("#review-requirement-btn");

    if (!currentQuestionElement) {
        return;
    }

    /*
     * READY STATE
     */
    if (interviewState.status === "READY_FOR_VALIDATION") {
        if (questionNumberElement) {
            questionNumberElement.textContent = "";
        }

        currentQuestionElement.textContent =
            "Requirement is ready for validation.";

        if (questionWhyElement) {
            questionWhyElement.textContent =
                "The copilot has completed the contextual interview. Review the structured requirement before BRD generation.";
        }

        if (answerInput) {
            answerInput.value = "";
            answerInput.disabled = true;
            answerInput.placeholder =
                "Interview complete — review the requirement.";
        }

        if (continueButton) {
            continueButton.hidden = true;
        }

        if (tbdButton) {
            tbdButton.hidden = true;
        }

        if (readyMessage) {
            readyMessage.hidden = false;
            readyMessage.innerHTML = `
                <strong>Requirement is ready for validation.</strong>
                <p>
                    The copilot has enough information for you to review
                    the requirement before a BRD is generated.
                </p>
            `;
        }

        if (reviewButton) {
            reviewButton.hidden = false;
        }

        renderInterviewHistory();
        renderRequirementState();

        return;
    }

    /*
     * INTERVIEWING STATE
     */
    if (question) {
        if (questionNumberElement) {
            questionNumberElement.textContent =
                `QUESTION ${String(interviewState.questionNumber).padStart(2, "0")}`;
        }

        currentQuestionElement.textContent = question.question;

        if (questionWhyElement) {
            questionWhyElement.textContent = question.why;
        }

        if (answerInput) {
            answerInput.disabled = false;
            answerInput.placeholder =
                "Enter your answer...";
            answerInput.value = "";
        }

        if (continueButton) {
            continueButton.hidden = false;
        }

        if (tbdButton) {
            tbdButton.hidden = false;
        }

        if (readyMessage) {
            readyMessage.hidden = true;
            readyMessage.innerHTML = "";
        }

        if (reviewButton) {
            reviewButton.hidden = true;
        }
    }

    renderInterviewHistory();
    renderRequirementState();
}

/* =========================================================
   INTERVIEW HISTORY
   ========================================================= */

function renderInterviewHistory() {
    const container = $("#interview-history");

    if (!container) {
        return;
    }

    if (!interviewState.answers.length) {
        container.innerHTML = "";
        return;
    }

    container.innerHTML = interviewState.answers
        .map((item) => {
            return `
                <div class="history-item">
                    <div class="history-question">
                        Q-${String(item.number).padStart(3, "0")}
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

    setText("#state-objective", state.objective || "Not established yet");
    setText("#state-scope", state.scope || "Not established yet");
    setText("#state-users", state.users || "Not established yet");
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

    const requirementsElement = $("#validation-requirements");

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

    const successElement = $("#validation-success");

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

    const requirements = state.requirements.length
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
${state.assumptions.length
    ? state.assumptions.join("\n")
    : "None identified"}

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

function approveRequirement() {
    renderValidation();
    generateBRD();
    goToStep(4, "#step-4");
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
    renderValidation();
    goToStep(3, "#step-3");
}

function backToRequirement() {
    goToStep(1, "#step-1");
}

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

    const readyMessage = $("#ready-message");

    if (readyMessage) {
        readyMessage.hidden = true;
        readyMessage.innerHTML = "";
    }

    const reviewButton = $("#review-requirement-btn");

    if (reviewButton) {
        reviewButton.hidden = true;
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

    counter.textContent = `${input.value.length} characters`;
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
        await navigator.clipboard.writeText(interviewState.brd);

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
   EVENT LISTENERS
   ========================================================= */

function initializeApp() {
    const analyzeButton = $("#analyze-btn");
    const sampleButton = $("#sample-btn");
    const continueButton = $("#continue-btn");
    const tbdButton = $("#tbd-btn");
    const reviewButton = $("#review-requirement-btn");
    const approveButton = $("#approve-btn");
    const copyButton = $("#copy-brd-btn");
    const restartButton = $("#restart-btn");
    const backButton = $("#back-to-requirement");
    const continueInterviewButton = $("#continue-interview-btn");
    const requirementInput = $("#requirement");

    if (analyzeButton) {
        analyzeButton.addEventListener("click", analyzeRequirement);
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

    if (continueInterviewButton) {
        continueInterviewButton.addEventListener(
            "click",
            () => goToStep(2, "#step-2")
        );
    }

    if (requirementInput) {
        requirementInput.addEventListener(
            "input",
            updateCharacterCount
        );
    }

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
