import { Question } from '@/types/question';
import { Policy } from '@/types/policy';
import { Parameter } from '@/types/parameter';

export const SEED_QUESTIONS: Question[] = [
  // ── Uber Release ──
  {
    id: 'q_driver_worked',
    label: 'Did the driver work?',
    type: 'boolean',
  },
  {
    id: 'q_missed_stop',
    label: 'Did the driver miss a stop?',
    type: 'boolean',
  },
  {
    id: 'q_vehicle_condition',
    label: 'What is the vehicle condition?',
    type: 'select',
    options: ['Good', 'Fair', 'Poor', 'Critical'],
  },
  {
    id: 'q_incidents_count',
    label: 'Number of incidents reported',
    type: 'number',
  },
  {
    id: 'q_notes',
    label: 'Additional notes',
    type: 'text',
  },

  // ── Credit Approval ──
  {
    id: 'q_monthly_income',
    label: 'Monthly income (R$)',
    type: 'number',
  },
  {
    id: 'q_credit_score',
    label: 'Credit score (0-1000)',
    type: 'number',
  },
  {
    id: 'q_has_property',
    label: 'Does the applicant own property?',
    type: 'boolean',
  },
  {
    id: 'q_employment_status',
    label: 'Employment status',
    type: 'select',
    options: ['Employed', 'Self-employed', 'Unemployed', 'Retired'],
  },
  {
    id: 'q_loan_amount',
    label: 'Requested loan amount (R$)',
    type: 'number',
  },

  // ── Medical Triage ──
  {
    id: 'q_temperature',
    label: 'Body temperature (°C)',
    type: 'number',
  },
  {
    id: 'q_chest_pain',
    label: 'Is the patient experiencing chest pain?',
    type: 'boolean',
  },
  {
    id: 'q_conscious',
    label: 'Is the patient conscious?',
    type: 'boolean',
  },
  {
    id: 'q_pain_level',
    label: 'Pain level (1-10)',
    type: 'number',
  },
  {
    id: 'q_main_symptom',
    label: 'Main symptom',
    type: 'select',
    options: ['Fever', 'Headache', 'Fracture', 'Breathing difficulty', 'Abdominal pain', 'Other'],
  },

  // ── Expense Approval ──
  {
    id: 'q_expense_amount',
    label: 'Expense amount (R$)',
    type: 'number',
  },
  {
    id: 'q_expense_category',
    label: 'Expense category',
    type: 'select',
    options: ['Travel', 'Equipment', 'Software', 'Training', 'Office supplies', 'Other'],
  },
  {
    id: 'q_has_receipt',
    label: 'Does the expense have a receipt/invoice?',
    type: 'boolean',
  },
  {
    id: 'q_manager_approved',
    label: 'Has the manager approved this expense?',
    type: 'boolean',
  },
  {
    id: 'q_approver_name',
    label: 'Approver name (manager)',
    type: 'text',
  },
  {
    id: 'q_expense_justification',
    label: 'Justification for the expense',
    type: 'text',
  },
];

export const SEED_PARAMETERS: Parameter[] = [
  { id: 'param_country', name: 'Country', key: 'country', type: 'string', category: 'geo' },
  { id: 'param_state', name: 'State', key: 'state', type: 'string', category: 'geo' },
  { id: 'param_city', name: 'City', key: 'city', type: 'string', category: 'geo' },
  { id: 'param_companyId', name: 'Company ID', key: 'companyId', type: 'string', category: 'org' },
  { id: 'param_department', name: 'Department', key: 'department', type: 'string', category: 'org' },
];

export const SEED_POLICIES: Policy[] = [
  // ── 1. Uber Release ──
  {
    id: 'pol_uber_release_sp',
    key: 'uber-release',
    name: 'Uber Release - SP / EMP_X',
    scope: {
      country: 'BR',
      state: 'SP',
      companyId: 'EMP_X',
    },
    steps: [
      { questionId: 'q_driver_worked' },
      { questionId: 'q_missed_stop' },
      {
        questionId: 'q_vehicle_condition',
        showWhen: {
          questionId: 'q_driver_worked',
          operator: 'eq',
          value: true,
        },
      },
    ],
    decision: {
      rules: [
        {
          when: {
            logic: 'OR',
            conditions: [
              { field: '$answers.q_driver_worked', operator: 'eq', value: false },
              { field: '$answers.q_missed_stop', operator: 'eq', value: true },
            ],
          },
          result: 'BLOCK',
          reason: 'Driver did not work or missed a stop.',
        },
      ],
      defaultResult: 'ALLOW',
      defaultReason: 'All checks passed.',
    },
  },

  // ── 2. Credit Approval ──
  {
    id: 'pol_credit_approval_br',
    key: 'credit-approval',
    name: 'Credit Approval - BANK_A',
    scope: {
      country: 'BR',
      companyId: 'BANK_A',
    },
    steps: [
      { questionId: 'q_employment_status' },
      { questionId: 'q_monthly_income' },
      { questionId: 'q_credit_score' },
      { questionId: 'q_has_property' },
      { questionId: 'q_loan_amount' },
    ],
    decision: {
      rules: [
        {
          when: {
            logic: 'OR',
            conditions: [
              { field: '$answers.q_credit_score', operator: 'lt', value: 400 },
              { field: '$answers.q_employment_status', operator: 'eq', value: 'Unemployed' },
            ],
          },
          result: 'BLOCK',
          reason: 'Credit score below minimum threshold or applicant is unemployed.',
        },
        {
          when: {
            logic: 'AND',
            conditions: [
              { field: '$answers.q_credit_score', operator: 'gte', value: 700 },
              { field: '$answers.q_monthly_income', operator: 'gte', value: 5000 },
            ],
          },
          result: 'ALLOW',
          reason: 'Good credit score and sufficient income. Auto-approved.',
        },
        {
          when: {
            logic: 'AND',
            conditions: [
              { field: '$answers.q_loan_amount', operator: 'gt', value: 50000 },
              { field: '$answers.q_has_property', operator: 'eq', value: false },
            ],
          },
          result: 'BLOCK',
          reason: 'High loan amount without property collateral.',
        },
      ],
      defaultResult: 'REVIEW',
      defaultReason: 'Application requires manual review by credit analyst.',
    },
  },

  // ── 3. Medical Triage ──
  {
    id: 'pol_medical_triage_sp',
    key: 'medical-triage',
    name: 'Emergency Triage - HOSP_A',
    scope: {
      country: 'BR',
      city: 'SAO_PAULO',
      companyId: 'HOSP_A',
    },
    steps: [
      { questionId: 'q_conscious' },
      { questionId: 'q_chest_pain' },
      { questionId: 'q_temperature' },
      { questionId: 'q_pain_level' },
      {
        questionId: 'q_main_symptom',
        showWhen: {
          questionId: 'q_conscious',
          operator: 'eq',
          value: true,
        },
      },
    ],
    decision: {
      rules: [
        {
          when: {
            logic: 'OR',
            conditions: [
              { field: '$answers.q_conscious', operator: 'eq', value: false },
              { field: '$answers.q_chest_pain', operator: 'eq', value: true },
            ],
          },
          result: 'BLOCK',
          reason: 'EMERGENCY: Unconscious patient or chest pain. Immediate intervention required.',
        },
        {
          when: {
            logic: 'OR',
            conditions: [
              { field: '$answers.q_temperature', operator: 'gt', value: 39 },
              { field: '$answers.q_pain_level', operator: 'gte', value: 8 },
              { field: '$answers.q_main_symptom', operator: 'eq', value: 'Breathing difficulty' },
            ],
          },
          result: 'REVIEW',
          reason: 'URGENT: High fever, severe pain, or breathing difficulty. Priority attention needed.',
        },
      ],
      defaultResult: 'ALLOW',
      defaultReason: 'Standard triage: patient placed in normal queue.',
    },
  },

  // ── 4. Expense Approval ──
  {
    id: 'pol_expense_approval_tech',
    key: 'expense-approval',
    name: 'Expense Approval - CORP_X / Technology',
    scope: {
      country: 'BR',
      companyId: 'CORP_X',
      department: 'Technology',
    },
    steps: [
      { questionId: 'q_expense_category' },
      { questionId: 'q_expense_amount' },
      { questionId: 'q_has_receipt' },
      { questionId: 'q_expense_justification' },
      { questionId: 'q_manager_approved' },
      {
        questionId: 'q_approver_name',
        showWhen: {
          questionId: 'q_manager_approved',
          operator: 'eq',
          value: true,
        },
      },
    ],
    decision: {
      rules: [
        {
          when: {
            logic: 'AND',
            conditions: [
              { field: '$answers.q_has_receipt', operator: 'eq', value: false },
            ],
          },
          result: 'BLOCK',
          reason: 'Expense rejected: no receipt/invoice attached.',
        },
        {
          when: {
            logic: 'AND',
            conditions: [
              { field: '$answers.q_expense_amount', operator: 'gt', value: 10000 },
              { field: '$answers.q_manager_approved', operator: 'eq', value: false },
            ],
          },
          result: 'BLOCK',
          reason: 'Expense above R$10,000 requires manager approval.',
        },
        {
          when: {
            logic: 'AND',
            conditions: [
              { field: '$answers.q_expense_amount', operator: 'lte', value: 500 },
              { field: '$answers.q_has_receipt', operator: 'eq', value: true },
            ],
          },
          result: 'ALLOW',
          reason: 'Small expense with receipt. Auto-approved.',
        },
        {
          when: {
            logic: 'AND',
            conditions: [
              { field: '$answers.q_manager_approved', operator: 'eq', value: true },
              { field: '$answers.q_has_receipt', operator: 'eq', value: true },
            ],
          },
          result: 'ALLOW',
          reason: 'Expense approved by manager with receipt attached.',
        },
      ],
      defaultResult: 'REVIEW',
      defaultReason: 'Expense requires review by finance department.',
    },
  },
];
