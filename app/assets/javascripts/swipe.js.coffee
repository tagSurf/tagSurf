$(document).ready ->
  FastClick.attach(document.body)
   
  state =
    tagSurfing: false
    initiated: false
    waiting: false
    queue: []
    wrapper: $('#swiper')
    current: $('#current')
    formatter: $('#formatter')
    next: $('#next')
    path: location.pathname.match(/\/t\/(.*)/)
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
    formatCards: null
    updateCards: null
    maxCardHeight: 330 #subject to change based on device height

  return unless state.wrapper
  return unless state.path

  state.fetchData = ->
    tag = state.path[1]
    if tag
      $.ajax
        url: "/cards/next/#{tag}",
      .success (data) ->
        data = data.cards
        state.queue = _.union(state.queue, data)
        state.queue = _.uniq state.queue, (item) ->
          JSON.stringify item
        state.updateCards()
    else
      $.ajax
        url: "/cards/next/hot",
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
          state.current.css('border-color', '#C90016')
          rotate = Math.min(Math.max(Math.abs(100-state.deltaX)/35.0, 0), 90)
        else
          state.current.css('border-color', '#8EE5B0')
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
    state.current.css('border-color', '#353535')
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
    if state.fullscreen != true
      state.fullscreen = true
      state.fullscreenButton.hide()
      el = state.current
      #el.addClass('full')
      full_title = "<p>#{state.queue[0].title}</p>"
      $($('.txt-container', el)[0]).html(full_title)
      $($('.img-container', el)[0]).toggleClass('expanded')
      $(state.fullscreenButton).addClass('hider')
      $('.ftscroller_y').addClass('full')

  state.displayFullscreenButton = (element) ->
    # Todo, need to defer scrollHeight somehow on first request
    if element.offsetHeight > element.scrollHeight
      state.fullscreenButton.hide()
      console.log "hide button"
    else
      state.fullscreenButton.show()
      console.log "show button"

  state.formatCards = ->
    template_current = """
        <div class="card-container card-style clearfix" id="current">
           <div class="img-container expand-animation clearfix">
              <img src="#{state.queue[0].link}" />
           </div>
           <div class="txt-container clearfix">
             <p>#{state.queue[0].title}</p>
           </div>
	   <div class="fullscreen">
	      <span class="expand-btn glyphicon glyphicon-chevron-down"></span>
	   </div>

        </div>
    """
    state.formatter.html template_current
    current_image = state.formatter.find('#current .img-container')
    current_title = state.formatter.find('#current .txt-container')
    current_fullscreen = state.formatter.find('#current .fullscreen')
    if $('img',current_image).height() + current_title.height() < state.maxCardHeight
      current_image.removeClass "expand-animation"
      current_fullscreen.addClass('hider')
      state.fullscreen = true
    else
      truncated_title = "#{state.queue[0].title}".trunc(30)
      truncated_title = "<p>" + truncated_title + "</p>"
      $(current_title).html(truncated_title) 
      state.fullscreen = false

    template_next =  """
        <div class="card-container card-style clearfix" id="next">
           <div class="img-container expand-animation clearfix">
              <img src="#{state.queue[1].link}" />
           </div>
           <div class="txt-container clearfix">
             <p>#{state.queue[1].title}</p>
           </div>
	   <div class="fullscreen">
	     <span class="expand-btn glyphicon glyphicon-chevron-down"></span>
	   </div>

        </div>
    """
    state.formatter[0].innerHTML = template_next + state.formatter.html()
    next_image = state.formatter.find('#next .img-container')
    next_title = state.formatter.find('#next .txt-container')
    next_fullscreen = state.formatter.find('#next .fullscreen')
    if $('img',next_image).height() + next_title.height() < state.maxCardHeight
      next_image.removeClass "expand-animation"
      next_fullscreen.addClass('hider')
    else
      truncated_title = "#{state.queue[1].title}".trunc(30)
      truncated_title = "<p>" + truncated_title + "</p>"
      $(next_title).html(truncated_title)

    $('#swiper').html(state.formatter.html())
    state.formatter.html("")

  state.updateCards = ->
    state.formatCards()
    state.current = $('#current')
    state.next = $('#next')
    state.fullscreenButton = $('#current .fullscreen')
 
#    setTimeout (->
      #state.displayFullscreenButton(state.current[0])
#      return
#    ), 500
     
    #$('img', state.current).attr("src", state.queue[0].link)
    #$('.text', state.current).text(state.queue[0].title)
    #$('img', state.next).attr("src", state.queue[1].link)
    #$('.text', state.next).text(state.queue[1].title)

  #state.wrapper.bind 'touchstart', state.swipeStart
  #state.wrapper.bind 'mousedown', state.swipeStart
  state.wrapper.bind 'touchmove', state.swipeStart

  state.wrapper.bind 'touchmove', state.swipeMove
  #state.wrapper.bind 'mousemove', state.swipeMove

  state.wrapper.bind 'touchend', state.swipeEnd
  state.wrapper.bind 'touchcancel', state.swipeEnd
  #state.wrapper.bind 'mouseup', state.swipeEnd

  state.fullscreenButton.bind 'touchstart', state.expand
  #state.wrapper.bind 'click', state.expand
  Hammer(state.wrapper).on "tap", state.expand
  #Hammer(state.wrapper).on "dragstart", state.swipeStart
  #Hammer(state.wrapper).on "dragend", state.swipeEnd
  #Hammer(state.wrapper).on "dragleft dragright dragup dragdown", state.swipeMove


  state.fetchData()
