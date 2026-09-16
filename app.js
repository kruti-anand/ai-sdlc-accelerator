```javascript
const sampleRequirement = 'We need to add MFA authentication for external users.';

const state = {
  requirement: '',
  requestType: '',
  questions: [],
  answers: {}
};

const $ = (selector) => document.querySelector(selector);

/*
 * ------------------------------------------------------------
 * Request Type Classification
 * ------------------------------------------------------------
 *
 * This is intentionally lightweight for the prototype.
 * In a production version, this logic can be replaced with
 * an LLM/API call using prompts/brd.prompt.md.
 */

function classifyRequest(value) {
  const lower = value.toLowerCase();

  const softwareSignals = [
    'build',
    'develop',
    'implement',
    'application',
    'app',
    'system',
    'software',
    'feature',
    'dashboard',
    'api',
    'integration',
    'integrate',
    'automation',
    'automate',
    'database',
    'authentication',
    'mfa',
    'login',
    'portal',
    'platform',
    'workflow system',
    'notification system'
  ];

  const processSignals = [
    'process',
    'workflow',
    'procedure',
    'policy',
    'operating model',
    'business process',
    'onboarding process',
    'approval process',
    'intake process',
    'governance'
  ];

  const planningSignals = [
    'plan',
    'planning',
    'trip',
    'travel',
    'itinerary',
    'schedule',
    'organize',
    'prepare',
    'event',
    'vacation',
    'visit',
    'agenda',
    'road trip',
    'tour',
    'recommend'
  ];

  const informationalSignals = [
    'what is',
    'how does',
    'explain',
    'tell me about',
    'information about',
    'research',
    'compare',
    'comparison',
    'why does',
    'how do i'
  ];

  if (softwareSignals.some(signal => lower.includes(signal))) {
    return 'Software/System Implementation';
  }

  if (processSignals.some(signal => lower.includes(signal))) {
    return 'Business/Process Requirement';
  }

  if (planningSignals.some(signal => lower.includes(signal))) {
    return 'Planning/Request for an Outcome';
  }

  if (informationalSignals.some(signal => lower.includes(signal))) {
    return 'Informational Request';
  }

  return 'Other';
}


/*
 * ------------------------------------------------------------
 * Clarification Question Sets
 * ------------------------------------------------------------
 */

const questionSets = {

  software: [
    {
      id: 'users',
      label: 'Who are the primary users, and who is included or excluded?',
      placeholder: 'e.g. External customers and partners; employees are excluded'
    },
    {
      id: 'outcome',
      label: 'What business outcome or problem should this solution address?',
      placeholder: 'e.g. Reduce failed login attempts and improve account security'
    },
    {
      id: 'scope',
      lab
```
