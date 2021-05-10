import { Octokit } from '@octokit/rest';
import { createGitgraph, templateExtend, TemplateName } from '@gitgraph/js';

const octo = new Octokit();

(async function () {
  const repoParams = {
    owner: 'iliashchuk',
    repo: 'agitile-kanban',
  };
  const graphContainer = document.getElementById('gitgraph');

  if (!graphContainer) {
    return;
  }

  var withoutHash = templateExtend(TemplateName.Metro, {
    commit: {
      message: {
        displayHash: false,
        displayAuthor: false,
      },
    },
  });
  const gitgraph = createGitgraph(graphContainer, { template: withoutHash });
  const graphBranches = {};

  const { data: branches } = await octo.rest.repos.listBranches(repoParams);

  const branchCommitsDictionary = {};
  const uniqueCommits = new Set();

  for (const branch of branches) {
    const { data: branchCommits } = await octo.rest.repos.listCommits({
      ...repoParams,
      sha: branch.name,
    });

    const commitDict = branchCommits.reduce((dict, commit) => {
      dict[commit.sha] = commit;
      return dict;
    }, {});

    commitDict.head = branchCommits[0];

    branchCommitsDictionary[branch.name] = commitDict;
  }

  const getUniqueBranchCommints = (branchName, commitDict) => {
    const uniqueBranchCommits = [];
    function populateBranchCommits(commit) {
      if (!commit) {
        return;
      }

      const { parents } = commit;

      if (parents.length === 1) {
        populateBranchCommits(commitDict[parents[0].sha]);
      }

      // merge commits start
      if (parents.length === 2) {
        const parentsOnOtherBranches = [];
        let ownParent;
        for (const parent of parents) {
          for (const branchKey in branchCommitsDictionary) {
            if (branchKey === branchName) {
              continue;
            }
            const parentOnOtherBranch =
              branchCommitsDictionary[branchKey][parent.sha];

            if (parentOnOtherBranch) {
              parentOnOtherBranch.mergeInto = branchName;
              if (
                !parentsOnOtherBranches.find(
                  ({ sha }) => sha === parentOnOtherBranch.sha
                )
              ) {
                parentsOnOtherBranches.push(parentOnOtherBranch);
              }
            }
            ownParent = commitDict[parent.sha];
          }
        }

        if (parentsOnOtherBranches.length === 2) {
          commit.isMerge = true;
          const commitADate = new Date(
            parentsOnOtherBranches[0].commit.committer.date
          );
          const commitBDate = new Date(
            parentsOnOtherBranches[1].commit.committer.date
          );
          let olderParent;
          let newerParent;
          if (commitADate - commitBDate < 0) {
            olderParent = parentsOnOtherBranches[0];
            newerParent = parentsOnOtherBranches[1];
          } else {
            olderParent = parentsOnOtherBranches[1];
            newerParent = parentsOnOtherBranches[0];
          }

          ownParent = olderParent;
          commit.mergedParentSha = newerParent.sha;
        }

        if (parentsOnOtherBranches.length === 1) {
          commit.mergedParentSha = parentsOnOtherBranches[0].sha;
        }

        // might require a check?
        populateBranchCommits(ownParent);
      }
      // merge commits end

      if (!uniqueCommits.has(commit.sha)) {
        uniqueCommits.add(commit.sha);
        uniqueBranchCommits.push({
          ...commit,
          branch: branchName,
        });
      }
      // else {
      //   commits.find(({ sha }) => sha === commit.sha).mergeInto = branchName;
      //   return;
      // }

      return;
    }
    populateBranchCommits(commitDict.head);

    return uniqueBranchCommits;
  };

  const commits = [];
  for (const branch of branches.sort((branchA) =>
    branchA.name !== 'main' && branchA.name !== 'master' ? 1 : -1
  )) {
    const commitDict = branchCommitsDictionary[branch.name];

    commits.push(...getUniqueBranchCommints(branch.name, commitDict));
  }

  const sorterdCommits = commits.sort((commitA, commitB) => {
    const ADate = new Date(commitA.commit.committer.date);
    const BDate = new Date(commitB.commit.committer.date);

    return ADate - BDate;
  });

  for (const commitMeta of sorterdCommits) {
    const { commit, branch, isMerge, mergedParentSha } = commitMeta;
    let graphBranch = graphBranches[branch];

    if (!graphBranch) {
      graphBranches[branch] = gitgraph.branch(branch);
      graphBranch = graphBranches[branch];
    }

    if (isMerge && mergedParentSha) {
      let mergedBranch;
      for (const commit of sorterdCommits) {
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
})();
