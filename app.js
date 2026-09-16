const sampleRequirement = 'We need to add MFA authentication for external users.';
const state = { requirement: '', questions: [], answers: {} };
const $ = (selector) => document.querySelector(selector);

const baseQuestions = [
  { id:'users', label:'Who are the external users, and which users are included or excluded?', placeholder:'e.g. Customers and partners; employees are excluded' },
  { id:'method', label:'Which authentication methods should be supported?', placeholder:'e.g. Authenticator app, SMS fallback, or undecided' },
  { id:'identity', label:'What existing identity provider or authentication system must this integrate with?', placeholder:'e.g. Okta, Azure AD B2C, or no existing provider' },
  { id:'success', label:'How will success be measured, and are there security or compliance requirements?', placeholder:'e.g. 95% enrollment in 30 days; SOC 2 controls apply' },
  { id:'scope', label:'What is explicitly in scope for the first release, and what is out of scope?', placeholder:'e.g. Web login only; mobile and account recovery later' }
];

function setStep(step) {
  document.querySelectorAll('.step-panel').forEach((panel, index) => { panel.hidden = index + 1 !== step; panel.classList.toggle('active-panel', index + 1 === step); });
  document.querySelectorAll('.step').forEach((item, index) => { item.classList.toggle('active', index + 1 === step); item.classList.toggle('done', index + 1 < step); });
  $('#progress-fill').style.width = `${(step - 1) * 50}%`;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function analyzeRequirement() {
  const value = $('#requirement').value.trim();
  if (!value) { showToast('Add a business requirement to begin.'); $('#requirement').focus(); return; }
  state.requirement = value;
  state.questions = [...baseQuestions];
  const lower = value.toLowerCase();
  if (!lower.includes('api') && !lower.includes('integrat')) state.questions.push({ id:'dependencies', label:'Which systems, APIs, teams, or vendors could this depend on?', placeholder:'e.g. Customer portal, security team, identity vendor' });
  $('#analysis-summary').textContent = `I found a clear direction in your requirement, but ${state.questions.length} decisions need stakeholder input before a reliable BRD can be drafted.`;
  $('#known-text').textContent = value;
  $('#attention-text').textContent = 'Users, solution boundaries, dependencies, and measurable outcomes are not yet defined.';
  $('#question-count').textContent = `${state.questions.length} questions`;
  $('#questions-list').innerHTML = state.questions.map((question, index) => `<div class="question"><label for="${question.id}"><span class="question-index">${String(index + 1).padStart(2, '0')}</span>${question.label}</label><input id="${question.id}" data-question="${question.id}" placeholder="${question.placeholder}" /></div>`).join('');
  setStep(2);
}

function answer(id) { const element = document.querySelector(`[data-question="${id}"]`); return element ? element.value.trim() : ''; }
function valueOrAssumption(id, fallback) { return state.answers[id] || `<span class="tag">Assumption</span> ${fallback}`; }

function generateBRD() {
  state.questions.forEach(q => { state.answers[q.id] = answer(q.id); });
  const req = state.requirement;
  $('#brd-title').textContent = `BRD · ${req.length > 58 ? `${req.slice(0, 58)}…` : req}`;
  $('#brd-subtitle').textContent = `Draft generated ${new Date().toLocaleDateString(undefined, { month:'short', day:'numeric', year:'numeric' })} · Validate assumptions before approval`;
  $('#brd-content').innerHTML = `
    <article class="brd-section"><h3>1. Business objective</h3><p>Enable the organization to deliver the requested capability: <strong>${escapeHtml(req)}</strong>. The outcome is to address the stated business need while making open decisions visible to stakeholders.</p></article>
    <article class="brd-section"><h3>2. Problem statement</h3><p>Users and stakeholders need a defined, dependable way to achieve the requested outcome. The current process, baseline pain point, and impact of not changing remain to be confirmed.</p></article>
    <article class="brd-section"><h3>3. Scope</h3><ul><li>Define and deliver the capability described in the approved requirement.</li><li>Confirm the first-release user population: ${valueOrAssumption('users','External users are in scope.')}</li><li>Confirm first-release boundaries: ${valueOrAssumption('scope','Release scope is limited to the primary user journey.')}</li></ul></article>
    <article class="brd-section"><h3>4. Functional requirements</h3><ul><li>The solution must support the approved user population and primary journey.</li><li>The solution must provide the agreed capability and user feedback for success or failure.</li><li>The solution must integrate with the approved identity/system landscape: ${valueOrAssumption('identity','An existing system or provider will be used.')}</li><li>The selected approach must support the agreed methods: ${valueOrAssumption('method','Authentication or interaction method is still to be selected.')}</li></ul></article>
    <article class="brd-section"><h3>5. Non-functional requirements</h3><ul><li>Security, privacy, availability, accessibility, and performance targets must be agreed before implementation.</li><li>Compliance requirements and evidence expectations: ${valueOrAssumption('success','No specific regulatory requirement has been provided.')}</li></ul></article>
    <article class="brd-section"><h3>6. Stakeholders & dependencies</h3><p>Product owner, business analyst, engineering, QA, security, and affected business users should participate in review. Cross-team and vendor dependencies: ${valueOrAssumption('dependencies','Dependencies have not yet been identified.')}</p></article>
    <article class="brd-section"><h3>7. Assumptions, risks & acceptance criteria</h3><ul><li><strong>Assumptions:</strong> Items marked above must be confirmed; no enterprise-specific facts were invented.</li><li><strong>Risk:</strong> Unresolved identity, security, or scope decisions may change cost, timeline, and design.</li><li><strong>Acceptance:</strong> Stakeholders approve scope; the agreed user journey works end to end; agreed security and success measures are demonstrably met.</li></ul></article>`;
  setStep(3);
}

function escapeHtml(text) { const div = document.createElement('div'); div.textContent = text; return div.innerHTML; }
function showToast(message) { const toast = $('#toast'); toast.textContent = message; toast.classList.add('show'); setTimeout(() => toast.classList.remove('show'), 2600); }

$('#requirement').addEventListener('input', (event) => { $('#char-count').textContent = `${event.target.value.length} / 1,000`; });
$('#sample-btn').addEventListener('click', () => { $('#requirement').value = sampleRequirement; $('#requirement').dispatchEvent(new Event('input')); $('#requirement').focus(); });
$('#analyze-btn').addEventListener('click', analyzeRequirement);
$('#back-btn').addEventListener('click', () => setStep(1));
$('#generate-btn').addEventListener('click', generateBRD);
$('#restart-btn').addEventListener('click', () => { $('#requirement').value = ''; $('#requirement').dispatchEvent(new Event('input')); state.answers = {}; setStep(1); });
$('#copy-btn').addEventListener('click', async () => { const text = $('#brd-content').innerText; try { await navigator.clipboard.writeText(`${$('#brd-title').innerText}\n\n${text}`); showToast('BRD copied to clipboard.'); } catch { showToast('Select the BRD text to copy it.'); } });
