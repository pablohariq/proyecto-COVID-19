//consumir la api de casos totales

const traerDatosTotales = async () =>{
    response = await axios.get('/api/total')
    console.log(response)
}