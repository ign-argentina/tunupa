# Tunupa

_**Tunupa**_ es un geocodificador directo y reverso o inverso, es decir que busca una ubicación por el nombre de un lugar o bien busca el nombre si recibe las coordenadas del lugar.

Expone sus funcionalidades a través de una API simple que acepta varios parámetros. Se conecta a una base de datos PostgreSQL donde debe existir una tabla con los nombres y sus coordenadas.

## Nombre

_**Tunupa**_ es una de las divinidades andinas más antiguas, en su máximo apogeo se le veneró en el altiplano alcanzando su auge durante el periodo de los reinos aymaras. Con la llegada de los Incas en algunos sitios fue suplantado por _Viracocha;_ en otros, ambos cultos se amalgamaron. 

La función de _Tunupa_ era el **ordenamiento del mundo**, personifica varios agentes de la naturaleza como el sol, el viento y las tormentas que pueden influir, para bien o para mal, en la producción agrícola. [Fuente: Pueblos Originarios](https://pueblosoriginarios.com/sur/andina/aymara/tunupa.html)

# Ejecución

1. Descargar o clonar este repositorio
2. Contar con una base de datos que tenga:
   1. una tabla de puntos llamada **places** que incluya atributos como nobmre y un vector de búsqueda de texto (ts_vector) donde la aplicación realizará las búsquedas por nombre llamado _"vector"_
   2. una tabla de polígonos llamada **admin_areas** que incluya las áreas que se devuelven como _"envolventes"_ de un punto o coordenadas buscadas, son las áreas intersectadas por ese punto
3. Copiar el archivo `sample.config.json` con el nombre `config.json` y modificar los valores de IP, puertos, usuario y contraseña para poder conectar con la base de datos
4. Instalar Node
5. Ejecutar la aplicación con el comando `npm run start` que usa _Nodemon_ o mediante otro script, por ejemplo _Forever_

# Uso

La API expone dos rutas:

Para geocodificar un nombre o coordenadas
> GET /search

Para obtener los datos de una ubicación por medio de su identificador
> GET /places

## Geocodificación

El parámetro requerido para este endpoint es **"q"**, de _query_ para enviar un nombre.

Ejemplo de búsqueda del texto **"Huajla, Atamisqui"**

**Solicitud:**

> GET /search?q=huajla,%20atamisqui

Devuelve como resultado

**Respuesta:**

```
[
  {
    "place": {
      "id": 770,
      "type": "Paraje",
      "name": "Huajla",
      "depto": "Atamisqui",
      "pcia": "Santiago del Estero",
      "rank": 0.025
    }
  }
]
```

Si el texto buscado es menos específico pueden ser devueltos varios resultados por la API.

Por ejemplo al buscar "Rio" se obtiene más de un resultado (acortado en este caso a 5).

**Respuesta:**

```
[
  {
    "place": {
      "id": 5070,
      "type": "Localidad simple",
      "name": "Río Chico",
      "depto": "Ñorquinco",
      "pcia": "Río Negro",
      "rank": 0.4
    }
  },
  {
    "place": {
      "id": 5083,
      "type": "Componente de localidad compuesta",
      "name": "Río Colorado",
      "depto": "Pichi Mahuida",
      "pcia": "Río Negro",
      "rank": 0.4
    }
  },
  {
    "place": {
      "id": 627,
      "type": "Localidad simple",
      "name": "Río Grande",
      "depto": "Río Grande",
      "pcia": "Tierra del Fuego",
      "rank": 0.4
    }
  },
  {
    "place": {
      "id": 1768,
      "type": "Localidad simple",
      "name": "Villa Río Hondo",
      "depto": "Río Hondo",
      "pcia": "Santiago del Estero",
      "rank": 0.4
    }
  },
  {
    "place": {
      "id": 8232,
      "type": "Componente de localidad compuesta",
      "name": "Río Cuarto",
      "depto": "Río Cuarto",
      "pcia": "Córdoba",
      "rank": 0.4
    }
  }
]
```

Cada resultado incluye su identificador o _id_ que puede ser usado luego en la ruta _places_ para obtener todos los atributos de ese elemento o lugar. 

**Solicitud**

De atributos del resultado "Río Grande" con salida en formato GeoJSON:

> GET /places?id=627&format=geojson

**Respuesta:**

```
{
  "type": "fc",
  "features": [
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [
          -67.696328136,
          -53.786326089
        ]
      },
      "properties": {
        "id": "627",
        "name": "Río Grande",
        "type": "Localidad simple",
        "aglo": "Río Grande",
        "gob_local": "Río Grande",
        "depto": "Río Grande",
        "pcia": "Tierra del Fuego",
        "cod_bahra": "94007010"
      }
    }
  ]
}
```

## Geocodificación inversa

Se usa el mismo parámetro **"q"** para enviar un par de coordenadas geográficas.

**Ejemplos válidos:** formato _latitud, longitud_

> -34.607356,-58.371786 // revuelve Ciudad Buenos Aires
>
> -32,-65
>
> 32 S 65 W // donde S significa "Sur" y W "West (Oeste)"
>
> 40°09'20.6"S 71°21'11.7"W // formato de Google Maps

**No válidos:**

> -234,-358 // fuera de rango, la latitud debe ser un valor entre 90 y -90 y la longitud entre 180 y -180.
>
> $%#%$#&&$ // caracteres no válidos
>
> -31,992499, -65,014396 // coma en lugar de punto como separador decimal
>
> 4888597.279230623, -7943007.456445146 // coordenadas en otro sistema, en este ejemplo son planas o proyectadas en EPSG:3857

Ejemplo de búsqueda del texto **-40.154704,-71.349861**

**Solicitud:**

> GET /search?q=-40.154704,-71.349861

**Respuesta:**

Si las coordenadas son próximas a un lugar o elemento en la taba de búsqueda se devuelve como resultado el _id_, nombre y otros atributos:

```
[
  {
    "place": {
      "id": 4541,
      "name": "San Martín de los Andes",
      "depto": "Lácar",
      "pcia": "Neuquén"
    }
  }
]
```

Si las coordenadas no coinciden con ningún punto de un lugar conocido la API responde con las áreas que son intersectadas o que contienen a ese punto.

Por ejemplo al buscar "-50.489952, -73.114255" (Glaciar Perito Moreno) se obtiene como resultado el listado de áreas que contienen a esas coordenadas, de esa forma se puede al menos entender la ubicación conociendo la región o área administrativa en la que se encuentra.

Siendo el resultado: _"Departamento Lago Argentino, Parque y Reserva Nacional Los Glaciares, Provincia de Santa Cruz"_

**Respuesta:**

```
[
  {
    "row_to_json": {
      "properties": "Departamento Lago Argentino, Parque y Reserva Nacional Los Glaciares, Provincia de Santa Cruz",
      "geom": {
        "type": "Point",
        "coordinates": [
          -73.114255,
          -50.489952
        ]
      }
    }
  }
]
```

## Parámetros

En los ejemplos anteriores se usaron algunos parámetros, aquí se listan todos los aceptados:

> ***Los parámetros deben separarse de la URL con un símbolo de interrogación "?"***
>
> ***Los parámetros deben separarse entre sí con un símbolo "&"***

| Parámetro | Función | Requerido? | Valor aceptado | Ejemplo |
|---|---|---|---|---|
| q | texto o coordeandas buscadas | Sí | textos, coordenadas (ver ejemplos arriba) | `q=Ushuaia` |
| limit | cantidad máxima de resultados a devolver | No | número | `limit=5` |
| format | formato de salida, texto o GeoJSON | No | "geojson" | `format=geojson` |
| radius | radio en metros para buscar lugares desde coordenadas | No | número | `radius=2500` |

**Ejemplo de solicitud con parámetros**

http://127.0.0.1:3000/search?q=-34.456,-60.3443&limit=6&format=geojson&radius=2000

**Respuesta**

```
{
  "type": "FeatureCollection",
  "features": [
    {
      "row_to_json": {
        "properties": "Municipio Salto, Partido de Salto, Provincia de Buenos Aires",
        "geom": {
          "type": "Point",
          "coordinates": [
            -60.3443,
            -34.456
          ]
        }
      }
    }
  ]
}
```