//Com o typescript, precisamos definir um tipo à biblioteca importada // npm install @types/express -d
import path from 'path';
import express from 'express';
import routes from './routes';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());
app.use(routes);


app.use('/uploads', express.static(path.resolve(__dirname, '..','uploads')));
//método .static, serve para deixar um link comum com os arquivos utilizados na aplicação (como um param da requisição)
//exemplo: acessar a rota-> http://localhost:3333/uploads/arquivo.extensao - mostra o arquivo

app.listen(3333,() =>{
    console.log('Server running at http://localhost:3333/..')
});