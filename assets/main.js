const $divTabla = $("#divTabla")
const traerDatos = async (url) =>{
    let response = await fetch(url)
    let {data} = await response.json() 
    // console.log(data)
    return data //data es un arreglo
}

const traerDatosPrivados = async (url,jwt) =>{
    let response = await fetch(url,{
		method: "GET",
		headers:{
			Authorization: `Bearer ${jwt}` 
			}
		}
	)
    let {data} = await response.json() 
    // console.log(data)
    return data //data es un arreglo
}

const identificarMasCasosActivos = (datosTotales) => { //identificar los 25 paises con mas casos activos
	datosFiltrados = datosTotales.filter(pais => pais.active > 10000) 
	datosFiltrados.sort((pais1, pais2) => pais2.active - pais1.active)
	topCasosActivos = datosFiltrados.slice(0,20) //top 20
	// console.log(topCasosActivos)
	return topCasosActivos
}

(async ()=>{
    let datosTotales = await traerDatos('/api/total')
    datosTotales.sort((pais1, pais2) => pais2.active - pais1.active)
    // console.log(datosTotales)
    let top25CasosActivos = identificarMasCasosActivos(datosTotales)
    crearGraficoPaises(top25CasosActivos)

    crearTabla(datosTotales)
    $("table").hide();
    $("table").fadeIn(500);
    //cuando esté la tabla dibujada, se agrega el evento a todos los botones
    $("td button").click(verDetalle)

})();

const crearGraficoPaises = (arreglo) =>{
    // console.log(arreglo)
    let paises = arreglo.map((d) => d.location) //d de data
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
              backgroundColor: "#D97706",
              data: arregloCasosActivos
            }
          ]
        },
        options: {
          title: {
            display: true,
            text: 'Casos de COVID según país'
          },
		  animation: {
			delay: 1000
		  }
        }
    });
}


cuerpoTabla = document.querySelector("#divTabla tbody")
const crearTabla = (arreglo) =>{
	arreglo.forEach(async (elemento) =>{
		// let paisTraducido = await traducirNombrePais(elemento.location);	//experimental
		cuerpoTabla.innerHTML += 
		`
		<tr><th scope="row">${elemento.location}</th> <td>${elemento.confirmed}</td> <td>${elemento.deaths}</td> <td>${elemento.recovered}</td> <td>${elemento.active}</td> <td><button class="btn btn-outline-primary btn-sm" data-toggle="modal" data-target="#modalDetalle" data-pais="${elemento.location}">Ver Detalle</button></td> </tr>
		`
	})
	$divTabla.removeClass("d-none")
}

let graficoDetallePais 
const verDetalle = async function(){
	if(graficoDetallePais) graficoDetallePais.destroy(); //destruir canvas previo si existe
	let pais = $(this).attr("data-pais")
	let paisTraducido = await traducirNombrePais(pais)
	let datosPais = await traerDatos(`/api/countries/${pais}`)
	let cifrasPais = Object.values(datosPais).slice(1,6)
	
	$("#modalDetalle .modal-title").html(`Detalle de casos COVID-19 para ${paisTraducido}`)
	graficoDetallePais = new Chart(document.getElementById("graficoDetallePais"), { //importante reasignar y no redefinir
		type: 'doughnut',
		data: {
		  labels: ["Confirmados", "Muertos", "Recuperados", "Activos"],
		  datasets: [
			{
			  label: "Cantidad",
			  backgroundColor: ["#3B82F6", "#DC2626","#10B981","#D97706"],
			  data: cifrasPais
			}
		  ]
		},
		options: {
		  title: {
			display: true,
			text: ""
		  },
		  animation: {
			duration: 1250,
			easing: "easeOutCubic"
		  },
		  cutout: "70%",
		  legend:{
			  display: true
		  }
		}
	});
}

//recibe el nombre de un país en inglés y devuelve su traducción en español mediante otra API
const traducirNombrePais = async (paisEnIngles) =>{
	let response = await fetch(`https://restcountries.eu/rest/v2/name/${paisEnIngles}`)
	let [data] = await response.json()
	let traduccion = data.translations.es
	return traduccion
}
//esta ultima funcionalidad tarda un poco. Para traducir los nombres de todas los países en la tabla sería muy lento.
//pero al menos en la traducción de la ventana modal se ve bien. Se podría agregar una ruedita de cargando quizás

//HITO 2

const iniciarSesion = async (e) => {
	e.preventDefault();
	let email = $("#email").val()
	let password = $("#password").val()
	
	let response = await fetch("/api/login",{
		method: "POST",
		body: JSON.stringify({email, password})
	})
	let data = await response.json()
	let token = data.token
	if (token){
		localStorage.setItem("token", token)
		$("#modalLogin").modal("hide")
		$("form")[0].reset() //esto deberia aplicar reset a un elemento html javascript
		iniciarApp()
	}
	else{
		alert("Nombre de usuario o contraseña inválidos") //esto se puede mejorar de muchas formas pero lo postergaremos considerando que es un MVP
	}
	
	
}

const iniciarApp = () => { //ejecutar una vez validado el usuario
	$("#liIniciarSesion").toggleClass("d-none")
	$("#liCerrarSesion").toggleClass("d-none")
	$("#liSituacionChile").toggleClass("d-none")
}

const cerrarSesion = () => {
	localStorage.removeItem("token")
	$("#liIniciarSesion").toggleClass("d-none")
	$("#liSituacionChile").toggleClass("d-none")
	$("#liCerrarSesion").toggleClass("d-none")
	$("#divGraficoChile").toggleClass("d-none")
	$("#divGraficoPaises").removeClass("d-none")

}

let canvasGraficoChile
const mostrarSituacionChile = async () => {
	$("#divGraficoChile").removeClass("d-none")
	if (canvasGraficoChile) canvasGraficoChile.destroy();
	$("#divTabla").addClass("d-none")
	$("#divGraficoPaises").addClass("d-none")

	let token = localStorage.getItem("token")
	const promesaConfirmados = traerDatosPrivados("/api/confirmed", token)
	const promesaRecuperados =  traerDatosPrivados("/api/recovered", token)
	const promesaMuertos =  traerDatosPrivados("/api/deaths", token)

	Promise.all([promesaConfirmados, promesaRecuperados, promesaMuertos]) //permite que se hagan las tres consultas en paralelo
	.then(([confirmados, recuperados, muertos]) => {

		let fechas = confirmados.map(d => d.date)

		let totalConfirmados = confirmados.map(d => d.total)
		let totalMuertos = muertos.map(d => d.total)
		let totalRecuperados = recuperados.map(d => d.total)
	
		let canvasGraficoChile = new Chart(document.getElementById("graficoChile"), {
			type: 'line',
			data: {
			  labels: fechas,
			  datasets: [{ 
				  data: totalConfirmados,
				  label: "Confirmados",
				  borderColor: "#3e95cd",
				  fill: false
				}, { 
				  data: totalMuertos,
				  label: "Muertos",
				  borderColor: "#8e5ea2",
				  fill: false
				}, { 
				  data: totalRecuperados,
				  label: "Recuperados",
				  borderColor: "#3cba9f",
				  fill: false
				}]
			},
			options: {
			  parsing: true, //requiere false para diezmar los datos
			  title: {
				display: true,
				text: 'Casos COVID-19 en Chile'
			  },
			  elements:{
				line:{
					borderWidth: 2
				}
			  },
			  plugins: { //diezmar los datos
				  decimation: {
					  enabled: true,
					  algorithm: "lttb"
				  }
			  }
			}
		});
	});
}

$("#liCerrarSesion a").click(cerrarSesion)
$("form").submit(iniciarSesion)
$("#liSituacionChile a").click(mostrarSituacionChile)
