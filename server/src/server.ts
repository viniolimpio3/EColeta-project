//Com o typescript, precisamos definir um tipo à biblioteca importada // npm install @types/express -d

import express from 'express';
const app = express();

app.get('/users',(request, response) => {
    response.json({
        nome:'Vinícius',
        teste:'VVini'
    });
});

app.listen(3333);
