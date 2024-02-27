//configuración necesaria para que el routeamiento 
//funcione correctamente.
import Koa from 'koa'
import pkg from 'koa-body';
const koaBody = pkg.default;

import cors from '@koa/cors'
import { router } from './router.js'


export const app = new Koa()

app.use(cors())
app.use(koaBody({ multipart: true }))
app.use(router.routes())
app.use(router.allowedMethods())