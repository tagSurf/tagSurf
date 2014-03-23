$(document).ready ->

  # Basic button actions
  toolbar =
    container: $('#overlay')
    buttons: ["history", "tagSearch", "settings"]
    historyTabOpen: false
    limit: 18
    offset: 0
    history: []

  toolbar.fetchHistory = (initial, scroller) ->
    $.ajax
      url: "/api/users/history/#{toolbar.limit}/#{toolbar.offset}",
    .success (results) ->
      if initial == true
        toolbar.history = results.data
        toolbar.render(true)
      else
        toolbar.history = _.union(toolbar.history, results.data)
        toolbar.render(false)

  # Toggle history view
  element = document.getElementById("history-btn")
  hammer = Hammer(element).on("tap", (event) ->
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
    toolbar.offset = 0
    document.getElementById("history-page").remove()
    
  toolbar.render = (initial) ->
    template = "<div class='overlay-container clearfix thumbnails' id='history-page'><div class='row'>"
    for card, idx in toolbar.history
      if ((idx + 1) % 3 == 0)
        template = template.concat("<div class='col-xs-1'><a href='/u/history'><img src='#{card.link}' width='80' height='80' /></a></div></div><div class='row'>")
      else
        template = template.concat("<div class='col-xs-1'><a href='/u/history'><img src='#{card.link}' width='80' height='80' /></a></div>")

    tempate = template.concat("</div>")

    toolbar.container.html(template)

    historyPage = document.getElementById('history-page')

    scroller = new FTScroller(historyPage,
      scrollingX: false,
      flinging: true,
      alwaysScroll: true,
      paginatedSnap: true
    )

    unless initial == true
      scroller.scrollTo(0, (scroller.scrollHeight - 200))

    # Function to add event listener to table
    scroller.addEventListener "reachedend", ->
      toolbar.offset = toolbar.offset + toolbar.limit
      toolbar.fetchHistory(false, historyPage)
      return
    , false
      
