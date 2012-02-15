($(function() {
  
  var submitKey = $( '#submitkey' ),
      keyField = $( '#apikey' ),
      saleHolder = $( '#sale-holder' ),
      productHolder = $( '#product-holder' );
      
  var api,
      didInitAccordion = false;
  
  function getImageUrl( sale ) {
    //get first imageUrl
    for( key in sale.image_urls ) {
      return sale.image_urls[ key ][ 0 ].url;
    }
  }
  
  function getProductViewHTML( sale ) {
    if( sale.products && sale.products.length > 0 ) {
      return '<div><a class="load-products" href="#">View Products</a></div>';
    } else {
      return '';
    }
  }
  
  function getDescriptionHTML( item, isProduct ) {
    var desc = isProduct ? item.content.description : item.description;
    if( desc && desc.length > 0 ) {
      return '<div><p>' + desc +'</p></div>';
    } else {
      return '';
    }
  }
  
  keyField.keyup(function() {
    if( $( this ).val().length > 0 ) {
      submitKey.fadeIn();
    } else {
      submitKey.fadeOut();
    }
  });
  
  submitKey.click(function() {
    var apiKey = keyField.val();
    keyField.val('');
    api = new GiltApi( apiKey );
    
    $( '#init' ).fadeOut(function() {
      $( '#content' ).fadeIn();
    });
    
  });
  
  $( '#getcurrent' ).click(function() {
    var content = $( '<div class="accordion"></div>' );
    api.getSales( function( sales ) {
      $.each( sales, function() {
        var child = $(
          '<h3 class="sale-item"><a href="#">' + this.name + '</a></h3>' +
          '<div>' +
            getProductViewHTML( this ) +
            '<div><img src="' + getImageUrl( this ) + '"/></div>' +
            getDescriptionHTML( this ) +
          '</div>'
        );
        
        child.find( 'a' ).data( this );
        content.append( child );
      });
      saleHolder.html( content );
      productHolder.empty();
      content.accordion();
    });
  });
  
  $( '#getupcoming' ).click(function() {
    var content = $( '<div class="accordion"></div>' );
    api.getSales( function( sales ) {
      $.each( sales, function() {
        content.append(
          '<h3 class="sale-item"><a href="#">' + this.name + '</a></h3>' +
          '<div>' +
            '<div>Begins at: <strong>' + this.begins + '</strong></div>' +
            '<div><img src="' + getImageUrl( this ) + '"/></div>' +
            getDescriptionHTML( this ) +
          '</div>'
        )
      });
      saleHolder.html( content );
      productHolder.empty();
      content.accordion();
    }, true);
  });
  
  $( '.load-products' ).live( 'click', function() {
    var content = $( '<div class="accordion"></div>' ),
        products = $( this ).data().products;
    
    var dfds = [];
    
    $.each( products, function() {
      dfds.push(
        api.getProductDetail( this, function( product ) {
          content.append(
            '<h3 class="product-item"><a href="#">' + product.name + '</a></h3>' +
            '<div>' +
              '<div><strong>' + product.brand + '</strong></div>' +
              '<div><a target="_blank" href="' + product.url + '">Buy it now!</a></div>' +
              '<div><img src="' + getImageUrl( product ) + '"/></div>' +
              getDescriptionHTML( product, true ) +
            '</div>'
          )
        })
      );
    });
    $.when.apply($, dfds).then(function() {
      productHolder.html( content );
      content.accordion();
    });
  });
  
}));