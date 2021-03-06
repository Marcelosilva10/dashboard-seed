var controllers = require('../controllers');
var lib = require('../lib');

var connect = require('../../config/connection');
var UserDB = require('../services/user');

module.exports = function(app, passport) {

  //Perfil do usuário - pessoal
  app.get('/profile/', controllers.isLoggedIn, function(req, res) {
    controllers.avatarUser(req, res, req.user, req.user, 'profile');
  });

  //Perfil do usuário - pessoal
  app.get('/profile/edit', controllers.isLoggedIn, function(req, res) {
    controllers.avatarUser(req, res, req.user, req.user, 'profile_edit');
  });
  app.post('/profile/edit', function(req, res) {
    // Update User
    if (!req.body.email) {
      req.flash('error', 'O e-mail não pode ser vazio');
      res.redirect('/profile/edit');
      return;
    }
    UserDB.findByIdAndUpdate(req.user.id, req.body).then(function (user) {
      req.flash('success', 'usuário atualizado');
      console.log('deu certo...');
      res.redirect('/profile/edit');
    }).catch(function(error) {
      req.flash('error', 'Ops, tivemos um problemas em atualizar seu cadastro. ' + error);
      res.send(error);
    });
    console.log(req.body);
  });

  //Editar profile
  app.get('/profile/edit/avatar', controllers.isLoggedIn, function(req,res) {
    controllers.avatarUser(req, res, req.user, req.user, 'profile_edit');
  });
  app.post('/profile/edit/avatar', function(req,res){
    var upload = lib.multer.diskStorage({
      destination: function (req, file, callback) {
        callback(null, 'public/uploads/avatar');
      },
      filename: function (req, file, callback) {
        lib.crypto.pseudoRandomBytes(16, function (err, raw) {
          callback(null, raw.toString('hex') + Date.now());
        });
      }
    });
    var uploader = lib.multer({ storage : upload}).single('avatarEdit');
    uploader(req,res,function(err) {
        if(err) {
          req.flash('error', 'Houve algum problema em subir seu arquivo.');
          //return res.end("Error uploading file.");
        }
        console.log(req.file);

        //crop-img
        var srcPath = __dirname+'/../../public/uploads/avatar/temp/' + req.file.filename;
        var dstPath = __dirname+'/../../public/uploads/avatar/' + req.file.filename;
        //fs.unlinkSync(srcPath);
        //console.log(srcPath, dstPath);


        User.findById(req.user.id, function(err, user) {
            if (err) {
              req.flash('error', 'Tivemos um problema em encontrar o seu avatar.');
              //res.send(err);
            }
            user.avatar = '/uploads/avatar/' + req.file.filename;  // update the user info
            // save user
            user.save(function(err) {
                if (err) {
                  req.flash('error', 'Houve um problema enviando seu avatar.');
                  //res.send(err);
                }

                res.redirect('/profile/edit');
                req.flash('success', 'usuário atualizado');
            });
        });
    });
  });
}
