$(document).ready ->

  # Basic button actions
  toolbar =
    container: $('#mwa')
    buttons: ["history", "tagSearch", "settings"]

  element = document.getElementById("history-btn")
  hammer = Hammer(element).on("tap", (event) ->
    toolbar.dropdown()
  )
    
  toolbar.dropdown = ->
    template = """
        <div class="history-container clearfix" id="history-page">
           <ul>
             <li><h1>Foo</h1></li>
             <li><h1>Foo</h1></li>
             <li><h1>Foo</h1></li>
             <li><h1>Foo</h1></li>
             <li><h1>Foo</h1></li>
             <li><h1>Foo</h1></li>
             <li><h1>Foo</h1></li>
             <li><h1>Foo</h1></li>
             <li><h1>Foo</h1></li>
           </ul>
        </div>
    """

    toolbar.container.html(template)
    containerElement = document.getElementById('history-page')
    scroller = new FTScroller(containerElement,
      scrollingX: false
    )
   
