import { CHART_COLORS } from '../../data/wardMetricsUtils';

export const DONUT_PALETTE = [
  CHART_COLORS.teal,
  CHART_COLORS.sky,
  CHART_COLORS.violet,
  CHART_COLORS.amber,
  CHART_COLORS.emerald,
  CHART_COLORS.slate,
];

export const axisTickStyle = { fontSize: 10, fill: CHART_COLORS.slate };
export const gridStroke = '#e2e8f0';
export const tooltipStyle = {
  contentStyle: {
    borderRadius: 8,
    border: '1px solid #e2e8f0',
    fontSize: 12,
  },
};
