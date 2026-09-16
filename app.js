const sampleRequirement = 'We need to add MFA authentication for external users.';

const state = {
  requirement: '',
  questions: [],
  answers: {},
  requestType: '',
  currentQuestionIndex: 0
};

const $ = (selector) => document.querySelector(selector);

/* -------------------------------------------------------
   Request classification
------------------------------------------------------- */

function classifyRequest(value) {
  const lower = value.toLowerCase();

  // Explicit language takes priority.
  // This prevents phrases such as "build a Requirements document"
  // from being mistaken for a software implementation request.
  const explicitPlanningSignals = [
    'not a technical requirement',
    'does not need to be implemented',
    'does not need implementation',
    'plan a trip',
    'trip plan',
    'travel plan',
    'itinerary'
  ];

  if (explicitPlanningSignals.some(signal => lower.includes(signal))) {
    return 'Planning/Request for an Outcome';
  }

  const planningSignals = [
    'plan',
    'planning',
    'trip',
    'travel',
    'schedule',
    'organize',
    'arrange',
    'visit',
    'vacation',
    'agenda',
    'event'
  ];

  const softwareSignals = [
    'develop',
    'implement',
    'create an application',
    'create a system',
    'software',
    'application',
    'api',
    'integration',
    'integrate',
    'automation',
    'database',
    'platform',
    'authentication',
    'mfa',
    'lambda',
    'cloud',
    'website',
    'portal',
    'system'
  ];

  const processSignals = [
    'process',
    'workflow',
    'procedure',
    'approval',
    'intake',
    'operating model',
    'business process',
    'policy',
    'review process',
    'standardize'
  ];

  const informationalSignals = [
    'explain',
    'what is',
    'how does',
    'tell me about',
    'information about',
    'research',
    'compare',
    'comparison'
  ];

  // Planning is checked before generic software terms.
  if (planningSignals.some(signal => lower.includes(signal))) {
    return 'Planning/Request for an Outcome';
  }

  if (softwareSignals.some(signal => lower.includes(signal))) {
    return 'Software/System Implementation';
  }

  if (processSignals.some(signal => lower.includes(signal))) {
    return 'Business/Process Requirement';
  }

  if (informationalSignals.some(signal => lower.includes(signal))) {
    return 'Informational Request';
  }

  return 'Other';
}

/* -------------------------------------------------------
   Request-specific clarification questions
------------------------------------------------------- */

const questionSets = {
  software: [
    {
      id: 'users',
      label: 'Who are the intended users, and who is explicitly out of scope?',
      placeholder: 'e.g. External customers and partners; employees are excluded'
    },
    {
      id: 'outcome',
      label: 'What business outcome should this capability achieve?',
      placeholder: 'e.g. Reduce login friction while improving account security'
    },
    {
      id: 'scope',
      label: 'What is in scope for the first release, and what is out of scope?',
      placeholder: 'e.g. Web login only; mobile and account recovery later'
    },
    {
      id: 'success',
      label: 'How will success be measured?',
      placeholder: 'e.g. 95% adoption within 30 days; fewer support calls'
    },
    {
      id: 'technical',
      label: 'Are there any known technical, security, compliance, or architecture constraints?',
      placeholder: 'e.g. Must use existing identity provider; SOC 2 requirements apply'
    },
    {
      id: 'dependencies',
      label: 'Which existing systems, APIs, teams, vendors, or other dependencies could be involved?',
      placeholder: 'e.g. Customer portal, identity team, security team'
    }
  ],

  process: [
    {
      id: 'problem',
      label: 'What problem or business need is this process intended to address?',
      placeholder: 'e.g. Requests are handled inconsistently across teams'
    },
    {
      id: 'users',
      label: 'Who participates in the process or is affected by the outcome?',
      placeholder: 'e.g. Product managers, engineering leads, and operations'
    },
    {
      id: 'current',
      label: 'How does the process work today?',
      placeholder: 'Describe the current workflow, pain points, or known gaps'
    },
    {
      id: 'outcome',
      label: 'What should be different after the process is improved?',
      placeholder: 'e.g. Consistent intake, clear ownership, and faster approvals'
    },
    {
      id: 'scope',
      label: 'What is in scope and out of scope?',
      placeholder: 'e.g. Product development intake only; production support excluded'
    },
    {
      id: 'success',
      label: 'How will you know the improved process is successful?',
      placeholder: 'e.g. Reduce cycle time by 20%'
    }
  ],

  planning: [
    {
      id: 'participants',
      label: 'Who is involved, and are there any participant needs that should shape the plan?',
      placeholder: 'e.g. Two adults and two children; minimize school absences'
    },
    {
      id: 'outcome',
      label: 'What is the desired outcome or experience?',
      placeholder: 'e.g. See key historical sites while keeping travel manageable'
    },
    {
      id: 'constraints',
      label: 'What dates, reservations, transportation, budget, or other constraints are already fixed?',
      placeholder: 'e.g. Flights are booked; arrival and departure cities are fixed'
    },
    {
      id: 'preferences',
      label: 'What preferences or priorities should the plan account for?',
      placeholder: 'e.g. Scenic areas, culture, safe transportation, reasonable lodging'
    },
    {
      id: 'scope',
      label: 'What locations, activities, or outcomes are required versus optional?',
      placeholder: 'e.g. Seville, Granada, and Barcelona are required; Madrid is excluded'
    },
    {
      id: 'undecided',
      label: 'What is still undecided or open for recommendations?',
      placeholder: 'e.g. Transportation between cities and day-by-day activities'
    }
  ],

  informational: [
    {
      id: 'objective',
      label: 'What are you trying to understand or accomplish with this information?',
      placeholder: 'e.g. Understand the differences before making a decision'
    },
    {
      id: 'context',
      label: 'What context or background should be considered?',
      placeholder: 'e.g. Current environment, audience, or existing knowledge'
    },
    {
      id: 'constraints',
      label: 'Are there any constraints on scope, depth, timeframe, or sources?',
      placeholder: 'e.g. Focus on current information and practical implications'
    }
  ],

  other: [
    {
      id: 'objective',
      label: 'What is the primary objective or desired outcome?',
      placeholder: 'Describe what you want to accomplish'
    },
    {
      id: 'scope',
      label: 'What is included, and what is explicitly outside the request?',
      placeholder: 'Describe the boundaries of the request'
    },
    {
      id: 'constraints',
      label: 'Are there any known constraints, preferences, or fixed decisions?',
      placeholder: 'e.g. Budget, timing, existing commitments, or preferences'
    },
    {
      id: 'success',
      label: 'What would a successful outcome look like?',
      placeholder: 'Describe the result you would consider successful'
    }
  ]
};

/* -------------------------------------------------------
   Helpers
------------------------------------------------------- */

function getQuestionSet(requestType) {
  switch (requestType) {
    case 'Software/System Implementation':
      return questionSets.software;

    case 'Business/Process Requirement':
      return questionSets.process;

    case 'Planning/Request for an Outcome':
      return questionSets.planning;

    case 'Informational Request':
      return questionSets.informational;

    default:
      return questionSets.other;
  }
}

function getTypeDescription(requestType) {
  switch (requestType) {
    case 'Software/System Implementation':
      return 'This request appears to describe a technology capability or system change.';

    case 'Business/Process Requirement':
      return 'This request appears to describe a business process, workflow, or operating need.';

    case 'Planning/Request for an Outcome':
      return 'This request appears to describe an outcome or plan rather than a software implementation.';

    case 'Informational Request':
      return 'This request appears to be primarily informational rather than an implementation request.';

    default:
      return 'This request does not clearly fit a predefined requirement type yet.';
  }
}

/* -------------------------------------------------------
   Workflow
------------------------------------------------------- */

function setStep(step) {
  document.querySelectorAll('.step-panel').forEach((panel, index) => {
    panel.hidden = index + 1 !== step;
    panel.classList.toggle('active-panel', index + 1 === step);
  });

  document.querySelectorAll('.step').forEach((item, index) => {
    item.classList.toggle('active', index + 1 === step);
    item.classList.toggle('done', index + 1 < step);
  });

  $('#progress-fill').style.width = `${(step - 1) * 50}%`;

  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
}

function analyzeRequirement() {
  const value = $('#requirement').value.trim();

  if (!value) {
    showToast('Add a business requirement to begin.');
    $('#requirement').focus();
    return;
  }

  state.requirement = value;
  state.requestType = classifyRequest(value);
  state.questions = getQuestionSet(state.requestType);
  state.answers = {};
  state.currentQuestionIndex = 0;

  const typeDescription = getTypeDescription(state.requestType);

  $('#conversation-list').innerHTML = '';

showNextQuestion();

setStep(2);
}

function showNextQuestion() {
  const index = state.currentQuestionIndex;

  if (index >= state.questions.length) {
    $('#question-progress').textContent = 'Complete';
    $('#current-answer').style.display = 'none';
    $('#next-question-btn').style.display = 'none';
    $('#generate-btn').style.display = 'inline-flex';
    return;
  }

  const question = state.questions[index];

  $('#question-progress').textContent =
    `Question ${index + 1}`;

  $('#conversation-list').innerHTML += `
    <div class="conversation-question">
      <div class="question-label">
        <span class="question-index">${String(index + 1).padStart(2, '0')}</span>
        <span>${question.label}</span>
      </div>
    </div>
  `;

  $('#current-answer').value = '';
  $('#current-answer').placeholder = question.placeholder;
  $('#current-answer').focus();
}

function answer(id) {
  const element = document.querySelector(`[data-question="${id}"]`);
  return element ? element.value.trim() : '';
}

function valueOrAssumption(id, fallback) {
  return state.answers[id]
    ? escapeHtml(state.answers[id])
    : `<span class="tag">Assumption</span> ${escapeHtml(fallback)}`;
}

/* -------------------------------------------------------
   BRD generation
------------------------------------------------------- */

function generateBRD() {
  state.questions.forEach(question => {
    state.answers[question.id] = answer(question.id);
  });

  const req = state.requirement;

  $('#brd-title').textContent =
    `BRD · ${req.length > 58 ? `${req.slice(0, 58)}…` : req}`;

  $('#brd-subtitle').textContent =
    `${state.requestType} · Draft generated ${new Date().toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })} · Validate assumptions before approval`;

  switch (state.requestType) {
    case 'Software/System Implementation':
      generateSoftwareBRD(req);
      break;

    case 'Business/Process Requirement':
      generateProcessBRD(req);
      break;

    case 'Planning/Request for an Outcome':
      generatePlanningBRD(req);
      break;

    case 'Informational Request':
      generateInformationalBRD(req);
      break;

    default:
      generateOtherBRD(req);
  }

  setStep(3);
}

/* -------------------------------------------------------
   Software BRD
------------------------------------------------------- */

function generateSoftwareBRD(req) {
  $('#brd-content').innerHTML = `
    <article class="brd-section">
      <h3>1. Business objective</h3>
      <p>
        Enable the organization to deliver the requested technology capability:
        <strong>${escapeHtml(req)}</strong>.
        The objective is to address the stated business need while keeping
        unresolved decisions visible.
      </p>
    </article>

    <article class="brd-section">
      <h3>2. Problem statement</h3>
      <p>
        Users and stakeholders need a defined and dependable capability that
        addresses the stated business need. The current-state pain point and
        impact of not changing should be confirmed.
      </p>
    </article>

    <article class="brd-section">
      <h3>3. Scope</h3>
      <ul>
        <li>Deliver the capability described in the approved requirement.</li>
        <li>
          Intended users:
          ${valueOrAssumption('users', 'The identified target users are in scope.')}
        </li>
        <li>
          First-release boundaries:
          ${valueOrAssumption('scope', 'Primary user journey only.')}
        </li>
      </ul>
    </article>

    <article class="brd-section">
      <h3>4. Functional requirements</h3>
      <ul>
        <li>The solution must support the approved user population and primary journey.</li>
        <li>The solution must provide the agreed capability and appropriate user feedback.</li>
        <li>
          Known technical constraints:
          ${valueOrAssumption('technical', 'No specific technical constraints have been provided.')}
        </li>
        <li>
          Dependencies:
          ${valueOrAssumption('dependencies', 'Dependencies have not yet been identified.')}
        </li>
      </ul>
    </article>

    <article class="brd-section">
      <h3>5. Success criteria</h3>
      <p>
        ${valueOrAssumption(
          'success',
          'Success measures must be agreed with stakeholders before implementation.'
        )}
      </p>
    </article>

    <article class="brd-section">
      <h3>6. Assumptions, risks & acceptance criteria</h3>
      <ul>
        <li><strong>Assumptions:</strong> Items marked above require stakeholder confirmation.</li>
        <li><strong>Risk:</strong> Unresolved scope, technical, security, or dependency decisions may affect design, cost, and timeline.</li>
        <li><strong>Acceptance:</strong> Stakeholders approve scope and success measures, and the agreed capability works as defined.</li>
      </ul>
    </article>
  `;
}

/* -------------------------------------------------------
   Business / Process BRD
------------------------------------------------------- */

function generateProcessBRD(req) {
  $('#brd-content').innerHTML = `
    <article class="brd-section">
      <h3>1. Business objective</h3>
      <p>
        Establish or improve a business process that addresses:
        <strong>${escapeHtml(req)}</strong>.
      </p>
    </article>

    <article class="brd-section">
      <h3>2. Problem statement</h3>
      <p>
        ${valueOrAssumption(
          'problem',
          'The current business problem and its impact require confirmation.'
        )}
      </p>
    </article>

    <article class="brd-section">
      <h3>3. Stakeholders & users</h3>
      <p>
        ${valueOrAssumption(
          'users',
          'Affected business users and process participants must be identified.'
        )}
      </p>
    </article>

    <article class="brd-section">
      <h3>4. Current & future state</h3>
      <ul>
        <li>
          <strong>Current state:</strong>
          ${valueOrAssumption(
            'current',
            'Current workflow has not yet been documented.'
          )}
        </li>
        <li>
          <strong>Desired outcome:</strong>
          ${valueOrAssumption(
            'outcome',
            'Desired future state requires confirmation.'
          )}
        </li>
      </ul>
    </article>

    <article class="brd-section">
      <h3>5. Scope</h3>
      <p>
        ${valueOrAssumption(
          'scope',
          'Process boundaries have not yet been confirmed.'
        )}
      </p>
    </article>

    <article class="brd-section">
      <h3>6. Success criteria</h3>
      <p>
        ${valueOrAssumption(
          'success',
          'Success measures must be agreed with stakeholders.'
        )}
      </p>
    </article>

    <article class="brd-section">
      <h3>7. Assumptions & risks</h3>
      <ul>
        <li><strong>Assumptions:</strong> Unconfirmed items are explicitly identified above.</li>
        <li><strong>Risk:</strong> An incomplete understanding of the current process may result in gaps in the future-state design.</li>
      </ul>
    </article>
  `;
}

/* -------------------------------------------------------
   Planning BRD
------------------------------------------------------- */

function generatePlanningBRD(req) {
  $('#brd-content').innerHTML = `
    <article class="brd-section">
      <h3>1. Desired outcome</h3>
      <p>
        <strong>${escapeHtml(req)}</strong>
      </p>
      <p>
        ${valueOrAssumption(
          'outcome',
          'The desired experience or outcome should be confirmed.'
        )}
      </p>
    </article>

    <article class="brd-section">
      <h3>2. Participants</h3>
      <p>
        ${valueOrAssumption(
          'participants',
          'Participants and their needs should be confirmed.'
        )}
      </p>
    </article>

    <article class="brd-section">
      <h3>3. Fixed constraints</h3>
      <p>
        ${valueOrAssumption(
          'constraints',
          'Dates, reservations, budget, transportation, and other fixed constraints have not yet been fully defined.'
        )}
      </p>
    </article>

    <article class="brd-section">
      <h3>4. Preferences & priorities</h3>
      <p>
        ${valueOrAssumption(
          'preferences',
          'Preferences and priorities are still to be confirmed.'
        )}
      </p>
    </article>

    <article class="brd-section">
      <h3>5. Required vs. optional scope</h3>
      <p>
        ${valueOrAssumption(
          'scope',
          'Required and optional elements have not yet been fully defined.'
        )}
      </p>
    </article>

    <article class="brd-section">
      <h3>6. Open decisions</h3>
      <p>
        ${valueOrAssumption(
          'undecided',
          'No additional open decisions have been identified.'
        )}
      </p>
    </article>

    <article class="brd-section">
      <h3>7. Assumptions & validation</h3>
      <ul>
        <li><strong>Assumptions:</strong> Items marked above should be confirmed before the plan is considered final.</li>
        <li><strong>Validation:</strong> Confirm that the resulting plan satisfies the fixed constraints and required outcomes.</li>
      </ul>
    </article>
  `;
}

/* -------------------------------------------------------
   Informational request
------------------------------------------------------- */

function generateInformationalBRD(req) {
  $('#brd-content').innerHTML = `
    <article class="brd-section">
      <h3>1. Objective</h3>
      <p>
        <strong>${escapeHtml(req)}</strong>
      </p>
      <p>
        ${valueOrAssumption(
          'objective',
          'The specific information objective should be confirmed.'
        )}
      </p>
    </article>

    <article class="brd-section">
      <h3>2. Context</h3>
      <p>
        ${valueOrAssumption(
          'context',
          'Additional context has not been provided.'
        )}
      </p>
    </article>

    <article class="brd-section">
      <h3>3. Constraints</h3>
      <p>
        ${valueOrAssumption(
          'constraints',
          'No specific constraints have been provided.'
        )}
      </p>
    </article>
  `;
}

/* -------------------------------------------------------
   Other request
------------------------------------------------------- */

function generateOtherBRD(req) {
  $('#brd-content').innerHTML = `
    <article class="brd-section">
      <h3>1. Objective</h3>
      <p>
        <strong>${escapeHtml(req)}</strong>
      </p>
      <p>
        ${valueOrAssumption(
          'objective',
          'The primary objective requires confirmation.'
        )}
      </p>
    </article>

    <article class="brd-section">
      <h3>2. Scope</h3>
      <p>
        ${valueOrAssumption(
          'scope',
          'Scope boundaries have not yet been confirmed.'
        )}
      </p>
    </article>

    <article class="brd-section">
      <h3>3. Constraints</h3>
      <p>
        ${valueOrAssumption(
          'constraints',
          'No specific constraints have been provided.'
        )}
      </p>
    </article>

    <article class="brd-section">
      <h3>4. Success criteria</h3>
      <p>
        ${valueOrAssumption(
          'success',
          'Success criteria should be confirmed with the requester.'
        )}
      </p>
    </article>
  `;
}

/* -------------------------------------------------------
   Utilities
------------------------------------------------------- */

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function showToast(message) {
  const toast = $('#toast');
  toast.textContent = message;
  toast.classList.add('show');

  setTimeout(() => {
    toast.classList.remove('show');
  }, 2600);
}

/* -------------------------------------------------------
   Event handlers
------------------------------------------------------- */

$('#requirement').addEventListener('input', (event) => {
  $('#char-count').textContent =
    `${event.target.value.length} / 1,000`;
});

$('#sample-btn').addEventListener('click', () => {
  $('#requirement').value = sampleRequirement;
  $('#requirement').dispatchEvent(new Event('input'));
  $('#requirement').focus();
});

$('#analyze-btn').addEventListener('click', analyzeRequirement);

$('#back-btn').addEventListener('click', () => {
  setStep(1);
});

$('#next-question-btn').addEventListener('click', () => {
  const question = state.questions[state.currentQuestionIndex];
  const response = $('#current-answer').value.trim();

  if (!response) {
    showToast('Please provide an answer, or enter "Not decided".');
    $('#current-answer').focus();
    return;
  }

  state.answers[question.id] = response;

  $('#conversation-list').innerHTML += `
    <div class="conversation-answer">
      ${escapeHtml(response)}
    </div>
  `;

  state.currentQuestionIndex += 1;

  showNextQuestion();
});

$('#generate-btn').addEventListener('click', generateBRD);

$('#restart-btn').addEventListener('click', () => {
  $('#requirement').value = '';
  $('#requirement').dispatchEvent(new Event('input'));

  state.answers = {};
  state.questions = [];
  state.requirement = '';
  state.requestType = '';

  setStep(1);
});

$('#copy-btn').addEventListener('click', async () => {
  const text = $('#brd-content').innerText;

  try {
    await navigator.clipboard.writeText(
      `${$('#brd-title').innerText}\n\n${text}`
    );

    showToast('BRD copied to clipboard.');
  } catch {
    showToast('Select the BRD text to copy it.');
  }
});
