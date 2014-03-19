$(document).ready ->

  # api/tags
  autoComplete =
    tags: []
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

  autoComplete.currentTag = ->
    urlRouteArray = window.location.href.split('/')
    urlRouteLength = urlRouteArray.length - 1
    urlRouteArray[urlRouteLength]

  autoComplete.fetchTags()
