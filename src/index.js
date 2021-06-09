import { createGraph, fetchAndNormalizeCommits, renderCommits } from './logic';

window.renderGitgraph = () => {
  const container = document.getElementById('Gitgraph-container');

  if (!container) {
    return null;
  }

  const graphElement = document.createElement('div');
  graphElement.id = 'graph';
  container.appendChild(graphElement);

  window.addEventListener('project-ready', ({ detail: project }) =>
    fetchAndRenderGraph(project)
  );

  const gitgraph = createGraph(graphElement);

  async function fetchAndRenderGraph(projectParams) {
    renderCommits(gitgraph, await fetchAndNormalizeCommits(projectParams));
  }
};

if (!document.getElementById('Gitgraph-container')) {
  window.renderGitgraph('gitgraph');
}
