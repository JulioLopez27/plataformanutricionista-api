export class Afeccion {
    constructor(diabetes_tipo_1, diabetes_tipo_2, celiaquismo, hipertension, alergias, enfermedad_renal,
                    hipercolesterolemia, anemia, obesidad) {
        this.diabetes_tipo_1 = diabetes_tipo_1; // Booleano
        this.diabetes_tipo_2 = diabetes_tipo_2; // Booleano
        this.celiaquismo = celiaquismo; // Booleano
        this.hipertension = hipertension; // Booleano
        this.alergias = alergias; // Cadena de caracteres separados por comas
        this.enfermedad_renal = enfermedad_renal; // Booleano
        this.hipercolesterolemia = hipercolesterolemia; // Booleano
        this.anemia = anemia; // Booleano
        this.obesidad = obesidad; // Booleano

    }
}


