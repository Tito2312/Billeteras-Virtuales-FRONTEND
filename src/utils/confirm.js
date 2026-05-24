export const appConfirm = (message, title = '¿Confirmar acción?') => {
  return new Promise((resolve) => {
    window.dispatchEvent(new CustomEvent('app-confirm', {
      detail: { message, title, resolve },
    }));
  });
};
