import {
  createGraph,
  fetchAndNormalizeCommits,
  renderCommits,
  dispatchMergeEvent,
} from './logic';

window.renderGitgraph = async () => {
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

  // TODO: rewrite to handle adequately in standalone mode
  setTimeout(() => fetchAndRenderGraph(project), 2000);

  setInterval(() => fetchAndRenderGraph(project), 5000);

  async function fetchAndRenderGraph(projectParams) {
    const { commits, newCommits } = await fetchAndNormalizeCommits(
      projectParams
    );

    const finishMergeBranches = ['main', 'development', 'dev'];
    const mergedTaskBranches = newCommits
      .filter(
        ({ mergeInto, branch }) =>
          finishMergeBranches.includes(mergeInto) &&
          !finishMergeBranches.includes(branch)
      )
      .map(({ branch }) => branch);

    if (mergedTaskBranches.length !== 0) {
      dispatchMergeEvent(mergedTaskBranches);
    }

    renderCommits(gitgraph, commits);
  }
};

if (!document.getElementById('Gitgraph-container')) {
  window.renderGitgraph('gitgraph');
}
