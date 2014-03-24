$(document).ready ->

  # Basic button actions
  toolbar =
    container: $('#overlay')
    historyPage: null
    counter: null
    gridEnd: null
    buttons: ["history", "tagSearch", "settings"]
    historyTabOpen: false
    limit: 18
    offset: 0
    history: []
    nextPage: []

  toolbar.fetchHistory = (initial, scroller) ->
    $.ajax
      url: "/api/users/history/#{toolbar.limit}/#{toolbar.offset}",
    .success (results) ->
      if initial == true
        toolbar.history = results.data
        toolbar.render(true)
      else
        toolbar.nextPage = results.data
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
    if initial
      template = "<div class='overlay-container clearfix thumbnails' id='history-page'><div class='row'>"
      for card, idx in toolbar.history
        if ((idx + 1) % 3 == 0)
          template = template.concat("<div class='col-xs-1'><a href='/u/history/#{card.id}'><img src='#{card.link}' width='80' height='80' /></a></div></div><div class='row'>")
        else
          template = template.concat("<div class='col-xs-1'><a href='/u/history/#{card.id}'><img src='#{card.link}' width='80' height='80' /></a></div>")

      template = template.concat("</div><div id='end-of-history-1'></div>")
      toolbar.container.html(template)
      toolbar.historyEl = $('#history-page')
      historyPage = toolbar.historyEl[0]
    else
      unless toolbar.gridEnd
        toolbar.counter = 1

      toolbar.gridEnd = $("#end-of-history-#{toolbar.counter}")

      nextCards = "<div class='row'>"
      for card, idx in toolbar.nextPage
        if ((idx + 1) % 3 == 0)
          nextCards = nextCards.concat("<div class='col-xs-1'><a href='/u/history/#{card.id}'><img src='#{card.link}' width='80' height='80' /></a></div></div><div class='row'>")
        else
          nextCards = nextCards.concat("<div class='col-xs-1'><a href='/u/history/#{card.id}'><img src='#{card.link}' width='80' height='80' /></a></div>")

      toolbar.counter = toolbar.counter + 1
      nextCards = nextCards.concat("</div><div id='end-of-history-#{toolbar.counter}'></div>")
      toolbar.gridEnd.after(nextCards)
      

    scroller = new FTScroller(historyPage,
      scrollingX: false,
      flinging: true,
      maxFlingDuration: 100,
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
      
