const Post = require('../models/postModel');
const fs = require('fs');

// --------------------RECUPERER TOUTES LES postS--------------------
exports.getAllPosts = (req, res, next) => {
  console.log('all posts');
  Post.find().then(
    (posts) => {
      res.status(200).json(posts);
    }
  ).catch(
    (error) => {
      res.status(400).json({
        error: error
      });
    }
  );
};

//---------------------RECUPERER UNE post--------------------------
exports.getOnePost = (req, res, next) => {
  console.log('ce posts');
  Post.findOne({
    _id: req.params.id
  }).then(
    (post) => {
      res.status(200).json(post);
    }
  ).catch(
    (error) => {
      res.status(404).json({
        error: error
      });
    }
  );
};
// ------------CREER NOUVEAU SOUCE--------------------------
exports.createPost = (req, res, next) => {
  const sauceObject = JSON.parse(req.body.sauce);
  delete sauceObject._id;
  console.log('createsauce')
  const sauce = new Sauce({
    ...sauceObject,

    likes: 0,
    dislikes: 0,
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
    usersLiked: [],
    usersDisliked: [],
  });
  sauce.save().then(
    () => {
      res.status(200).json({
        message: 'Post saved successfully!'
      });
    }
  ).catch(
    (error) => {
      res.status(400).json({
        error: error
      });
    }
  );
};

// ----------------------MODIFY LE SAUCE------------------------------
exports.modifySauce = (req, res, next) => {

  console.log('modifier sauces');
  const sauceObject = req.file ? {
    ...JSON.parse(req.body.sauce),
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
  } : { ...req.body };
  console.log(sauceObject);
  console.log(req.auth.userId);
  if (sauceObject.userId !== req.auth.userId) {
    return res.status(401).json({ error: new Error('Vous ne pouvez pas modifier cette sauce') })
  }
  Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
    .then(
      () => {
        console.log('Sauce modifié !');
        res.status(200).json({
          message: 'Sauce updated successfully!'
        });
      }
    ).catch(
      (error) => {
        res.status(400).json({
          error: error
        });
      }
    );
};
//   -------------------DELETE post-------------------------------------
exports.deletePost = (req, res, next) => {
  console.log('supprimer posts');
  Post.findOne({ _id: req.params.id })
    .then((post) => {
      if (post.userId !== req.auth.userId) {
        return res.status(401).json({ error: new Error('Vous ne pouvez pas modifier cette post') })
      }
      const filename = post.imageUrl.split('/images/')[1]
      fs.unlink(`images/${filename}`, () => {
        Post.deleteOne({ _id: req.params.id }).then(
          () => {
            res.status(200).json({
              message: 'Deleted!'
            });
          }
        ).catch(
          (error) => {
            res.status(400).json({
              error: error
            });
          }
        );
      })
    })

};


// // ------------------------LIKE post-----------------------
// exports.likePost = (req, res, next) => {
//   Post.findOne({ _id: req.params.id })
//     .then((post) => {
//       let vot;
//       let votant = req.body.userId;
//       let like = post.usersLiked;
//       let unlike = post.usersDisliked;
//       let bon = like.includes(votant);
//       let mauvais = unlike.includes(votant);
//       if (bon === true) {
//         vot = 1;
//       } else if (mauvais === true) {
//         vot = -1;
//       } else {
//         vot = 0;
//       }

//       if (vot === 0 && req.body.like === 1) {
//         post.likes += 1;
//         post.usersLiked.push(votant);
//       } else if (vot === 1 && req.body.like === 0) {
//         post.likes -= 1;
//         const nouveauUsersLiked = like.filter((f) => f != votant);
//         post.usersLiked = nouveauUsersLiked;
//       } else if (vot === -1 && req.body.like === 0) {
//         post.dislikes -= 1;
//         const nouveauUsersDisliked = unlike.filter((f) => f != votant);
//         post.usersDisliked = nouveauUsersDisliked;
//       } else if (vot === 0 && req.body.like === -1) {
//         post.dislikes += 1;
//         post.usersDisliked.push(votant);
//       } else {
//         console.log("tentavive de vote illégal");
//       }
//       Post.updateOne(
//         { _id: req.params.id },
//         {
//           likes: post.likes,
//           dislikes: post.dislikes,
//           usersLiked: post.usersLiked,
//           usersDisliked: post.usersDisliked,
//         }
//       )
//         .then(() => res.status(200).json({ message: "Vous venez de voter" }))
//         .catch((error) => {
//           if (error) {
//             console.log(error);
//           }
//         });
//     })
//     // si erreur envoit un status 404 Not Found et l'erreur en json
//     .catch((error) => res.status(404).json({ error }));
// }


// -------------------------method 2-----------------------

exports.likePost = (req, res, next) => {
  Post.findOne({ _id: req.params.id })
    .then((post) => {
      if (req.body.like === 1) {
        post.usersLiked.push(req.body.userId);
      } else if (req.body.like === -1) {
        post.usersDisliked.push(req.body.userId);
      } else if (req.body.like === 0) {
        // if (post.usersLiked.includes(req.body.userId) === true) {
        //   const userIdIndex = post.usersLiked.indexOf(req.body.userId);
        //   post.usersLiked.splice(userIdIndex, 1);
        // }
        // if (post.usersDisliked.includes(req.body.userId) === true) {
        //   const userIdIndexDisliked = post.usersDisliked.indexOf(req.body.userId);
        //   post.usersDisliked.splice(userIdIndexDisliked, 1);
        // }
        if (post.usersLiked.includes(req.body.userId) === true) {
          const userIdIndex = post.usersLiked.indexOf(req.body.userId);
          post.usersLiked.splice(userIdIndex, 1);
        } else {
          const userIdIndexDisliked = post.usersDisliked.indexOf(req.body.userId);
          post.usersDisliked.splice(userIdIndexDisliked, 1);
        }
      }
      post.likes = post.usersLiked.length;
      post.dislikes = post.usersDisliked.length;
      Post.updateOne(
        { _id: req.params.id },
        {
          likes: post.likes,
          dislikes: post.dislikes,
          usersLiked: post.usersLiked,
          usersDisliked: post.usersDisliked,
        }
      )
        .then(() => res.status(200).json({ message: "Vous venez de voter" }))
        .catch((error) => {
          if (error) {
            console.log(error);
          }
        });
    })
    // si erreur envoit un status 404 Not Found et l'erreur en json
    .catch((error) => res.status(404).json({ error }));
}