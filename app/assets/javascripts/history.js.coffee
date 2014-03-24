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
      url: "/api/history/#{id}",
    .success (data) ->
      state.collection = data.cards
      $.each state.collection, (index, value) ->
        console.log value
        state.carouselInner.append("
          <li class='pane#{index + 1}'>
            <div class='carousel-img-container'>
              <img src='#{value.link}' class='carousel-img' />
            </div>
            <small>#{value.title}</small>
          </li>
        ")
    
      state.renderCarousel()
      state.initScrolling()
  
  state.renderCarousel = ->
    carousel = new Carousel(state.wrapper[0])
    carousel.init()

  state.initScrolling = ->
    historyScroller = new FTScroller($('.carousel-card'),
      scrollingX: false,
      flinging: true,
      maxFlingDuration: 100,
    )

  state.fetchRevolvingHistory(state.startingId)
