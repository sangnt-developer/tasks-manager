const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const User = require('../models/user');
const router = new express.Router();
const auth = require('../middleware/auth');

router.post('/users', async (req, res) => {
    const user = new User(req.body)
    try {
        await user.save();
        const token = await user.generateAuthToken();
        res.status(201).send({ user, token });
    } catch (e) {
        res.status(400).send(e);
    }
})

router.post('/users/login', async (req, res) => {
  try {
    const user = await User.findByCredentials(req.body.email, req.body.password);
    const token = await user.generateAuthToken();
    res.send({ user, token });
  }
  catch (error)  {
    res.status(400).send();
  }
})

router.post('/users/logout', auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter((token) => {
      return token.token !== req.token;
    });
    await req.user.save();
    res.send();
  }
  catch (error)  {
    res.status(500).send();
  }
})

router.post('/users/logoutAll', auth, async (req, res) => {
  try {
    req.user.tokens = [];
    await req.user.save();
    res.send();
  }
  catch (error)  {
    res.status(500).send();
  }
})

router.get('/users/me', auth, async (req, res) => {
    res.send(req.user);
})

// router.get('/users', auth, async (req, res) => {
//   try {
//       const users = await User.find({})
//       res.send(users)
//   } catch (e) {
//       res.status(500).send()
//   }
// })

// router.get('/users/:id', async (req, res) => {
//     const _id = req.params.id

//     try {
//         const user = await User.findById(_id)

//         if (!user) {
//             return res.status(404).send()
//         }

//         res.send(user)
//     } catch (e) {
//         res.status(500).send()
//     }
// })

router.patch('/users/me', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'email', 'password', 'age']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' })
    }

    try {
        // const user = await User.findById(req.params.id);

        updates.forEach(update => req.user[update] = req.body[update]);

        await req.user.save();

        // const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })

        // if (!user) {
        //     return res.status(404).send()
        // }

        res.send(req.user)
    } catch (e) {
        res.status(400).send(e)
    }
})

router.delete('/users/me', auth, async (req, res) => {
    try {
        // const user = await User.findByIdAndDelete(req.user._id)

        // if (!user) {
        //     return res.status(404).send()
        // }
        await req.user.remove();
        res.send(req.user);
    } catch (e) {
        res.status(500).send();
    }
})

const upload = multer({
  limits: {
    fileSize: 1024 * 1024
  },
  fileFilter(req, file, callback) {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/i)) {
      callback(new Error('Please upload an image file'));
    }
    callback(undefined, true);
  }
});
router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {
  const imageBuffer = await sharp(req.file.buffer).resize(250, 250).png().toBuffer();
  req.user.avatar = imageBuffer;
  await req.user.save();
  res.send();
}, (error, req, res, next) => {
  res.status(400).send({ error: error.message })
});

router.delete('/users/me/avatar', auth, async (req, res) => {
  const currentUser = req.user;
  currentUser.avatar = undefined;
  await currentUser.save();
  res.send();
});

router.get('/users/:id/avatar', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user || !user.avatar) {
      throw new Error();
    }

    res.set('Content-Type', 'image/png');
    res.send(user.avatar);
  }
  catch (error) {
    res.status(404).send();
  }
})

module.exports = router