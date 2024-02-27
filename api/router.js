/*archivo de configuración de las rutas http
a ser usadas*/
import Router from '@koa/router'
import { Nutricionista } from './models/nutricionista.js'
import { Consultante } from './models/consultante.js'
import { Receta } from './models/receta.js'
import * as para_agente_externo from './utility/nutricionista/api/index.js'
export const router = new Router()




router.get('/login', async (ctx) => { await Nutricionista.login(ctx) })
router.post('/signup', async (ctx) => { await Nutricionista.signup(ctx) })

router.get('/getSpecialty', async (ctx) => { await Nutricionista.getSpecialty(ctx) })
router.get('/getCountries', async (ctx) => { await Nutricionista.getCountries(ctx) })

router.get('/getProfileData', async (ctx) => { await Nutricionista.getProfileData(ctx) })
router.put('/updateProfileData', async (ctx) => { await Nutricionista.updateProfile(ctx) })

router.get('/getConsultants', async (ctx) => { await Nutricionista.getConsultantes(ctx) })
router.get('/getHistory', async (ctx) => { await Nutricionista.getHistory(ctx) })
router.post('/getHistoryInformes', async (ctx) => { await Nutricionista.getHistoryInformes(ctx) })
router.post('/saveReport', async (ctx) => { await Nutricionista.saveReport(ctx) })
router.get('/getReport', async (ctx) => { await Nutricionista.getReport(ctx) })

//------------------------------------------------------------------------------------------------------------------
//Recetas -> obtenerlas y crearlas
router.get('/getRecipes', async (ctx) => { await Receta.getRecipes(ctx) })
router.post('/createRecipe', async (ctx) => { await Receta.createRecipe(ctx) })

//------------------------------------------------------------------------------------------------------------
// Segmento para las rutas que van a estar expuestas a un servicio externo.

//para_agente_externo => hace referencia las apis que se proporciona a ChefDigitales para
// que pueda obtener algunos recursos de la plataforma sin necesidad de acceder al codigo fuente.

//route abierta para exponer los nutricionistas con todos sus datos
router.post('/getNutritionist', para_agente_externo.getNutricionistas)


//ruta: Deja expuesto las apis para aceptar el registro del nutricionista / desactivar su cuenta
router.put('/acceptRegistration', para_agente_externo.acceptRegistration)
router.put('/disabledNutritionist', para_agente_externo.disabledNutricionista)
//----------------------------------------------------------------------------------------------------------------

router.post('/createNewConsultant', async (ctx) => { await Consultante.createNewConsultant(ctx) })
router.post('/detalleConsultante', async (ctx) => { await Nutricionista.getConsultantDataForId(ctx) })
router.put('/updateConsultantData', async (ctx) => { await Consultante.updateConsultantData(ctx) })

router.post('/detalleConsultante/anamnesis', async (ctx) => { await Nutricionista.getAnamnesisForId(ctx) })
router.post('/detalleConsultante/afecciones', async (ctx) => { await Nutricionista.getAfeccionesForId(ctx) })
router.post('/detalleConsultante/tipodieta', async (ctx) => { await Nutricionista.getTipoDietaForId(ctx) })

