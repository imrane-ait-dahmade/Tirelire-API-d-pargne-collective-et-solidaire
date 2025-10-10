import Router from "./Router.js";
// import AuthController from '../app/Http/Controllers/AuthController.js';
import AuthController from "../app/Http/Controllers/AuthController.js";
const Route = new Router();

Route.get('/', (req, res) => res.json('hello world'));
Route.post('/register',AuthController.Register);
Route.get('/users', AuthController.GetAll);
Route.get('/user/:id',AuthController.find);
Route.post('/login',AuthController.login);
export default Route.getRouter();


