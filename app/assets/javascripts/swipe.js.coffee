$(document).ready ->
  slides = []

  $.ajax
    url: "/cards/next",
    context: document.body
  .success (data) ->
    slides = $.merge slides, data
    console.log slides

    gallery = new SwipeView('#swiper', { numberOfPages: slides.length })

    for i in [0...3]
      page = if i==0 then slides.length-1 else i-1
      el = document.createElement('img')
      el.src = slides[page].link
      el.width = slides[page].width
      el.height = slides[page].height
      gallery.masterPages[i].appendChild(el)

      text = document.createElement('p')
      text.innerHTML = slides[page].title
      gallery.masterPages[i].appendChild(text)


    gallery.onFlip ->
      el = null
      upcoming = null

      for i in [0...3]
        upcoming = gallery.masterPages[i].dataset.upcomingPageIndex

        if upcoming != gallery.masterPages[i].dataset.pageIndex
          el = gallery.masterPages[i].querySelector('img')
          el.className = 'loading'
          el.src = slides[upcoming].link
          el.width = slides[upcoming].width
          el.height = slides[upcoming].height

          text = gallery.masterPages[i].querySelector('p')
          text.innerHTML = slides[upcoming].title

    gallery.onMoveOut ->
      $(gallery.masterPages[gallery.currentMasterPage]).removeClass 'swipeview-active'

    gallery.onMoveIn ->
      $(gallery.masterPages[gallery.currentMasterPage]).addClass 'swipeview-active'
