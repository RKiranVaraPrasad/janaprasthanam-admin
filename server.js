var express     = require('express'),
    bodyParser  = require('body-parser'),
    cors        = require('cors'),
    multer      = require('multer'),
    path        = require('path'),
    ejs         = require('ejs'),
    mysql       = require('mysql');

var storage = multer.diskStorage({
    destination: './public/uploads',
    filename: function(req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
})

var storagePdf = multer.diskStorage({
    destination: './public/pdf',
    filename: function(req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
})

var upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
    if (file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg") {
      cb(null, true);
    } else {
      cb(null, false);
      return cb(new Error('Only .png, .jpg and .jpeg format allowed!'));
    }
  }
});

var pdf = multer({
    storage: storagePdf,
    fileFilter: (req, file, cb) => {
    if (file.mimetype == "application/pdf") {
      cb(null, true);
    } else {
      cb(null, false);
      return cb(new Error('Only .pdf format allowed!'));
    }
  }
});

var PORT = process.env.PORT || 3400;

var app = express();
app.use(cors());

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    next();
});

var connection = mysql.createConnection({
    host: 'premium152.web-hosting.com',
    user: 'nodeghfe_jptelevision_use',
    password: 'Kiran@1982',
    database: 'nodeghfe_jptelevision',
    multipleStatements: true
});

connection.connect((err) => {
    if (err) {
        console.log(err.message);
    }
    console.log('db ' + connection.state);
})

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


app.set('view engine', 'ejs');

app.use(express.static('./public'));


// categories


app.get('/epaper', (req, res) => {
    res.render('epaper')
})

app.get('/create-epaper', (req, res) => {
    connection.query('SELECT * FROM epaper ORDER BY ID DESC', (err, result) => {
        if (!err)
            res.render('create-epaper', {epaper: result});
        else
            console.log(err)
    })
})

app.post('/create-epaper', upload.single('uploadEfile'), (req, res) => {

    var sql = "INSERT INTO epaper VALUES('"+ req.body.papaerDate +"' + '"+ req.file.filename +"')";

    connection.query(sql, (err) => {
        if (!err) {
            connection.query('SELECT * FROM epaper', (err, result) => {
                if (!err)
                    res.render('create-epaper', {epaper: result});
                else
                    console.log(err)
            })
        }
        else 
            console.log(err)
    })
})

app.get('/categories', (req, res) => {
    res.render('categories')
})

app.get('/create-category', (req, res) => {
    connection.query('SELECT * FROM category ORDER BY Category_ID ASC', (err, result) => {
                if (!err)
                    res.render('create-category', {category: result});
                else
                    console.log(err)
            })
})

app.get('/api/categories', (req, res) => {
    connection.query('SELECT * FROM category ORDER BY Category_ID ASC', (err, result) => {
        if (!err)
            res.send(result);
        else
            console.log(err)
    })
})

app.post('/create-category', (req, res) => {
    console.log(req.body)
    var sql = "INSERT INTO category VALUES(null, '"+ req.body.Category_Name +"')";

    connection.query(sql, (err) => {
        if (!err) {
            connection.query('SELECT * FROM category', (err, result) => {
                if (!err)
                    res.render('create-category', {category: result});
                else
                    console.log(err)
            })
        }
    })
    
})

// posts

app.get('/posts', (req, res) => {
    connection.query('SELECT * FROM category', (err, result) => {
        if (!err)
            res.render('index', {category: result});
        else
            console.log(err)
    })
})

app.get('/create-post', (req, res) => {
    connection.query('SELECT * FROM post ORDER BY ID DESC', (err, result) => {
        if (!err)
            res.render('create-post', {posts: result});
        else
            console.log(err)
    })
})

app.get('/api/posts', (req, res) => {
    connection.query('SELECT * FROM post ORDER BY ID DESC', (err, result) => {
        if (!err)
            res.send(result);
        else
            console.log(err)
    })
})

app.get('/api/posts/:id', (req, res) => {
    var sql = 'SELECT * FROM post WHERE ID = ?'; 
    var id = req.params.id;
    connection.query(sql, [id], (err, result) => {
        if (!err)
            res.send(result);
        else
            console.log(err)
    })
})

// list by category

app.get('/api/postsByCatID/:id', (req, res) => {
    var sql = 'SELECT * FROM post WHERE Category_ID = ? ORDER BY ID DESC'; 
    var id = req.params.id;
    connection.query(sql, [id], (err, result) => {
        if (!err)
            res.send(result);
        else
            console.log(err)
    })
})

// home page 

app.get('/home-slider', (req, res) => {
    connection.query('SELECT * FROM category', (err, result) => {
        if (!err)
            res.render('home-slider', {category: result});
        else
            console.log(err)
    })
})

app.get('/api/bannerSlider', (req, res) => {
    connection.query('SELECT * FROM homeSliders ORDER BY ID DESC', (err, result) => {
        if (!err)
            res.send(result);
        else
            console.log(err)
    })
})

app.get('/api/bannerSlider/:id', (req, res) => {
    var sql = 'SELECT * FROM homeSliders WHERE ID = ?'; 
    var id = req.params.id;
    connection.query(sql, [id], (err, result) => {
        if (!err)
            res.send(result);
        else
            console.log(err)
    })
})

app.get('/create-banner', (req, res) => {
    connection.query('SELECT * FROM homeSliders ORDER BY ID DESC', (err, result) => {
        if (!err)
            res.render('create-banner', {banner: result});
        else
            console.log(err)
    })
})

app.post('/create-banner', upload.single('uploadImage'), (req, res) => {

    var sql = "INSERT INTO homeSliders VALUES(null, '"+ req.body.Category_ID +"', '"+ req.body.Category_Name +"', '"+ req.body.Title +"', '"+ req.body.Description +"', '"+ req.file.filename +"', '"+ req.body.Youtube +"')";

    connection.query(sql, (err) => {
        if (!err) {
            connection.query('SELECT * FROM homeSliders', (err, result) => {
                if (!err)
                    res.render('create-banner', {banner: result});
                else
                    console.log(err)
            })
        }
        else 
            console.log(err)
    })
})

app.get('/delete-banner/:id', (req, res) => {
    
    var sql = "DELETE FROM homeSliders WHERE ID = ?";
    var id = req.params.id;
    
    connection.query(sql, [id], (err) => {
        if (!err) {
            connection.query('SELECT * FROM homeSliders', (err, result) => {
                if (!err)
                    res.render('create-banner', {banner: result});
                else
                    console.log(err)
            })
        }
        else 
            console.log(err)
    })
})

app.get('/api/bannerSlider', (req, res) => {
    connection.query('SELECT * FROM homeSliders ORDER BY ID DESC LIMIT 5', (err, result) => {
        if (!err)
            res.send(result);
        else
            console.log(err)
    })
})

app.get('/api/latestLeft', (req, res) => {
    connection.query('SELECT * FROM post ORDER BY ID DESC LIMIT 4', (err, result) => {
        if (!err)
            res.send(result);
        else
            console.log(err)
    })
})

app.get('/api/latestRight', (req, res) => {
    connection.query('SELECT * FROM post ORDER BY ID DESC LIMIT 4, 4', (err, result) => {
        if (!err)
            res.send(result);
        else
            console.log(err)
    })
})

app.get('/api/ap', (req, res) => {
    connection.query('SELECT * FROM post WHERE Category_ID = 31 ORDER BY ID DESC LIMIT 5', (err, result) => {
        if (!err)
            res.send(result);
        else
            console.log(err)
    })
})

app.get('/api/telangana', (req, res) => {
    connection.query('SELECT * FROM post WHERE Category_ID = 32 ORDER BY ID DESC LIMIT 5', (err, result) => {
        if (!err)
            res.send(result);
        else
            console.log(err)
    })
})

app.get('/api/cinema', (req, res) => {
    connection.query('SELECT * FROM post WHERE Category_ID = 33 ORDER BY ID DESC LIMIT 5', (err, result) => {
        if (!err)
            res.send(result);
        else
            console.log(err)
    })
})

app.get('/api/sports', (req, res) => {
    connection.query('SELECT * FROM post WHERE Category_ID = 34 ORDER BY ID DESC LIMIT 5', (err, result) => {
        if (!err)
            res.send(result);
        else
            console.log(err)
    })
})

app.get('/api/business', (req, res) => {
    connection.query('SELECT * FROM post WHERE Category_ID = 35 ORDER BY ID DESC LIMIT 5', (err, result) => {
        if (!err)
            res.send(result);
        else
            console.log(err)
    })
})

app.get('/api/national', (req, res) => {
    connection.query('SELECT * FROM post WHERE Category_ID = 36 ORDER BY ID DESC LIMIT 5', (err, result) => {
        if (!err)
            res.send(result);
        else
            console.log(err)
    })
})

app.get('/api/world', (req, res) => {
    connection.query('SELECT * FROM post WHERE Category_ID = 37 ORDER BY ID DESC LIMIT 5', (err, result) => {
        if (!err)
            res.send(result);
        else
            console.log(err)
    })
})


app.post('/create-post', upload.single('uploadImage'), (req, res) => {

    var sql = "INSERT INTO post VALUES(null, '"+ req.body.Category_ID +"', '"+ req.body.Category_Name +"', '"+ req.body.Title +"', '"+ req.body.Description +"', '"+ req.file.filename +"', '"+ req.body.Youtube +"')";

    connection.query(sql, (err) => {
        if (!err) {
            connection.query('SELECT * FROM post', (err, result) => {
                if (!err)
                    res.render('create-post', {posts: result});
                else
                    console.log(err)
            })
        }
        else 
            console.log(err)
    })
})

app.get('/delete-post/:id', (req, res) => {
    
    var sql = "DELETE FROM post WHERE ID = ?";
    var id = req.params.id;
    
    connection.query(sql, [id], (err) => {
        if (!err) {
            // res.send("deleted successfully..")
            connection.query('SELECT * FROM post', (err, result) => {
                if (!err)
                    res.render('create-post', {posts: result});
                else
                    console.log(err)
            })
        }
        else 
            console.log(err)
    })
})

// breaking News

app.get('/breaking', (req, res) => {
    connection.query('SELECT * FROM category', (err, result) => {
        if (!err)
            res.render('breaking', {category: result});
        else
            console.log(err)
    })
})

app.get('/api/breaking', (req, res) => {
    connection.query('SELECT * FROM breaking ORDER BY ID DESC LIMIT 1', (err, result) => {
        if (!err)
            res.send(result);
        else
            console.log(err)
    })
})

app.get('/api/breaking/:id', (req, res) => {
    var sql = 'SELECT * FROM breaking WHERE ID = ?'; 
    var id = req.params.id;
    connection.query(sql, [id], (err, result) => {
        if (!err)
            res.send(result);
        else
            console.log(err)
    })
})

app.get('/create-breaking', (req, res) => {
    connection.query('SELECT * FROM breaking ORDER BY ID DESC', (err, result) => {
        if (!err)
            res.render('create-breaking', {breaking: result});
        else
            console.log(err)
    })
})

app.post('/create-breaking', upload.single('uploadImage'), (req, res) => {

    var sql = "INSERT INTO breaking VALUES(null, '"+ req.body.Category_ID +"', '"+ req.body.Category_Name +"', '"+ req.body.Title +"', '"+ req.body.Description +"', '"+ req.file.filename +"', '"+ req.body.Youtube +"')";

    connection.query(sql, (err) => {
        if (!err) {
            connection.query('SELECT * FROM breaking', (err, result) => {
                if (!err)
                    res.render('create-breaking', {breaking: result});
                else
                    console.log(err)
            })
        }
        else 
            console.log(err)
    })
})

app.get('/delete-breaking/:id', (req, res) => {
    
    var sql = "DELETE FROM breaking WHERE ID = ?";
    var id = req.params.id;
    
    connection.query(sql, [id], (err) => {
        if (!err) {
            connection.query('SELECT * FROM breaking', (err, result) => {
                if (!err)
                    res.render('create-breaking', {breaking: result});
                else
                    console.log(err)
            })
        }
        else 
            console.log(err)
    })
})


// epaper


// Youtube

app.get('/youtube', (req, res) => {
    res.render('youtube')
})

app.get('/api/youtube', (req, res) => {
    connection.query('SELECT * FROM youtube ORDER BY ID DESC LIMIT 4', (err, result) => {
        if (!err)
            res.send(result);
        else
            console.log(err)
    })
})

app.get('/create-youtube', (req, res) => {
    connection.query('SELECT * FROM youtube ORDER BY ID DESC', (err, result) => {
        if (!err)
            res.render('create-youtube', {youtube: result});
        else
            console.log(err)
    })
})

app.post('/create-youtube', (req, res) => {

    var sql = "INSERT INTO youtube VALUES(null, '"+ req.body.Title +"', '"+ req.body.YoutubeLink +"')";

    connection.query(sql, (err) => {
        if (!err) {
            connection.query('SELECT * FROM youtube', (err, result) => {
                if (!err)
                    res.render('create-youtube', {youtube: result});
                else
                    console.log(err)
            })
        }
        else 
            console.log(err)
    })
})

app.get('/delete-youtube/:id', (req, res) => {
    
    var sql = "DELETE FROM youtube WHERE ID = ?";
    var id = req.params.id;
    
    connection.query(sql, [id], (err) => {
        if (!err) {
            // res.send("deleted successfully..")
            connection.query('SELECT * FROM youtube', (err, result) => {
                if (!err)
                    res.render('create-youtube', {youtube: result});
                else
                    console.log(err)
            })
        }
        else 
            console.log(err)
    })
})


// e-paper

app.get('/e-paper', (req, res) => {
    res.render('e-paper')
})

app.get('/api/e-paper', (req, res) => {
    connection.query('SELECT * FROM epaper ORDER BY ID DESC LIMIT 4', (err, result) => {
        if (!err)
            res.send(result);
        else
            console.log(err)
    })
})

app.get('/create-e-paper', (req, res) => {
    connection.query('SELECT * FROM epaper ORDER BY ID DESC', (err, result) => {
        if (!err)
            res.render('create-e-paper', {ePaper: result});
        else
            console.log(err)
    })
})

app.post('/create-e-paper', pdf.single('Epaper'), (req, res) => {

    var sql = "INSERT INTO epaper VALUES(null, '"+ req.body.selectDate +"', '"+ req.file.filename +"')";

    connection.query(sql, (err) => {
        if (!err) {
            connection.query('SELECT * FROM epaper', (err, result) => {
                if (!err)
                    res.render('create-e-paper', {ePaper: result});
                else
                    console.log(err)
            })
        }
        else 
            console.log(err)
    })
})

app.get('/delete-e-paper/:id', (req, res) => {
    
    var sql = "DELETE FROM epaper WHERE ID = ?";
    var id = req.params.id;
    
    connection.query(sql, [id], (err) => {
        if (!err) {
            connection.query('SELECT * FROM epaper', (err, result) => {
                if (!err)
                    res.render('create-e-paper', {ePaper: result});
                else
                    console.log(err)
            })
        }
        else 
            console.log(err)
    })
})


// gallery

app.get('/gallery', (req, res) => {
    res.render('gallery')
})

app.get('/api/gallery', (req, res) => {
    connection.query('SELECT * FROM gallery ORDER BY ID DESC', (err, result) => {
        if (!err)
            res.send(result);
        else
            console.log(err)
    })
})

app.get('/api/galleryUploads', (req, res) => {
    connection.query('SELECT * FROM galleryUploads ORDER BY ID DESC', (err, result) => {
        if (!err)
            res.send(result);
        else
            console.log(err)
    })
})

app.get('/create-gallery', (req, res) => {
    connection.query('SELECT * FROM galleryUploads ORDER BY ID DESC', (err, result) => {
        if (!err)
            res.render('create-gallery', {gallery: result});
        else
            console.log(err)
    })
})

app.post('/create-gallery', upload.array('files', 12), (req, res) => {
    
    var sql = "INSERT INTO gallery VALUES(null, '"+ req.body.Category_Name +"')";
    
    connection.query(sql, (err) => {
        if (!err) {
            
            var sqlGallery = "INSERT INTO galleryUploads VALUES(null, '"+ result.insertId +"', 'Blue Village 1')";
            connection.query(sqlGallery, (err, result) => {
                if (!err)
                    res.send(result)
                else
                    console.log(err)
            })
        }
        else 
            console.log(err)
    })
    

    
})

app.listen(PORT, (req, res) => {
    console.log(`Server is running on PORT ${PORT}`);
})




