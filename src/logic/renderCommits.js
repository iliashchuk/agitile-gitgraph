export const renderCommits = (gitgraph, sortedCommits) => {
  gitgraph.clear();

  const graphBranches = {};

  for (const commitMeta of sortedCommits) {
    const { commit, branch, isMerge, mergedBranch } = commitMeta;
    let graphBranch = graphBranches[branch];

    if (!graphBranch) {
      graphBranches[branch] = gitgraph.branch(branch);
      graphBranch = graphBranches[branch];
    }

    if (isMerge && mergedBranch) {
      graphBranch.merge(graphBranches[mergedBranch], commit.message);
      continue;
    }

    graphBranch.commit(commit.message);
    // const { mergeInto } = commitMeta;

    // if (mergeInto) {
    //   console.log(mergeInto, commitMeta.commit.message);
    //   graphBranches[mergeInto].merge({ branch: graphBranch });
    // }
  }
};
