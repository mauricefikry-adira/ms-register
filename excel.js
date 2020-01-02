//requiring path and fs modules
const path = require('path');
const fs = require('fs');
//joining path of directory 
const directoryPath = path.join(__dirname, 'data');
//passsing directoryPath and callback function
fs.readdir(directoryPath, function (err, files) {
    //handling error
    if (err) {
        return console.log('Unable to scan directory: ' + err);
    } 
    //listing all files using forEach
    files.forEach(function (file) {
        // Do whatever you want to do with the file
        console.log(file); 
        const XLSX = require('xlsx');
        const workbook = XLSX.readFile('D:/MAURICE FIKRY 2019/AdiraRepository/ms_register/data/Batch 64.xlsx');
        const sheet_name_list = workbook.SheetNames;
        
        var data = XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]])
        var jsonData = JSON.stringify(data)

        //save Json to File
        var fs1 = require('fs');
        fs1.writeFile("64.json", jsonData, function(err) {
           if (err) {
               console.log(err);
            }
        });
    });
});


// // load excel to json File-1
// const XLSX = require('xlsx');
// const workbook = XLSX.readFile('D:/MAURICE FIKRY 2019/AdiraRepository/ms_register/data/Batch 43.xlsx');
// const sheet_name_list = workbook.SheetNames;
// console.log(XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]));
// var data = XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]])
// var jsonData = JSON.stringify(data)



// save Json to File
// var fs1 = require('fs');
// fs1.writeFile("test.json", jsonData, function(err) {
//     if (err) {
//         console.log(err);
//     }
// });

// var fs = require('fs');
// var results = JSON.parse(fs.readFileSync('Game.json', 'utf8'));

// function sendJSON(){

//     var xmlhttp = new XMLHttpRequest();   // new HttpRequest instance
//     xmlhttp.onreadystatechange = function() {
//         if (this.readyState == 4 && this.status == 200) {
//            document.getElementById("result").innerHTML =
//            this.responseText;
//         }
//      };
//     xmlhttp.open("POST", "http://localhost:3000");
//     xmlhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
//     xmlhttp.send(JSON.stringify(myData));
    
//     }

