const methodNotAllowed = require('../middlewares/methodNotAllowed');


module.exports = function add405ForRouter(appOrRouter, paths, allowed = ['GET','OPTIONS']) {
  const guard = methodNotAllowed(allowed);

  paths.forEach((path) => {
    
    appOrRouter.options(path, (req, res) => {
      res.set('Allow', allowed.join(', '));
      res.sendStatus(204);
    });
    
    ['post','put','patch','delete'].forEach((m) => {
      appOrRouter[m](path, guard);
    });
  });
};
