import { formatRequestDate } from './date-formatter.util'
describe('DateFormatter', () => {
  it('formatRequestDate formata data', () => {
    expect(formatRequestDate(new Date(2024, 3, 1))).toBeTruthy();
  });
});
