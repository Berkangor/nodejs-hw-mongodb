export const ctrlWrapper = (ctrl) => (req, res, next) =>
  Promise.resolve(ctrl(req, res, next)).catch(next);
