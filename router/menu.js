const express = require("express")
const app = express()
const menu = require("../models/index").menu
const multer = require("multer")
const path = require("path")
const fs = require("fs")

const { Op } = require('sequelize')

app.use(express.urlencoded({ extended: true }))
app.use(express.json())

// config storage image
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./img")
  },
  filename: (req, file, cb) => {
    cb(null, "img-" + Date.now() + path.extname(file.originalname))
  }
})
let upload = multer({ storage: storage })

app.get("/", async (req, res) => {
  menu.findAll()
    .then(result => {
      res.json({
        data: result
      })
    })
    .catch(error => {
      res.json({
        message: error.message
      })
    })
})

app.get("/menu/:nama_menu", auth, async (req, res) => {
  let param = {
      nama_menu: req.params.nama_menu,
  }
  menu.findAll({
      where: {
          [Op.or]: [
              {'$menu.nama_menu$': {[Op.like]: `%${param.nama_menu}%`}}
          ]
      }
  })
      .then(result => {
          res.json({
              data: result
          })
      })
      .catch(error => {
          res.json({
              message: error.message
          })
      })
})

app.get("/:id", async (req, res) => {
  let param = {
    id_menu: req.params.id
  }
  menu.findOne({ where: param })
    .then(result => {
      res.json({
        data: result
      })
    })
    .catch(error => {
      res.json({
        message: error.message
      })
    })
})

app.get("/jenis/:jenis", async (req, res) => {
  let param = {
    jenis: req.params.jenis
  }
  menu.findAll({ where: param })
    .then(result => {
      res.json({
        data: result
      })
    })
    .catch(error => {
      res.json({
        message: error.message
      })
    })
})

app.post("/", upload.single("gambar"), async (req, res) => {
  if (!req.file) {
    res.json({
      message: "File tidak ada!"
    })
  } else {
    let data = {
      nama_menu: req.body.nama_menu,
      jenis: req.body.jenis,
      deskripsi: req.body.deskripsi,
      gambar: req.file.filename,
      harga: req.body.harga
    }
    menu.create(data)
      .then(result => {
        res.json({
          message: "Data Berhasil Ditambahkan",
          data: result
        })
      })
      .catch(error => {
        res.json({
          message: error.message
        })
      })
  }
})

app.put("/", upload.single("gambar"), async (req, res) => {
  let param = {
    id_menu: req.body.id_menu
  }
  let data = {
    nama_menu: req.body.nama_menu,
    jenis: req.body.jenis,
    deskripsi: req.body.deskripsi,
    harga: req.body.harga
  }
  if (req.file) {
    // get data by id
    const row = menu.findOne({ where: param })
      .then(result => {
        let oldFileName = result.gambar

        // delete old file
        let dir = path.join(__dirname, "../img", oldFileName)
        fs.unlink(dir, err => console.log(err))
      })
      .catch(error => {
        console.log(error.message);
      })

    // set new filename
    data.gambar = req.file.filename
  }
  menu.update(data, { where: param })
    .then(result => {
      res.json({
        message: "Data Berhasil Diperbarui"
      })
    })
    .catch(error => {
      res.json({
        message: error.message
      })
    })
})

app.delete("/:id", async (req, res) => {
  try {
    let param = { id_menu: req.params.id }
    let result = await menu.findOne({ where: param })
    let oldFileName = result.gambar

    // delete old file
    let dir = path.join(__dirname, "../img", oldFileName)
    fs.unlink(dir, err => console.log(err))

    // delete data
    menu.destroy({ where: param })
      .then(result => {

        res.json({
          message: "data berhasil di hapus",
        })
      })
      .catch(error => {
        res.json({
          message: error.message
        })
      })

  } catch (error) {
    res.json({
      message: error.message
    })
  }

})
module.exports = app

