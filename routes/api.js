import Router from "./Router.js";

const Route = new Router();

Route.get('/', (req, res) => res.json('hello world'));

export default Route.getRouter();


