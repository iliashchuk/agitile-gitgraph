export const renderCommits = (gitgraph, sortedCommits) => {
  gitgraph.clear();

  const graphBranches = {};

  for (const commitMeta of sortedCommits) {
    const { commit, branch, isMerge, mergedParentSha } = commitMeta;
    let graphBranch = graphBranches[branch];

    if (!graphBranch) {
      graphBranches[branch] = gitgraph.branch(branch);
      graphBranch = graphBranches[branch];
    }

    if (isMerge && mergedParentSha) {
      let mergedBranch;
      for (const commit of sortedCommits) {
        if (commit.sha === mergedParentSha) {
          mergedBranch = commit.branch;
        }
      }

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
