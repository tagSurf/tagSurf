$(document).ready ->
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
      console.log data
      state.queue = $.merge state.queue, data
      state.updateCards()

  state.swipeStart = (e) ->
    return if state.initiated or state.waiting

    point = if e.touches then e.touches[0] else e

    state.initiated = true
    state.startX = point.pageX
    state.current.addClass 'moving'


  state.swipeMove = (e) ->
    return if !state.initiated or state.waiting
    e.preventDefault()

    point = if e.touches then e.touches[0] else e

    state.deltaX = point.pageX-state.startX
    console.log('deltaX: '+state.deltaX)

    # state.current.css('transform', '')
    translate = 'translate('+state.deltaX+'px,0)'
    
    # if Math.abs(state.deltaX) > 100
    #   direction = if state.deltaX < 0 then -1 else 1
    #   rotate = Math.min(Math.max(Math.abs(100-state.deltaX)/20.0, 0), 90)
    #   translate += ' rotate('+(direction*rotate)+'deg)'
    
    state.current.css('transform', translate)


  state.swipeEnd = (e) ->
    return unless state.initiated

    point = if e.touches then e.touches[0] else e

    state.initiated = false
    state.current.removeClass 'moving'

    if Math.abs(state.deltaX) <= 50
      # did not swipe far enough, return
      state.current.css('transform', 'translate(0)')
      console.log('swipe return')
      return

    state.waiting = true

    if state.deltaX > 50
      # swipe right
      state.current.css('transform', 'translate(250px)')
      state.swipeRight()
    else
      # swipe left
      state.current.css('transform', 'translate(-250px)')
      state.swipeLeft()

    #swap current and next
    state.current.removeClass('current')
    state.current.addClass('next')
    state.next.removeClass('next')
    state.next.addClass('current')

    setTimeout state.nextPicture, 250-Math.abs(state.deltaX)

  state.swipeRight = ->
    console.log('swiped right')

  state.swipeLeft = ->
    console.log('swipe left')

  state.nextPicture = ->
    state.queue.shift()
    current = state.current
    next = state.next
    state.current = next
    state.next = current

    state.waiting = false
    state.next.css('transform', 'translate(0)')
    $('img', state.next).attr("src", state.queue[1].link)
    state.updateCards()

    if state.queue.length <= 2
      state.fetchData()

  state.updateCards = ->
    $('img', state.current).attr("src", state.queue[0].link)
    $('.text', state.current).text(state.queue[0].title)
    $('img', state.next).attr("src", state.queue[1].link)
    $('.text', state.next).text(state.queue[1].title)


  state.wrapper.bind 'touchstart', state.swipeStart
  #state.wrapper.bind 'mousedown', state.swipeStart
  #state.wrapper.bind 'touchmove', state.swipeStart

  state.wrapper.bind 'touchmove', state.swipeMove
  #state.wrapper.bind 'mousemove', state.swipeMove

  state.wrapper.bind 'touchend', state.swipeEnd
  state.wrapper.bind 'touchcancel', state.swipeEnd
  #state.wrapper.bind 'mouseup', state.swipeEnd

  state.fetchData()


  # $.ajax
  #   url: "/cards/next",
  #   context: document.body
  # .success (data) ->
  #   slides = $.merge slides, data
  #   console.log slides

  #   gallery = new SwipeView('#swiper', { numberOfPages: slides.length })

  #   for i in [0...3]
  #     page = if i==0 then slides.length-1 else i-1
  #     el = document.createElement('img')
  #     el.src = slides[page].link
  #     el.width = slides[page].width
  #     el.height = slides[page].height
  #     gallery.masterPages[i].appendChild(el)

  #     text = document.createElement('p')
  #     text.innerHTML = slides[page].title
  #     gallery.masterPages[i].appendChild(text)


  #   gallery.onFlip ->
  #     el = null
  #     upcoming = null

  #     for i in [0...3]
  #       upcoming = gallery.masterPages[i].dataset.upcomingPageIndex

  #       if upcoming != gallery.masterPages[i].dataset.pageIndex
  #         el = gallery.masterPages[i].querySelector('img')
  #         el.className = 'loading'
  #         el.src = slides[upcoming].link
  #         el.width = slides[upcoming].width
  #         el.height = slides[upcoming].height

  #         text = gallery.masterPages[i].querySelector('p')
  #         text.innerHTML = slides[upcoming].title

  #   gallery.onMoveOut ->
  #     $(gallery.masterPages[gallery.currentMasterPage]).removeClass 'swipeview-active'

  #   gallery.onMoveIn ->
  #     $(gallery.masterPages[gallery.currentMasterPage]).addClass 'swipeview-active'
