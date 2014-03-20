$(document).ready ->
   
  state =
    initiated: false
    waiting: false
    collection: []
    wrapper: $('#carousel')
    path: location.pathname.match(/\/u\/(.*)/)
    
  return unless state.wrapper
  return unless state.path

  Carousel = (element) ->
    self = this
    element = $(element)
    container = $(">ul", element)
    panes = $(">ul>li", element)
    pane_width = 0
    pane_count = panes.length
    current_pane = 0

    @init = ->
      console.log "inot"
      setPaneDimensions()
      $(window).on "load resize orientationchange", ->
        setPaneDimensions()

    setPaneDimensions = ->
      console.log "setting page"
      pane_width = element.width()
      panes.each ->
        $(this).width pane_width
      container.width pane_width * pane_count

    @showPane = (index, animate) ->
      index = Math.max(0, Math.min(index, pane_count - 1))
      current_pane = index
      offset = -((100 / pane_count) * current_pane)
      setContainerOffset offset, animate

    # between the bounds
    setContainerOffset = (percent, animate) ->
      container.removeClass "animate"
      container.addClass "animate"  if animate
      container.css "transform", "translate(" + percent + "%,0)"

    handleHammer = (ev) ->
      # disable browser scrolling
      ev.gesture.preventDefault()
      switch ev.type
        when "dragright", "dragleft"
          
          # stick to the finger
          pane_offset = -(100 / pane_count) * current_pane
          drag_offset = ((100 / pane_width) * ev.gesture.deltaX) / pane_count
          
          # slow down at the first and last pane
          drag_offset *= .4  if (current_pane is 0 and ev.gesture.direction is "right") or (current_pane is pane_count - 1 and ev.gesture.direction is "left")
          setContainerOffset drag_offset + pane_offset
        when "swipeleft"
          self.next()
          ev.gesture.stopDetect()
        when "swiperight"
          self.prev()
          ev.gesture.stopDetect()
        when "release"
          
          # more then 50% moved, navigate
          if Math.abs(ev.gesture.deltaX) > pane_width / 2
            if ev.gesture.direction is "right"
              self.prev()
            else
              self.next()
          else
            self.showPane current_pane, true

    @next = ->
      @showPane current_pane + 1, true

    @prev = ->
      @showPane current_pane - 1, true

    new Hammer(element[0],
      drag_lock_to_axis: true
    ).on "release dragleft dragright swipeleft swiperight", handleHammer

  carousel = new Carousel(document.getElementById("carousel"))
  carousel.init()

