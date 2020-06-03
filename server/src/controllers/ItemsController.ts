import {Request, Response} from 'express';
import knex from '../database/connection';
class ItemsController{
    
    async list(request:Request, response:Response){
        const items = await knex('items').select('*');
    
        const serializableItems = items.map((item)=>{
            return {
                id: item.id_items,
                title: item.title,
                image_url: `http://localhost:3333/uploads/${item.image}`
            }
        })
        return response.json(serializableItems);
    }
}
export default ItemsController;