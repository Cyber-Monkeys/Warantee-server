var firebase = require('firebase');
module.exports = {
  isAuthenticated: function (req, res, next) {
    var user = firebase.auth().currentUser;
    if (user !== null) {
    	console.log("authentication successful");
     	req.user = user;
     	next();
    } else {
    	console.log("authentication failed");
     	res.redirect('/login');
    }
  },
}