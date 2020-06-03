import {Request, Response} from 'express';
import knex from '../database/connection';
class PointsController{
    //Listagem de pontos de coleta por categoria: Cidade / uf / items - QUERY PARAMS (?)
    //http://localhost:3333/points?uf=teste&city=qualquer&items=1,2
    async list(request:Request, response:Response){
        const { uf, city, items  } = request.query;

        //convertendo os items para array
        const parsedItems = String(items)
        .split(',')//retira a vírgula
        .map(item => Number(item.trim()));//força pra ser array de Number

        //Filtrando pontos de coleta fazendo join na table item_point
        const points = await knex('points')
        .join('item_point', 'points.id_points', '=', 'item_point.id_points')
        .whereIn('item_point.id_items', parsedItems)
        .where('city', String(city))
        .where('uf', String(uf))
        .distinct()//Como o resultado pode ser mais de um ponto, o distinct faz não repetir!
        .select('points.*');//select apenas dados da tabela pontos

        return response.json(points);

    }


    // Points Individual - usando no mobile
    async show(request:Request, response:Response){//usando request params (parâmetro dentro da rota)
        
        const id = request.params.id_point;

        //buscando o point com o id requisitado
        const point = await knex('points').where('id_points',id).first();
        if(!point){
            response.status(400).json({msg:'Error: Point not found'});
        }

        const items = await knex('items')//buscando os items que têm relação com o colect point requisitado! - quais itens são recebidos nesse ponto de coleta
        .join( 'item_point', "items.id_items", "=", "item_point.id_items" )
        .where('item_point.id_points', id)
        .select('items.title');

        return response.json({ point, items });
    }

    async create(request:Request, response:Response){
        
        //const trx = await knex.transaction();//espera uma operação no banco terminar, para iniciar outra

        const {//DESESTRUTURAÇÃO DE UM OBJETO
            name, 
            email,
            whatsapp,
            latitude,
            longitude,
            city,
            uf, 
            items
        } = request.body;

        const points = {
            image:'https://images.unsplash.com/photo-1517976487492-5750f3195933?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=400&q=80',
            name, // = name: name
            email,
            whatsapp,
            latitude,
            longitude,
            city,
            uf
        }
        const insertedID = await knex('points').insert(points);//Retorna o id que é gerado no banco!!
        console.log('Point inserted')
    
        const pointItems = items.map((id_item:number)=>{
            return {
                id_items:id_item,
                id_points:insertedID[0]//id gerado da função anterior
            };
        });
        

        await knex('item_point').insert(pointItems);//SEMPRE QUE FOR REALIZAR CRUD NO BANCO, COLOCAR AWAIT!    
        console.log('Item Point inserted')
        

        return response.json({
            id:insertedID[0],
            ...points//passa todos os campos do objeto 
        });
    }
}
export default PointsController;