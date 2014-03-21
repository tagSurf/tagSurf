$(document).ready ->
   
  state =
    initiated: false
    waiting: false
    collection: []
    wrapper: $('#carousel')
    path: location.pathname.match(/\/u\/(.*)/)
    
  return unless state.wrapper
  return unless state.path

  carousel = new Carousel(document.getElementById("carousel"))
  carousel.init()

