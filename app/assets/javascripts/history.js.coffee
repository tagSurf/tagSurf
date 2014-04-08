$(document).ready ->
   
  state =
    initiated: false
    waiting: false
    collection: []
    wrapper: $('#carousel')
    carouselInner: $('#carousel-ul')
    path: location.pathname.match(/\/u\/(.*)/)
    startingId: location.pathname.split("/")[3]
    
  return unless state.path

  state.fetchRevolvingHistory = (id) ->
    $.ajax
      url: "/api/history/bracketed/#{id}",
    .success (data) ->
      state.collection = data.data
      $.each state.collection, (index, value) ->
        state.carouselInner.append("
          <li class='pane#{index + 1} carousel-card' data-id='#{value.id}'>
            <div class='carousel-img-container'>
              <img src='#{value.image_link_medium}' class='carousel-img' />
            </div>
            
            <div class='carousel-txt-container'>
              <p>#{value.title}</p>
            </div>
          </li>
        ")

      state.renderCarousel()
      state.initScrolling()
    
  
  state.renderCarousel = ->
    carousel = new Carousel(state.wrapper[0])
    carousel.init(2)

  state.initScrolling = ->
    # wait for styling requirements 
    # historyScroller = new FTScroller($('.carousel-img-container'),
    #  scrollingX: false,
    #  flinging: true,
    #  maxFlingDuration: 100,
    #)

  state.fetchRevolvingHistory(state.startingId)
