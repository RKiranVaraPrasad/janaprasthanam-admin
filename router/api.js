var express     = require('express'),
    multer      = require('multer'),
    path        = require('path');

var storage = multer.diskStorage({
    destination: './public/uploads',
    filename: function(req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
})

var upload = multer({
    storage: storage
}).single('myImage');

var router = express.Router();


router.get('/get-data', (req, res) => {
    res.send('Data received....')
})

router.post('/post-data', (req, res) => {
    upload((req, res) => {
        console.log(req.file)
        res.send('test')
    })
    //console.log('req.body');
})

module.exports = router;