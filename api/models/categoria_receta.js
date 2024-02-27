export class Categoria_Receta {
    constructor(nombre, descripcion) {
        this.nombre = nombre;
        this.descripcion = descripcion;
    }
}

// Categorias de ChefDigitales:
const categoriaPorDefecto = new Categoria_Receta("Almuerzo", "Cena","Bebidas","Sopas","Entradas","Repostería",
                                "Postres","Salsas","Guarnición","Desayuno","Comida de bebé","Halloween","vc/Almuerzos",);
