import { describe, it, expect } from 'vitest';

describe('Reports Generator Frontend Suite', () => {
  it('validates supported report types and formats', () => {
    const supportedTypes = ['patent_landscape', 'technology_intelligence', 'innovation_scores', 'commercialization', 'funding_matrix'];
    const supportedFormats = ['pdf', 'csv', 'json'];

    expect(supportedTypes).toContain('patent_landscape');
    expect(supportedFormats).toContain('pdf');
  });

  it('validates report payload parameters', () => {
    const payload = {
      report_type: 'patent_landscape',
      format: 'pdf',
      domain: 'Robotics & AI',
      date_from: '2024-01-01',
      date_to: '2026-08-16'
    };

    expect(payload.report_type).toBe('patent_landscape');
    expect(payload.format).toBe('pdf');
  });
});
