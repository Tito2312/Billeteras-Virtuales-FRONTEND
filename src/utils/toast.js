const dispatch = (msg, type) => {
  window.dispatchEvent(new CustomEvent('app-toast', { detail: { msg, type } }));
};

export const toast = {
  success: (msg) => dispatch(msg, 'success'),
  error: (msg) => dispatch(msg, 'error'),
  info: (msg) => dispatch(msg, 'info'),
};
