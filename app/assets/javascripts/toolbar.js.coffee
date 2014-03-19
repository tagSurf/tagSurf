$(document).ready ->

  # Basic button actions
  toolbar =
    container: $('#overlay')
    buttons: ["history", "tagSearch", "settings"]
    historyTabOpen: false
    limit: 18
    offset: 0
    history: []

  toolbar.fetchHistory = (initial) ->
    $.ajax
      url: "/api/users/history/#{toolbar.limit}/#{toolbar.offset}",
    .success (results) ->
      if initial == true
        toolbar.history = results.data
        toolbar.render()
      else
        toolbar.history = _.union(toolbar.history, results.data)
        toolbar.render()

  # Toggle history view
  element = document.getElementById("history-btn")
  hammer = Hammer(element).on("tap", (event) ->
    console.log "here"
    if toolbar.historyTabOpen == false
      toolbar.historyTabOpen = true
      toolbar.fetchHistory(true)
    else
      toolbar.clearHistoryView()
  )

  toolbar.clearHistoryView = ->
    return if toolbar.historyTabOpen == false
    toolbar.historyTabOpen = false
    toolbar.history = []
    document.getElementById("history-page").remove()
    
  toolbar.render = ->
    template = "<div class='overlay-container clearfix thumbnails' id='history-page'><div class='row'>"
    for card, idx in toolbar.history
      if ((idx + 1) % 3 == 0)
        template = template.concat("<div class='col-xs-1'><a href=''><img src='#{card.link}' width='80' height='80' /></a></div></div><div class='row'>")
      else
        template = template.concat("<div class='col-xs-1'><a href=''><img src='#{card.link}' width='80' height='80' /></a></div>")

    tempate = template.concat("</div>")

    toolbar.container.html(template)
    containerElement = document.getElementById('history-page')

    scroller = new FTScroller(containerElement,
      scrollingX: false,
      flinging: false
    )

    # Function to add event listener to table
    scroller.addEventListener "reachedend", ->
      toolbar.offset = toolbar.offset + toolbar.limit
      toolbar.fetchHistory(false)
      return
    , false
      
