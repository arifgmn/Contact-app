const express = require('express')
const expressLayouts = require('express-ejs-layouts')

const { body, validationResult, check } = require('express-validator')
const methodOverride = require('method-override')

const session = require('express-session')
const cookieParser = require('cookie-parser')
const flash = require('connect-flash')

require('./utils/db')
const Contact = require('./model/contacts')

const app = express()
const port = 3000

// setup method override
app.use(methodOverride('_method'))

// setup ejs
app.set('view engine', 'ejs')
app.use(expressLayouts)
app.use(express.static('public'))
app.use(express.urlencoded({ extended : true }))

// setup flash
app.use(cookieParser('secret'))
app.use(session({
    cookie: { maxAge : 6000 },
    secret: 'secret',
    resave: true,
    saveUninitialized: true,
}))
app.use(flash())

// Halaman Home
app.get('/', (req, res) => {
    res.render('index', {
        title: 'Halaman Home',
        layout: 'layouts/main'
    })
})
// Halaman About
app.get('/about', (req, res) => {
    res.render('about', {
        title: 'Halaman About',
        layout: 'layouts/main'
    })
})
// Halaman Contact
app.get('/contact', async (req, res) => {
    const contacts = await Contact.find()

    res.render('contact', {
        title: 'Halaman Contact',
        layout: 'layouts/main',
        contacts,
        msg: req.flash('msg')
    })
})

// Halaman form tambah data
app.get('/contact/add', (req, res) => {
    res.render('add-contact', {
        title: 'Form Tambah Contact',
        layout: 'layouts/main',
    })
})

// prossess tambah data
app.post('/contact', [
    body('nama').custom(async (value) => {
        const duplikat = await Contact.findOne({ nama: value })
        if(duplikat) {
            throw new Error('Nama Contact Sudah digunakan!')
        }
        return true
    }),
    check('email', 'Email Tidak Valid!').isEmail(),
    check('nohp', 'Nomor Handphone Tidak Valid!').isMobilePhone('id-ID')
] ,(req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.render('add-contact', {
        title: 'Form Tambah Contact',
        layout: 'layouts/main',
        errors: errors.array()
        })
    } else {
        Contact.insertMany(req.body, (error, result) => {
            req.flash('msg', 'Data Contact Berhasil Ditambahkan!')
            res.redirect('/contact')
        })
    }
})

// proses delete contact
// app.get('/contact/delete/:nama', async (req, res) => {
//     const contact = await Contact.findOne({ nama : req.params.nama })
//     if(!contact) {
//         res.status(404)
//         res.send('404')
//     } else {
//         Contact.deleteOne({ _id : contact._id}).then((result) => {
//             req.flash('msg', 'Data Contact Berhasil Dihapus!')
//             res.redirect('/contact')
//         })
//     }
// })
app.delete('/contact', (req, res) => {
    Contact.deleteOne({ nama : req.body.nama}).then((result) => {
        req.flash('msg', 'Data Contact Berhasil Dihapus!')
        res.redirect('/contact')
    })
})

// Halaman ubah
app.get('/contact/edit/:nama', async (req, res) => {
    const contact = await Contact.findOne({ nama: req.params.nama})

    res.render('edit-contact', {
        title: 'Form Ubah Contact',
        layout: 'layouts/main',
        contact
    })
})

app.put('/contact', [
    body('nama').custom(async (value, { req }) => {
        const duplikat = await Contact.findOne({ nama: value })
        if(value !== req.body.oldNama && duplikat) {
            throw new Error('Nama Contact Sudah digunakan!')
        }
        return true
    }),
    check('email', 'Email Tidak Valid!').isEmail(),
    check('nohp', 'Nomor Handphone Tidak Valid!').isMobilePhone('id-ID')
    ] ,(req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.render('edit-contact', {
        title: 'Form Ubah Contact',
        layout: 'layouts/main',
        errors: errors.array(),
        contact: req.body 
        })
    } else {
        Contact.updateOne(
            { _id: req.body._id},
            {
                $set: {
                    nama: req.body.nama,
                    nohp: req.body.nohp,
                    email: req.body.email,
                }
            }
        ).then((result) => {
            req.flash('msg', 'Data Contact Berhasil DiUbah!')
            res.redirect('/contact')
        })
    }
})

// Halaman detail
app.get('/contact/:nama', async (req, res) => {
    const contact = await Contact.findOne({ nama: req.params.nama })
    res.render('detail-contact', {
        title: 'Halaman Detail Contact',
        layout: 'layouts/main',
        contact
    })
})

app.listen(port, () => {
    console.log(`Contact App listening on http://localhost:${port}`)
})