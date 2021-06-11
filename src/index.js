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

  const gitgraph = createGraph(graphElement);

  // TODO: rewrite to handle adequately in standalone mode
  setTimeout(() => fetchAndRenderGraph(project), 2000);

  setInterval(() => fetchAndRenderGraph(project), 5000);

  // ACTUALLY POLLING IS PERFECTLY FINE!
  async function fetchAndRenderGraph(projectParams) {
    const { commits, newCommits } = await fetchAndNormalizeCommits(
      projectParams
    );
    console.log(newCommits);

    const finishMergeBranches = ['main', 'development', 'dev'];
    const mergedTaskBranches = newCommits
      .filter(
        ({ isMerge, branch }) => isMerge && finishMergeBranches.includes(branch)
      )
      .map(({ mergedBranch }) => mergedBranch);

    if (mergedTaskBranches.length !== 0) {
      dispatchMergeEvent(mergedTaskBranches);
    }

    renderCommits(gitgraph, commits);
  }
};

if (!document.getElementById('Gitgraph-container')) {
  window.renderGitgraph('gitgraph');
}
