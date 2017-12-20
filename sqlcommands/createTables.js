
pool.query("CREATE TABLE `User` (`userid` INT NOT NULL, `rating` INT NOT NULL, PRIMARY KEY (`userid`));"
    , function(err, rows, fields) {
        if (err) throw err;
        else console.log('Create User Table');
});

pool.query("CREATE TABLE `Match` (`user1` INT NOT NULL, `user2` INT NOT NULL, `matchdate` DATE NOT NULL, `win` INT NOT NULL, " +
    "PRIMARY KEY (`user1`, `user2`, `matchdate`));", 
    function(err, rows, fields){
        if (err) throw err;
        else console.log('Create Match table');
});


pool.query("ALTER TABLE `Match2` ADD CONSTRAINT `Match_fk0` FOREIGN KEY (`user1`) REFERENCES `User2`(`userid`);",
function(err){
    if (err) throw err;
    else console.log("Constraints added");           
});

pool.query("ALTER TABLE `Match2` ADD CONSTRAINT `Match_fk1` FOREIGN KEY (`user2`) REFERENCES `User2`(`userid`);",
function(err){
    if (err) throw err;
    else console.log("Constraints2 added");           
});


pool.query("CREATE TABLE `User2` (`userid` varchar(32) NOT NULL, `rating` INT NOT NULL, PRIMARY KEY (`userid`));"
, function(err, rows, fields) {
    if (err) throw err;
    else console.log('Create User Table');
});

pool.query("CREATE TABLE `Match2` (`user1` varchar(32) NOT NULL, `user2` varchar(32) NOT NULL, `matchdate` DATE NOT NULL, `win` INT NOT NULL, " +
"PRIMARY KEY (`user1`, `user2`, `matchdate`));", 
function(err, rows, fields){
    if (err) throw err;
    else console.log('Create Match table');
});

pool.query("ALTER TABLE `Match2` ADD CONSTRAINT `Match2_fk0` FOREIGN KEY (`user1`) REFERENCES `User2`(`userid`);",
function(err){
    if (err) throw err;
    else console.log("Constraints added");           
});

pool.query("ALTER TABLE `Match2` ADD CONSTRAINT `Match2_fk1` FOREIGN KEY (`user2`) REFERENCES `User2`(`userid`);",
function(err){
    if (err) throw err;
    else console.log("Constraints2 added");           
});
