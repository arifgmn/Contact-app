const mongoose = require('mongoose')
mongoose.connect('mongodb://localhost:27017/Arif', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
});

// Menambahkan 1 contact
// const contact1 = new Contact({
//     nama: 'Arif Gimnastiar',
//     nohp: '089632760125',
//     email: 'arif@gmail.com'
// })

// // Simpan ke collection
// contact1.save().then((contact) => console.log(contact))

