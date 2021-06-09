import { createGraph, fetchAndNormalizeCommits, renderCommits } from './logic';

window.renderGitgraph = () => {
  const container = document.getElementById('Gitgraph-container');

  const locationParams = window.location.pathname
    .split('/')
    .filter((param) => param);
  const project = {
    owner: locationParams[0],
    repo: locationParams[1],
  };

  if (!container || !project) {
    return null;
  }

  const graphElement = document.createElement('div');
  graphElement.id = 'graph';
  container.appendChild(graphElement);

  // window.addEventListener('project-ready', ({ detail: project }) => {
  //   console.log('event?', project);
  //   fetchAndRenderGraph(project);
  // });

  const gitgraph = createGraph(graphElement);
  fetchAndRenderGraph(project);

  setInterval(() => fetchAndRenderGraph(project), 1000);

  async function fetchAndRenderGraph(projectParams) {
    renderCommits(gitgraph, await fetchAndNormalizeCommits(projectParams));
  }
};

if (!document.getElementById('Gitgraph-container')) {
  window.renderGitgraph('gitgraph');
}
