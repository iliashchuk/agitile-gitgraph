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
  // renderCommits(gitgraph, await fetchAndNormalizeCommits(project));
  // refetchAndRenderGraph(project);

  setInterval(() => refetchAndRenderGraph(project), 10000);

  async function refetchAndRenderGraph(projectParams) {
    const commits = await fetchAndNormalizeCommits(projectParams);

    const finishMergeBranches = ['main', 'development', 'dev'];
    const mergedTaskBranches = commits
      .filter(
        ({ mergeInto, branch }) =>
          finishMergeBranches.includes(mergeInto) &&
          !finishMergeBranches.includes(branch)
      )
      .map(({ branch }) => branch);

    console.log(mergedTaskBranches);

    if (mergedTaskBranches.length !== 0) {
      dispatchMergeEvent(mergedTaskBranches);
    }

    console.log(commits);
    renderCommits(gitgraph, commits);
  }
};

if (!document.getElementById('Gitgraph-container')) {
  window.renderGitgraph('gitgraph');
}
