// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
  if (req.session.userId) {
    next();
  } else {
    req.flash('error', 'Please log in to continue');
    res.redirect('/login');
  }
};

// Middleware to check if user has admin or product manager role
const isAdminOrProductManager = (req, res, next) => {
  if (req.session.user && 
      (req.session.user.role === 'admin' || req.session.user.role === 'product_manager')) {
    next();
  } else {
    req.flash('error', 'You do not have permission to access this area');
    res.redirect('/shop');
  }
};

// Middleware to check if user is admin only
const isAdmin = (req, res, next) => {
  if (req.session.user && req.session.user.role === 'admin') {
    next();
  } else {
    req.flash('error', 'Admin access required');
    res.redirect('/shop');
  }
};

// Middleware to check specific permissions
const hasPermission = (permission) => {
  return (req, res, next) => {
    if (req.session.user && 
        (req.session.user.permissions?.includes(permission) || req.session.user.role === 'admin')) {
      next();
    } else {
      req.flash('error', 'You do not have permission to perform this action');
      res.redirect('/shop');
    }
  };
};

module.exports = {
  isAuthenticated,
  isAdminOrProductManager,
  isAdmin,
  hasPermission
};