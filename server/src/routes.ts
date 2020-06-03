import express, { response } from 'express';


const routes = express.Router();

import ItemsController from './controllers/ItemsController';
import PointsController from './controllers/PointsController';

//instânciando objeto das classes Controllers
const items = new ItemsController();
const points = new PointsController();

//Listagem de Itens
routes.get('/items', items.list);//método list da classe ItemsController
//Cadastrar colect points
routes.post('/points', points.create);
//Listar points específicos
routes.get('/points/:id_point', points.show);
//listar points de acordo com localização
routes.get('/points', points.list);

export default routes;    