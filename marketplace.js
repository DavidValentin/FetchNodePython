import fetch from "node-fetch";
import chalk from "chalk";
import { readFileSync } from "fs";
import { createObjectCsvWriter as createCSV } from "csv-writer";

// Imprimir en consola la fecha de ejecucion
let now = new Date();
console.log(chalk.bgRedBright(now.toLocaleString()));

// Crear arreglos para iterar en getData
var body_arr;
var cookie_arr;
var xfblsd_arr;
var referer_arr;
var resources_arr = [];
var recursos = [];

// Leer JSON proveniente del codigo Python
var jsonString = readFileSync("data.json", "utf8");

try {
  let datos = JSON.parse(jsonString);
  for (var dato of datos) {
    body_arr = dato.body[0];
    cookie_arr = dato.cookie[0];
    xfblsd_arr = dato.xfblsd[0];
    referer_arr = dato.referer[0];
    recursos = [body_arr, cookie_arr, xfblsd_arr, referer_arr];
    resources_arr.push(recursos);
  }
} catch (err) {
  console.log("Error parsing JSON string:", err);
}

// Crear documento de salida CSV
const csv = createCSV({
  path: "demoD.csv",
  header: [
    { id: "producto", title: "PRODUCTO" },
    { id: "precio", title: "PRECIO" },
    { id: "vendedor", title: "VENDEDOR" },
    { id: "lugar", title: "LUGAR" },
  ],
});

for (var [index, value] of resources_arr.entries()) {
  // Obtencion de productos
  const getData = async () => {
    try {
      const response = await fetch("https://www.facebook.com/api/graphql/", {
        headers: {
          accept: "*/*",
          "accept-language": "es",
          "content-type": "application/x-www-form-urlencoded",
          "sec-ch-prefers-color-scheme": "light",
          "sec-ch-ua":
            '"Chromium";v="106", "Google Chrome";v="107", "Not;A=Brand";v="24"',
          "sec-ch-ua-mobile": "?0",
          "sec-ch-ua-platform": '"Windows"',
          "sec-fetch-dest": "empty",
          "sec-fetch-mode": "cors",
          "sec-fetch-site": "same-origin",
          "viewport-width": "1536",
          "x-fb-friendly-name": "CometMarketplaceSearchContentPaginationQuery",
          "x-fb-lsd": value[2],
          "cookie": value[1],
          "Referrer": value[3],
          "Referrer-Policy": "strict-origin-when-cross-origin",
        },
        "body": value[0],
        "method": "POST",
        "mode": "cors",
        "credentials": "include",
      });

      const data = await response.json();

      var listing_price = "";
      var listing_location = "";
      var marketplace_listing_title = "";
      var marketplace_listing_seller = "";

      for (const edge of data.data.marketplace_search.feed_units.edges) {
        if (edge.node) {
          // Almacenando los datos en variables
          listing_price = edge.node.listing.listing_price.amount;
          listing_location = edge.node.listing.location.reverse_geocode.city;
          marketplace_listing_title =
            edge.node.listing.marketplace_listing_title;
          marketplace_listing_seller =
            edge.node.listing.marketplace_listing_seller.name;

          // Guardando los datos en el doc CSV
          await csv
            .writeRecords([
              {
                producto: marketplace_listing_title,
                precio: listing_price,
                vendedor: marketplace_listing_seller,
                lugar: listing_location,
              },
            ])
            .then(() => {});
        }
      }
    } catch (e) {
      console.log("Error happened", e);
    }
  };

  getData();
}
