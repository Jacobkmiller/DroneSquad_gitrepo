var mongoose = require('mongoose');

var User = mongoose.model('User');
var Group = mongoose.model('Group');
var Meetup = mongoose.model('Meetup');

module.exports = {

  getLoggedUser: function(req, res){
    console.log(req.session.user);
    res.json(req.session.user);
  },

  register: function(req,res){
		var user = new User(req.body);
		user.save(function(err){
			if (err){
        console.log(err);
				res.status(500).send("Users did not save");
			}
      else{
        console.log(user);
  			req.session.user = req.body;
        res.sendStatus(200);
			}
		});
	},

	login: function (req, res) {
    console.log(req.body);
		User.findOne({email: req.body.email}).exec(function (err, user) {
      if(user == null){
        console.log("login failed");
        res.status(400).send("Login Failed")
      }
			else if(req.body.password == user.password){
        console.log("login successful");
				req.session.user = user;
        console.log(req.session.user);
				res.sendStatus(200);
			}
		})
	},

  logout: function (req, res) {
    console.log("Logged out the user");
    req.session.destroy();
    res.redirect('/');
  },

  getUsers: function(req, res){
    User.find({}).exec(function(err, users){
      if(err){
        res.status(500).send('There was a problem retrieving all users')
      }
      else{
        res.json(users);
      }
    })
  },

  getGroups: function(req, res){
    Group.find({}).exec(function(err, groups){
      if(err){
        res.status(500).send('There was a problem retrieving all groups.')
      }
      else{
        res.json(groups);
      }
    })
  },

  createGroup: function (req, res) {
    var group = new Group(req.body);
    group._organizers.push(req.session.user._id);
    group.save(function(err){
      if (err){
        res.status(500).send("Group did not save");
      }
      else{
        console.log(group);
        res.sendStatus(200);
      }
    });
  },
  getGroup: function (req, res) {
    Group.findOne({_id:req.params.id}, function(err, group){
      if (err){
        res.status(500).send("Had trouble finding group");
      }
      else{
        res.json(group);
      }
    });
  },

  addMeetup: function (req, res) {
    var meetup = new Meetup(req.body);
    meetup._group = req.params.id;
    meetup.save(function(err){
      if (err){
        console.log(err);
        res.status(500).send("New Meetup did not save"+err);
      }
      else{
        console.log(meetup);
        res.sendStatus(200);
      }
    });
  },

  getMeetups: function (req, res) {
    Meetup.find({_group: req.params.id}, function(err, meetups){
      if (err){
        res.status(500).send("Had trouble finding meetups");
      }
      else{
        res.json(meetups);
      }
    });
  },

  getAllMeetups: function(req, res){
    Meetup.find({}).populate("_group").exec(function(err, meetups){
      if(err){
        res.status(500).send('There was a problem retrieving all meetups.')
      }
      else{
        res.json(meetups);
      }
    })
  },

  joinGroup: function (req, res) {
    console.log('**************'+req.body);
    Group.findOne({_id:req.body}, function (err, group){
      if(err){
        res.status(500).send("Had trouble finding group")
      } else{
        Group._members.push(req.session.user._id);
        Group.save(function(err) {
          if(err){
            res.status(500).send("did not join group")
          } else{
            res.sendStatus(200);
            }
          })
        }
      });
    }
}
