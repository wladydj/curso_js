(function(){
    let latlngs = '';
    let array_localidad = [];
    let polygon = ''; 
    let search = "15"; 
    
    var map = L.map('map').setView([4.60971, -74.08175], 11);

    L.tileLayer('https://{s}.tile.osm.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
     }).addTo(map);

    async function GetLocalidad(){
        const url_localidad = "https://serviciosgis.catastrobogota.gov.co/otrosservicios/rest/services/educacion/inversion/MapServer/0?f=pjson";		
        let resp='[]';
        document.getElementById("map").style.visibility = "hidden";
        try{
            const Localidad = await fetch(url_localidad);
            /*if (!Localidad.ok){
                throw new Error("GetLocalidad - 404 API REST Localidades");
            }*/
            document.getElementById("map").style.visibility = "visible";
            resp = Localidad.json();
        }catch (e){
            console.error("GetLocalidad - Error en la Conexión del API");
        }
      
        return resp;
    }

    async function LoadInfo(){
        let resp = ''; 
        const url_service = "https://serviciosgis.catastrobogota.gov.co/otrosservicios/rest/services/educacion/inversion/MapServer/0/query?where=1%3D1&text=&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&distance=&units=esriSRUnit_Meter&relationParam=&outFields=&returnGeometry=true&returnTrueCurves=false&maxAllowableOffset=&geometryPrecision=&outSR=&havingClause=&returnIdsOnly=false&returnCountOnly=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&returnZ=false&returnM=false&gdbVersion=&historicMoment=&returnDistinctValues=false&resultOffset=&resultRecordCount=&returnExtentOnly=false&datumTransformation=&parameterValues=&rangeValues=&quantizationParameters=&featureEncoding=esriDefault&f=geojson";
        const GeoLoc = await fetch(url_service);
        if(!GeoLoc.ok){
            throw new Error("GetLocalidad - 404 API REST Localidades");
        }else{
            resp = GeoLoc.json();
        }
        return resp;        
    }

    function ViewInfo(GeoLoc){
        let count = 0;			
            GeoLoc['features'].forEach(function(elemento, indice, array) {
                latlngs = "[";
                elemento.geometry.coordinates[0].forEach(function(elemento2, indice2, array) {
                        if (latlngs != "[") latlngs += ", ";	
                        latlngs += "["+elemento2[1]+","+elemento2[0]+"]";
                        count++;
                    })
                  latlngs += "]";
                  row = SearchLocalidad(elemento.properties.COD_LOCA);
                  array_localidad[row][2] = latlngs;
                  
                  //console.log(array_localidad[row][0]+ " - "+array_localidad[row][1]+ " - "+count+" - Color: "+array_localidad[row][3]);
                });
    }

    function GetInfo(Localidad){
        let ContentButton=''; 
        for(var i in Localidad.fields[6].domain.codedValues) {
            let color = '{"color": "'+GetRandomColor()+'"}';
            array_localidad.push( [Localidad.fields[6].domain.codedValues[i].code,  
                                    Localidad.fields[6].domain.codedValues[i].name, "[]", color]);
        }
        array_localidad.sort((a, b) => a[1].localeCompare(b[1]));
        // var nombre_localidad = [];
        // for (var i in array_localidad){
        //     //console.log(i);
        //     //console.log(array_localidad[i][1]);
        //     nombre_localidad = array_localidad[i][1];
        //     console.log(nombre_localidad);
        // }
        //insertionSort(array_localidad);
        //array_localidad.push([])
        //console.log(array_localidad);
        //console.log(array_localidad);
        
        let k=0;
        while(k<array_localidad.length){
            ContentButton += '<a href="#" data-id_localidad="'+array_localidad[k][0]+'" class="btn_localidad btn btn-default btn-block" role="button"><span class="pull-left">'+array_localidad[k][1]+'</span>&nbsp;</a>';
            k++; 
        }  
        //const row = array_localidad.findIndex(row => row.includes());
        document.getElementById("LocalButton").innerHTML=ContentButton; 
        ActiveButtons();
               
    }

    // function insertionSort( myArray ) {
    //     var size = myArray.length,
    //         slot,
    //         tmp;
       
    //     for ( var item = 0; item < size; item++ ) {     
    //       tmp = myArray[item];
    //       for ( slot = item - 1; slot >= 0 && myArray[slot] > tmp; slot-- ){
    //         myArray[ slot + 1 ] = myArray[slot];
    //       }
    //       myArray[ slot + 1 ] = tmp;
    //     }
    //     return myArray;
    //   }
  
    function drawMap(idLocalidad){
        row = SearchLocalidad(idLocalidad);
        const json_coord = JSON.parse(array_localidad[row][2]);
        const json_color = JSON.parse(array_localidad[row][3]);
        if(polygon != ''){
            map.eachLayer(layer => {
                layer.remove()});

                L.tileLayer('https://{s}.tile.osm.org/{z}/{x}/{y}.png', {
                    attribution: '&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
                }).addTo(map);
        }

    
        polygon = L.polygon(json_coord, json_color).addTo(map); 
        	
    }	

    function GetRandomColor() {
        let color = '#';
        for (var i = 0; i < 6; i++) {
            color += Math.floor(Math.random() * 10);
        }
        return color;
    }

    function ActiveButtons(){
        var buttons = document.querySelectorAll(".btn_localidad").length;

        for (var i = 0; i < buttons ; i++) {
            document.querySelectorAll(".btn_localidad")[i].addEventListener("click", function() {
                row = SearchLocalidad(this.dataset.id_localidad)
                document.getElementById("Title").innerHTML = "Mapa Localidad "+ array_localidad[row][0] + " - "+ array_localidad[row][1]+" Bogotá D.C ";
                drawMap(this.dataset.id_localidad);
            });
        }		
    }

    function SearchLocalidad(IdLocalidad){
        const row = array_localidad.findIndex(row => row.includes(IdLocalidad));
        return row;
    }


    const prepareLocalidad = () => {
        return new Promise((resolve, reject) => {
            GetLocalidad().then(GetInfo); 
            setTimeout(
                function (){
                    //array_localidad = [];  
                    if(array_localidad.length > 0)
                        resolve('OK');
                    else
                        reject("error");
                }, 1000); 
        });
    };

    prepareLocalidad()
        .then(response => console.log(response))
        .then(response => LoadInfo().then(ViewInfo))
        .catch(response => console.log('Fallo'));

})();
