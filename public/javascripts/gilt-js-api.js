/*****************************************

Gilt Groupe JavaScript (jQuery) Public API
Copyright Gilt Groupe 2012


*****************************************/

($(function() {
    GiltApi = function( apiKey ) {
    
    var self = this,
        apiObj = { apikey : apiKey };
      
    //api key validation
    if ( typeof apiKey != "string" || !apiKey ) errorHandler( "Invalid API Key" );
    
    //config base url and valid stores
    var giltApiBase = "https://api.gilt.com/v1/",
        stores = [
          "men",
          "women",
          "home",
          "kids"
        ];
    
    function errorHandler( message ) {
      throw( message );
      return false;
    }
    
    //store name validation
    function validateStore( storeName ) {
      return $.inArray( storeName, stores ) > -1 || storeName == '';
    }
    
    function isFunc( func ) {
      return typeof func == "function";
    }
    
    //creates a request that returns sales or product data
    function request( url, callback, modifier ) {
      
      //jQuery deferred init
      var dfd = $.Deferred();
      
      //jQuery syntax ajax
      $.ajax({
          url: url,
          dataType: "jsonp",
          data: apiObj,
          success: function( data ) {
            
            if( isFunc( modifier ) ) {
              data = modifier( data );
            } 
            
            if( isFunc( callback ) ) {
              callback( data ); 
            }
            dfd.resolve( data );
          },
          error: function() {
            errorHandler( "Error retrieving Gilt API Data" );
          }
      });
      
      return dfd;
    }
    
    //builds a path to the desired sales data
    function salesQuery( storeName, fileName, saleKey ) {
      storeName = typeof storeName == "string" ? storeName.toLowerCase() : '';
      if ( validateStore( storeName ) ) {
        
        var storeQuery =  storeName.length > 0 ? storeName + '/' : storeName,
            saleKeyQuery =  saleKey && saleKey.length > 0 ? saleKey + '/' : ''; 
            
        return giltApiBase + "sales/" + storeQuery + saleKeyQuery + fileName + ".json";; 

      } else {
        errorHandler( "Invalid store name" );
      }
      
    }
    
    //iterate over the sales data and get the products for each sale
    function getProductsFromSales( sales ) {
      var products = [];
      for ( key in sales ) {
        var sale = sales[ key ];
        for( product in sale.products ) {
          products.push( sale.products[ product ] );
        }
      }
      return products;
    }
    
    //public methods
    
    //gets sales on gilt, sorted by upcoming/active and storeName
    this.getSales = function( callback, upcoming, storeName ) {
      var fileName = upcoming ? 'upcoming' : 'active';
      return request(
        salesQuery( storeName, fileName ),
        callback,
        function( data ) {
          return data.sales;
        }
      );
    },
    
    //gets detail of a single sale by sale key (a property in each sale object from getSales)
    this.getSaleDetail = function( storeName, saleKey, callback ) {
     return request(
        salesQuery( storeName, 'detail', saleKey ),
        callback        
      );
    },
    
    //returns an array of current product urls, can be filtered by store name
    this.getProducts = function( callback, storeName ) {
      return request(
        salesQuery( storeName, 'active' ),
        callback,
        function( data ) {
          return getProductsFromSales( data.sales );
        }
      );
    },
    
    //returns product detail data from a single given product url (from getProducts)
    this.getProductDetail = function( productUrl, callback ) {
      return request(
        productUrl,
        callback
      );
    }
  }
  
}));