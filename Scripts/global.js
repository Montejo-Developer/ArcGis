//Variables globales 
var latitude; 
var longitude;

//Llamamos a la geolocalizacion
getLocation();

//Cargar mapa
function loadMap () {
    require(["esri/Map",
    "esri/views/MapView",
    "esri/widgets/Bookmarks",
    "esri/widgets/Expand",
    "esri/widgets/Search",
    "esri/Graphic"],//Requerimos los modulosde nuestro proyecto
        function (Map, MapView, Bookmarks, Expand, Search, Graphic) { //Funcion que crea nuestro mapa
    
            var map = new Map({
            basemap: "topo-vector" //Capa de referencia topografica basada en vectores 
        });
    
        var view = new MapView({ //Elemento dibujable para visualizar el mapa
    
            container: "viewDiv", //Contenedor donde debe ejecutarse
            map: map, //Asigna el mapa previamente creado a nuestro contenedor
    
            center: [-0.48149,38.34517], // longitud, latitud donde se posiciona el mapa
            zoom: 13 //Nivel de zoom
        });
        const bookmarks = new Bookmarks({ //Elemento que almacena la ubicaion actual en una lista
            view: view, //Asignamos nuestros bookmarks a la view que hemos creado
            editingEnabled: true //Permitimos añadir eliminar o modificar bookmarks
          });
    
          const bkExpand = new Expand({ //Elemento que muestra el "menu" donde almacenar los bookmarks
            view: view,
            content: bookmarks, //Le asignamos los bookmarks a este menu
            expanded: false //Dictamina si el menu esta desplegado o no por defecto
          });
    
          view.ui.add(bkExpand, "top-right"); // Añadir la ubicacion del menu bkExpand

          // Widget de busqueda
          var search = new Search({
            view: view
          });

          view.ui.add(search, "top-right"); // Añadir la ubicacion del menu search

          view.on("click", function(evt){ //Creamos un evento onClick() en nuestra view
            search.clear(); //Limpiamos el campo de busqueda
            view.popup.clear();
            
            if (search.activeSource) { //Comprueba si hay alguna coordenada seleccionada
              var geocoder = search.activeSource.locator; // Accede al localizador interno
              // de ArcGis y almacena las coordenas del punto seleccionado
              
              //params es requerido para funcionar ya que necesitamos una localizacion, le pasamos las coordenadas clickadas
              var params = {
                location: evt.mapPoint 
              };

              //Funcion interna de Arcgis que convierte coordenas a direcciones
              geocoder.locationToAddress(params)
                .then(function(response) { // Muestra la direccion
                  var address = response.address;
                  
                  createMarker(evt.mapPoint); //LLamada a la funcion donde crearemos nuestro marcador
                  showPopup(address, evt.mapPoint); //Llamada a la funcion donde crearemos nuestro PopUp

                }, function(err) { // En caso de error nos dira que no encuentra la direccion
                  showPopup("No address found.", evt.mapPoint);
                });
            }
          });
          
          //Funcion interna que muestra un campo de texto encima del punto del mapa
          function showPopup(address, pt) {
            view.popup.open({

              
              //Redondeamos los numeros de las coordenadas y las ponemos de titulo
              title:  + Math.round(pt.longitude * 100000)/100000 + 
              ", " + Math.round(pt.latitude * 100000)/100000,
              //La direccion de existir sera el contenido
              content: address + " Distancia : " + 
              measure(pt.latitude,pt.longitude
                ,latitude,longitude) + " Km",
              location: pt
            });
          }

          function createMarker(pt) {

            var symbol = {
              type: "simple-marker",
              style: "square",
              color: "blue",
              size: "8px", 
              outline: {  // Borde exterior
                color: [ 255, 255, 0 ],
                width: 3 
              }
            };
  
            var point = {
              type: "point",  // tipo de marcador
              longitude: pt.longitude,
              latitude: pt.latitude
            };
  
            //Objeto que engloba el point y el simbol
            var pointGraphic = new Graphic({
              geometry: point,
              symbol: symbol
            });
  
            view.graphics.add(pointGraphic);
          }

          function measure(lat1, lon1, lat2, lon2){  // Funcion que calcula la distancia entre dos puntos
            var R = 6378.137; // Radio de la tierra en KM

            //Calcula la diferencia entre las latitudes y las longitudes
            var dLat = lat2 * Math.PI / 180 - lat1 * Math.PI / 180; 
            var dLon = lon2 * Math.PI / 180 - lon1 * Math.PI / 180;

            //Formula matematica que convierte la diferencia entre coordenadas a KM
            var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
            var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
            //Resultado final
            var distancia = R * c;

            return distancia.toFixed(2); // Devolvemos el valor con un maximo de 2 decimales
        }
           
        });
}

//Obtener localizacion actual
function getLocation() {

  //PRUEBAS
  for (let index = 0; index < 5; index++) {
    console.log(index);
    
  }

  var control = true;
  var numeral = 0;
  do {
    
    console.log("Hola mundo");
    numeral++;

    if(numeral == 5) {
      control = false;
    }

  } while (control);

  //FIN PRUEBAS


    //Recogemos localizacion actual
    navigator.geolocation.getCurrentPosition(success,error);//Tenemos que pasarle una funciona a realizar en caso de exito o error
}

function success(pos) {
    //Gestion de los datos en caso de tener exito
    latitude = pos.coords.latitude;
    longitude = pos.coords.longitude;
    loadMap();
  };
  
  function error(err) {
      //Gestion de error
    console.warn('ERROR(' + err.code + '): ' + err.message); //
  };
