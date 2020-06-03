import path from 'path';

module.exports = {
    client:'mysql',
    version:'2.18',
    connection:{
        host:'localhost',
        user:'root',
        password:'',
        database:'EColeta_db'
    },
    seeds:{
        directory:path.resolve(__dirname, 'src','database','seeds')
    }
}
