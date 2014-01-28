$(document).ready ->
  FastClick.attach(document.body)

  state =
    initiated: false
    waiting: false
    queue: []
    wrapper: $('#swiper')
    current: $('#current')
    next: $('#next')
    startX: 0
    deltaX: 0
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
      console.log "fetched"
      state.queue = _.union(state.queue, data)
      console.log state.queue
      state.updateCards()

  state.swipeStart = (e) ->
    state.current.css('opacity', 0.8)
    return if state.initiated or state.waiting

    e = e.originalEvent
    point = if e.touches then e.touches[0] else e

    state.initiated = true
    state.startX = point.pageX
    state.current.addClass 'moving'


  state.swipeMove = (e) ->
    return if !state.initiated or state.waiting
    e.preventDefault()
    
    e = e.originalEvent
    touchObject = e.changedTouches[0]

    point = if e.touches then e.touches[0] else e

    state.deltaX = touchObject.pageX - state.startX

    translate = 'translate('+state.deltaX+'px,0)'
    
    if Math.abs(state.deltaX) > 70
      direction = if state.deltaX < 0 then -1 else 1
      if direction == -1
        state.current.css('background-color', '#E56E6E')
        rotate = Math.min(Math.max(Math.abs(100-state.deltaX)/35.0, 0), 90)
      else
        state.current.css('background-color', '#8EE5B0')
        rotate = Math.min(Math.max(Math.abs(100-state.deltaX)/15.0, 0), 90)
    
      translate += ' rotate('+(direction*rotate)+'deg)'

    state.current.css('transform', translate)
    state.current.css('-webkit-transform', translate)

  state.swipeEnd = (e) ->
    state.current.css('opacity', 1.0)
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
      state.swipeRight(state.current)
    else
      # swipe left
      state.current.css('transform', 'translate(-250px)')
      state.current.css('-webkit-transform', 'translate(-250px)')
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
      console.log data
      state.updateCards()

  state.swipeLeft = (obj) ->
    $.ajax
      url: "/votes/#{ state.queue[0].id }/dislike",
    .success (data) ->
      console.log data
      state.updateCards()

  state.nextPicture = ->
    $('.expand-btn').show()
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
    $('.expand-btn').hide()
    el = state.current.children("div")
    el.addClass('full').removeClass('partial')

  state.updateCards = ->
    template = """
        <div class="card-container" id="next">
           <div class="img-container partial">
              <img src="#{state.queue[1].link}" />
           </div>
           <div class="txt-container clearfix">
             <p>#{state.queue[1].title}</p>
           </div>
        </div>

        <div class="card-container" id="current">
           <div class="img-container partial">
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

  $('.expand-btn').bind 'touchstart', state.expand

  state.fetchData()
