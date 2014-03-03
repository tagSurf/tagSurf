$(document).ready ->

  # Basic button actions
  toolbar =
    container: $('#overlay')
    buttons: ["history", "tagSearch", "settings"]
    collection: [1,2,3,4,5,6,7,8,9]
    historyTabOpen: false

  element = document.getElementById("history-btn")
  hammer = Hammer(element).on("tap", (event) ->
    if toolbar.historyTabOpen == false
      toolbar.historyTabOpen = true
      toolbar.dropdown()
    else
      toolbar.clearHistoryView()
  )

  # Toggle history view
  toolbar.clearHistoryView = ->
    return if toolbar.historyTabOpen == false
    toolbar.historyTabOpen = false
    document.getElementById("history-page").remove()
    
  toolbar.dropdown = ->
    template = """
      <div class='overlay-container clearfix thumbnails' id='history-page'>
        <div class="row">
          <div class='col-xs-1'>
            <h6>Title</h6>
            <img src="http://i.imgur.com/l3Tyokn.gif" width="80" height="80" /> 
          </div>
          <div class='col-xs-1'>
            <h6>Title</h6>
            <img src="http://i.imgur.com/l3Tyokn.gif" width="80" height="80" /> 
          </div>
          <div class='col-xs-1'>
            <h6>Title</h6>
            <img src="http://i.imgur.com/l3Tyokn.gif" width="80" height="80" /> 
          </div>
        </div>

        <div class="row">
          <div class='col-xs-1'>
            <h6>Title</h6>
            <img src="http://i.imgur.com/l3Tyokn.gif" width="80" height="80" /> 
          </div>
          <div class='col-xs-1'>
            <h6>Title</h6>
            <img src="http://i.imgur.com/l3Tyokn.gif" width="80" height="80" /> 
          </div>
          <div class='col-xs-1'>
            <h6>Title</h6>
            <img src="http://i.imgur.com/l3Tyokn.gif" width="80" height="80" /> 
          </div>
        </div>

        <div class="row">
          <div class='col-xs-1'>
            <h6>Title</h6>
            <img src="http://i.imgur.com/l3Tyokn.gif" width="80" height="80" /> 
          </div>
        </div>

      </div>
    """
    #template = "<div class='col-sm-1'>"
    #$.each([1,2,3,4,5,6,7,8,9] = (idx, obj) ->
    #  template += "<h2>Content</h2>"
    #  if ((idx + 1) % 3 == 0)
    #    template += "<br /><hr>"

    #obj =
    #  flammable: "inflammable"
    #  duh: "no duh"

    #$.each obj, (key, value) ->
    #  alert key + ": " + value
    #  return


    toolbar.container.html(template)
    containerElement = document.getElementById('history-page')

    scroller = new FTScroller(containerElement,
      scrollingX: false
    )

    fetchHistory = (params) ->
      console.log params
      return

    # Function to add event listener to table
    scroller.addEventListener "reachedend", ->
      fetchHistory({offset: 0, limit: 20})
      return
    , false
       
