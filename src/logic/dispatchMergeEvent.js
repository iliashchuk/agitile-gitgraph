export const dispatchMergeEvent = (branches) => {
  const mergeEvent = new CustomEvent('merge', {
    detail: branches,
  });
  window.dispatchEvent(mergeEvent);
};
