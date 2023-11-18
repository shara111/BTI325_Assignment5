const Sequelize = require('sequelize');

var sequelize = new Sequelize('SenecaDB', 'shara111', 'D2mM5slkvAGF', {
    host: 'ep-green-grass-73651344-pooler.us-east-2.aws.neon.tech',
    dialect: 'postgres',
    port: 5432,
    dialectOptions: {
        ssl: { rejectUnauthorized: false }
    },
    query: { raw: true }
});

const Category = sequelize.define('Category', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    category: Sequelize.STRING
});

const Post = sequelize.define("Post", {
    body: Sequelize.TEXT,
    title: Sequelize.STRING,
    postDate: Sequelize.DATE,
    featureImage: Sequelize.STRING,
    published: Sequelize.BOOLEAN,
    categoryId: {
        type: Sequelize.INTEGER,
        references: {
            model: Category,
            key: 'id'
        }
    }
});

Post.belongsTo(Category, { foreignKey: 'categoryId' });

module.exports.initialize = () => {
    return new Promise((resolve, reject) => {
        sequelize.sync().then((data) => {
            resolve(data);
        }).catch(err => {
            console.error("Error during database synchronization:", err);
            reject("Unable to sync the database");
        });
    });
};




module.exports.getAllPosts = () => {
    return new Promise((resolve, reject) => {
        Post.findAll().then((data) =>{
            resolve(data);
        }).catch(err => reject("no results returned"));
    });
};

module.exports.getPublishedPosts = () => {
    return new Promise((resolve, reject) => {
        Post.findAll({
            where:{
                published: true
            }
        }).then(data => {
            resolve(data);
        }).catch(err => reject("no results returned"));
    });
};

module.exports.getCategories = () => {
    return new Promise((resolve, reject) => {
        Category.findAll().then(data =>{
            resolve(data);
        }).catch(err => reject("no results returned"));
    });
};
module.exports.addPost = (postData) => {
    return new Promise((resolve, reject) => {
        postData.published = (postData.published) ? true : false;
        for (var prop in postData) {
            if (postData[prop] === "") {
                postData[prop] = null;
            }
        }

        postData.postDate = new Date();
        Post.create(postData).then(() => resolve()) // Corrected promise resolution
            .catch(err => reject("unable to create post"));
    });
}

module.exports.getPostsByCategory = (category) => {
    return new Promise((resolve, reject) => {
        Post.findAll({
            where: {
                category: category
            }
        }).then((data) => {
            resolve(data);
        }).catch(err => reject("no results returned"));
    });
};

module.exports.getPostsByMinDate = (minDateStr) => {
    return new Promise((resolve, reject) => {
        Post.findAll({
            where: {
                postDate: { $gte: new Date(minDateStr)} 
            }
        }).then(data => {
            resolve(data);
        }).catch(err => reject("no results returned"));
    });
};

module.exports.getPostById = (id) => {
    return new Promise((resolve, reject) => {
        Post.findAll({
            where: {
                id: id
            }
        }).then(data => {
            resolve(data[0]);
        }).catch(err => reject("no results returned"));
    });
};

module.exports.getPublishedPostsByCategory = (category) => {
    return new Promise((resolve, reject) => {
        Post.findAll({
            where: {
                published: true,
                category: category
            }
        }).then(data => {
            resolve(data);
        }).catch(err => reject("no results returned"));
    });
};
module.exports.addCategory = (categoryData) => {
    return new Promise((resolve, reject) => {
        for (var prop in categoryData) {
            if (categoryData[prop] === "") {
                categoryData[prop] = null;
            }
        }
        Category.create({
           category: categoryData.category
        }).then(() => resolve()) // Corrected promise resolution
          .catch(err => reject('could not create a category'));
    });
}
module.exports.deleteCategoryById = (id) => {
    return new Promise((resolve, reject) =>
    {
        Category.destroy({
            where: {
                id: id
            }
        }).then(() => resolve()).catch((err) => reject('could not delete the category'))
    });
}

module.exports.deletePostById = (id) => {
    return new Promise((resolve, reject) =>
    {
        Post.destroy({
            where: {
            id: id
        }}).then(() => resolve()).catch(() => reject('could not delete the post'))
    })
}
/*
module.exports = {
    initialize, 
    getAllPosts, 
    getPublishedPosts, 
    getCategories, 
    addPost, 
    getPostsByCategory, 
    getPostsByMinDate, 
    getPostById, 
    getPublishedPostsByCategory, 
    addCategory, 
    deleteCategoryById, 
    deletePostById
}
*/