const traerDatosTotales = async () =>{
    let response = await fetch('/api/total')
    let {data} = await response.json() 
    // console.log(data)
    return data //data es un arreglo
}

const identificarMasCasosActivos = (datosTotales) => { //identificar los 25 paises con mas casos activos
    datosFiltrados = datosTotales.filter(pais => pais.active > 10000) 
    datosFiltrados.sort((pais1, pais2) => pais2.active - pais1.active)
    topCasosActivos = datosFiltrados.slice(0,20) //top 20
    console.log(topCasosActivos)
    return topCasosActivos
}

(async ()=>{
    let datosTotales = await traerDatosTotales()
    console.log(datosTotales)
    let top25CasosActivos = identificarMasCasosActivos(datosTotales)
    crearGrafico(top25CasosActivos)
})();

const crearGrafico = (arreglo) =>{
    console.log(arreglo)
    let paises = arreglo.map(d => d.location) //d de data
    let arregloConfirmados = arreglo.map(d => d.confirmed)
    let arregloMuertes = arreglo.map(d => d.deaths)
    let arregloRecuperados = arreglo.map(d => d.recovered)
    let arregloCasosActivos = arreglo.map(d => d.active)


    new Chart(document.getElementById("graficoPaises"), {
        type: 'bar',
        data: {
          labels: paises,
          datasets: [
            {
              label: "Confirmados",
              backgroundColor: "#3B82F6",
              data: arregloConfirmados
            }, 
            {
              label: "Muertes",
              backgroundColor: "#DC2626",
              data: arregloMuertes
            },
            {
              label: "Recuperados",
              backgroundColor: "#10B981",
              data: arregloRecuperados
            },
            {
              label: "Casos Activos",
              backgroundColor: "#FCD34D",
              data: arregloCasosActivos
            }
          ]
        },
        options: {
          title: {
            display: true,
            text: 'Casos de COVID según país'
          }
        }
    });
}
