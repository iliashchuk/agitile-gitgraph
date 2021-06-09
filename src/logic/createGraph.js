import { createGitgraph, templateExtend, TemplateName } from '@gitgraph/js';

var withoutHash = templateExtend(TemplateName.Metro, {
  commit: {
    message: {
      displayHash: false,
      displayAuthor: false,
      font: '1em Arial, sans-serif',
    },
    spacing: 40,
    dot: {
      size: 8,
    },
  },
  tag: {
    font: '1em Arial, sans-serif',
  },
  branch: {
    label: { font: '1em Arial, sans-serif' },
    spacing: 20,
    lineWidth: 6,
  },
});

export const createGraph = (graphElement) => {
  return createGitgraph(graphElement, { template: withoutHash });
};
