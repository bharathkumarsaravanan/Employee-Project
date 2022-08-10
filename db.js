const path = require('path');
const { Interface } = require('readline');
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(path.resolve(__dirname,'./data.db'));

const knex = require('knex')({
    client: 'sqlite3',
    connection: {
        filename: './data.db'
    },
    useNullAsDefault: true
});

// knex.insert({emp_name: 'Kalai',
//             emp_age: '23',
//             emp_salary: '23136',
//             departmentId: '14',
//             profile: 'John.jpeg',
//             reportingId: '41'
//         })
//         .into('emprec')
//         .then()
        
// knex('department')
//     .where('id',17)
//     .del()
//     .then()

// knex('department')
//     .where('id',19)
//     .update({
//         name: 'Financiar'
//     }).then()

//     knex.select('profile')
//     .from('emprec')
//     .where('id',1)
//     .then((row) => console.log(row[0].profile)); 

knex.select('*')
    .from('emprec')
    .where('id',48)
    .then((row1) => 
        // console.log(row1[0].reportingId)
        // var dep = row1[0].reportingId

        knex.select('*')
            .from('department')
            .where('id',row1[0].Id)
            .then((row2) => console.log(row2))
    )
    
    // knex.select('*')
    // .from('emprec')
    // .where('id',48)
    // .then((row1) =>
        
    //     knex.select('*')
    //         .from('department')
    //         .where('id',row1[0].reportingId)
    //         .then((row2) =>

    //             knex.select('*')
    //                 .from('emprec')
    //                 .where('id',row1.reportingId)
    //                 .then((row3) =>
                       
    //                 console.log(row1,row2,row3)

    //                 ) 
    //         )
    // )

// knex.select('*')
//         .from('department')
//         .then((e) => console.log(e))

// db.serialize(() => {
//     db.all("SELECT * FROM emprec",[], (err,row)=> {
//         if(err){
//             console.log(err);
//         }
//             console.log(row);
           
//     });
// });



// db.close();