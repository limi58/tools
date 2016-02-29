'use strict'

const fs = require('fs')

fs.readdir('./', (err, files)=>{
  let newFile;
  files.forEach((file, i)=>{
    if(/.+?\.(?!js)/.test(file)) {
      newFile = file.replace(/.+?\./, `${i}.`)
      console.log(`old: ${file} - new: ${newFile}`)
      fs.rename(file, newFile, ()=>{console.log(`${i} is successful!!!`)})
    }
  })
})