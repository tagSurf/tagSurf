$(document).ready ->
  FastClick.attach(document.body)

  # FTScroller implementation
  # https://github.com/ftlabs/ftscroller
  #scroller = new FTScroller(document.getElementById("mwa"),
     #  scrollingX: false,
     #  scrollingY: true,
     #  alwaysScroll: true,
     #  flinging: false,
     #  updateOnWindowResize: true
     #)
    
  state =
    tagSurfing: false
    initiated: false
    waiting: false
    queue: []
    wrapper: $('#swiper')
    current: $('#current')
    next: $('#next')
    fullscreenButton: $('.fullscreen')
    startX: 0
    startY: 0
    deltaX: 0
    deltaY: 0
    fullscreen: false
    snapThreshold: 50
    swipeStart: null
    swipeMove: null
    swipeEnd: null
    swipeLeft: null
    swipeRight: null
    nextPicture: null
    updateCards: null

  return unless state.wrapper

  state.fetchData = ->
    $.ajax
      url: "/cards/next",
    .success (data) ->
      data = data.cards
      state.queue = _.union(state.queue, data)
      state.queue = _.uniq state.queue, (item) ->
        JSON.stringify item
      state.updateCards()

  state.swipeStart = (e) ->
    return if state.initiated or state.waiting

    e = e.originalEvent
    return if e.touches.length > 1
    point = if e.touches then e.touches[0] else e

    state.initiated = true
    state.startX = point.pageX
    state.startY = point.pageY
    state.current.addClass 'moving'

  state.swipeMove = (e) ->
    return if !state.initiated or state.waiting
    
    e = e.originalEvent
    return if e.touches.length > 1
    touchObject = e.changedTouches[0]

    point = if e.touches then e.touches[0] else e

    state.deltaX = touchObject.pageX - state.startX
    state.deltaY = touchObject.pageY - state.startY

    if Math.abs(state.deltaY) < Math.abs(state.deltaX)
      e.preventDefault()
      translate = 'translate('+state.deltaX+'px,0)'
      
      if Math.abs(state.deltaX) > 70
        direction = if state.deltaX < 0 then -1 else 1
        if direction == -1
          state.current.css('background-color', '#E56E6E')
          rotate = Math.min(Math.max(Math.abs(100-state.deltaX)/35.0, 0), 90)
        else
          state.current.css('background-color', '#8EE5B0')
          rotate = Math.min(Math.max(Math.abs(100-state.deltaX)/20.0, 5), 90)
      
        translate += ' rotate('+(direction*rotate)+'deg)'

      state.current.css('transform', translate)
      state.current.css('-webkit-transform', translate)
      state.current.css('-moz-transform', translate)
    else if state.fullscreen == false
      e.preventDefault()
    else
      return

  state.swipeEnd = (e) ->
    e.preventDefault()
    state.current.css('background-color', '#f4f3f4')
    return unless state.initiated

    e = e.originalEvent
    point = if e.touches then e.touches[0] else e

    state.initiated = false
    state.current.removeClass 'moving'

    if Math.abs(state.deltaX) <= 100
      # did not swipe far enough, return
      state.current.css('transform', 'translate(0)')
      #console.log('swipe return')
      return

    state.waiting = true

    if state.deltaX > 90
      # swipe right
      state.current.css('transform', 'translate(250px)')
      state.current.css('-webkit-transform', 'translate(250px)')
      state.current.css('-moz-transform', 'translate(250px)')
      state.swipeRight(state.current)
    else
      # swipe left
      state.current.css('transform', 'translate(-250px)')
      state.current.css('-webkit-transform', 'translate(-250px)')
      state.current.css('-moz-transform', 'translate(-250px)')
      state.swipeLeft(state.current)

    #swap current and next
    state.current.removeClass('current')
    state.current.addClass('next')
    state.next.removeClass('next')
    state.next.addClass('current')

    setTimeout state.nextPicture, 250-Math.abs(state.deltaX)

  state.swipeRight = (obj) ->
    $.ajax
      url: "/votes/#{ state.queue[0].id }/like",
    .success (data) ->
      state.updateCards()

  state.swipeLeft = (obj) ->
    $.ajax
      url: "/votes/#{ state.queue[0].id }/dislike",
    .success (data) ->
      state.updateCards()

  state.nextPicture = ->
    state.queue.shift()
    current = state.current
    next = state.next
    state.current = next
    state.next = current

    state.waiting = false
    state.next.css('transform', 'translate(0)')
    state.next.css('-webkit-transform', 'translate(0)')
    $('img', state.next).attr("src", state.queue[1].link)
    state.updateCards()

    if state.queue.length <= 2
      state.fetchData()

  state.expand = ->
    state.fullscreen = true
    state.fullscreenButton.hide()
    el = state.current
    el.addClass('full')
    $('.ftscroller_y').addClass('full')

  state.updateCards = ->
    template = """
        <div class="card-container clearfix" id="next">
           <div class="img-container clearfix">
              <img src="#{state.queue[1].link}" />
           </div>
           <div class="txt-container clearfix">
             <p>#{state.queue[1].title}</p>
           </div>
        </div>

        <div class="card-container clearfix" id="current">
           <div class="img-container clearfix">
              <img src="#{state.queue[0].link}" />
           </div>
           <div class="txt-container clearfix">
             <p>#{state.queue[0].title}</p>
           </div>
        </div>
    """

    $('#swiper').html(template)
    state.current = $('#current')
    state.next = $('#next')
    state.fullscreen = false
 
    element = state.current[0]

    if (element.offsetHeight < element.scrollHeight) || (element.offsetWidth < element.scrollWidth)
      state.fullscreenButton.show()
    else
      state.fullscreenButton.hide()
  
    $('img', state.current).attr("src", state.queue[0].link)
    $('.text', state.current).text(state.queue[0].title)
    $('img', state.next).attr("src", state.queue[1].link)
    $('.text', state.next).text(state.queue[1].title)

  #state.wrapper.bind 'touchstart', state.swipeStart
  #state.wrapper.bind 'mousedown', state.swipeStart
  state.wrapper.bind 'touchmove', state.swipeStart

  state.wrapper.bind 'touchmove', state.swipeMove
  #state.wrapper.bind 'mousemove', state.swipeMove

  state.wrapper.bind 'touchend', state.swipeEnd
  state.wrapper.bind 'touchcancel', state.swipeEnd
  #state.wrapper.bind 'mouseup', state.swipeEnd

  state.fullscreenButton.bind 'touchstart', state.expand

  state.fetchData()
