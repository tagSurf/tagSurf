$(document).ready ->

  # api/tags
  autoComplete =
    tags: []
    form: $('#tag-search')
    input: $("#ts-tags")

  autoComplete.fetchTags = ->
    autoComplete.input.attr('placeholder', autoComplete.currentTag())
    $.ajax
        url: "/api/tags",
      .success (data) ->
        this.tags = data['tags']
        autoComplete.input.autocomplete(
          source: this.tags
          minLength : 0
          select: (event, ui) ->
            window.location = "/t/#{ui.item.value}"
        ).on "focus", (event) ->
          $(this).autocomplete "search", ""
        
  autoComplete.form.keydown (e) ->
    if e.keyCode is 13
      e.preventDefault()
      window.location = "/t/#{autoComplete.input.val()}"

  autoComplete.currentTag = ->
    urlRouteArray = window.location.href.split('/')
    urlRouteLength = urlRouteArray.length - 1
    urlRouteArray[urlRouteLength]

  autoComplete.fetchTags()
