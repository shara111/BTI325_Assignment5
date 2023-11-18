const express = require('express');
const blogData = require("./blog-service");  // Correctly imported as blogData
const multer = require("multer");
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');
const exphbs = require("express-handlebars");
const path = require("path");
const stripJs = require('strip-js');
const upload = multer();
const app = express();

const HTTP_PORT = process.env.PORT || 8080;

cloudinary.config({
    cloud_name: 'derlwpyf6',
    api_key: '691953784436571',
    api_secret: 'Tz1OauNIs8TUsSHfybLsCr9G21c',
    secure: true
});

// Middleware
app.use(express.static("public"));
app.use(upload.single("featureImage"));
app.use(function(req, res, next) {
    let route = req.path.substring(1);
    app.locals.activeRoute = "/" + (isNaN(route.split('/')[1]) ? route.replace(/\/(?!.*)/, "") : route.replace(/\/(.*)/, ""));
    app.locals.viewingCategory = req.query.category;
    next();
});

app.use(express.urlencoded({ extended: true }));

// Handlebars engines and helpers
app.engine('.hbs', exphbs.engine({
    extname: '.hbs',
    helpers: {
        navLink: function(url, options) {
            return '<li' +
                ((url == app.locals.activeRoute) ? ' class="active" ' : '') +
                '><a href="' + url + '">' + options.fn(this) + '</a></li>';
        },
        equal: function(lvalue, rvalue, options) {
            if (arguments.length < 3)
                throw new Error("Handlebars Helper equal needs 2 parameters");
            if (lvalue != rvalue) {
                return options.inverse(this);
            } else {
                return options.fn(this);
            }
        },
        safeHTML: function(context) {
            return stripJs(context);
        },
        formatDate: function(dateObj) {
            let year = dateObj.getFullYear();
            let month = (dateObj.getMonth() + 1).toString();
            let day = dateObj.getDate().toString();
            return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        }
    }
}));
app.set('view engine', 'hbs');

// App routes
app.get('/', (req, res) => {
    res.redirect("/blog");
});

app.get('/about', (req, res) => {
    res.render('about');
});

app.get('/blog', async (req, res) => {
    let viewData = {};

    try {
        let posts = [];
        if (req.query.category) {
            posts = await blogData.getPublishedPostsByCategory(req.query.category);
        } else {
            posts = await blogData.getPublishedPosts();
        }

        posts.sort((a, b) => new Date(b.postDate) - new Date(a.postDate));
        let post = posts[0];

        viewData.posts = posts;
        viewData.post = post;
    } catch (err) {
        viewData.message = "no results";
    }

    try {
        let categories = await blogData.getCategories();
        viewData.categories = categories;
    } catch (err) {
        viewData.categoriesMessage = "no results"
    }

    res.render("blog", { data: viewData })
});
app.get('/blog/:id', async (req, res) => {

    let viewData = {};

    try{

        let posts = [];

        if(req.query.category){
            posts = await blog_service.getPublishedPostsByCategory(req.query.category);
        }else{
            posts = await blog_service.getPublishedPosts();
        }

        posts.sort((a,b) => new Date(b.postDate) - new Date(a.postDate));

        viewData.posts = posts;

    }catch(err){
        viewData.message = "no results";
    }

    try{
        viewData.post = await blog_service.getPostById(req.params.id);
    }catch(err){
        viewData.message = "no results"; 
    }

    try{
        let categories = await blog_service.getCategories();

        viewData.categories = categories;
    }catch(err){
        viewData.categoriesMessage = "no results"
    }

    res.render("blog", {data: viewData})
});
app.get('/posts', (req, res) => {
    const category = req.query.category;
    const minDate = req.query.minDate;

    if (category) {
        blogData.getPostsByCategory(Number(category)) // Corrected to use blogData
            .then((data) => res.render("posts", {posts: data}))
            .catch((err) => res.render("posts", {message: err}));
    } else if (minDate) {
        blogData.getPostsByMinDate(minDate) // Corrected to use blogData
            .then((data) => res.render("posts", {posts: data}))
            .catch((err) => res.render("posts", {message: err}));
    } else {
        blogData.getAllPosts() // Corrected to use blogData
            .then((data) => {
                if (data.length > 0) {
                    res.render("posts", {posts: data});
                } else {
                    res.render("posts", {message: "no results"});
                }
            })
            .catch((err) => res.render("posts", {message: err}));
    }
});
app.get('/posts/add', (req, res) => {
    blogData.getCategories().then(data => {
        res.render('addPost', {categories: data});
    }).catch(err => {
        res.render('addPost',{categories: []});
    })
})
app.post('/posts/add', (req, res) => {
    let streamUpload = (req) => {
        return new Promise((resolve, reject) => {
            let stream = cloudinary.uploader.upload_stream(
                (error, result) => {
                if (result) {
                    resolve(result);
                } else {
                    reject(error);
                }
                }
            );
    
            streamifier.createReadStream(req.file.buffer).pipe(stream);
        });
    }; 
    async function upload(req) {
        let result = await streamUpload(req);
        return result;
    }
    upload(req).then((uploaded)=>{
        req.body.featureImage = uploaded.url;
        blogData.addPost(req.body)
        .then(() => {
            console.log("New post added");
            res.redirect('/posts')}); // redirect to posts
})})
app.get('/posts/:value', (req, res) => {
    blogData.getPostById(Number(req.params.value)).then((data) => res.send(data))
    .catch((err) => {return {message: err}});
})
app.get('/categories', (req, res) => {
    blogData.getCategories() // Corrected to use blogData
        .then((data) => {
            if (data.length > 0) {
                res.render('categories', {categories: data});
            } else {
                res.render('categories', {message: "no results"});
            }
        })
        .catch((err) => res.render('categories', {message: err}));
});

// start server if initialize is successful
try {
    blogData.initialize().then(() => {
        app.listen(HTTP_PORT, () => {
            console.log(`Express http server listening on port ${HTTP_PORT}`);
        });
    });
} catch (err) {
    console.error("Initialization failed:", err);
    throw new Error("Could not initialize data set");
}

app.get('/categories/add', (req, res) => {
    res.render('addCategory');
});

app.post('/categories/add', (req,res) => {
    blogData.addCategory(req.body).then(() => res.redirect('/categories'))
});

app.get('/categories/delete/:id', (req,res) => {
    blogData.deleteCategoryById(req.params.id)
        .then(() => res.redirect('/categories'))
        .catch(() => res.status(500).send("Unable to Remove Category / Category not found"))
});

app.get('/posts/delete/:id', (req, res) => {
    blogData.deletePostById(req.params.id)
        .then(() => res.redirect('/posts'))
        .catch(() => res.status(500).send("Unable to Remove Category / Category not found"))
})