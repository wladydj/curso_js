(async function () {
    var url_service = "https://www.datos.gov.co/resource/nav4-rbv7.json";
  
    function getDataOfi() {
      return new Promise((resolve) => {
        fetch(url_service).then((response) => response.json()).then((data) => resolve(data));
      });
    }
  
    let source = await getDataOfi();
    var respuesta = document.querySelector('#respuesta');
	respuesta.innerHTML = '';

    for(var i in source){
        respuesta.innerHTML += `
            <tr>
                <td>${source[i]["nombre_unidad_armda_nacional"]}</td>
				<td>${source[i]["nombre_gestor"]}</td>
                <td>${source[i]["email_gestor"]}</td>
                <td>${source[i]["direccion_unidad"]}</td>
                <td>${source[i]["ciudad"]}</td>
                <td>${source[i]["departamento"]}</td>
			</tr>
		`
    }

  })();