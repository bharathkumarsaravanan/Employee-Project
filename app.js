const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(path.resolve(__dirname,'./data.db'));
const formidable = require('formidable');
const fs = require('fs');
const { join } = require('path');
const knex = require('knex')({
    client: 'sqlite3',
    connection: {
        filename: './data.db'
    },
    useNullAsDefault: true
});

const app = express();


app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
app.use(express.static("images"));
app.set('view engine', 'ejs');

app.get("/create", function(req,res){

    knex.select('*')
        .from('department')
        .then((rows) =>
            knex.select('*')
                .from('emprec')
                .then((row) =>
                res.render('create', {departments: rows,rep: row})
                )
        )
    // db.all(`SELECT * FROM department`,[],(err,rows) => {
    //     if(err){
    //         console.log(err);
    //     }
           
    //         db.all(`SELECT * FROM emprec`,[],(err,row) => {
    //             if(err){
    //                 console.log(err);
    //             }
    //             res.render('create', {departments: rows,rep: row})
    //         });
        
    // });
   
    
});

app.post("/create", function(req,res){
    

    var form = new formidable.IncomingForm();
    var uploadFolder = path.join(__dirname,'images')
    form.uploadDir = uploadFolder;
    // console.log(form);
    
    form.parse(req, function(err,fields,files){

        var empName = fields.eName;
        var empAge = fields.eAge;
        var empSal = fields.eSal;
        var depname = fields.depId;
        var repId = fields.report;
        
        db.run(`INSERT INTO emprec (emp_name,emp_age,emp_salary,departmentId,reportingId) VALUES ('${empName}','${empAge}','${empSal}','${depname}','${repId}')`);

        db.all(`SELECT MAX(id) AS id FROM emprec`,[],function(err,row){

        if(err){
        
            console.log(err);
        
        }

        var ext = path.extname(files.myFile.originalFilename);
        var fileName = row[0].id + ext;
        var file = files.myFile;
 
        try{
            
            fs.renameSync(file.filepath,join(uploadFolder,fileName));
        
        }catch(err){
            
            console.log(err);
        
        }

        db.run(`UPDATE emprec SET profile=? WHERE id=?`,[fileName,row[0].id],function(err){

            if(err){
            
                console.log(err);
            
            }
        
        });

       });

        res.redirect("/");
    
    });
    
});

app.get("/", function(req,res){
    let sql = `SELECT emprec.id , emprec.emp_name , emprec.emp_age , emprec.emp_salary,department.name from emprec join department on emprec.departmentId = department.id order by emp_name`;

    db.all(sql,[],(err,rows) => {
        
        if(err){
        
            console.log(err);
        
        }

        db.all(`SELECT 
                e.emp_name AS reportingTo,
                d.emp_name AS employee
                FROM
                emprec e
                INNER JOIN emprec d ON 
                d.reportingId = e.id ORDER BY d.emp_name`,[],(err,row) => {
                     if(err){
                        console.log(err);
                     }
                   
                      res.render("index", {det: rows, rep: row});
           
                 });
       
    });
});

app.get("/:id/delete", function(req,res){
    let id = req.params.id;
    var image;

    knex.select('profile')
        .from('emprec')
        .where('id',id)
        .then((row) =>
       
        // image = 'images/' + row[0].profile
        
        fs.unlink('images/' + row[0].profile,function(err){
            
            if(err){
            
                console.log(err)
            
            }
            
            console.log('image deleted')
        })   )

        knex('emprec')
            .where('id',id)
            .del()
            .then()

    // db.all(`SELECT profile FROM emprec WHERE id=?`,id,function(err,row){

    //     if(err){
        
    //         console.log(err);
        
    //     }
        
    //     let image = 'images/' + row[0].profile;
        
    //     fs.unlink(image,function(err){
            
    //         if(err){
            
    //             console.log(err);
            
    //         }
            
    //         console.log('image deleted');
    //     });
    
    // });

    // db.run(`DELETE FROM emprec WHERE id=?`,id, function(err){

    //     if(err){
        
    //         console.log(err);
        
    //     }else{
        
    //         console.log("row deleted");
    //     }

    // });

    res.redirect("/");    

});

app.get("/employees/:id/edit", function(req,res){
    let id = req.params.id;
   
    knex.select('*')
        .from('emprec')
        .where('id',id)
        .then((row1) =>

            knex.select('*')
                .from('department')
                .then((row2) => 

                    knex.select('*')
                        .from('emprec')
                        .then((row3) =>
                   
                        res.render('edit', {employee: row1[0],departments: row2,rep: row3})
                             
                        )
                )
        )

    // db.all("SELECT * FROM emprec where id = ?",[id] ,(err,row1) => {

    //     if(err){
        
    //         console.log(err);
        
    //     }
    //     db.all(`SELECT * FROM department`,[],(err,rows) => {
        
    //         if(err){
        
    //             console.log(err);
        
    //         }
               
    //             db.all(`SELECT * FROM emprec`,[],(err,row) => {
               
    //                 if(err){
               
    //                     console.log(err);
               
    //                 }
                  
    //                 res.render('edit', {employee: row1[0],departments: rows,rep: row});
                
    //             });
            
    //         });
     
    // });


});   

app.post("/employees/:id/edit", function(req,res){
    
    var empName = req.body.eName;
    var empAge = req.body.eAge;
    var empSal = req.body.eSal;
    var depname = req.body.depId;
    var report = req.body.report;
    var id = req.params.id;

    var input = [empName,empAge,empSal,depname,report]

    knex('emprec')
        .where('id',id)
        .update({
            emp_name: empName,
            emp_age: empAge,
            emp_salary: empSal,
            departmentId: depname,
            reportingId: report
        }).then()

            res.redirect("/");

    
    // db.run("UPDATE emprec SET emp_name=?, emp_age=?, emp_salary=?, departmentId=?, reportingId=? WHERE id=?", input, function(err,rows){
    
    //     if(err){
    
    //         console.log(err);
    
    //     }else{
    
    //         console.log("updated");
    
    //         res.redirect("/");
    
    //     }
   
    // });
     
});

app.get("/employees/:id", function(req,res){
    let id = req.params.id;

    knex.select('*')
        .from('emprec')
        .where('id',id)
        .then((row1) =>
            
            knex.select('*')
                .from('department')
                .where('id',row1[0].departmentId)
                .then((row2) =>

                    knex.select('*')
                        .from('emprec')
                        .where('id',row1[0].reportingId)
                        .then((row3) =>
                           
                          res.render("details", {employee: row1[0], dep: row2[0], rep: row3[0]} )

                        ) 
                )
        )

    // db.all("SELECT * FROM emprec WHERE id=?",[id],function(err,row1){
    
    //     if(err){
    
    //         console.log(err);
    
    //     }
    
    //         console.log("success");
            
    //         var repId = row1[0].reportingId;
    //         var depId = row1[0].departmentId;
            
    //         db.all("SELECT * FROM department WHERE id=?",[depId],function(err,row2){
  
    //             if(err){
  
    //                 console.log(err);
  
    //             }
  
    //               db.all("SELECT * FROM emprec WHERE id=?",[repId],function(err,row3){
    
    //                 if(err){
    
    //                     console.log(err);
    
    //                 }
    
    //                 res.render("details", {employee: row1[0], dep: row2[0], rep: row3[0]} );
    
    //             });
    
    //         });
    
    //     });

});

app.get("/departments", function(req,res){
 
    let sql = 'SELECT * FROM department order by name';
 
    db.all(sql,[],(err,rows) => {
 
        if(err){
 
            console.log(err);
 
        }
    
        res.render("departments/dept",{dep: rows});
   
    });

});

app.get("/departments/:id/delete", function(req,res){
    let id = req.params.id;

    knex('department')
        .where('id',id)
        .del()
        .then()

        console.log("department row deleted")
 
        res.redirect("/departments")

    // db.run(`DELETE FROM department WHERE id=?`,id,function(err){
 
    //     if(err){
 
    //         console.log(err);
 
    //     }else{
 
    //         console.log("department row deleted");
 
    //         res.redirect("/departments");
 
    //     }
 
    // });

});

app.get("/departments/:id/edit", function(req,res){
    let id = req.params.id;

    knex.select('*')
        .from('department')
        .where('id',id)
        .then((dep) => res.render("departments/edit", { department: dep[0]}))

    // db.each(`SELECT * FROM department where id=?`,[id],(err,rows) => {
    
    //     if(err){
    
    //         console.log(err);
    
    //     }else{
    
    //         res.render("departments/edit", { department: rows });
    
    //     }
    
    // });

});

app.post("/departments/:id/edit", function(req,res){

    let id = req.params.id;
    var depName = req.body.dName;
    var input = [depName,id]

    knex('department')
        .where('id',id)
        .update({
            name: depName
        }).then()
        res.redirect("/departments");
        
    // db.run(`UPDATE department SET name=? WHERE id=?`,input,function(err,rows){
   
    //     if(err){
   
    //         console.log(err);
   
    //     }
   
    //     res.redirect("/departments");
   
    // });

});

app.get("/departments/add", function(req,res){

    res.render("departments/adddept");

});

app.post("/departments/add",function(req,res){
    
    var depName = req.body.departmentName;

    knex.insert({
        name: depName
    })
    .into('department')
    .then()

    // db.run(`INSERT INTO department(name) values ('${depName}')`);
    
    res.redirect("/departments");

});

app.listen(4000,function(){
    console.log("Server has been started through Port 4000");
});
