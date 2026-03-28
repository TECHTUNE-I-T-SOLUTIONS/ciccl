export const PROJECT_TYPES = [
  'Cost Estimation & Quantity Surveying',
  'Project Planning & Scheduling',
  'Project Controls',
  'Contract Administration',
  'Construction Supervision',
  'Civil Works & Infrastructure Construction',
  'Procurement & Materials Management',
  'Site Investigation & Geotechnical Engineering',
  'Structural Design & Engineering',
  'Health, Safety & Environment (HSE) Management',
  'Quality Assurance & Quality Control (QA/QC)',
  'Value Engineering',
  'Risk Management & Claims',
  'Feasibility Studies',
  'Project Management Consultancy (PMC)',
  'Commissioning & Handover',
  'Tendering & Bid Management',
  'Construction Monitoring & Reporting',
  'Asset Management & Maintenance Planning',
  'Temporary Works Design',
  'Other',
] as const;

export type ProjectType = (typeof PROJECT_TYPES)[number];

export default PROJECT_TYPES;
